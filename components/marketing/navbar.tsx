"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-950"
        >
          iDispatchLoads.com
        </Link>

        <nav aria-label="Main navigation">
          <ul className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));

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
      </div>
    </header>
  );
}
