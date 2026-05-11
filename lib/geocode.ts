/**
 * Server-side geocoding via Nominatim (OpenStreetMap's free service).
 *
 * Cache: module-level Map; lives for the lifetime of the serverless function
 * instance. Same city is never looked up twice in the same process.
 *
 * Rate limit: Nominatim's usage policy requires no more than 1 request/second
 * from a single source. We enforce ~1.1s between uncached requests. This
 * means a cold dispatcher page with 10 unique cities to resolve takes up to
 * 11 seconds on first load. Acceptable per plan v3 §3.2.
 *
 * Long-term: replace with Mapbox or LocationIQ if cold-load time becomes a
 * UX problem. Public API; no key required today.
 */

const cache = new Map<string, [number, number] | null>();
let lastRequestAt = 0;

const NOMINATIM_MIN_INTERVAL_MS = 1100;

function cacheKey(city: string, state: string) {
  return `${city.trim().toLowerCase()}|${state.trim().toUpperCase()}`;
}

async function waitForRateLimit(): Promise<void> {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < NOMINATIM_MIN_INTERVAL_MS) {
    await new Promise((resolve) => setTimeout(resolve, NOMINATIM_MIN_INTERVAL_MS - elapsed));
  }
  lastRequestAt = Date.now();
}

export async function geocodeCity(
  city: string,
  state: string,
): Promise<[number, number] | null> {
  const trimmedCity = city.trim();
  const trimmedState = state.trim();
  if (!trimmedCity || !trimmedState) return null;

  const key = cacheKey(trimmedCity, trimmedState);
  if (cache.has(key)) {
    return cache.get(key) ?? null;
  }

  await waitForRateLimit();

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", `${trimmedCity}, ${trimmedState}, USA`);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "us");

    const response = await fetch(url.toString(), {
      headers: {
        // Nominatim's terms require a meaningful User-Agent.
        "User-Agent": "iDispatchLoads/1.0 (internal dispatcher tool; private)",
      },
      // Short timeout — if Nominatim is slow, fall back to null.
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      cache.set(key, null);
      return null;
    }

    const data = (await response.json()) as Array<{ lat: string; lon: string }>;
    if (!Array.isArray(data) || data.length === 0) {
      cache.set(key, null);
      return null;
    }

    const lat = Number.parseFloat(data[0].lat);
    const lon = Number.parseFloat(data[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      cache.set(key, null);
      return null;
    }

    const coords: [number, number] = [lat, lon];
    cache.set(key, coords);
    return coords;
  } catch (error) {
    console.error(`[geocode] failed for ${key}:`, error);
    cache.set(key, null);
    return null;
  }
}

/**
 * Batch helper. Honors the rate limit between uncached lookups.
 * Returns a Map keyed by `${city}|${STATE}` (uppercase state). Use the same
 * key shape via getGeocodeKey() when reading.
 */
export async function geocodeCities(
  inputs: Array<{ city: string; state: string }>,
): Promise<Map<string, [number, number] | null>> {
  const result = new Map<string, [number, number] | null>();
  for (const { city, state } of inputs) {
    const key = cacheKey(city, state);
    if (result.has(key)) continue;
    const coords = await geocodeCity(city, state);
    result.set(key, coords);
  }
  return result;
}

export function getGeocodeKey(city: string, state: string) {
  return cacheKey(city, state);
}
