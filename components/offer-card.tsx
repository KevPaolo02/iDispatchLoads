import { updateOfferStatusAction } from "@/app/(dashboard)/actions";
import type { DriverOfferView, OfferWithDriver } from "@/lib/data";
import { formatCurrency, routeLabel } from "@/lib/utils";

import { StatusBadge } from "./status-badge";

type OfferCardProps = {
  offer: OfferWithDriver | DriverOfferView;
  returnTo: string;
  showRoute?: boolean;
};

export function OfferCard({ offer, returnTo, showRoute = false }: OfferCardProps) {
  const load = "load" in offer ? offer.load : null;
  const isPending = offer.status === "pending";

  return (
    <article className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{offer.driver?.name ?? "Driver"}</h3>
            <StatusBadge status={offer.status} />
          </div>
          <p className="text-sm text-slate-300">{offer.driver?.phone ?? "--"}</p>
          {showRoute && load ? <p className="text-sm text-slate-400">{routeLabel(load)}</p> : null}
          <p className="text-sm text-slate-300">{offer.message_body}</p>
          <p className="text-xs text-slate-500">
            Offered {formatCurrency(offer.offered_price)} · Sent {new Date(offer.created_at).toLocaleString()}
          </p>
        </div>

        {isPending ? (
          <form action={updateOfferStatusAction} className="w-full max-w-sm space-y-3">
            <input type="hidden" name="offer_id" value={offer.id} />
            <input type="hidden" name="return_to" value={returnTo} />
            <label className="space-y-2 text-sm text-slate-300">
              Agreed price
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-400/50"
                name="agreed_price"
                type="number"
                step="0.01"
                defaultValue={offer.offered_price ?? ""}
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                name="decision"
                value="accepted"
                className="rounded-2xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Accept
              </button>
              <button
                name="decision"
                value="rejected"
                className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20"
              >
                Reject
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </article>
  );
}
