import { createLoadAction } from "@/app/(dashboard)/actions";
import { CentralDispatchPasteForm } from "@/components/central-dispatch-paste-form";
import { FlashBanner } from "@/components/flash-banner";
import { LoadForm } from "@/components/load-form";
import { LoadTable } from "@/components/load-table";
import { SectionCard } from "@/components/section-card";
import { SummaryCard } from "@/components/summary-card";
import { StatusBadge } from "@/components/status-badge";
import { getContacts, getDashboardData } from "@/lib/data";
import { normalizeArray } from "@/lib/utils";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const error = normalizeArray(params.error)[0];
  const success = normalizeArray(params.success)[0];
  const [{ loads, drivers }, contacts] = await Promise.all([
    getDashboardData(),
    getContacts(),
  ]);

  const newLoads = loads.filter((load) => load.status === "NEW").length;
  const offeredLoads = loads.filter((load) => load.status === "OFFERED").length;
  const assignedLoads = loads.filter((load) => load.status === "ASSIGNED").length;
  const availableDrivers = drivers.filter((driver) => driver.is_available).length;

  return (
    <div className="space-y-8">
      {error ? <FlashBanner type="error" message={error} /> : null}
      {success ? <FlashBanner type="success" message={success} /> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="New loads" value={String(newLoads)} hint="Fresh work that still needs coverage." />
        <SummaryCard label="Offered loads" value={String(offeredLoads)} hint="Offers are out and waiting on a response." />
        <SummaryCard label="Assigned loads" value={String(assignedLoads)} hint="Loads already locked to a driver." />
        <SummaryCard label="Available drivers" value={String(availableDrivers)} hint="Drivers currently eligible for matching." />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Quick Add From CD"
          description="Paste the Central Dispatch details and create the load in one step."
        >
          <CentralDispatchPasteForm />
        </SectionCard>

        <SectionCard
          title="Manual Entry"
          description="Use this when the pasted board text is incomplete or you are entering a load from a call."
        >
          <LoadForm action={createLoadAction} submitLabel="Save load" returnTo="/" contacts={contacts} />
        </SectionCard>
      </section>

      <section className="grid gap-6">
        <SectionCard
          title="Driver Availability"
          description="Quick snapshot of current capacity before you start sending offers."
        >
          <div className="space-y-3">
            {drivers.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                No drivers yet. Add a driver on the Drivers page to enable matching.
              </p>
            ) : (
              drivers.map((driver) => (
                <div key={driver.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{driver.name}</p>
                      <StatusBadge status={driver.is_available ? "available" : "offline"} />
                    </div>
                    <p className="mt-1 text-sm text-slate-300">
                      {driver.current_location} · {driver.trailer_type}
                    </p>
                  </div>
                  <p className="text-sm text-slate-400">
                    {driver.is_available ? "Eligible for matching" : "Hidden from matching until available"}
                  </p>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Dispatch Board"
        description="Table view of current loads with quick offer sending to the best-ranked driver."
      >
        <LoadTable loads={loads} />
      </SectionCard>
    </div>
  );
}
