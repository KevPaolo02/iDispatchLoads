type AdTrackingValue = string | number | boolean | null | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

function getGoogleAdsId() {
  return process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim();
}

function getGoogleAdsConversionLabel() {
  return process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?.trim();
}

function getMetaPixelId() {
  return process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
}

export function hasAdTracking() {
  return Boolean(getGoogleAdsId() || getMetaPixelId());
}

export function trackMarketingPageView(pathname: string) {
  if (typeof window === "undefined") {
    return;
  }

  const url = window.location.href;
  const googleAdsId = getGoogleAdsId();
  const metaPixelId = getMetaPixelId();

  if (googleAdsId && typeof window.gtag === "function") {
    window.gtag("config", googleAdsId, {
      page_path: pathname,
      page_location: url,
    });
  }

  if (metaPixelId && typeof window.fbq === "function") {
    window.fbq("track", "PageView");
  }
}

export function trackLeadConversion(
  properties: Record<string, AdTrackingValue> = {},
) {
  if (typeof window === "undefined") {
    return;
  }

  const googleAdsId = getGoogleAdsId();
  const googleAdsConversionLabel = getGoogleAdsConversionLabel();
  const metaPixelId = getMetaPixelId();

  if (
    googleAdsId &&
    googleAdsConversionLabel &&
    typeof window.gtag === "function"
  ) {
    window.gtag("event", "conversion", {
      send_to: `${googleAdsId}/${googleAdsConversionLabel}`,
      value: 1,
      currency: "USD",
      ...properties,
    });
  }

  if (metaPixelId && typeof window.fbq === "function") {
    window.fbq("track", "Lead", properties);
  }
}
