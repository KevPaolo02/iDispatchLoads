const ANALYTICS_DISTINCT_ID_KEY = "idispatchloads_distinct_id";

function getAnalyticsHost() {
  return (
    process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/$/, "") ||
    "https://us.i.posthog.com"
  );
}

function getAnalyticsKey() {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY;
}

function getDistinctId() {
  if (typeof window === "undefined") {
    return "server";
  }

  const existingId = window.localStorage.getItem(ANALYTICS_DISTINCT_ID_KEY);

  if (existingId) {
    return existingId;
  }

  const nextId = window.crypto?.randomUUID?.() ?? `anon-${Date.now()}`;
  window.localStorage.setItem(ANALYTICS_DISTINCT_ID_KEY, nextId);
  return nextId;
}

export function captureBrowserAnalyticsEvent(
  event: string,
  properties: Record<string, string | number | boolean | null | undefined> = {},
) {
  const apiKey = getAnalyticsKey();

  if (!apiKey || typeof window === "undefined") {
    return;
  }

  const payload = {
    api_key: apiKey,
    event,
    distinct_id: getDistinctId(),
    properties: {
      ...properties,
      $current_url: window.location.href,
      $pathname: window.location.pathname,
    },
  };

  void fetch(`${getAnalyticsHost()}/capture/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Analytics should never block the marketing experience.
  });
}
