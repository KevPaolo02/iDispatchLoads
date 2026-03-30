import Link from "next/link";
import type { Metadata } from "next";

import { PagePlaybook } from "@/components/dashboard/page-playbook";
import { ReloadPriorityBadge } from "@/components/dashboard/status-badge";
import {
  getDispatcherAccountOptions,
  requireDashboardSession,
} from "@/lib/auth";
import {
  listDrivers,
  listLoadOpportunities,
  listLoads,
  listLoadVehicles,
  listProblemFlags,
} from "@/lib/db";
import {
  buildDispatcherPerformanceEntries,
  buildDashboardKpis,
  buildFleetMovementEntries,
  buildFollowUpQueues,
  buildLoadReviewEntries,
  buildReloadPriorityEntries,
  filterDriversForAccess,
  filterLoadsForAccess,
  filterOpportunitiesForAccess,
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

function QuickActionCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[1.5rem] border border-sky-100 bg-gradient-to-br from-white via-sky-50/80 to-emerald-50/60 p-5 shadow-[0_22px_60px_-40px_rgba(14,165,233,0.45)] transition hover:border-[var(--color-primary)] hover:from-white hover:to-sky-50"
    >
      <p className="font-heading text-xl font-semibold text-slate-950">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <p className="mt-4 text-sm font-semibold text-[var(--color-primary)]">
        Open
      </p>
    </Link>
  );
}

