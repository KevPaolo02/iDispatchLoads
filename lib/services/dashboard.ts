import type {
  DispatchLoadStatus,
  Driver,
  DriverStatus,
  Lead,
  LeadStatus,
  Load,
  LoadOpportunity,
  LoadOpportunityVehicle,
  ProblemFlag,
} from "@/lib/types";
import {
  dispatchLoadStatuses,
  driverStatuses,
  leadStatuses,
} from "@/lib/types";
import {
  getLoadMarginSnapshot,
  getLoadMissingChecklist,
  getOpportunityMissingChecklist,
} from "@/lib/services/dispatch";

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
  lastTouchedAt: string;
  missingCount: number;
  problemCount: number;
  grossProfit: number | null;
  profitPerVehicle: number | null;
  isLowMargin: boolean;
};

export type FleetMovementEntry = {
  driver: Driver;
  activeLoad: Load | null;
  nextOpportunity: LoadOpportunity | null;
  openOpportunityCount: number;
  assignedLoadsCount: number;
  lastLoadDate: string | null;
  needsReload: boolean;
  reloadPriorityLevel: ReloadPriorityLevel | null;
  reloadPriorityReason: string | null;
  reloadReadyAt: string | null;
};

export type OpportunityBoardEntry = {
  opportunity: LoadOpportunity;
  assignedDriverName: string | null;
  lastTouchedAt: string;
  missingCount: number;
  problemCount: number;
  vehicleCount: number;
};

export const reloadPriorityLevels = [
  "reload_now",
  "reload_soon",
  "watch",
] as const;

export type ReloadPriorityLevel = (typeof reloadPriorityLevels)[number];

export type ReloadPriorityEntry = {
  driver: Driver;
  activeLoad: Load | null;
  nextOpportunity: LoadOpportunity | null;
  level: ReloadPriorityLevel;
  reason: string;
  readyAt: string | null;
};

export type DashboardKpiWindow = {
  newOpportunities: number;
  loadsPosted: number;
  loadsBooked: number;
  pickups: number;
  deliveries: number;
};

export type DashboardKpis = {
  today: DashboardKpiWindow;
  week: DashboardKpiWindow;
  problemLoads: number;
  averageMargin: number | null;
  loadsNotTouchedToday: number;
};

export type FollowUpQueueItem = {
  id: string;
  title: string;
  href: string;
  status: string;
  reason: string;
  lastTouchedAt: string;
};

export type FollowUpQueues = {
  needsFollowUpNow: FollowUpQueueItem[];
  notTouchedFourHours: FollowUpQueueItem[];
  pickupToday: FollowUpQueueItem[];
  pickupTomorrow: FollowUpQueueItem[];
  bookedMissingDriverInfo: FollowUpQueueItem[];
  inTransitNeedingUpdate: FollowUpQueueItem[];
  problemLoads: FollowUpQueueItem[];
};

export const LEAD_STALE_THRESHOLD_HOURS = 48;
export const FOLLOW_UP_STALE_HOURS = 4;
export const RELOAD_SOON_THRESHOLD_HOURS = 24;
export const RELOAD_WATCH_THRESHOLD_HOURS = 48;

const LEAD_STALE_THRESHOLD_MS = LEAD_STALE_THRESHOLD_HOURS * 60 * 60 * 1000;
const FOLLOW_UP_STALE_MS = FOLLOW_UP_STALE_HOURS * 60 * 60 * 1000;
const RELOAD_SOON_THRESHOLD_MS = RELOAD_SOON_THRESHOLD_HOURS * 60 * 60 * 1000;
const RELOAD_WATCH_THRESHOLD_MS = RELOAD_WATCH_THRESHOLD_HOURS * 60 * 60 * 1000;

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

  return fields.some((field) => field?.toLowerCase().includes(normalizedQuery));
}

function isKnownStatus<TStatus extends string>(
  value: string,
  statuses: readonly TStatus[],
): value is TStatus {
  return statuses.includes(value as TStatus);
}

function isLoadOpen(load: Load) {
  return load.status !== "delivered" && load.status !== "closed";
}

