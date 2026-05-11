import {
  createDriverAction,
  deleteDriverAction,
  updateDriverAction,
  updateDriverLocationAction,
} from "@/app/(dashboard)/actions";
import { ConfirmForm } from "@/components/confirm-form";
import { DriverForm } from "@/components/driver-form";
import { FlashBanner } from "@/components/flash-banner";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { getDriversData } from "@/lib/data";
import { preferredRoutesInput } from "@/lib/form-utils";
import { normalizeArray } from "@/lib/utils";

export default async function DriversPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const error = normalizeArray(params.error)[0];
  const success = normalizeArray(params.success)[0];
  const { drivers, assignedCountByDriver } = await getDriversData();

  return (
    <div className="space-y-8">
      {error ? <FlashBanner type="error" message={error} /> : null}
      {success ? <FlashBanner type="success" message={success} /> : null}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard
          title="Add Driver"
          description="Keep the roster light and current so matching stays reliable."
        >
          <DriverForm action={createDriverAction} submitLabel="Save driver" returnTo="/drivers" />
        </SectionCard>

        <SectionCard
          title="Route Profile Notes"
          description="Use preferred routes as the driver's working zone for the route planner."
        >
          <div className="space-y-3 text-sm text-slate-300">
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4">
              For your local driver, enter zones like NJ, NY, CT, PA plus notes such as North Jersey local or Philly okay.
            </p>
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4">
              The route planner uses these zones to decide whether a load keeps the driver working or leaves him needing a backhaul.
            </p>
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Current location is stored as free text like <span className="font-mono text-slate-200">Newark, NJ</span>. Keep the state code consistent.
            </p>
          </div>
        </SectionCard>
      </section>

      <SectionCard title="Driver Roster" description="Edit driver details inline without leaving the page.">
        <div className="space-y-4">
          {drivers.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
              No drivers yet. Add the first driver to unlock matching and offers.
            </p>
          ) : (
            drivers.map((driver) => (
              <div key={driver.id} className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{driver.name}</h3>
                      <StatusBadge status={driver.is_available ? "available" : "offline"} />
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      {assignedCountByDriver.get(driver.id) ?? 0} historical assigned loads
                    </p>
                  </div>

                  <ConfirmForm
                    action={deleteDriverAction}
                    confirmMessage={`Delete ${driver.name}? Active assignments must be unassigned first.`}
                  >
                    <input type="hidden" name="id" value={driver.id} />
                    <input type="hidden" name="return_to" value="/drivers" />
                    <button className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20">
                      Delete driver
                    </button>
                  </ConfirmForm>
                </div>

                {/* Phase 3.4 — inline location edit. Feeds the route planner map. */}
                <form
                  action={updateDriverLocationAction}
                  className="mb-5 flex flex-col gap-2 rounded-2xl border border-sky-400/20 bg-sky-400/5 p-3 sm:flex-row sm:items-end"
                >
                  <input type="hidden" name="driver_id" value={driver.id} />
                  <input type="hidden" name="return_to" value="/drivers" />
                  <label className="flex-1 space-y-1 text-xs uppercase tracking-[0.18em] text-sky-200">
                    Current location
                    <input
                      name="current_location"
                      defaultValue={driver.current_location}
                      placeholder="Newark, NJ"
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm normal-case tracking-normal text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400/50"
                    />
                  </label>
                  <button className="rounded-2xl border border-sky-400/40 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/20">
                    Save location
                  </button>
                </form>

                <form action={updateDriverAction} className="space-y-4">
                  <input type="hidden" name="id" value={driver.id} />
                  <input type="hidden" name="return_to" value="/drivers" />

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2 text-sm text-slate-300">
                      Name
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-slate-100 outline-none transition focus:border-sky-400/50"
                        name="name"
                        defaultValue={driver.name}
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-300">
                      Phone
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-slate-100 outline-none transition focus:border-sky-400/50"
                        name="phone"
                        defaultValue={driver.phone}
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
                      Current location
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-slate-100 outline-none transition focus:border-sky-400/50"
                        name="current_location"
                        defaultValue={driver.current_location}
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
                      Preferred routes / zones
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-slate-100 outline-none transition focus:border-sky-400/50"
                        name="preferred_routes"
                        defaultValue={preferredRoutesInput(driver.preferred_routes)}
                        placeholder="NJ, NY, CT, PA, North Jersey local, Philly okay"
                      />
                    </label>
                    <label className="space-y-2 text-sm text-slate-300">
                      Trailer type
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-slate-100 outline-none transition focus:border-sky-400/50"
                        name="trailer_type"
                        defaultValue={driver.trailer_type}
                      />
                    </label>
                    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        name="is_available"
                        defaultChecked={driver.is_available}
                        className="size-4 rounded border-white/20 bg-slate-950"
                      />
                      Available for matching
                    </label>
                  </div>

                  <button className="rounded-2xl bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
                    Update driver
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
}