function DispatcherLeaderboard({
  entries,
}: {
  entries: Array<{
    email: string;
    label: string;
    assignedUnits: number;
    totalLoads: number;
    activeLoads: number;
    deliveredLoads: number;
    openOpportunities: number;
    problemLoads: number;
    lastActivityAt: string | null;
  }>;
}) {
  return (
    <section className="rounded-[1.5rem] border border-sky-100 bg-white p-6 shadow-[0_20px_60px_-38px_rgba(14,165,233,0.35)]">
      <div>
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          Dispatcher Leaderboard
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Owner view of dispatcher workload and completed dispatch output.
        </p>
      </div>

      {!entries.length ? (
        <p className="mt-4 text-sm leading-6 text-slate-500">
          No dispatcher-assigned units yet.
        </p>
      ) : (
        <>
          <div className="mt-5 space-y-3 md:hidden">
            {entries.map((entry) => (
              <article
                key={entry.email}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{entry.label}</p>
                    <p className="mt-1 break-all text-xs text-slate-500">
                      {entry.email}
                    </p>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    {entry.totalLoads} loads
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
                  <p>Units: {entry.assignedUnits}</p>
                  <p>Active: {entry.activeLoads}</p>
                  <p>Delivered: {entry.deliveredLoads}</p>
                  <p>Open opps: {entry.openOpportunities}</p>
                  <p>Problems: {entry.problemLoads}</p>
                  <p>
                    Last:{" "}
                    {entry.lastActivityAt
                      ? formatDateTime(entry.lastActivityAt)
                      : "No activity"}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="text-xs uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="pb-3 pr-4">Dispatcher</th>
                <th className="pb-3 pr-4">Units</th>
                <th className="pb-3 pr-4">Total Loads</th>
                <th className="pb-3 pr-4">Active</th>
                <th className="pb-3 pr-4">Delivered</th>
                <th className="pb-3 pr-4">Open Opps</th>
                <th className="pb-3 pr-4">Problems</th>
                <th className="pb-3">Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.email} className="border-t border-slate-200">
                  <td className="py-4 pr-4">
                    <p className="font-semibold text-slate-950">{entry.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{entry.email}</p>
                  </td>
                  <td className="py-4 pr-4">{entry.assignedUnits}</td>
                  <td className="py-4 pr-4 font-semibold text-slate-950">
                    {entry.totalLoads}
                  </td>
                  <td className="py-4 pr-4">{entry.activeLoads}</td>
                  <td className="py-4 pr-4">{entry.deliveredLoads}</td>
                  <td className="py-4 pr-4">{entry.openOpportunities}</td>
                  <td className="py-4 pr-4">{entry.problemLoads}</td>
                  <td className="py-4">
                    {entry.lastActivityAt
                      ? formatDateTime(entry.lastActivityAt)
                      : "No activity yet"}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

export default async function DashboardHomePage() {
  const session = await requireDashboardSession();
  const dispatcherOptions = getDispatcherAccountOptions();
  const [drivers, loads, opportunities, loadVehicles, problemFlags] =
    await Promise.all([
      listDrivers(),
      listLoads(),
      listLoadOpportunities(),
      listLoadVehicles(),
      listProblemFlags(),
    ]);

  const scopedDrivers = filterDriversForAccess(drivers, session);
  const visibleDriverIds = new Set(scopedDrivers.map((driver) => driver.id));
  const scopedLoads = filterLoadsForAccess(loads, visibleDriverIds, session);
  const scopedOpportunities = filterOpportunitiesForAccess(
    opportunities,
    visibleDriverIds,
    session,
  );

  const loadEntries = buildLoadReviewEntries(
    scopedLoads,
    scopedDrivers,
    loadVehicles,
    problemFlags,
  );
  const kpis = buildDashboardKpis(
    scopedLoads,
    scopedOpportunities,
    problemFlags,
    loadEntries,
  );
  const followUpQueues = buildFollowUpQueues(
    scopedLoads,
    scopedOpportunities,
    problemFlags,
    scopedDrivers,
  );
  const reloadPriorityEntries = buildReloadPriorityEntries(
    buildFleetMovementEntries(scopedDrivers, scopedLoads, scopedOpportunities),
  );
  const dispatcherPerformanceEntries =
    session.role === "admin"
      ? buildDispatcherPerformanceEntries(
          drivers,
          loads,
          opportunities,
          problemFlags,
          dispatcherOptions,
        )
      : [];

  return (
    <section className="space-y-8">
      <div className="rounded-[1.75rem] border border-sky-100 bg-gradient-to-r from-white via-sky-50 to-emerald-50 px-5 py-5 shadow-[0_26px_70px_-50px_rgba(14,165,233,0.5)]">
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
      </div>

      <PagePlaybook
        eyebrow={session.role === "admin" ? "Owner View" : "Dispatcher View"}
        title="Start here every day"
        description={
          session.role === "admin"
            ? "Use this page to see who needs help, which units are at risk of sitting, and which dispatcher owns the most active work."
            : "Use this page as your home base. Work the follow-up queues first, then move into Fleet Movement for new board posts and Dispatch for booked loads."
        }
        steps={
          session.role === "admin"
            ? [
                {
                  title: "Check the queues first",
                  description:
                    "Anything in follow-up, problem loads, or booked-missing-driver-info needs attention before new work.",
                },
                {
                  title: "Watch reload risk",
                  description:
                    "Open Fleet Movement when a Daniel Gruas LLC unit is about to sit or has no next opportunity attached.",
                },
                {
                  title: "Coach by volume and outcomes",
                  description:
                    "Use the dispatcher leaderboard to see workload, active execution, and who is closing the most work.",
                },
              ]
            : [
                {
                  title: "Work the follow-up queues",
                  description:
                    "Start with the top queues below. They tell you what must be touched now so nothing goes stale.",
                },
                {
                  title: "Capture and assign new board posts",
                  description:
                    "Go to Fleet Movement to log new Central Dispatch, Super Dispatch, ACV, or other board opportunities.",
                },
                {
                  title: "Move booked work into Dispatch",
                  description:
                    "Once a move is confirmed, create the booked load and keep status, contacts, pricing, and notes current.",
                },
              ]
        }
        actions={[
          { label: "Open Training", href: "/dashboard/training" },
          { label: "Open Reports", href: "/dashboard/reports" },
          { label: "Open Fleet Movement", href: "/dashboard/movement" },
          { label: "Open Dispatch Board", href: "/dashboard/dispatch" },
          ...(session.role === "admin"
            ? [{ label: "Review Leads", href: "/dashboard/leads" }]
            : []),
        ]}
      />

      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="font-heading text-2xl font-semibold text-slate-950">
            Quick Actions
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            Best next taps for phone and tablet work.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <QuickActionCard
            title="Work urgent queues"
            description="Handle follow-up, problem loads, and missing info before taking new work."
            href="#urgent-queues"
          />
          <QuickActionCard
            title="Capture board posts"
            description="Log fresh Central Dispatch, Super Dispatch, or ACV opportunities."
            href="/dashboard/movement"
          />
          <QuickActionCard
            title="Run booked loads"
            description="Open confirmed work, send route details, and update execution status."
            href="/dashboard/dispatch"
          />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        <article className="rounded-[1.5rem] border border-sky-100 bg-gradient-to-br from-white to-sky-50 p-5 shadow-[0_18px_60px_-35px_rgba(14,165,233,0.3)]">
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
        <article className="rounded-[1.5rem] border border-amber-100 bg-gradient-to-br from-white to-amber-50 p-5 shadow-[0_18px_60px_-35px_rgba(245,158,11,0.22)]">
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
        <article className="rounded-[1.5rem] border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-5 shadow-[0_18px_60px_-35px_rgba(16,185,129,0.22)]">
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
        <article className="rounded-[1.5rem] border border-rose-100 bg-gradient-to-br from-white to-rose-50 p-5 shadow-[0_18px_60px_-35px_rgba(244,63,94,0.18)]">
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

      <section id="urgent-queues" className="grid gap-4 xl:grid-cols-3">
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

      {session.role === "admin" ? (
        <DispatcherLeaderboard entries={dispatcherPerformanceEntries} />
      ) : null}

      <section className="rounded-[1.5rem] border border-amber-100 bg-gradient-to-br from-white to-amber-50/70 p-6 shadow-[0_18px_60px_-35px_rgba(245,158,11,0.18)]">
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
                className="rounded-2xl border border-amber-100 bg-white/80 p-4"
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
