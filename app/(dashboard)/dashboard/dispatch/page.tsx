import type { Metadata } from "next";

import { DispatchBoard } from "@/components/dashboard/dispatch-board";
import { getLeadById, listDrivers, listLoads } from "@/lib/db";
import {
  buildDriverReviewEntries,
  buildLoadReviewEntries,
  filterDriverReviewEntries,
  filterLoadReviewEntries,
  parseDispatchBoardFilters,
} from "@/lib/services";

type DashboardDispatchPageProps = {
  searchParams?: Promise<{
    leadId?: string;
    driverId?: string;
    driverStatus?: string;
    driverQuery?: string;
    loadStatus?: string;
    loadQuery?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Dispatch Lite | iDispatchLoads",
};

export const dynamic = "force-dynamic";

export default async function DashboardDispatchPage({
  searchParams,
}: DashboardDispatchPageProps) {
  let drivers = [];
  let loads = [];
  let selectedLead = null;
  let preselectedDriverId = null;

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const leadId = resolvedSearchParams?.leadId;
  const driverId = resolvedSearchParams?.driverId;
  const filters = parseDispatchBoardFilters(resolvedSearchParams ?? {});
  preselectedDriverId = driverId ?? null;

  try {
    [drivers, loads, selectedLead] = await Promise.all([
      listDrivers(),
      listLoads(),
      leadId ? getLeadById(leadId) : Promise.resolve(null),
    ]);
  } catch (error) {
    console.error("[dashboard-dispatch] Failed to load dispatch board", error);

    return (
      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
            Dispatch Lite
          </p>
          <h1 className="font-heading text-3xl font-semibold text-slate-950 sm:text-4xl">
            Dispatch board is temporarily unavailable.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            The internal dispatch board could not read the current drivers or
            loads. Check the latest repository logs and confirm the new
            Supabase migration has been applied.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 px-6 py-5 text-sm leading-6 text-rose-700">
          Dispatch Lite depends directly on the new `drivers` and `loads`
          tables. If they are missing, run the latest Supabase migration before
          using this page.
        </div>
      </section>
    );
  }

  const driverEntries = buildDriverReviewEntries(drivers, loads);
  const visibleDriverEntries = filterDriverReviewEntries(driverEntries, filters);
  const loadEntries = buildLoadReviewEntries(loads, drivers);
  const visibleLoadEntries = filterLoadReviewEntries(loadEntries, filters);

  return (
    <DispatchBoard
      drivers={drivers}
      loads={loads}
      driverEntries={visibleDriverEntries}
      loadEntries={visibleLoadEntries}
      filters={filters}
      selectedLead={selectedLead}
      preselectedDriverId={preselectedDriverId}
    />
  );
}
