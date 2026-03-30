"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const footerLinks = [
  { href: "/en", label: "Home" },
  { href: "/en#services", label: "Services" },
  { href: "/en#home-how-it-works", label: "How It Works" },
  { href: "/en#contact", label: "Contact" },
];

const footerLinksEs = [
  { href: "/", label: "Inicio" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/#como-funciona", label: "Cómo Funciona" },
  { href: "/#contacto", label: "Contacto" },
];

export function Footer() {
  const pathname = usePathname();
  const isSpanish =
    pathname === "/" || pathname === "/es" || pathname.startsWith("/es/");
  const links = isSpanish ? footerLinksEs : footerLinks;

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12 sm:px-8 lg:px-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="max-w-md">
            <Link
              href={isSpanish ? "/" : "/en"}
              className="text-lg font-semibold tracking-[0.18em] text-white uppercase"
            >
              iDispatchLoads.com
            </Link>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              {isSpanish
                ? "Servicios de dispatch confiables para conductores y dueños-operadores que quieren mejores cargas, mejores tarifas y una operación más clara."
                : "Reliable dispatch services for owner-operators who want better loads, stronger rates, and a smoother day-to-day operation."}
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <ul className="grid gap-3 text-sm">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-t border-white/10 pt-5 text-xs text-slate-500">
          <p>
            {isSpanish ? "Desarrollado por " : "Powered by "}
            <a
              href="https://colcore.co"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-slate-300"
            >
              ColCore.co
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
