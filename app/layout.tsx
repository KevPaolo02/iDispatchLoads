import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "iDispatchLoads.com | Dispatch Services for Owner Operators",
  description:
    "Reliable dispatch services for owner operators, including load booking, rate negotiation, broker communication, and paperwork handling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[var(--color-page)] text-slate-950">
        {children}
      </body>
    </html>
  );
}
