import { getRankedDriverMatches } from "@/lib/matching";
import type { Database, Json } from "@/types/database";

type DriverRow = Database["public"]["Tables"]["drivers"]["Row"];
type LoadRow = Database["public"]["Tables"]["loads"]["Row"];

export type LoadFitVerdict = "TAKE" | "MAYBE" | "RISKY";

export type DriverRouteProfile = {
  homeCity: string | null;
  homeState: string | null;
  zones: string[];
  routeNotes: string[];
  isConfigured: boolean;
};

export type LoadFit = {
  load: LoadRow;
  score: number;
  verdict: LoadFitVerdict;
  reasons: string[];
  warnings: string[];
  nextMove: string;
  revenuePerMile: number | null;
};

export type PairSuggestion = {
  first: LoadRow;
  next: LoadRow;
  score: number;
  reason: string;
};

const defaultLocalZones = ["NJ", "NY", "CT", "PA"];

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function title(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function stateTokens(value: string) {
  return (value.match(/\b[A-Z]{2}\b/gi) ?? []).map((token) => token.toUpperCase());
}

function routesToText(value: Json | null) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function parseLocation(location: string) {
  const [city = "", state = ""] = location.split(",").map((segment) => segment.trim());

  return {
    city: city ? title(city) : null,
    state: stateTokens(state)[0] ?? null,
  };
}

export function getDriverRouteProfile(driver: DriverRow | null): DriverRouteProfile {
  if (!driver) {
    return {
      homeCity: null,
      homeState: null,
      zones: [],
      routeNotes: [],
      isConfigured: false,
    };
  }

  const location = parseLocation(driver.current_location);
  const routeNotes = routesToText(driver.preferred_routes);
  const zonesFromRoutes = routeNotes.flatMap(stateTokens);
  const zones = unique([...zonesFromRoutes, ...(location.state ? [location.state] : [])]);

  return {
    homeCity: location.city,
    homeState: location.state,
    zones,
    routeNotes,
    isConfigured: routeNotes.length > 0 || zones.length > 0,
  };
}

export function suggestedOneDriverZones(driver: DriverRow | null) {
  const profile = getDriverRouteProfile(driver);

  if (profile.zones.length > 0) {
    return profile.zones;
  }

  return defaultLocalZones;
}

function scoreToVerdict(score: number): LoadFitVerdict {
  if (score >= 72) return "TAKE";
  if (score >= 48) return "MAYBE";
  return "RISKY";
}

function recommendationText(load: LoadRow, profile: DriverRouteProfile, zones: string[], warnings: string[]) {
  const deliveryInZone = zones.includes(load.delivery_state);
  const pickupInZone = zones.includes(load.pickup_state);

  if (!deliveryInZone) {
    return `Find a pickup near ${load.delivery_city}, ${load.delivery_state} before committing.`;
  }

  if (!pickupInZone && deliveryInZone) {
    return `Good if the empty drive to ${load.pickup_city}, ${load.pickup_state} is short.`;
  }

  if (warnings.length > 0) {
    return "Check the warning before offering this load.";
  }

  if (profile.homeState && load.delivery_state === profile.homeState) {
    return "Ends close to the driver's home zone.";
  }

  return "Looks workable for this driver's normal lane.";
}

export function scoreLoadForDriver(driver: DriverRow, load: LoadRow): LoadFit {
  const profile = getDriverRouteProfile(driver);
  const zones = profile.zones.length > 0 ? profile.zones : defaultLocalZones;
  const reasons: string[] = [];
  const warnings: string[] = [];
  let score = 45;

  const pickupInZone = zones.includes(load.pickup_state);
  const deliveryInZone = zones.includes(load.delivery_state);
  const pickupNearHome = profile.homeState ? load.pickup_state === profile.homeState : false;
  const deliveryNearHome = profile.homeState ? load.delivery_state === profile.homeState : false;
  const match = getRankedDriverMatches(load, [driver])[0];
  const revenuePerMile = load.distance_miles && load.distance_miles > 0 ? load.price / load.distance_miles : null;

  if (match) {
    score += 8;
    reasons.push("Trailer fit looks OK.");
  } else {
    score -= 35;
    warnings.push("Trailer or availability may not fit.");
  }

  if (pickupInZone) {
    score += 18;
    reasons.push(`Pickup is inside ${driver.name}'s zone.`);
  } else {
    score -= 12;
    warnings.push(`Pickup starts outside normal zones: ${load.pickup_state}.`);
  }

  if (deliveryInZone) {
    score += 22;
    reasons.push("Delivery keeps the driver inside the working area.");
  } else {
    score -= 24;
    warnings.push(`Delivery ends outside normal zones: ${load.delivery_state}.`);
  }

  if (pickupNearHome) {
    score += 10;
    reasons.push("Pickup is near the driver's current/home state.");
  }

  if (deliveryNearHome) {
    score += 10;
    reasons.push("Delivery returns toward the driver's base.");
  }

  if (pickupInZone && deliveryInZone) {
    score += 12;
    reasons.push("Local/regional lane inside normal territory.");
  }

  if (revenuePerMile !== null) {
    if (revenuePerMile >= 2) {
      score += 18;
      reasons.push(`Strong rate: $${revenuePerMile.toFixed(2)}/mi.`);
    } else if (revenuePerMile >= 1.25) {
      score += 8;
      reasons.push(`Usable rate: $${revenuePerMile.toFixed(2)}/mi.`);
    } else if (revenuePerMile < 1) {
      score -= 16;
      warnings.push(`Low rate: $${revenuePerMile.toFixed(2)}/mi.`);
    }
  } else {
    warnings.push("Miles are missing, so rate per mile cannot be checked.");
  }

  if (load.distance_miles && load.distance_miles <= 160 && pickupInZone && deliveryInZone) {
    score += 10;
    reasons.push("Short local move.");
  }

  if (load.distance_miles && load.distance_miles > 350 && !deliveryInZone) {
    score -= 12;
    warnings.push("Long trip ending outside the normal lane.");
  }

  const boundedScore = Math.max(0, Math.min(100, score));

  return {
    load,
    score: boundedScore,
    verdict: scoreToVerdict(boundedScore),
    reasons: reasons.slice(0, 4),
    warnings: warnings.slice(0, 4),
    nextMove: recommendationText(load, profile, zones, warnings),
    revenuePerMile,
  };
}

export function getLoadFits(driver: DriverRow | null, loads: LoadRow[]) {
  if (!driver) {
    return [];
  }

  return loads
    .filter((load) => load.status === "NEW" || load.status === "OFFERED")
    .map((load) => scoreLoadForDriver(driver, load))
    .sort((left, right) => right.score - left.score);
}

export function getBackhaulNeeds(fits: LoadFit[]) {
  return fits.filter((fit) => fit.verdict !== "TAKE" && fit.warnings.some((warning) => warning.includes("Delivery ends outside")));
}

export function getPairSuggestions(loads: LoadRow[]) {
  const candidates = loads.filter((load) => load.status === "NEW" || load.status === "OFFERED");
  const suggestions: PairSuggestion[] = [];

  for (const first of candidates) {
    for (const next of candidates) {
      if (first.id === next.id) {
        continue;
      }

      let score = 0;
      let reason = "";

      if (first.delivery_city.toLowerCase() === next.pickup_city.toLowerCase() && first.delivery_state === next.pickup_state) {
        score = 95;
        reason = `Same market: ${first.delivery_city}, ${first.delivery_state}.`;
      } else if (first.delivery_state === next.pickup_state) {
        score = 72;
        reason = `Same state handoff: ends ${first.delivery_state}, next starts ${next.pickup_state}.`;
      }

      if (score > 0) {
        suggestions.push({ first, next, score, reason });
      }
    }
  }

  return suggestions.sort((left, right) => right.score - left.score).slice(0, 8);
}
