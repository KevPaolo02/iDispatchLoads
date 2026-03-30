import Link from "next/link";
import type { Metadata } from "next";

import { PagePlaybook } from "@/components/dashboard/page-playbook";
import { StatusBadge } from "@/components/dashboard/status-badge";
import {
  requireDashboardSession,
} from "@/lib/auth";
import {
  buildReportFileName,
  loadOperationsReportSnapshot,
  parseReportFilters,
  reportPeriodPresets,
} from "@/lib/services";

type DashboardReportsPageProps = {
  searchParams?: Promise<{
    period?: string;
    from?: string;
    to?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Reports | iDispatchLoads",
};

export const dynamic = "force-dynamic";

function buildReportExportQuery({
  period,
  from,
  to,
}: {
  period: string;
  from: string;
  to: string;
}) {
  const params = new URLSearchParams({
    period,
    from,
    to,
  });

  return params.toString();
}

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

function formatDateTime(value: string | null) {
  if (!value) {
    return "TBD";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 font-heading text-3xl font-semibold text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </article>
  );
}

function StatusBreakdownSection({
  title,
  rows,
}: {
  title: string;
  rows: Array<{
    status: string;
    count: number;
  }>;
}) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]">
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          {title}
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Snapshot of records created inside this report window.
        </p>
      </div>

      {!rows.length ? (
        <p className="mt-4 text-sm leading-6 text-slate-500">
          No records in this period yet.
        </p>
      ) : (
        <div className="mt-5 flex flex-wrap gap-3">
          {rows.map((row) => (
            <div
              key={row.status}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <StatusBadge label={row.status} />
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {row.count}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PeriodFilterForm({
  period,
  from,
  to,
}: {
  period: string;
  from: string;
  to: string;
}) {
  return (
    <form
      action="/dashboard/reports"
      method="get"
      className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]"
    >
      <div className="grid gap-4 xl:grid-cols-[14rem,12rem,12rem,auto,auto]">
        <select
          name="period"
          defaultValue={period}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        >
          {reportPeriodPresets.map((preset) => (
            <option key={preset} value={preset}>
              {preset === "day"
                ? "Today"
                : preset === "week"
                  ? "This week"
                  : preset === "month"
                    ? "This month"
                    : preset === "quarter"
                      ? "This quarter"
                      : preset === "year"
                        ? "This year"
                        : "Custom range"}
            </option>
          ))}
        </select>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          From
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          To
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
        </label>
        <button
          type="submit"
          className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-strong)]"
        >
          Run Report
        </button>
        <Link
          href="/dashboard/reports"
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}

function SimpleTable({
  title,
  description,
  headers,
  rows,
}: {
  title: string;
  description: string;
  headers: string[];
  rows: Array<Array<string | number>>;
}) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]">
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          {title}
        </h2>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>

      {!rows.length ? (
        <p className="mt-4 text-sm leading-6 text-slate-500">
          Nothing to show for this report window.
        </p>
      ) : (
        <>
          <div className="mt-5 space-y-3 md:hidden">
            {rows.map((row, index) => (
              <article
                key={index}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="space-y-3">
                  {row.map((cell, cellIndex) => (
                    <div
                      key={cellIndex}
                      className="flex flex-col gap-1 border-b border-slate-200 pb-3 last:border-b-0 last:pb-0"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {headers[cellIndex]}
                      </p>
                      <p className="text-sm leading-6 text-slate-800">{cell}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="text-xs uppercase tracking-[0.14em] text-slate-500">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="pb-3 pr-4">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-t border-slate-200">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="py-4 pr-4 align-top">
                      {cell}
                    </td>
                  ))}
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

export default async function DashboardReportsPage({
  searchParams,
}: DashboardReportsPageProps) {
  const session = await requireDashboardSession();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const filters = parseReportFilters(resolvedSearchParams ?? {});
  const { report, range } = await loadOperationsReportSnapshot({
    session: {
      role: session.role,
      email: session.email,
    },
    filters,
  });
  const exportQuery = buildReportExportQuery({
    period: filters.period,
    from: range.from,
    to: range.to,
  });
  const excelFileName = buildReportFileName(range, "csv");
  const pdfFileName = buildReportFileName(range, "pdf");

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
          Reports
        </p>
        <h1 className="font-heading text-3xl font-semibold text-slate-950 sm:text-4xl">
          Daily, weekly, monthly, quarterly, and annual reporting
        </h1>
        <p className="max-w-3xl text-base leading-7 text-slate-600">
          Use this page to review what actually happened over time instead of
          relying on memory. Reports stay scoped to the current user: owners see
          the full business, dispatchers only see their own assigned work.
        </p>
      </div>

      <PagePlaybook
        eyebrow={session.role === "admin" ? "Owner Reporting" : "Dispatcher Reporting"}
        title="How to use reports"
        description="The dashboard tells you what needs attention now. Reports tell you what happened across a period so you can review output, economics, and team performance."
        steps={[
          {
            title: "Pick a report window",
            description:
              "Use daily, weekly, monthly, quarterly, yearly, or a custom date range depending on the level of review you need.",
          },
          {
            title: "Read the summary first",
            description:
              "Start with the top KPI cards for volume, deliveries, active work, revenue, gross profit, and problem load count.",
          },
          {
            title: "Use the tables for accountability",
            description:
              "Dispatcher, unit, lane, and status sections show where work volume and outcomes are actually coming from.",
          },
        ]}
        actions={[
          { label: "Open Dashboard", href: "/dashboard" },
          { label: "Open Fleet Movement", href: "/dashboard/movement" },
          { label: "Open Dispatch", href: "/dashboard/dispatch" },
        ]}
      />

      <PeriodFilterForm
        period={filters.period}
        from={range.from}
        to={range.to}
      />

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              Export Options
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Download this report in an Excel-friendly spreadsheet or open a
              print-ready version you can save as PDF.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={`/dashboard/reports/export?${exportQuery}`}
              download={excelFileName}
              className="inline-flex items-center justify-center rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-strong)]"
            >
              Download Excel (.csv)
            </a>
            <Link
              href={`/dashboard/reports/print?${exportQuery}`}
              target="_blank"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              Print / Save PDF
            </Link>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Suggested filenames: {excelFileName} and {pdfFileName}
        </p>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
          Active report window
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <StatusBadge label={filters.period} />
          <p className="text-base font-semibold text-slate-950">
            {report.range.label}
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {session.role === "admin" ? (
          <SummaryCard
            label="New Leads"
            value={`${report.summary.leadsCreated ?? 0}`}
            hint="Leads captured in this reporting window"
          />
        ) : null}
        <SummaryCard
          label="New Opportunities"
          value={`${report.summary.opportunitiesCreated}`}
          hint="Fresh possible moves captured from boards"
        />
        <SummaryCard
          label="Loads Created"
          value={`${report.summary.loadsCreated}`}
          hint="Booked load records created in this period"
        />
        <SummaryCard
          label="Pickups / Deliveries"
          value={`${report.summary.pickupsScheduled} / ${report.summary.deliveriesScheduled}`}
          hint="Scheduled pickups and completed deliveries in this period"
        />
        <SummaryCard
          label="Revenue / Gross Profit"
          value={`${formatCurrency(report.summary.revenue)} / ${formatCurrency(report.summary.grossProfit)}`}
          hint="Booked revenue and margin from loads created in this window"
        />
        <SummaryCard
          label="Carrier Pay / Avg Gross"
          value={`${formatCurrency(report.summary.carrierPay)} / ${formatCurrency(report.summary.averageGrossProfit)}`}
          hint="Carrier payouts and average gross profit per load with pricing"
        />
        <SummaryCard
          label="Active Loads / Active Units"
          value={`${report.summary.activeLoads} / ${report.summary.activeUnits}`}
          hint="Current open work at the time you run this report"
        />
        <SummaryCard
          label="Problem Loads"
          value={`${report.summary.problemLoads}`}
          hint="Open load issues still unresolved right now"
        />
      </section>

      <SimpleTable
        title="Dispatcher Performance"
        description="Quick owner/dispatcher view of who is carrying the most work inside this reporting window."
        headers={[
          "Dispatcher",
          "Units",
          "Opps",
          "Loads",
          "Deliveries",
          "Active",
          "Revenue",
          "Gross Profit",
          "Problems",
        ]}
        rows={report.dispatcherRows.map((row) => [
          row.label,
          row.assignedUnits,
          row.opportunitiesCreated,
          row.loadsCreated,
          row.deliveriesScheduled,
          row.activeLoads,
          formatCurrency(row.revenue),
          formatCurrency(row.grossProfit),
          row.problemLoads,
        ])}
      />

      <SimpleTable
        title="Unit Performance"
        description="Use this to see which Daniel Gruas LLC units are producing work, sitting idle, or carrying the most volume."
        headers={[
          "Unit",
          "Dispatcher",
          "Status",
          "Opps",
          "Loads",
          "Deliveries",
          "Active",
          "Revenue",
          "Gross Profit",
          "Last Load",
        ]}
        rows={report.unitRows.map((row) => [
          row.driverName,
          row.dispatcherLabel,
          row.status.replaceAll("_", " "),
          row.opportunitiesCreated,
          row.loadsCreated,
          row.deliveriesScheduled,
          row.activeLoads,
          formatCurrency(row.revenue),
          formatCurrency(row.grossProfit),
          formatDateTime(row.lastLoadAt),
        ])}
      />

      <SimpleTable
        title="Top Lanes"
        description="Quick route view showing where the booked work volume is coming from in this period."
        headers={["Lane", "Loads", "Revenue"]}
        rows={report.topLanes.map((row) => [
          row.lane,
          row.loads,
          formatCurrency(row.revenue),
        ])}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <StatusBreakdownSection
          title="Load Status Breakdown"
          rows={report.loadStatusBreakdown}
        />
        <StatusBreakdownSection
          title="Opportunity Status Breakdown"
          rows={report.opportunityStatusBreakdown}
        />
      </div>
    </section>
  );
}
