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
    { href: "/dashboard/reports", label: "Reports" },
    { href: "/dashboard/training", label: "Training" },
    { href: "/dashboard/movement", label: "Movement" },
    { href: "/dashboard/dispatch", label: "Dispatch" },
  ];

  if (session.role === "admin") {
    navItems.splice(2, 0, { href: "/dashboard/leads", label: "Leads" });
  }

  return (
    <div className="min-h-screen bg-[var(--color-dashboard-shell)] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-sky-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5">
          <div className="rounded-[1.5rem] border border-sky-100 bg-gradient-to-r from-white via-sky-50 to-emerald-50 px-4 py-4 shadow-[0_18px_50px_-38px_rgba(14,165,233,0.45)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              iDispatchLoads Internal
            </p>
            <p className="mt-1 font-heading text-2xl font-semibold text-slate-950">
              Operations
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="w-full rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm text-slate-600 sm:w-auto sm:rounded-full sm:py-2">
              <span className="font-semibold text-slate-900">{session.roleLabel}</span>{" "}
              <span className="break-all text-slate-500">• {session.email}</span>
            </div>

            <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <nav className="flex min-w-max gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-sky-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_10px_28px_-24px_rgba(14,165,233,0.6)] transition hover:border-[var(--color-primary)] hover:bg-sky-50 hover:text-[var(--color-primary)]"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                className="rounded-full border border-sky-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:bg-sky-50 hover:text-[var(--color-primary)]"
              >
                Public site
              </Link>

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
