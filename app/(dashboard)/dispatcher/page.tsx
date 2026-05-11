import Link from "next/link";

import { sendOfferAction } from "@/app/(dashboard)/actions";
import { CentralDispatchPasteForm } from "@/components/central-dispatch-paste-form";
import DispatchMap from "@/components/dispatch-map-loader";
import type { ActiveLoadRoute, CandidateLoadPin } from "@/components/dispatch-map";
import { FlashBanner } from "@/components/flash-banner";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { getDashboardData } from "@/lib/data";
import { geocodeCities, getGeocodeKey } from "@/lib/geocode";
import {
  getBackhaulNeeds,
  getDriverRouteProfile,
  getLoadFits,
  getPairSuggestions,
  suggestedOneDriverZones,
  type LoadFit,
} from "@/lib/route-planning";
import { formatCurrency, formatDate, normalizeArray, routeLabel } from "@/lib/utils";

function parseDriverLocation(value: string | null | undefined): { city: string; state: string } | null {
  if (!value) return null;
  const match = value.match(/^([^,]+),\s*([A-Za-z]{2})$/);
  if (!match) return null;
  return { city: match[1].trim(), state: match[2].toUpperCase() };
}

function verdictStyle(verdict: LoadFit["verdict"]) {
  if (verdict === "TAKE") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100";
  if (verdict === "MAYBE") return "border-amber-400/30 bg-amber-400/10 text-amber-100";
  return "border-rose-400/30 bg-rose-400/10 text-rose-100";
}

function verdictLabel(verdict: LoadFit["verdict"]) {
  if (verdict === "TAKE") return "Take";
  if (verdict === "MAYBE") return "Maybe";
  return "Risky";
}

