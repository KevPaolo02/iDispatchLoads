import type {
  Driver,
  Lead,
  Load,
  LoadOpportunity,
  ProblemFlag,
} from "@/lib/types";

import { getDispatcherAccountOptions } from "@/lib/auth";
import {
  listDrivers,
  listLeads,
  listLoadOpportunities,
  listLoads,
  listLoadVehicles,
  listProblemFlags,
} from "@/lib/db";
import {
  filterDriversForAccess,
  filterLoadsForAccess,
  filterOpportunitiesForAccess,
} from "@/lib/services/dashboard";
import { getLoadMarginSnapshot } from "@/lib/services/dispatch";

export const reportPeriodPresets = [
  "day",
  "week",
  "month",
  "quarter",
  "year",
  "custom",
] as const;

export type ReportPeriodPreset = (typeof reportPeriodPresets)[number];

type SearchParamRecord = Record<string, string | string[] | undefined>;

export type ReportFilters = {
  period: ReportPeriodPreset;
  from: string;
  to: string;
};

export type ReportRange = {
  period: ReportPeriodPreset;
  label: string;
  start: string;
  endExclusive: string;
  from: string;
  to: string;
};

export type ReportSummary = {
  leadsCreated: number | null;
  opportunitiesCreated: number;
  loadsCreated: number;
  pickupsScheduled: number;
  deliveriesScheduled: number;
  activeLoads: number;
  activeUnits: number;
  revenue: number;
  carrierPay: number;
  grossProfit: number;
  averageGrossProfit: number | null;
  problemLoads: number;
};

export type DispatcherReportRow = {
  email: string;
  label: string;
  assignedUnits: number;
  opportunitiesCreated: number;
  loadsCreated: number;
  deliveriesScheduled: number;
  activeLoads: number;
  revenue: number;
  grossProfit: number;
  problemLoads: number;
};

export type UnitReportRow = {
  driverId: string;
  driverName: string;
  dispatcherLabel: string;
  status: string;
  opportunitiesCreated: number;
  loadsCreated: number;
  deliveriesScheduled: number;
  activeLoads: number;
  revenue: number;
  grossProfit: number;
  lastLoadAt: string | null;
};

export type LaneReportRow = {
  lane: string;
  loads: number;
  revenue: number;
};

export type StatusBreakdownRow = {
  status: string;
  count: number;
};

export type OperationsReport = {
  range: ReportRange;
  summary: ReportSummary;
  dispatcherRows: DispatcherReportRow[];
  unitRows: UnitReportRow[];
  topLanes: LaneReportRow[];
  loadStatusBreakdown: StatusBreakdownRow[];
  opportunityStatusBreakdown: StatusBreakdownRow[];
};

export type ReportLoadOptions = {
  role: "admin" | "dispatcher";
  email: string;
};

function readSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function isKnownPeriod(value: string): value is ReportPeriodPreset {
  return reportPeriodPresets.includes(value as ReportPeriodPreset);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function formatRangeLabel(start: Date, endInclusive: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${formatter.format(start)} - ${formatter.format(endInclusive)}`;
}

function getTime(value: string | null | undefined) {
  if (!value) {
    return Number.NaN;
  }

  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function isWithinRange(
  value: string | null | undefined,
  startTime: number,
  endExclusiveTime: number,
) {
  const time = getTime(value);

  return Number.isFinite(time) && time >= startTime && time < endExclusiveTime;
}

function getRevenue(load: Load) {
  return load.customerPrice ?? load.rate ?? 0;
}

function formatCurrencyNumber(value: number | null) {
  if (value === null) {
    return "";
  }

  return value.toFixed(2);
}

function normalizeDispatcherEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function parseReportFilters(
  searchParams: SearchParamRecord = {},
): ReportFilters {
  const rawPeriod = readSearchParam(searchParams.period);
  const period = isKnownPeriod(rawPeriod) ? rawPeriod : "week";

  return {
    period,
    from: readSearchParam(searchParams.from).trim(),
    to: readSearchParam(searchParams.to).trim(),
  };
}

export function resolveReportRange(
  filters: ReportFilters,
  now: Date = new Date(),
): ReportRange {
  const today = startOfDay(now);
  let start = today;
  let endExclusive = addDays(today, 1);

  switch (filters.period) {
    case "day":
      break;
    case "week":
      start = addDays(today, -6);
      break;
    case "month":
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case "quarter": {
      const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
      start = new Date(today.getFullYear(), quarterStartMonth, 1);
      break;
    }
    case "year":
      start = new Date(today.getFullYear(), 0, 1);
      break;
    case "custom": {
      const fromDate = parseDateInput(filters.from);
      const toDate = parseDateInput(filters.to);

      if (fromDate && toDate && toDate >= fromDate) {
        start = fromDate;
        endExclusive = addDays(toDate, 1);
      } else {
        start = addDays(today, -6);
      }
      break;
    }
    default:
      break;
  }

  if (filters.period !== "custom") {
    endExclusive = addDays(today, 1);
  }

  const endInclusive = addDays(endExclusive, -1);

  return {
    period: filters.period,
    label: formatRangeLabel(start, endInclusive),
    start: start.toISOString(),
    endExclusive: endExclusive.toISOString(),
    from: formatDateInput(start),
    to: formatDateInput(endInclusive),
  };
}

export function buildOperationsReport({
  range,
  leads,
  drivers,
  loads,
  opportunities,
  loadVehicles,
  problemFlags,
  dispatcherOptions,
  includeLeadMetrics,
}: {
  range: ReportRange;
  leads: Lead[];
  drivers: Driver[];
  loads: Load[];
  opportunities: LoadOpportunity[];
  loadVehicles: Array<{ loadId: string }>;
  problemFlags: ProblemFlag[];
  dispatcherOptions: Array<{
    email: string;
    label: string;
  }>;
  includeLeadMetrics: boolean;
}): OperationsReport {
  const startTime = getTime(range.start);
  const endExclusiveTime = getTime(range.endExclusive);
  const dispatcherLabelByEmail = new Map(
    dispatcherOptions.map((option) => [
      option.email.trim().toLowerCase(),
      option.label,
    ]),
  );

  const loadVehicleCountByLoadId = new Map<string, number>();
  loadVehicles.forEach((vehicle) => {
    loadVehicleCountByLoadId.set(
      vehicle.loadId,
      (loadVehicleCountByLoadId.get(vehicle.loadId) ?? 0) + 1,
    );
  });

  const loadsCreatedInRange = loads.filter((load) =>
    isWithinRange(load.createdAt, startTime, endExclusiveTime),
  );
  const opportunitiesCreatedInRange = opportunities.filter((opportunity) =>
    isWithinRange(opportunity.createdAt, startTime, endExclusiveTime),
  );
  const deliveriesInRange = loads.filter(
    (load) =>
      (load.status === "delivered" || load.status === "closed") &&
      isWithinRange(
        load.deliveryDate ?? load.updatedAt,
        startTime,
        endExclusiveTime,
      ),
  );
  const pickupsInRange = loads.filter((load) =>
    isWithinRange(load.pickupDate, startTime, endExclusiveTime),
  );
  const activeLoads = loads.filter(
    (load) => load.status !== "delivered" && load.status !== "closed",
  );
  const activeUnits = new Set(
    activeLoads
      .map((load) => load.driverId)
      .filter((driverId): driverId is string => Boolean(driverId)),
  );
  const problemLoadIds = new Set(
    problemFlags
      .filter((flag) => flag.entityType === "load" && flag.resolvedAt === null)
      .map((flag) => flag.entityId),
  );
  const problemLoads = loads.filter((load) => problemLoadIds.has(load.id));

  let revenue = 0;
  let carrierPay = 0;
  let grossProfit = 0;
  let loadsWithMargin = 0;

  loadsCreatedInRange.forEach((load) => {
    revenue += getRevenue(load);
    carrierPay += load.carrierPay ?? 0;

    const margin = getLoadMarginSnapshot(
      load,
      loadVehicleCountByLoadId.get(load.id) ?? 0,
    );

    if (margin.grossProfit !== null) {
      grossProfit += margin.grossProfit;
      loadsWithMargin += 1;
    }
  });

  const summary: ReportSummary = {
    leadsCreated: includeLeadMetrics
      ? leads.filter((lead) =>
          isWithinRange(lead.createdAt, startTime, endExclusiveTime),
        ).length
      : null,
    opportunitiesCreated: opportunitiesCreatedInRange.length,
    loadsCreated: loadsCreatedInRange.length,
    pickupsScheduled: pickupsInRange.length,
    deliveriesScheduled: deliveriesInRange.length,
    activeLoads: activeLoads.length,
    activeUnits: activeUnits.size,
    revenue,
    carrierPay,
    grossProfit,
    averageGrossProfit:
      loadsWithMargin > 0 ? grossProfit / loadsWithMargin : null,
    problemLoads: problemLoads.length,
  };

  const dispatcherEmails = new Set<string>();
  drivers.forEach((driver) => {
    const email = normalizeDispatcherEmail(driver.assignedDispatcherEmail);

    if (email) {
      dispatcherEmails.add(email);
    }
  });

  const dispatcherRows = Array.from(dispatcherEmails)
    .map((email) => {
      const dispatcherDriverIds = new Set(
        drivers
          .filter(
            (driver) =>
              normalizeDispatcherEmail(driver.assignedDispatcherEmail) === email,
          )
          .map((driver) => driver.id),
      );
      const dispatcherLoads = loadsCreatedInRange.filter(
        (load) => load.driverId !== null && dispatcherDriverIds.has(load.driverId),
      );
      const dispatcherDeliveries = deliveriesInRange.filter(
        (load) => load.driverId !== null && dispatcherDriverIds.has(load.driverId),
      );
      const dispatcherOpportunities = opportunitiesCreatedInRange.filter(
        (opportunity) =>
          opportunity.assignedDriverId !== null &&
          dispatcherDriverIds.has(opportunity.assignedDriverId),
      );
      const dispatcherActiveLoads = activeLoads.filter(
        (load) => load.driverId !== null && dispatcherDriverIds.has(load.driverId),
      );
      const dispatcherProblemLoads = problemLoads.filter(
        (load) => load.driverId !== null && dispatcherDriverIds.has(load.driverId),
      );

      let dispatcherRevenue = 0;
      let dispatcherGrossProfit = 0;

      dispatcherLoads.forEach((load) => {
        dispatcherRevenue += getRevenue(load);
        const margin = getLoadMarginSnapshot(
          load,
          loadVehicleCountByLoadId.get(load.id) ?? 0,
        );

        if (margin.grossProfit !== null) {
          dispatcherGrossProfit += margin.grossProfit;
        }
      });

      return {
        email,
        label: dispatcherLabelByEmail.get(email) ?? email,
        assignedUnits: dispatcherDriverIds.size,
        opportunitiesCreated: dispatcherOpportunities.length,
        loadsCreated: dispatcherLoads.length,
        deliveriesScheduled: dispatcherDeliveries.length,
        activeLoads: dispatcherActiveLoads.length,
        revenue: dispatcherRevenue,
        grossProfit: dispatcherGrossProfit,
        problemLoads: dispatcherProblemLoads.length,
      };
    })
    .sort((left, right) => {
      if (right.loadsCreated !== left.loadsCreated) {
        return right.loadsCreated - left.loadsCreated;
      }

      if (right.revenue !== left.revenue) {
        return right.revenue - left.revenue;
      }

      return left.label.localeCompare(right.label);
    });

  const unitRows = drivers
    .map((driver) => {
      const unitLoadsCreated = loadsCreatedInRange.filter(
        (load) => load.driverId === driver.id,
      );
      const unitDeliveries = deliveriesInRange.filter(
        (load) => load.driverId === driver.id,
      );
      const unitActiveLoads = activeLoads.filter(
        (load) => load.driverId === driver.id,
      );
      const unitOpportunities = opportunitiesCreatedInRange.filter(
        (opportunity) => opportunity.assignedDriverId === driver.id,
      );
      const lastLoadAt = unitLoadsCreated
        .map((load) =>
          load.deliveryDate ?? load.pickupDate ?? load.updatedAt ?? load.createdAt,
        )
        .filter(Boolean)
        .sort()
        .at(-1) ?? null;

      let unitRevenue = 0;
      let unitGrossProfit = 0;

      unitLoadsCreated.forEach((load) => {
        unitRevenue += getRevenue(load);
        const margin = getLoadMarginSnapshot(
          load,
          loadVehicleCountByLoadId.get(load.id) ?? 0,
        );

        if (margin.grossProfit !== null) {
          unitGrossProfit += margin.grossProfit;
        }
      });

      return {
        driverId: driver.id,
        driverName: driver.driverName,
        dispatcherLabel:
          dispatcherLabelByEmail.get(
            normalizeDispatcherEmail(driver.assignedDispatcherEmail),
          ) ?? "Unassigned",
        status: driver.status,
        opportunitiesCreated: unitOpportunities.length,
        loadsCreated: unitLoadsCreated.length,
        deliveriesScheduled: unitDeliveries.length,
        activeLoads: unitActiveLoads.length,
        revenue: unitRevenue,
        grossProfit: unitGrossProfit,
        lastLoadAt,
      };
    })
    .sort((left, right) => {
      if (right.loadsCreated !== left.loadsCreated) {
        return right.loadsCreated - left.loadsCreated;
      }

      if (right.revenue !== left.revenue) {
        return right.revenue - left.revenue;
      }

      return left.driverName.localeCompare(right.driverName);
    });

  const laneMap = new Map<string, { loads: number; revenue: number }>();
  loadsCreatedInRange.forEach((load) => {
    const lane = `${load.origin} -> ${load.destination}`;
    const current = laneMap.get(lane) ?? { loads: 0, revenue: 0 };
    current.loads += 1;
    current.revenue += getRevenue(load);
    laneMap.set(lane, current);
  });

  const topLanes = Array.from(laneMap.entries())
    .map(([lane, value]) => ({
      lane,
      loads: value.loads,
      revenue: value.revenue,
    }))
    .sort((left, right) => {
      if (right.loads !== left.loads) {
        return right.loads - left.loads;
      }

      return right.revenue - left.revenue;
    })
    .slice(0, 8);

  const loadStatusBreakdown = Array.from(
    loadsCreatedInRange.reduce((map, load) => {
      map.set(load.status, (map.get(load.status) ?? 0) + 1);
      return map;
    }, new Map<string, number>()),
  )
    .map(([status, count]) => ({ status, count }))
    .sort((left, right) => right.count - left.count);

  const opportunityStatusBreakdown = Array.from(
    opportunitiesCreatedInRange.reduce((map, opportunity) => {
      map.set(opportunity.status, (map.get(opportunity.status) ?? 0) + 1);
      return map;
    }, new Map<string, number>()),
  )
    .map(([status, count]) => ({ status, count }))
    .sort((left, right) => right.count - left.count);

  return {
    range,
    summary,
    dispatcherRows,
    unitRows,
    topLanes,
    loadStatusBreakdown,
    opportunityStatusBreakdown,
  };
}

export async function loadOperationsReportSnapshot({
  session,
  filters,
}: {
  session: ReportLoadOptions;
  filters: ReportFilters;
}) {
  const range = resolveReportRange(filters);
  const dispatcherOptions = getDispatcherAccountOptions();

  const [drivers, loads, opportunities, loadVehicles, problemFlags, leads] =
    await Promise.all([
      listDrivers(),
      listLoads(),
      listLoadOpportunities(),
      listLoadVehicles(),
      listProblemFlags(),
      session.role === "admin" ? listLeads() : Promise.resolve<Lead[]>([]),
    ]);

  const scopedDrivers = filterDriversForAccess(drivers, session);
  const visibleDriverIds = new Set(scopedDrivers.map((driver) => driver.id));
  const scopedLoads = filterLoadsForAccess(loads, visibleDriverIds, session);
  const scopedOpportunities = filterOpportunitiesForAccess(
    opportunities,
    visibleDriverIds,
    session,
  );

  const report = buildOperationsReport({
    range,
    leads,
    drivers: scopedDrivers,
    loads: scopedLoads,
    opportunities: scopedOpportunities,
    loadVehicles,
    problemFlags,
    dispatcherOptions,
    includeLeadMetrics: session.role === "admin",
  });

  return { report, filters, range };
}

function escapeCsvCell(value: string | number | null) {
  const stringValue =
    value === null || typeof value === "undefined" ? "" : String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}

function appendCsvSection(
  lines: string[],
  title: string,
  headers: string[],
  rows: Array<Array<string | number | null>>,
) {
  lines.push(title);
  lines.push(headers.map(escapeCsvCell).join(","));

  if (!rows.length) {
    lines.push("No data");
  } else {
    rows.forEach((row) => {
      lines.push(row.map(escapeCsvCell).join(","));
    });
  }

  lines.push("");
}

export function buildOperationsReportCsv(report: OperationsReport) {
  const lines: string[] = [];

  lines.push("iDispatchLoads Report");
  lines.push(`Window,${escapeCsvCell(report.range.label)}`);
  lines.push(`Period,${escapeCsvCell(report.range.period)}`);
  lines.push("");

  appendCsvSection(lines, "Summary", ["Metric", "Value"], [
    ["New Leads", report.summary.leadsCreated ?? ""],
    ["New Opportunities", report.summary.opportunitiesCreated],
    ["Loads Created", report.summary.loadsCreated],
    ["Pickups Scheduled", report.summary.pickupsScheduled],
    ["Deliveries Scheduled", report.summary.deliveriesScheduled],
    ["Active Loads", report.summary.activeLoads],
    ["Active Units", report.summary.activeUnits],
    ["Revenue", formatCurrencyNumber(report.summary.revenue)],
    ["Carrier Pay", formatCurrencyNumber(report.summary.carrierPay)],
    ["Gross Profit", formatCurrencyNumber(report.summary.grossProfit)],
    [
      "Average Gross Profit",
      formatCurrencyNumber(report.summary.averageGrossProfit),
    ],
    ["Problem Loads", report.summary.problemLoads],
  ]);

  appendCsvSection(
    lines,
    "Dispatcher Performance",
    [
      "Dispatcher",
      "Email",
      "Units",
      "Opportunities",
      "Loads",
      "Deliveries",
      "Active Loads",
      "Revenue",
      "Gross Profit",
      "Problem Loads",
    ],
    report.dispatcherRows.map((row) => [
      row.label,
      row.email,
      row.assignedUnits,
      row.opportunitiesCreated,
      row.loadsCreated,
      row.deliveriesScheduled,
      row.activeLoads,
      formatCurrencyNumber(row.revenue),
      formatCurrencyNumber(row.grossProfit),
      row.problemLoads,
    ]),
  );

  appendCsvSection(
    lines,
    "Unit Performance",
    [
      "Unit",
      "Dispatcher",
      "Status",
      "Opportunities",
      "Loads",
      "Deliveries",
      "Active Loads",
      "Revenue",
      "Gross Profit",
      "Last Load",
    ],
    report.unitRows.map((row) => [
      row.driverName,
      row.dispatcherLabel,
      row.status,
      row.opportunitiesCreated,
      row.loadsCreated,
      row.deliveriesScheduled,
      row.activeLoads,
      formatCurrencyNumber(row.revenue),
      formatCurrencyNumber(row.grossProfit),
      row.lastLoadAt ?? "",
    ]),
  );

  appendCsvSection(
    lines,
    "Top Lanes",
    ["Lane", "Loads", "Revenue"],
    report.topLanes.map((row) => [
      row.lane,
      row.loads,
      formatCurrencyNumber(row.revenue),
    ]),
  );

  appendCsvSection(
    lines,
    "Load Status Breakdown",
    ["Status", "Count"],
    report.loadStatusBreakdown.map((row) => [row.status, row.count]),
  );

  appendCsvSection(
    lines,
    "Opportunity Status Breakdown",
    ["Status", "Count"],
    report.opportunityStatusBreakdown.map((row) => [row.status, row.count]),
  );

  return `\uFEFF${lines.join("\n")}`;
}

export function buildReportFileName(
  range: ReportRange,
  suffix: "csv" | "pdf",
) {
  return `idispatchloads-${range.period}-${range.from}-to-${range.to}.${suffix}`;
}
