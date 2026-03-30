import type { ReactNode } from "react";

import { AdTracking } from "@/components/marketing/ad-tracking";
import { MarketingAnalytics } from "@/components/marketing/marketing-analytics";
import { Footer } from "@/components/marketing/footer";
import { Navbar } from "@/components/marketing/navbar";

type MarketingLayoutProps = {
  children: ReactNode;
};

export default function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <AdTracking />
      <MarketingAnalytics />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
