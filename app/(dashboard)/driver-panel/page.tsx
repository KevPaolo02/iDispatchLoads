import Link from "next/link";

import { updateDriverLoadStatusAction } from "@/app/(dashboard)/actions";
import { FlashBanner } from "@/components/flash-banner";
import { OfferCard } from "@/components/offer-card";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { getDriverPanelData } from "@/lib/data";
import { formatCurrency, formatDate, normalizeArray, routeLabel } from "@/lib/utils";

export default async function DriverPanelPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const error = normalizeArray(params.error)[0];
  const success = normalizeArray(params.success)[0];
  const selectedDriverId = normalizeArray(params.driverId)[0] ?? null;
  const { drivers, selectedDriver, offers, assignedLoads } = await getDriverPanelData(selectedDriverId);

  const pendingOffers = offers.filter((offer) => offer.status === "pending");
  const offerHistory = offers.filter((offer) => offer.status !== "pending");

  return (
    <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
      <SectionCard
        title="Drivers"
        description="Pick a driver to simulate their internal offer inbox and trip updates."
        className="h-fit"
      >
        <div className="space-y-3">
          {drivers.map((driver) => (
            <Link
              key={driver.id}
              href={`/driver-panel?driverId=${driver.id}`}
              className={`block rounded-2xl border px-4 py-3 transition ${
                selectedDriver?.id === driver.id
                  ? "border-sky-400/30 bg-sky-400/10"
                  : "border-white/10 bg-white/5 hover:border-sky-400/20 hover:bg-sky-400/5"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-white">{driver.name}</p>
                <StatusBadge status={driver.is_available ? "available" : "offline"} />
              </div>
              <p className="mt-1 text-sm text-slate-400">{driver.current_location}</p>
            </Link>
          ))}
        </div>
      </SectionCard>

      <div className="space-y-8">
        {error ? <FlashBanner type="error" message={error} /> : null}
        {success ? <FlashBanner type="success" message={success} /> : null}

        {selectedDriver ? (
          <>
            <SectionCard
              title={selectedDriver.name}
              description={`${selectedDriver.current_location} · ${selectedDriver.trailer_type}`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={selectedDriver.is_available ? "available" : "offline"} />
                <p className="text-sm text-slate-300">{selectedDriver.phone}</p>
              </div>
            </SectionCard>

            <SectionCard
              title="Pending Offers"
              description="This mocks the driver response flow without a real SMS provider."
            >
              <div className="space-y-4">
                {pendingOffers.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
                    No pending offers for this driver.
                  </p>
                ) : (
                  pendingOffers.map((offer) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      returnTo={`/driver-panel?driverId=${selectedDriver.id}`}
                      showRoute
                    />
                  ))
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Assigned Loads"
              description="Update trip progress as the load moves."
            >
              <div className="space-y-4">
                {assignedLoads.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
                    No assigned loads for this driver yet.
                  </p>
                ) : (
                  assignedLoads.map((load) => (
                    <article key={load.id} className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">{routeLabel(load)}</h3>
                            <StatusBadge status={load.status} />
                            {load.driver_status ? <StatusBadge status={load.driver_status} /> : null}
                          </div>
                          <p className="mt-2 text-sm text-slate-300">
                            Pickup {formatDate(load.pickup_date)} · {load.vehicle_type}
                          </p>
                          <p className="mt-1 text-sm text-slate-400">Agreed {formatCurrency(load.agreed_price ?? load.price)}</p>
                        </div>

                        <form action={updateDriverLoadStatusAction} className="flex flex-wrap gap-2">
                          <input type="hidden" name="load_id" value={load.id} />
                          <input type="hidden" name="return_to" value={`/driver-panel?driverId=${selectedDriver.id}`} />
                          <button
                            name="driver_status"
                            value="en_route"
                            className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-2.5 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/20"
                          >
                            En route
                          </button>
                          <button
                            name="driver_status"
                            value="picked_up"
                            className="rounded-2xl border border-fuchsia-400/30 bg-fuchsia-400/10 px-4 py-2.5 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-400/20"
                          >
                            Picked up
                          </button>
                          <button
                            name="driver_status"
                            value="delivered"
                            className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20"
                          >
                            Delivered
                          </button>
                        </form>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </SectionCard>

            <SectionCard title="Offer History" description="Recent responses for dispatcher visibility.">
              <div className="space-y-4">
                {offerHistory.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
                    No accepted or rejected offers yet.
                  </p>
                ) : (
                  offerHistory.map((offer) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      returnTo={`/driver-panel?driverId=${selectedDriver.id}`}
                      showRoute
                    />
                  ))
                )}
              </div>
            </SectionCard>
          </>
        ) : (
          <SectionCard
            title="Driver Panel"
            description="Select a driver on the left to view pending offers and assigned loads."
          >
            <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
              This route is intentionally simple. It gives you a safe internal way to simulate how a driver would accept an offer and update trip progress.
            </p>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
