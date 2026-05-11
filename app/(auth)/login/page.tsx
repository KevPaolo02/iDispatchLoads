import { redirect } from "next/navigation";

import { signInAction } from "@/app/(auth)/actions";
import { FlashBanner } from "@/components/flash-banner";
import { createClient } from "@/lib/supabase/server";
import { normalizeArray } from "@/lib/utils";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const params = (await searchParams) ?? {};
  const error = normalizeArray(params.error)[0];
  const success = normalizeArray(params.success)[0];

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/30">
          <p className="text-xs uppercase tracking-[0.28em] text-sky-300">Internal Dispatch Tool</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Run loads, offers, and driver assignments from one board.</h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300">
            iDispatchLoads is built for the dispatcher sitting between load boards and a small fleet. Keep coverage fast, prevent duplicate offers, and lock assignments before the lane goes stale.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Board</p>
              <p className="mt-2 text-sm text-slate-200">Live load status and driver coverage in one place.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Offers</p>
              <p className="mt-2 text-sm text-slate-200">Mock SMS offers with acceptance and rejection tracking.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Drivers</p>
              <p className="mt-2 text-sm text-slate-200">Simple internal panel for trip progress updates.</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/30">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Secure Access</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Sign in</h2>
            <p className="mt-2 text-sm text-slate-400">
              Use an authenticated Supabase user. For a private rollout, create the first account in Supabase Auth.
            </p>
          </div>

          <div className="space-y-3">
            {error ? <FlashBanner type="error" message={error} /> : null}
            {success ? <FlashBanner type="success" message={success} /> : null}
          </div>

          <form action={signInAction} className="mt-6 space-y-4">
            <label className="block space-y-2 text-sm text-slate-300">
              Email
              <input
                name="email"
                type="email"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400/50"
                placeholder="dispatch@company.com"
              />
            </label>

            <label className="block space-y-2 text-sm text-slate-300">
              Password
              <input
                name="password"
                type="password"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400/50"
                placeholder="Your password"
              />
            </label>

            <button className="w-full rounded-2xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
              Open dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