function getTime(value: string | null | undefined) {
  if (!value) {
    return Number.NaN;
  }

  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function getLatestTimestamp(loads: Load[]) {
  return loads.reduce<number | null>((latest, load) => {
    const candidates = [load.pickupDate, load.deliveryDate, load.updatedAt, load.createdAt]
      .map((value) => getTime(value))
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

function getStartOfToday(now: Date) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

function getStartOfTomorrow(now: Date) {
  const startOfToday = getStartOfToday(now);
  return startOfToday + 24 * 60 * 60 * 1000;
}

function getStartOfWeek(now: Date) {
  const date = new Date(now);
  date.setDate(now.getDate() - 6);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function isWithinWindow(value: string | null, start: number, end?: number) {
  const timestamp = getTime(value);

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  if (typeof end === "number") {
    return timestamp >= start && timestamp < end;
  }

  return timestamp >= start;
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
  const updatedAtTime = getTime(lead.updatedAt);

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
    const activeLoads = assignedLoads.filter(isLoadOpen);
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
    if (filters.driverStatus !== "all" && driver.status !== filters.driverStatus) {
      return false;
    }

    return matchesSearchQuery(filters.driverQuery, [
      driver.driverName,
      driver.company,
      driver.phone,
      driver.truckType,
      driver.truckUnitNumber,
      driver.trailerUnitNumber,
      driver.homeBase,
      driver.preferredLanes,
    ]);
  });
}

export function buildLoadReviewEntries(
  loads: Load[],
  drivers: Driver[],
  loadVehicles: { loadId: string }[] = [],
  problemFlags: ProblemFlag[] = [],
): LoadReviewEntry[] {
  const driverNameById = new Map(drivers.map((driver) => [driver.id, driver.driverName]));
  const vehicleCountByLoadId = new Map<string, number>();
  const problemCountByLoadId = new Map<string, number>();

  loadVehicles.forEach((vehicle) => {
    vehicleCountByLoadId.set(
      vehicle.loadId,
      (vehicleCountByLoadId.get(vehicle.loadId) ?? 0) + 1,
    );
  });

  problemFlags
    .filter((flag) => flag.entityType === "load" && !flag.resolvedAt)
    .forEach((flag) => {
      problemCountByLoadId.set(
        flag.entityId,
        (problemCountByLoadId.get(flag.entityId) ?? 0) + 1,
      );
    });

  return loads.map((load) => {
    const vehicleCount = vehicleCountByLoadId.get(load.id) ?? 0;
    const margin = getLoadMarginSnapshot(load, vehicleCount);

    return {
      load,
      assignedDriverName: load.driverId
        ? driverNameById.get(load.driverId) ?? null
        : null,
      lastTouchedAt: load.updatedAt,
      missingCount: getLoadMissingChecklist(load).length,
      problemCount: problemCountByLoadId.get(load.id) ?? 0,
      grossProfit: margin.grossProfit,
      profitPerVehicle: margin.profitPerVehicle,
      isLowMargin: margin.isLowMargin,
    };
  });
}

function getEarliestOpportunityTimestamp(opportunity: LoadOpportunity) {
  const value = opportunity.pickupWindow ?? opportunity.firstAvailableDate ?? opportunity.createdAt;
  const parsed = getTime(value);
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

function getReloadPriorityOrder(level: ReloadPriorityLevel | null) {
  switch (level) {
    case "reload_now":
      return 0;
    case "reload_soon":
      return 1;
    case "watch":
      return 2;
    default:
      return 3;
  }
}

function getReloadReadyAt(driver: Driver, activeLoad: Load | null) {
  return activeLoad?.deliveryDate ?? driver.availableFrom ?? activeLoad?.pickupDate ?? null;
}

function getReloadPriority({
  driver,
  activeLoad,
  nextOpportunity,
  now,
}: {
  driver: Driver;
  activeLoad: Load | null;
  nextOpportunity: LoadOpportunity | null;
  now: Date;
}) {
  if (nextOpportunity) {
    return {
      level: null,
      reason: null,
      readyAt: getReloadReadyAt(driver, activeLoad),
    };
  }

  const readyAt = getReloadReadyAt(driver, activeLoad);
  const readyAtTimestamp = getTime(readyAt);
  const hasReadyAt = Number.isFinite(readyAtTimestamp);
  const msUntilReady = hasReadyAt ? readyAtTimestamp - now.getTime() : null;

  if (!activeLoad && driver.status === "available") {
    return {
      level: "reload_now" as const,
      reason: "Unit is free with no booked next move.",
      readyAt,
    };
  }

  if (msUntilReady !== null && msUntilReady <= 0) {
    return {
      level: "reload_now" as const,
      reason: "Active work is due now and no reload is lined up.",
      readyAt,
    };
  }

  if (msUntilReady !== null && msUntilReady <= RELOAD_SOON_THRESHOLD_MS) {
    return {
      level: "reload_soon" as const,
      reason: "This unit will need the next move within 24 hours.",
      readyAt,
    };
  }

  if (msUntilReady !== null && msUntilReady <= RELOAD_WATCH_THRESHOLD_MS) {
    return {
      level: "watch" as const,
      reason: "Watch this unit for the next reload within 48 hours.",
      readyAt,
    };
  }

  if (!activeLoad && driver.status !== "available") {
    return {
      level: "watch" as const,
      reason: "No active load or next move is attached to this unit yet.",
      readyAt,
    };
  }

  return {
    level: null,
    reason: null,
    readyAt,
  };
}

export function buildFleetMovementEntries(
  drivers: Driver[],
  loads: Load[],
  opportunities: LoadOpportunity[],
): FleetMovementEntry[] {
  const now = new Date();

  return drivers
    .map((driver) => {
      const driverLoads = loads.filter(
        (load) => load.driverId === driver.id && isLoadOpen(load),
      );
      const activeLoadTimestamp = getLatestTimestamp(driverLoads);
      const activeLoad =
        driverLoads.find((load) => {
          const timestamp = getLatestTimestamp([load]);
          return timestamp !== null && timestamp === activeLoadTimestamp;
        }) ?? null;

      const driverOpportunities = opportunities
        .filter(
          (opportunity) =>
            opportunity.assignedDriverId === driver.id &&
            !["closed_won", "closed_lost"].includes(opportunity.status),
        )
        .sort((left, right) => {
          const leftTime = getEarliestOpportunityTimestamp(left);
          const rightTime = getEarliestOpportunityTimestamp(right);
          return leftTime - rightTime;
        });

      const openOpportunityCount = driverOpportunities.filter(
        (opportunity) => opportunity.status !== "closed_won",
      ).length;

      const nextOpportunity = driverOpportunities[0] ?? null;
      const reloadPriority = getReloadPriority({
        driver,
        activeLoad,
        nextOpportunity,
        now,
      });

      return {
        driver,
        activeLoad,
        nextOpportunity,
        openOpportunityCount,
        assignedLoadsCount: driverLoads.length,
        lastLoadDate:
          activeLoadTimestamp === null
            ? null
            : new Date(activeLoadTimestamp).toISOString(),
        needsReload: reloadPriority.level !== null,
        reloadPriorityLevel: reloadPriority.level,
        reloadPriorityReason: reloadPriority.reason,
        reloadReadyAt: reloadPriority.readyAt,
      };
    })
    .sort((left, right) => {
      const priorityDifference =
        getReloadPriorityOrder(left.reloadPriorityLevel) -
        getReloadPriorityOrder(right.reloadPriorityLevel);

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return left.driver.driverName.localeCompare(right.driver.driverName);
    });
}

export function buildOpportunityBoardEntries(
  opportunities: LoadOpportunity[],
  drivers: Driver[],
  vehicles: LoadOpportunityVehicle[] = [],
  problemFlags: ProblemFlag[] = [],
): OpportunityBoardEntry[] {
  const driverNameById = new Map(drivers.map((driver) => [driver.id, driver.driverName]));
  const vehiclesByOpportunityId = new Map<string, LoadOpportunityVehicle[]>();
  const problemCountByOpportunityId = new Map<string, number>();

  vehicles.forEach((vehicle) => {
    const current = vehiclesByOpportunityId.get(vehicle.opportunityId) ?? [];
    current.push(vehicle);
    vehiclesByOpportunityId.set(vehicle.opportunityId, current);
  });

  problemFlags
    .filter((flag) => flag.entityType === "load_opportunity" && !flag.resolvedAt)
    .forEach((flag) => {
      problemCountByOpportunityId.set(
        flag.entityId,
        (problemCountByOpportunityId.get(flag.entityId) ?? 0) + 1,
      );
    });

  return opportunities.map((opportunity) => {
    const opportunityVehicles = vehiclesByOpportunityId.get(opportunity.id) ?? [];

    return {
      opportunity,
      assignedDriverName: opportunity.assignedDriverId
        ? driverNameById.get(opportunity.assignedDriverId) ?? null
        : null,
      lastTouchedAt: opportunity.updatedAt,
      missingCount: getOpportunityMissingChecklist(
        opportunity,
        opportunityVehicles,
      ).length,
      problemCount: problemCountByOpportunityId.get(opportunity.id) ?? 0,
      vehicleCount: opportunityVehicles.length,
    };
  });
}

export function buildReloadPriorityEntries(
  fleetEntries: FleetMovementEntry[],
): ReloadPriorityEntry[] {
  return fleetEntries
    .filter((entry) => entry.reloadPriorityLevel && entry.reloadPriorityReason)
    .map((entry) => ({
      driver: entry.driver,
      activeLoad: entry.activeLoad,
      nextOpportunity: entry.nextOpportunity,
      level: entry.reloadPriorityLevel!,
      reason: entry.reloadPriorityReason!,
      readyAt: entry.reloadReadyAt,
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
      load.referenceNumber,
      load.contactName,
      load.contactPhone,
      load.customerName,
      load.customerPhone,
    ]);
  });
}

export function buildDashboardKpis(
  loads: Load[],
  opportunities: LoadOpportunity[],
  problemFlags: ProblemFlag[],
  loadEntries: LoadReviewEntry[] = [],
  now: Date = new Date(),
): DashboardKpis {
  const startOfToday = getStartOfToday(now);
  const startOfTomorrow = getStartOfTomorrow(now);
  const startOfWeek = getStartOfWeek(now);

  const today: DashboardKpiWindow = {
    newOpportunities: opportunities.filter((opportunity) =>
      isWithinWindow(opportunity.createdAt, startOfToday, startOfTomorrow),
    ).length,
    loadsPosted: loads.filter(
      (load) =>
        load.status === "posted" &&
        isWithinWindow(load.createdAt, startOfToday, startOfTomorrow),
    ).length,
    loadsBooked: loads.filter(
      (load) =>
        ["booked", "assigned", "pickup_scheduled", "picked_up", "in_transit", "delivered", "closed"].includes(
          load.status,
        ) && isWithinWindow(load.updatedAt, startOfToday, startOfTomorrow),
    ).length,
    pickups: loads.filter((load) =>
      isWithinWindow(load.pickupDate, startOfToday, startOfTomorrow),
    ).length,
    deliveries: loads.filter((load) =>
      isWithinWindow(load.deliveryDate, startOfToday, startOfTomorrow),
    ).length,
  };

  const week: DashboardKpiWindow = {
    newOpportunities: opportunities.filter((opportunity) =>
      isWithinWindow(opportunity.createdAt, startOfWeek),
    ).length,
    loadsPosted: loads.filter(
      (load) => load.status === "posted" && isWithinWindow(load.createdAt, startOfWeek),
    ).length,
    loadsBooked: loads.filter(
      (load) =>
        ["booked", "assigned", "pickup_scheduled", "picked_up", "in_transit", "delivered", "closed"].includes(
          load.status,
        ) && isWithinWindow(load.updatedAt, startOfWeek),
    ).length,
    pickups: loads.filter((load) => isWithinWindow(load.pickupDate, startOfWeek))
      .length,
    deliveries: loads.filter((load) =>
      isWithinWindow(load.deliveryDate, startOfWeek),
    ).length,
  };

  const unresolvedProblemLoads = problemFlags.filter(
    (flag) => flag.entityType === "load" && !flag.resolvedAt,
  ).length;
  const marginValues = (loadEntries.length
    ? loadEntries
    : buildLoadReviewEntries(loads, []))
    .map((entry) => entry.grossProfit)
    .filter((value): value is number => value !== null);

  return {
    today,
    week,
    problemLoads: unresolvedProblemLoads,
    averageMargin: marginValues.length
      ? marginValues.reduce((sum, value) => sum + value, 0) / marginValues.length
      : null,
    loadsNotTouchedToday: loads.filter(
      (load) => getTime(load.updatedAt) < startOfToday && isLoadOpen(load),
    ).length,
  };
}

export function buildFollowUpQueues(
  loads: Load[],
  opportunities: LoadOpportunity[],
  problemFlags: ProblemFlag[],
  drivers: Driver[],
  now: Date = new Date(),
): FollowUpQueues {
  const startOfToday = getStartOfToday(now);
  const startOfTomorrow = getStartOfTomorrow(now);
  const startOfDayAfterTomorrow = startOfTomorrow + 24 * 60 * 60 * 1000;
  const driverNameById = new Map(drivers.map((driver) => [driver.id, driver.driverName]));

  const unresolvedProblemLoads = new Set(
    problemFlags
      .filter((flag) => flag.entityType === "load" && !flag.resolvedAt)
      .map((flag) => flag.entityId),
  );

  const opportunityToQueue = (opportunity: LoadOpportunity, reason: string): FollowUpQueueItem => ({
    id: opportunity.id,
    title: `${opportunity.origin} -> ${opportunity.destination}`,
    href: `/dashboard/movement/${opportunity.id}`,
    status: opportunity.status,
    reason,
    lastTouchedAt: opportunity.updatedAt,
  });

  const loadToQueue = (load: Load, reason: string): FollowUpQueueItem => ({
    id: load.id,
    title: `${load.origin} -> ${load.destination}`,
    href: `/dashboard/dispatch/${load.id}`,
    status: load.status,
    reason,
    lastTouchedAt: load.updatedAt,
  });

  return {
    needsFollowUpNow: opportunities
      .filter((opportunity) =>
        ["new", "needs_review", "needs_quote", "awaiting_customer"].includes(
          opportunity.status,
        ),
      )
      .sort((left, right) => getTime(left.updatedAt) - getTime(right.updatedAt))
      .slice(0, 12)
      .map((opportunity) =>
        opportunityToQueue(opportunity, "Opportunity needs active follow-up."),
      ),
    notTouchedFourHours: [
      ...opportunities
        .filter((opportunity) => now.getTime() - getTime(opportunity.updatedAt) >= FOLLOW_UP_STALE_MS)
        .map((opportunity) =>
          opportunityToQueue(opportunity, "Not touched in 4+ hours."),
        ),
      ...loads
        .filter((load) => isLoadOpen(load) && now.getTime() - getTime(load.updatedAt) >= FOLLOW_UP_STALE_MS)
        .map((load) => loadToQueue(load, "Not touched in 4+ hours.")),
    ]
      .sort((left, right) => getTime(left.lastTouchedAt) - getTime(right.lastTouchedAt))
      .slice(0, 12),
    pickupToday: loads
      .filter((load) => isWithinWindow(load.pickupDate, startOfToday, startOfTomorrow))
      .map((load) => loadToQueue(load, "Pickup is scheduled for today.")),
    pickupTomorrow: loads
      .filter((load) =>
        isWithinWindow(load.pickupDate, startOfTomorrow, startOfDayAfterTomorrow),
      )
      .map((load) => loadToQueue(load, "Pickup is scheduled for tomorrow.")),
    bookedMissingDriverInfo: loads
      .filter(
        (load) =>
          load.status === "booked" &&
          !load.driverId &&
          !load.carrierDriverName &&
          !load.carrierDispatcherName,
      )
      .map((load) =>
        loadToQueue(load, "Booked but still missing driver / dispatcher handling."),
      ),
    inTransitNeedingUpdate: loads
      .filter(
        (load) =>
          ["picked_up", "in_transit"].includes(load.status) &&
          now.getTime() - getTime(load.updatedAt) >= FOLLOW_UP_STALE_MS,
      )
      .map((load) => loadToQueue(load, "In transit and needs an update.")),
    problemLoads: loads
      .filter((load) => unresolvedProblemLoads.has(load.id))
      .map((load) => {
        const driverLabel = load.driverId
          ? driverNameById.get(load.driverId) ?? "Assigned unit"
          : "Unassigned";
        return loadToQueue(load, `Problem flag open. Handling: ${driverLabel}.`);
      }),
  };
}
