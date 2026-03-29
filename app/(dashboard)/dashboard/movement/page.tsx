import type { Metadata } from "next";

import { MovementBoard } from "@/components/dashboard/movement-board";
import {
  listDrivers,
  listLoadOpportunities,
  listLoadOpportunityVehicles,
  listLoads,
  listProblemFlags,
} from "@/lib/db";
import {
  buildFleetMovementEntries,
  buildOpportunityBoardEntries,
  buildReloadPriorityEntries,
} from "@/lib/services";

export const metadata: Metadata = {
  title: "Fleet Movement | iDispatchLoads",
};

export const dynamic = "force-dynamic";

export default async function DashboardMovementPage() {
  let drivers = [];
  let loads = [];
  let opportunities = [];
  let opportunityVehicles = [];
  let problemFlags = [];

  try {
    [drivers, loads, opportunities, opportunityVehicles, problemFlags] =
      await Promise.all([
      listDrivers(),
      listLoads(),
      listLoadOpportunities(),
      listLoadOpportunityVehicles(),
      listProblemFlags(),
    ]);
  } catch (error) {
    console.error("[dashboard-movement] Failed to load movement board", error);

    return (
      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
            Fleet Movement
          </p>
          <h1 className="font-heading text-3xl font-semibold text-slate-950 sm:text-4xl">
            Movement board is temporarily unavailable.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            The board could not read drivers, loads, or board opportunities.
            Check the latest repository logs and confirm the movement migration
            has been applied.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 px-6 py-5 text-sm leading-6 text-rose-700">
          Fleet Movement depends on the extended `drivers` fields and the new
          `load_opportunities` table. Run the latest Supabase migration before
          using this page.
        </div>
      </section>
    );
  }

  const fleetEntries = buildFleetMovementEntries(drivers, loads, opportunities);
  const opportunityEntries = buildOpportunityBoardEntries(
    opportunities,
    drivers,
    opportunityVehicles,
    problemFlags,
  );
  const reloadPriorityEntries = buildReloadPriorityEntries(fleetEntries);

  return (
    <MovementBoard
      drivers={drivers}
      fleetEntries={fleetEntries}
      opportunityEntries={opportunityEntries}
      reloadPriorityEntries={reloadPriorityEntries}
    />
  );
}
