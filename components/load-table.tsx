import Link from "next/link";

import { deleteLoadAction, sendOfferAction } from "@/app/(dashboard)/actions";
import type { LoadWithRelations } from "@/lib/data";
import { formatCurrency, formatDate, routeLabel } from "@/lib/utils";

import { StatusBadge } from "./status-badge";

type LoadTableProps = {
  loads: LoadWithRelations[];
};

export function LoadTable({ loads }: LoadTableProps) {
  if (loads.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
        No loads yet. Add the first load from the form above to start dispatching.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr className="text-left text-xs uppercase tracking-[0.22em] text-slate-500">
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Pickup</th>
              <th className="px-4 py-3">Equipment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Assigned</th>
              <th className="px-4 py-3">Best match</th>
              <th className="px-4 py-3">Offers</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-sm text-slate-200">
            {loads.map((load) => {
              const topMatch = load.matches[0];
              const pendingOffers = load.offers.filter((offer) => offer.status === "pending").length;
              const acceptedOffer = load.offers.find((offer) => offer.status === "accepted");

              return (
                <tr key={load.id} className="align-top">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-white">{routeLabel(load)}</p>
                    <p className="mt-2 text-xs text-slate-400">{load.notes || "No notes"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p>{formatDate(load.pickup_date)}</p>
                    <p className="mt-1 text-xs text-slate-400">{load.distance_miles ? `${load.distance_miles} mi` : "Distance not set"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p>{load.vehicle_type}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatCurrency(load.price)}</p>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={load.status} />
                    {load.driver_status ? (
                      <div className="mt-2">
                        <StatusBadge status={load.driver_status} />
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    {load.driver ? (
                      <div>
                        <p className="font-medium text-white">{load.driver.name}</p>
                        <p className="mt-1 text-xs text-slate-400">{formatCurrency(load.agreed_price ?? load.price)}</p>
                      </div>
                    ) : (
                      <span className="text-slate-500">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {topMatch ? (
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium text-white">{topMatch.driver.name}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {topMatch.driver.current_location} · {topMatch.driver.trailer_type}
                          </p>
                          <p className="mt-1 text-xs text-sky-200">Match score {topMatch.score}</p>
                        </div>
                        {!load.driver_id && load.status !== "COMPLETED" ? (
                          <form action={sendOfferAction}>
                            <input type="hidden" name="load_id" value={load.id} />
                            <input type="hidden" name="driver_id" value={topMatch.driver.id} />
                            <input type="hidden" name="offered_price" value={load.price} />
                            <input type="hidden" name="return_to" value="/" />
                            <button className="rounded-xl border border-sky-400/30 bg-sky-400/10 px-3 py-2 text-xs font-semibold text-sky-100 transition hover:bg-sky-400/20">
                              Send Offer
                            </button>
                          </form>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-slate-500">No available drivers</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1 text-xs">
                      <p>{pendingOffers} pending</p>
                      <p>{acceptedOffer ? "1 accepted" : "0 accepted"}</p>
                      <p>{load.offers.filter((offer) => offer.status === "rejected").length} rejected</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/loads/${load.id}`}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-semibold text-slate-100 transition hover:border-sky-400/30 hover:bg-sky-400/10"
                      >
                        Manage
                      </Link>
                      <form action={deleteLoadAction}>
                        <input type="hidden" name="id" value={load.id} />
                        <input type="hidden" name="return_to" value="/" />
                        <button className="w-full rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/20">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
