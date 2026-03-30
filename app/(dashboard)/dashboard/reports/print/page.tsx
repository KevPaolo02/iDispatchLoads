import Link from "next/link";
import type { Metadata } from "next";

import { PrintPageButton } from "@/components/shared/print-page-button";
import { requireDashboardSession } from "@/lib/auth";
import {
  buildReportFileName,
  loadOperationsReportSnapshot,
  parseReportFilters,
} from "@/lib/services";

type DashboardReportsPrintPageProps = {
  searchParams?: Promise<{
    period?: string;
    from?: string;
    to?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Print Report | iDispatchLoads",
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

function SimplePrintTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: Array<Array<string | number>>;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="font-heading text-xl font-semibold text-slate-950">
        {title}
      </h2>

      {!rows.length ? (
        <p className="text-sm text-slate-500">No data in this report window.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="text-xs uppercase tracking-[0.14em] text-slate-500">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="border-b border-slate-200 pb-3 pr-4">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border-b border-slate-100 py-3 pr-4 align-top"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default async function DashboardReportsPrintPage({
  searchParams,
}: DashboardReportsPrintPageProps) {
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
  const pdfFileName = buildReportFileName(range, "pdf");

  return (
    <section className="space-y-6 print:space-y-4">
      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)] print:hidden">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
            PDF Export
          </p>
          <h1 className="font-heading text-3xl font-semibold text-slate-950">
            Print or save this report as PDF
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            Use your browser print dialog and choose “Save as PDF” to download
            this report. Suggested filename: {pdfFileName}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <PrintPageButton label="Print / Save PDF" />
          <Link
            href="/dashboard/reports"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            Back to Reports
          </Link>
        </div>
      </div>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)] print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
            iDispatchLoads Report
          </p>
          <h1 className="font-heading text-3xl font-semibold text-slate-950">
            Operations Report
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            Window: {report.range.label}
          </p>
          <p className="text-sm leading-6 text-slate-600">
            Scope: {session.role === "admin" ? "Owner / full business" : "Dispatcher / assigned work only"}
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              New Opportunities
            </p>
            <p className="mt-2 font-heading text-2xl font-semibold text-slate-950">
              {report.summary.opportunitiesCreated}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Loads Created
            </p>
            <p className="mt-2 font-heading text-2xl font-semibold text-slate-950">
              {report.summary.loadsCreated}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Revenue
            </p>
            <p className="mt-2 font-heading text-2xl font-semibold text-slate-950">
              {formatCurrency(report.summary.revenue)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Gross Profit
            </p>
            <p className="mt-2 font-heading text-2xl font-semibold text-slate-950">
              {formatCurrency(report.summary.grossProfit)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Active Loads
            </p>
            <p className="mt-2 font-heading text-2xl font-semibold text-slate-950">
              {report.summary.activeLoads}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Problem Loads
            </p>
            <p className="mt-2 font-heading text-2xl font-semibold text-slate-950">
              {report.summary.problemLoads}
            </p>
          </div>
        </div>
      </section>

      <SimplePrintTable
        title="Dispatcher Performance"
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

      <SimplePrintTable
        title="Unit Performance"
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
        ])}
      />

      <SimplePrintTable
        title="Top Lanes"
        headers={["Lane", "Loads", "Revenue"]}
        rows={report.topLanes.map((row) => [
          row.lane,
          row.loads,
          formatCurrency(row.revenue),
        ])}
      />
    </section>
  );
}
