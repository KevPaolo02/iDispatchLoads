import type {
  DispatchLoadStatus,
  Driver,
  DriverStatus,
  Lead,
  LeadStatus,
  Load,
} from "@/lib/types";
import {
  dispatchLoadStatuses,
  driverStatuses,
  leadStatuses,
} from "@/lib/types";

type SearchParamRecord = Record<string, string | string[] | undefined>;

export type LeadReviewStatusFilter = LeadStatus | "all";
export type DriverReviewStatusFilter = DriverStatus | "all";
export type LoadReviewStatusFilter = DispatchLoadStatus | "all";

export type LeadReviewFilters = {
  status: LeadReviewStatusFilter;
  query: string;
};

export type DispatchBoardFilters = {
  driverStatus: DriverReviewStatusFilter;
  driverQuery: string;
  loadStatus: LoadReviewStatusFilter;
  loadQuery: string;
};

export type LeadFollowUpFlags = {
  isNew: boolean;
  needsContact: boolean;
  isStale: boolean;
};

export type LeadReviewEntry = {
  lead: Lead;
  flags: LeadFollowUpFlags;
};

export type DriverOperationalSnapshot = {
  assignedLoadsCount: number;
  lastLoadDate: string | null;
  activeLoad: Load | null;
};

export type DriverReviewEntry = {
  driver: Driver;
  metrics: DriverOperationalSnapshot;
};

export type LoadReviewEntry = {
  load: Load;
  assignedDriverName: string | null;
};

export const LEAD_STALE_THRESHOLD_HOURS = 48;

const LEAD_STALE_THRESHOLD_MS = LEAD_STALE_THRESHOLD_HOURS * 60 * 60 * 1000;

function readSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function normalizeSearchQuery(value: string) {
  return value.trim().toLowerCase();
}

function matchesSearchQuery(
  query: string,
  fields: Array<string | null | undefined>,
) {
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return true;
  }

  return fields.some((field) =>
    field?.toLowerCase().includes(normalizedQuery),
  );
}

function isKnownStatus<TStatus extends string>(
  value: string,
  statuses: readonly TStatus[],
): value is TStatus {
  return statuses.includes(value as TStatus);
}

function getLatestTimestamp(loads: Load[]) {
  return loads.reduce<number | null>((latest, load) => {
    const candidates = [load.pickupDate, load.deliveryDate, load.createdAt]
      .map((value) => (value ? new Date(value).getTime() : Number.NaN))
      .filter((value) => Number.isFinite(value));

    if (!candidates.length) {
      return latest;
    }

    const loadLatest = Math.max(...candidates);

    if (latest === null || loadLatest > latest) {
      return loadLatest;
    }

    return latest;
  }, null);
}

export function parseLeadReviewFilters(
  searchParams: SearchParamRecord = {},
): LeadReviewFilters {
  const rawStatus = readSearchParam(searchParams.status);

  return {
    status: isKnownStatus(rawStatus, leadStatuses) ? rawStatus : "all",
    query: readSearchParam(searchParams.query).trim(),
  };
}

export function getLeadFollowUpFlags(
  lead: Lead,
  now: Date = new Date(),
): LeadFollowUpFlags {
  const isActiveLead = lead.status !== "lost" && lead.status !== "onboarded";
  const updatedAt = new Date(lead.updatedAt);
  const updatedAtTime = updatedAt.getTime();

  return {
    isNew: lead.status === "new",
    needsContact: isActiveLead && !lead.lastContactedAt,
    isStale:
      isActiveLead &&
      Number.isFinite(updatedAtTime) &&
      now.getTime() - updatedAtTime >= LEAD_STALE_THRESHOLD_MS,
  };
}

export function buildLeadReviewEntries(
  leads: Lead[],
  now: Date = new Date(),
): LeadReviewEntry[] {
  return leads.map((lead) => ({
    lead,
    flags: getLeadFollowUpFlags(lead, now),
  }));
}

export function filterLeadReviewEntries(
  leadEntries: LeadReviewEntry[],
  filters: LeadReviewFilters,
) {
  return leadEntries.filter(({ lead }) => {
    if (filters.status !== "all" && lead.status !== filters.status) {
      return false;
    }

    return matchesSearchQuery(filters.query, [
      lead.firstName,
      lead.lastName,
      `${lead.firstName} ${lead.lastName}`.trim(),
      lead.phone,
      lead.email,
    ]);
  });
}

export function parseDispatchBoardFilters(
  searchParams: SearchParamRecord = {},
): DispatchBoardFilters {
  const rawDriverStatus = readSearchParam(searchParams.driverStatus);
  const rawLoadStatus = readSearchParam(searchParams.loadStatus);

  return {
    driverStatus: isKnownStatus(rawDriverStatus, driverStatuses)
      ? rawDriverStatus
      : "all",
    driverQuery: readSearchParam(searchParams.driverQuery).trim(),
    loadStatus: isKnownStatus(rawLoadStatus, dispatchLoadStatuses)
      ? rawLoadStatus
      : "all",
    loadQuery: readSearchParam(searchParams.loadQuery).trim(),
  };
}

export function buildDriverReviewEntries(
  drivers: Driver[],
  loads: Load[],
): DriverReviewEntry[] {
  return drivers.map((driver) => {
    const assignedLoads = loads.filter((load) => load.driverId === driver.id);
    const activeLoads = assignedLoads.filter((load) => load.status !== "delivered");
    const lastLoadTimestamp = getLatestTimestamp(assignedLoads);
    const activeLoadTimestamp = getLatestTimestamp(activeLoads);

    const activeLoad =
      activeLoads.find((load) => {
        const timestamp = getLatestTimestamp([load]);
        return timestamp !== null && timestamp === activeLoadTimestamp;
      }) ?? null;

    return {
      driver,
      metrics: {
        assignedLoadsCount: activeLoads.length,
        lastLoadDate:
          lastLoadTimestamp === null
            ? null
            : new Date(lastLoadTimestamp).toISOString(),
        activeLoad,
      },
    };
  });
}

export function filterDriverReviewEntries(
  driverEntries: DriverReviewEntry[],
  filters: DispatchBoardFilters,
) {
  return driverEntries.filter(({ driver }) => {
    if (
      filters.driverStatus !== "all" &&
      driver.status !== filters.driverStatus
    ) {
      return false;
    }

    return matchesSearchQuery(filters.driverQuery, [
      driver.driverName,
      driver.company,
      driver.phone,
      driver.truckType,
      driver.homeBase,
      driver.preferredLanes,
    ]);
  });
}

export function buildLoadReviewEntries(
  loads: Load[],
  drivers: Driver[],
): LoadReviewEntry[] {
  const driverNameById = new Map(drivers.map((driver) => [driver.id, driver.driverName]));

  return loads.map((load) => ({
    load,
    assignedDriverName: load.driverId
      ? driverNameById.get(load.driverId) ?? null
      : null,
  }));
}

export function filterLoadReviewEntries(
  loadEntries: LoadReviewEntry[],
  filters: DispatchBoardFilters,
) {
  return loadEntries.filter(({ load, assignedDriverName }) => {
    if (filters.loadStatus !== "all" && load.status !== filters.loadStatus) {
      return false;
    }

    return matchesSearchQuery(filters.loadQuery, [
      assignedDriverName,
      load.company,
      load.origin,
      load.destination,
      load.broker,
    ]);
  });
}
