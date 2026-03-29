import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { logoutAction } from "@/app/(dashboard)/actions/logout";
import { requireDashboardSession } from "@/lib/auth";

type DashboardLayoutProps = {
  children: ReactNode;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await requireDashboardSession();
  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/movement", label: "Movement" },
    { href: "/dashboard/leads", label: "Leads" },
    { href: "/dashboard/dispatch", label: "Dispatch" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              iDispatchLoads Internal
            </p>
            <p className="mt-1 font-heading text-2xl font-semibold text-slate-950">
              Operations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{session.roleLabel}</span>{" "}
              <span className="text-slate-500">• {session.email}</span>
            </div>

            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/"
              className="text-sm font-semibold text-[var(--color-primary)] transition hover:text-[var(--color-primary-strong)]"
            >
              Public site
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
