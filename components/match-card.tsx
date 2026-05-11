import { assignLoadAction, sendOfferAction } from "@/app/(dashboard)/actions";
import type { Database } from "@/types/database";

type LoadRow = Database["public"]["Tables"]["loads"]["Row"];

type MatchCardProps = {
  load: LoadRow;
  match: {
    driver: Database["public"]["Tables"]["drivers"]["Row"];
    score: number;
    reasons: string[];
  };
  returnTo: string;
};

export function MatchCard({ load, match, returnTo }: MatchCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{match.driver.name}</h3>
            <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2.5 py-1 text-xs font-semibold text-sky-100">
              Score {match.score}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            {match.driver.current_location} · {match.driver.trailer_type}
          </p>
          <p className="mt-1 text-sm text-slate-400">{match.driver.phone}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {match.reasons.map((reason) => (
              <span key={reason} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                {reason}
              </span>
            ))}
          </div>
        </div>

        <form action={sendOfferAction} className="w-full max-w-sm space-y-3">
          <input type="hidden" name="load_id" value={load.id} />
          <input type="hidden" name="driver_id" value={match.driver.id} />
          <input type="hidden" name="return_to" value={returnTo} />
          <label className="space-y-2 text-sm text-slate-300">
            Offer / agreed price
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-400/50"
              name="price"
              type="number"
              step="0.01"
              defaultValue={load.price}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-2xl bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
              Send Offer
            </button>
            <button
              formAction={assignLoadAction}
              className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20"
            >
              Direct Assign
            </button>
          </div>
        </form>
      </div>
    </article>
  );
}
