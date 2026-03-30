"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/en", label: "Home" },
  { href: "/en#services", label: "Services" },
  { href: "/en#home-how-it-works", label: "How It Works" },
  { href: "/en#contact", label: "Contact" },
];

const navLinksEs = [
  { href: "/", label: "Inicio" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/#como-funciona", label: "Cómo Funciona" },
  { href: "/#contacto", label: "Contacto" },
];

export function Navbar() {
  const pathname = usePathname();
  const isSpanish =
    pathname === "/" || pathname === "/es" || pathname.startsWith("/es/");
  const links = isSpanish ? navLinksEs : navLinks;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 sm:px-8 lg:px-10">
        <Link
          href={isSpanish ? "/" : "/en"}
          className="flex items-center gap-3"
        >
          <Image
            src="/idispatchloads-logo-road-shield.svg"
            alt="iDispatchLoads.com"
            width={164}
            height={41}
            className="h-auto w-[150px] sm:w-[164px]"
            priority
          />
        </Link>

        <div className="flex items-center gap-3">
          <nav aria-label="Main navigation">
            <ul className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              {links.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" &&
                    link.href !== "/en" &&
                    pathname.startsWith(link.href));

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-slate-950 text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/en"
              className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                isSpanish
                  ? "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900"
                  : "border-slate-950 bg-slate-950 text-white"
              }`}
            >
              EN
            </Link>
            <Link
              href="/"
              className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                isSpanish
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              ES
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
