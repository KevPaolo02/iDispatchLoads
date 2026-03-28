"use client";

import { useEffect } from "react";

import { usePathname } from "next/navigation";

import { captureBrowserAnalyticsEvent } from "@/lib/utils";

export function MarketingAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    captureBrowserAnalyticsEvent("page_view", {
      pathname,
      title: document.title,
    });
  }, [pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const element = target.closest<HTMLElement>("[data-analytics-event]");

      if (!element?.dataset.analyticsEvent) {
        return;
      }

      captureBrowserAnalyticsEvent(element.dataset.analyticsEvent, {
        pathname: window.location.pathname,
        label: element.dataset.analyticsLabel ?? element.textContent?.trim() ?? "",
        location: element.dataset.analyticsLocation ?? "marketing",
      });
    }

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return null;
}
