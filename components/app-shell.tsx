import Link from "next/link";

import { signOutAction } from "@/app/(auth)/actions";

type AppShellProps = {
  userEmail: string;
  children: React.ReactNode;
};

const navigation = [
  { href: "/", label: "Board" },
  { href: "/dispatcher", label: "Route Planner" },
  { href: "/drivers", label: "Drivers" },
  { href: "/contacts", label: "Contacts" },
  { href: "/driver", label: "Driver View" },
  { href: "/driver-panel", label: "Test Panel" },
];

export function AppShell({ userEmail, children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-sky-300">Private Dispatch Ops</p>
              <div className="mt-2 flex flex-col gap-2 lg:flex-row lg:items-end lg:gap-4">
                <h1 className="text-3xl font-semibold text-white">iDispatchLoads</h1>
                <p className="text-sm text-slate-400">
                  Fast load coverage, clean driver matching, and simple offer tracking for small fleets.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Signed in</p>
                <p className="text-sm text-slate-200">{userEmail}</p>
              </div>
              <form action={signOutAction}>
                <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-400/30 hover:bg-sky-400/10">
                  Sign out
                </button>
              </form>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-400/30 hover:bg-sky-400/10"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
