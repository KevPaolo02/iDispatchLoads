import Link from "next/link";

import { updateDriverLoadStatusAction, updateDriverLocationAction, updateOfferStatusAction } from "@/app/(dashboard)/actions";
import { FlashBanner } from "@/components/flash-banner";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { getDriverPanelData } from "@/lib/data";
import { formatCurrency, formatDate, normalizeArray, routeLabel } from "@/lib/utils";

export default async function DriverViewPage({
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
  const activeLoads = assignedLoads.filter((load) => load.status !== "COMPLETED");
  const completedLoads = assignedLoads.filter((load) => load.status === "COMPLETED");

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {error ? <FlashBanner type="error" message={error} /> : null}
      {success ? <FlashBanner type="success" message={success} /> : null}

      {drivers.length === 0 ? (
        <SectionCard title="Vista del Chofer" description="No hay choferes todavia.">
          <Link
            href="/drivers"
            className="inline-flex rounded-2xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
          >
            Crear chofer
          </Link>
        </SectionCard>
      ) : null}

      {!selectedDriver && drivers.length > 1 ? (
        <SectionCard title="Escoge chofer" description="Selecciona el chofer para ver sus ofertas y cargas.">
          <div className="grid gap-3">
            {drivers.map((driver) => (
              <Link
                key={driver.id}
                href={`/driver?driverId=${driver.id}`}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:border-sky-400/30 hover:bg-sky-400/10"
              >
                <p className="font-semibold text-white">{driver.name}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {driver.current_location} · {driver.trailer_type}
                </p>
              </Link>
            ))}
          </div>
        </SectionCard>
      ) : null}

      {selectedDriver ? (
        <>
          <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-sky-300">Vista del Chofer</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-white">Hola, {selectedDriver.name}</h1>
                <p className="mt-2 text-sm text-slate-300">
                  {selectedDriver.current_location} · {selectedDriver.trailer_type}
                </p>
              </div>
              <StatusBadge status={selectedDriver.is_available ? "available" : "offline"} />
            </div>
          </section>

          <SectionCard title="Mi Ubicacion" description="Actualiza donde estas para que el dispatcher pueda escoger mejores cargas.">
            <form action={updateDriverLocationAction} className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input type="hidden" name="driver_id" value={selectedDriver.id} />
              <input type="hidden" name="return_to" value={`/driver?driverId=${selectedDriver.id}`} />
              <label className="space-y-2 text-sm text-slate-300">
                Ciudad, estado
                <input
                  name="current_location"
                  defaultValue={selectedDriver.current_location}
                  placeholder="Newark, NJ"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400/50"
                />
              </label>
              <button className="self-end rounded-2xl bg-sky-400 px-4 py-3 text-base font-semibold text-slate-950 transition hover:bg-sky-300">
                Actualizar
              </button>
            </form>
          </SectionCard>

          <SectionCard title="Ofertas Pendientes" description={`${pendingOffers.length} ofertas esperando respuesta.`}>
            <div className="space-y-4">
              {pendingOffers.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400">
                  No tienes ofertas pendientes.
                </p>
              ) : (
                pendingOffers.map((offer) => (
                  <article key={offer.id} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={offer.status} />
                        <p className="text-sm font-semibold text-emerald-200">{formatCurrency(offer.offered_price)}</p>
                      </div>
                      {offer.load ? (
                        <>
                          <h2 className="text-xl font-semibold text-white">{routeLabel(offer.load)}</h2>
                          <p className="text-sm text-slate-300">
                            Recoger: {formatDate(offer.load.pickup_date)} · {offer.load.vehicle_type}
                          </p>
                        </>
                      ) : null}
                      <p className="text-sm leading-6 text-slate-300">{offer.message_body}</p>
                    </div>

                    <form action={updateOfferStatusAction} className="mt-4 grid grid-cols-2 gap-3">
                      <input type="hidden" name="offer_id" value={offer.id} />
                      <input type="hidden" name="agreed_price" value={offer.offered_price ?? ""} />
                      <input type="hidden" name="return_to" value={`/driver?driverId=${selectedDriver.id}`} />
                      <button
                        name="decision"
                        value="accepted"
                        className="rounded-2xl bg-emerald-400 px-4 py-3 text-base font-semibold text-slate-950 transition hover:bg-emerald-300"
                      >
                        Aceptar
                      </button>
                      <button
                        name="decision"
                        value="rejected"
                        className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-base font-semibold text-rose-100 transition hover:bg-rose-400/20"
                      >
                        Rechazar
                      </button>
                    </form>
                  </article>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title="Mis Cargas" description={`${activeLoads.length} cargas activas.`}>
            <div className="space-y-4">
              {activeLoads.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400">
                  No tienes cargas activas.
                </p>
              ) : (
                activeLoads.map((load) => (
                  <article key={load.id} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={load.status} />
                      {load.driver_status ? <StatusBadge status={load.driver_status} /> : null}
                    </div>
                    <h2 className="mt-3 text-xl font-semibold text-white">{routeLabel(load)}</h2>
                    <p className="mt-2 text-sm text-slate-300">
                      Recoger: {formatDate(load.pickup_date)} · {load.vehicle_type}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-200">
                      Pago: {formatCurrency(load.agreed_price ?? load.price)}
                    </p>

                    <form action={updateDriverLoadStatusAction} className="mt-4 grid gap-3 sm:grid-cols-3">
                      <input type="hidden" name="load_id" value={load.id} />
                      <input type="hidden" name="return_to" value={`/driver?driverId=${selectedDriver.id}`} />
                      <button
                        name="driver_status"
                        value="en_route"
                        className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-base font-semibold text-sky-100 transition hover:bg-sky-400/20"
                      >
                        En camino
                      </button>
                      <button
                        name="driver_status"
                        value="picked_up"
                        className="rounded-2xl border border-fuchsia-400/30 bg-fuchsia-400/10 px-4 py-3 text-base font-semibold text-fuchsia-100 transition hover:bg-fuchsia-400/20"
                      >
                        Recogido
                      </button>
                      <button
                        name="driver_status"
                        value="delivered"
                        className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-base font-semibold text-emerald-100 transition hover:bg-emerald-400/20"
                      >
                        Entregado
                      </button>
                    </form>
                  </article>
                ))
              )}
            </div>
          </SectionCard>

          {completedLoads.length > 0 ? (
            <SectionCard title="Entregadas" description={`${completedLoads.length} cargas completadas.`}>
              <div className="space-y-3">
                {completedLoads.map((load) => (
                  <div key={load.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-semibold text-white">{routeLabel(load)}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {formatDate(load.pickup_date)} · {formatCurrency(load.agreed_price ?? load.price)}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
