import "server-only";

import { getOptionalEnv } from "@/lib/utils";

type AnalyticsValue = string | number | boolean | null | undefined;

type CaptureServerAnalyticsEventInput = {
  event: string;
  distinctId: string;
  properties?: Record<string, AnalyticsValue>;
};

function getAnalyticsConfig() {
  const apiKey =
    getOptionalEnv("POSTHOG_API_KEY") ?? getOptionalEnv("NEXT_PUBLIC_POSTHOG_KEY");

  if (!apiKey) {
    return null;
  }

  return {
    apiKey,
    host:
      getOptionalEnv("POSTHOG_HOST") ??
      getOptionalEnv("NEXT_PUBLIC_POSTHOG_HOST") ??
      "https://us.i.posthog.com",
  };
}

export async function captureServerAnalyticsEvent({
  event,
  distinctId,
  properties = {},
}: CaptureServerAnalyticsEventInput) {
  const config = getAnalyticsConfig();

  if (!config) {
    return;
  }

  try {
    await fetch(`${config.host.replace(/\/$/, "")}/capture/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: config.apiKey,
        event,
        distinct_id: distinctId,
        properties,
      }),
      cache: "no-store",
    });
  } catch (error) {
    console.error("[analytics] Failed to capture server event", error);
  }
}
