import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/shared/login-form";
import { getDashboardSession } from "@/lib/auth";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Internal Login | iDispatchLoads",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getDashboardSession();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const nextPath = resolvedSearchParams?.next ?? "/dashboard/movement";

  if (session) {
    redirect(nextPath.startsWith("/dashboard") ? nextPath : "/dashboard/movement");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-16">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <section className="rounded-[2rem] bg-slate-950 px-8 py-10 text-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.65)] sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
            iDispatchLoads Internal
          </p>
          <h1 className="mt-5 font-heading text-4xl font-semibold leading-tight sm:text-5xl">
            Dispatch board access for the owner and dispatcher.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Sign in to review Daniel Gruas LLC units, board opportunities, live
            loads, and the reload queue without exposing internal operations on
            the public site.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Movement
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                See which units need the next move first.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Dispatch
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Track booked loads, manifests, and quick contacts.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Leads
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Keep onboarding and follow-up visible without a full CRM.
              </p>
            </article>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white px-8 py-10 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.35)] sm:px-10">
          <LoginForm nextPath={nextPath} />
        </section>
      </div>
    </main>
  );
}
