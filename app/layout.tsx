import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://idispatchloads.com"),
  title: {
    default: "iDispatchLoads.com | Dispatch en Español para Choferes del Noreste",
    template: "%s | iDispatchLoads.com",
  },
  description:
    "Servicios de dispatch en español para choferes y dueños-operadores que trabajan desde, por, o hacia New York, New Jersey, Connecticut y Pennsylvania.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://idispatchloads.com",
    siteName: "iDispatchLoads.com",
    title: "iDispatchLoads.com | Dispatch en Español para Choferes del Noreste",
    description:
      "Dispatch en español para choferes que trabajan NY, NJ, CT y PA.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "iDispatchLoads.com dispatch en español para choferes del noreste",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "iDispatchLoads.com | Dispatch en Español para Choferes del Noreste",
    description:
      "Dispatch en español para choferes que trabajan NY, NJ, CT y PA.",
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-[var(--color-page)] text-slate-950">
        {children}
      </body>
    </html>
  );
}
