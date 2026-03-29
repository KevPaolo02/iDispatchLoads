import Link from "next/link";
import type { Metadata } from "next";

import { ReloadPriorityBadge } from "@/components/dashboard/status-badge";
import {
  listDrivers,
  listLoadOpportunities,
  listLoads,
  listLoadVehicles,
  listProblemFlags,
} from "@/lib/db";
import {
  buildDashboardKpis,
  buildFleetMovementEntries,
  buildFollowUpQueues,
  buildLoadReviewEntries,
  buildReloadPriorityEntries,
} from "@/lib/services";

export const metadata: Metadata = {
  title: "Dispatcher Dashboard | iDispatchLoads",
};

export const dynamic = "force-dynamic";

function formatCurrency(value: number | null) {
  if (value === null) {
    return "TBD";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function QueueSection({
  title,
  items,
}: {
  title: string;
  items: Array<{
    id: string;
    title: string;
    href: string;
    status: string;
    reason: string;
    lastTouchedAt: string;
  }>;
}) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          {title}
        </h2>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
          {items.length}
        </span>
      </div>

      {!items.length ? (
        <p className="mt-4 text-sm leading-6 text-slate-500">
          Nothing is waiting in this queue right now.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-[var(--color-primary)] hover:bg-white"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-1 text-sm uppercase tracking-[0.12em] text-slate-500">
                    {item.status.replaceAll("_", " ")}
                  </p>
                </div>
                <p className="text-sm text-slate-500">
                  {formatDateTime(item.lastTouchedAt)}
                </p>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {item.reason}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default async function DashboardHomePage() {
  const [drivers, loads, opportunities, loadVehicles, problemFlags] =
    await Promise.all([
      listDrivers(),
      listLoads(),
      listLoadOpportunities(),
      listLoadVehicles(),
      listProblemFlags(),
    ]);

  const loadEntries = buildLoadReviewEntries(
    loads,
    drivers,
    loadVehicles,
    problemFlags,
  );
  const kpis = buildDashboardKpis(
    loads,
    opportunities,
    problemFlags,
    loadEntries,
  );
  const followUpQueues = buildFollowUpQueues(
    loads,
    opportunities,
    problemFlags,
    drivers,
  );
  const reloadPriorityEntries = buildReloadPriorityEntries(
    buildFleetMovementEntries(drivers, loads, opportunities),
  );

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
          Dispatcher Dashboard
        </p>
        <h1 className="font-heading text-3xl font-semibold text-slate-950 sm:text-4xl">
          Clear priorities, fast handoffs, and fewer Kevin-only details.
        </h1>
        <p className="max-w-3xl text-base leading-7 text-slate-600">
          This board puts follow-up, reload risk, bookings, and problem loads in
          front of the dispatcher first so daily work can move without guesswork.
        </p>
      </div>

      <section className="grid gap-4 xl:grid-cols-4">
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
            New Opportunities
          </p>
          <p className="mt-3 font-heading text-3xl font-semibold text-slate-950">
            {kpis.today.newOpportunities}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {kpis.week.newOpportunities} in the last 7 days
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
            Loads Posted / Booked
          </p>
          <p className="mt-3 font-heading text-3xl font-semibold text-slate-950">
            {kpis.today.loadsPosted} / {kpis.today.loadsBooked}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {kpis.week.loadsPosted} posted and {kpis.week.loadsBooked} booked
            this week
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
            Pickups / Deliveries
          </p>
          <p className="mt-3 font-heading text-3xl font-semibold text-slate-950">
            {kpis.today.pickups} / {kpis.today.deliveries}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Today&apos;s schedule pulse
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
            Avg Margin / Problem Loads
          </p>
          <p className="mt-3 font-heading text-3xl font-semibold text-slate-950">
            {formatCurrency(kpis.averageMargin)}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {kpis.problemLoads} problem load{kpis.problemLoads === 1 ? "" : "s"} •{" "}
            {kpis.loadsNotTouchedToday} not touched today
          </p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <QueueSection
          title="Needs Follow-Up Now"
          items={followUpQueues.needsFollowUpNow}
        />
        <QueueSection
          title="Not Touched 4+ Hours"
          items={followUpQueues.notTouchedFourHours}
        />
        <QueueSection
          title="Problem Loads"
          items={followUpQueues.problemLoads}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <QueueSection title="Pickup Today" items={followUpQueues.pickupToday} />
        <QueueSection
          title="Pickup Tomorrow"
          items={followUpQueues.pickupTomorrow}
        />
        <QueueSection
          title="Booked Missing Driver Info"
          items={followUpQueues.bookedMissingDriverInfo}
        />
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-slate-950">
              Reload Priority
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Units that need the next move before they sit.
            </p>
          </div>
          <Link
            href="/dashboard/movement"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            Open Movement Board
          </Link>
        </div>

        {!reloadPriorityEntries.length ? (
          <p className="mt-4 text-sm leading-6 text-slate-500">
            No Daniel Gruas LLC unit is exposed in the reload queue right now.
          </p>
        ) : (
          <div className="mt-5 grid gap-4 xl:grid-cols-3">
            {reloadPriorityEntries.map((entry) => (
              <article
                key={entry.driver.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">
                      {entry.driver.driverName}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {entry.driver.currentLocation ?? entry.driver.homeBase}
                    </p>
                  </div>
                  <ReloadPriorityBadge level={entry.level} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {entry.reason}
                </p>
                <p className="mt-3 text-sm text-slate-500">
                  Ready at:{" "}
                  {entry.readyAt ? formatDateTime(entry.readyAt) : "No ready time"}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