export default async function DispatcherPlannerPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const error = normalizeArray(params.error)[0];
  const success = normalizeArray(params.success)[0];
  const selectedDriverId = normalizeArray(params.driverId)[0] ?? null;
  const { loads, drivers } = await getDashboardData();
  const driver =
    (selectedDriverId ? drivers.find((candidate) => candidate.id === selectedDriverId) : null) ??
    (drivers.length === 1 ? drivers[0] : null);

  const profile = getDriverRouteProfile(driver);
  const zones = suggestedOneDriverZones(driver);
  const loadFits = getLoadFits(driver, loads);
  const backhaulNeeds = getBackhaulNeeds(loadFits);
  const pairSuggestions = getPairSuggestions(loads);
  const takeLoads = loadFits.filter((fit) => fit.verdict === "TAKE");
  const maybeLoads = loadFits.filter((fit) => fit.verdict === "MAYBE");
  const riskyLoads = loadFits.filter((fit) => fit.verdict === "RISKY");

  // Build geocoding inputs: driver location, active load route, all candidate
  // load pickups. Active load = the driver's currently-assigned load if any.
  const activeLoad = driver
    ? loads.find((load) => load.driver_id === driver.id && load.status === "ASSIGNED")
    : null;

  const driverLoc = driver ? parseDriverLocation(driver.current_location) : null;

  const toGeocode: Array<{ city: string; state: string }> = [];
  if (driverLoc) toGeocode.push(driverLoc);
  if (activeLoad) {
    toGeocode.push({ city: activeLoad.pickup_city, state: activeLoad.pickup_state });
    toGeocode.push({ city: activeLoad.delivery_city, state: activeLoad.delivery_state });
  }
  for (const fit of loadFits) {
    toGeocode.push({ city: fit.load.pickup_city, state: fit.load.pickup_state });
  }

  // Cache-aware batch geocode (sequential, 1.1s between uncached requests).
  const coordsByKey = await geocodeCities(toGeocode);

  const driverPosition = driverLoc ? coordsByKey.get(getGeocodeKey(driverLoc.city, driverLoc.state)) ?? null : null;

  const activeRoute: ActiveLoadRoute | null = activeLoad
    ? {
        pickup:
          coordsByKey.get(getGeocodeKey(activeLoad.pickup_city, activeLoad.pickup_state)) ?? null,
        delivery:
          coordsByKey.get(getGeocodeKey(activeLoad.delivery_city, activeLoad.delivery_state)) ?? null,
        pickupLabel: `${activeLoad.pickup_city}, ${activeLoad.pickup_state}`,
        deliveryLabel: `${activeLoad.delivery_city}, ${activeLoad.delivery_state}`,
      }
    : null;

  const candidateLoadPins: CandidateLoadPin[] = loadFits.map((fit) => ({
    id: fit.load.id,
    pickup: coordsByKey.get(getGeocodeKey(fit.load.pickup_city, fit.load.pickup_state)) ?? null,
    pickupLabel: `${fit.load.pickup_city}, ${fit.load.pickup_state}`,
    deliveryLabel: `${fit.load.delivery_city}, ${fit.load.delivery_state}`,
    payoutLabel: formatCurrency(fit.load.price),
    verdict: fit.verdict,
  }));

  return (
    <div className="space-y-6">
      {error ? <FlashBanner type="error" message={error} /> : null}
      {success ? <FlashBanner type="success" message={success} /> : null}

      <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-sky-300">Dispatcher Planner</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Route decisions before you offer</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              Use this page to decide whether a load keeps the driver in the right lane or leaves you hunting for a pickup to avoid empty miles.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-400/30 hover:bg-sky-400/10"
          >
            Board
          </Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <SectionCard title="Driver Route Profile" description="This is the lane logic used for load scoring.">
          {drivers.length === 0 ? (
            <div className="space-y-4">
              <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400">
                Add your first driver, then set preferred routes like NJ, NY, CT, PA.
              </p>
              <Link
                href="/drivers"
                className="inline-flex rounded-2xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
              >
                Add driver
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {drivers.length > 1 ? (
                <div className="flex flex-wrap gap-2">
                  {drivers.map((candidate) => (
                    <Link
                      key={candidate.id}
                      href={`/dispatcher?driverId=${candidate.id}`}
                      className={`rounded-2xl border px-4 py-2 text-sm transition ${
                        driver?.id === candidate.id
                          ? "border-sky-400/30 bg-sky-400/10 text-sky-100"
                          : "border-white/10 bg-white/5 text-slate-200 hover:border-sky-400/30"
                      }`}
                    >
                      {candidate.name}
                    </Link>
                  ))}
                </div>
              ) : null}

              {driver ? (
                <>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-white">{driver.name}</h2>
                      <StatusBadge status={driver.is_available ? "available" : "offline"} />
                    </div>
                    <p className="mt-2 text-sm text-slate-300">
                      Current: {driver.current_location} · {driver.trailer_type}
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">Working zones</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {zones.map((zone) => (
                        <span key={zone} className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-sm text-sky-100">
                          {zone}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white">Route notes</p>
                    {profile.routeNotes.length > 0 ? (
                      <div className="mt-2 space-y-2 text-sm text-slate-300">
                        {profile.routeNotes.map((note) => (
                          <p key={note}>{note}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-slate-400">
                        No preferred routes saved yet. Add zones like NJ, NY, CT, PA on the Drivers page.
                      </p>
                    )}
                  </div>

                  <Link href="/drivers" className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-400/30">
                    Edit driver zones
                  </Link>
                </>
              ) : null}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Paste Candidate Load" description="Copy from Central Dispatch, paste once, then score it on this planner.">
          <CentralDispatchPasteForm />
        </SectionCard>
      </section>

      {driver ? (
        <>
          <SectionCard
            title="Route Chain Map"
            description={
              activeLoad
                ? "Active route, where the truck goes empty, and candidate pickups color-coded by verdict."
                : "Candidate pickups color-coded by verdict. Assign a load to draw the active route and empty-after-delivery zone."
            }
          >
            <DispatchMap
              driverPosition={driverPosition}
              driverName={driver.name}
              driverLocationLabel={driver.current_location}
              activeRoute={activeRoute}
              candidateLoads={candidateLoadPins}
            />
            {(driverLoc && !driverPosition) ||
            candidateLoadPins.some((p) => !p.pickup) ||
            (activeRoute && (!activeRoute.pickup || !activeRoute.delivery)) ? (
              <p className="mt-3 text-xs text-amber-200/80">
                Some locations could not be geocoded yet. The map updates as Nominatim resolves them (rate-limited to 1/sec).
              </p>
            ) : null}
          </SectionCard>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Take</p>
              <p className="mt-2 text-3xl font-semibold text-white">{takeLoads.length}</p>
            </div>
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Maybe</p>
              <p className="mt-2 text-3xl font-semibold text-white">{maybeLoads.length}</p>
            </div>
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-rose-200">Risky</p>
              <p className="mt-2 text-3xl font-semibold text-white">{riskyLoads.length}</p>
            </div>
          </section>

          <SectionCard title="Load Fit" description="Ranked by zone fit, rate per mile, trailer fit, and where the driver ends.">
            <div className="space-y-4">
              {loadFits.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
                  No candidate loads yet. Paste a Central Dispatch load above.
                </p>
              ) : (
                loadFits.map((fit) => (
                  <article key={fit.load.id} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${verdictStyle(fit.verdict)}`}>
                            {verdictLabel(fit.verdict)}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                            Score {fit.score}
                          </span>
                          {fit.revenuePerMile ? (
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                              ${fit.revenuePerMile.toFixed(2)}/mi
                            </span>
                          ) : null}
                        </div>
                        <h2 className="mt-3 text-xl font-semibold text-white">{routeLabel(fit.load)}</h2>
                        <p className="mt-2 text-sm text-slate-300">
                          {fit.load.vehicle_type} · {formatCurrency(fit.load.price)} · Pickup {formatDate(fit.load.pickup_date)}
                        </p>
                        <p className="mt-3 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-3 text-sm text-sky-100">
                          {fit.nextMove}
                        </p>
                        <div className="mt-3 grid gap-2 md:grid-cols-2">
                          {fit.reasons.map((reason) => (
                            <p key={reason} className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-100">
                              {reason}
                            </p>
                          ))}
                          {fit.warnings.map((warning) => (
                            <p key={warning} className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-100">
                              {warning}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                        <Link
                          href={`/loads/${fit.load.id}`}
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-slate-100 transition hover:border-sky-400/30"
                        >
                          Open
                        </Link>
                        {fit.verdict !== "RISKY" ? (
                          <form action={sendOfferAction}>
                            <input type="hidden" name="load_id" value={fit.load.id} />
                            <input type="hidden" name="driver_id" value={driver.id} />
                            <input type="hidden" name="price" value={fit.load.price} />
                            <input type="hidden" name="return_to" value={`/dispatcher?driverId=${driver.id}`} />
                            <button className="w-full rounded-2xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
                              Offer
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </SectionCard>

          <section className="grid gap-6 xl:grid-cols-2">
            <SectionCard title="Backhaul Watch" description="Loads that may leave the driver hunting for the next pickup.">
              <div className="space-y-3">
                {backhaulNeeds.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400">
                    No deadhead warnings on the current candidate board.
                  </p>
                ) : (
                  backhaulNeeds.map((fit) => (
                    <div key={fit.load.id} className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                      <p className="font-semibold text-white">{routeLabel(fit.load)}</p>
                      <p className="mt-2 text-sm text-amber-100">{fit.nextMove}</p>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>

            <SectionCard title="Possible Pairs" description="Candidate loads that chain by delivery and next pickup market.">
              <div className="space-y-3">
                {pairSuggestions.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400">
                    Paste more candidate loads to find pairings.
                  </p>
                ) : (
                  pairSuggestions.map((pair) => (
                    <div key={`${pair.first.id}-${pair.next.id}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pair score {pair.score}</p>
                      <p className="mt-2 text-sm font-semibold text-white">1. {routeLabel(pair.first)}</p>
                      <p className="mt-1 text-sm font-semibold text-white">2. {routeLabel(pair.next)}</p>
                      <p className="mt-2 text-sm text-slate-300">{pair.reason}</p>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>
          </section>
        </>
      ) : null}
    </div>
  );
}
