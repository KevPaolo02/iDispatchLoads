import Link from "next/link";

import {
  assignLoadAction,
  createDriverAction,
  createLoadAction,
  saveDriverNotesAction,
  saveLoadNotesAction,
  updateDriverStatusAction,
  updateLoadStatusAction,
} from "@/app/(dashboard)/dashboard/dispatch/actions/dispatch-actions";
import {
  DriverStatusBadge,
  LoadStatusBadge,
  StatusBadge,
} from "@/components/dashboard/status-badge";
import { CopyButton } from "@/components/shared/copy-button";
import type { Driver, Lead, LoadOpportunity } from "@/lib/types";
import { dispatchLoadStatuses, driverStatuses } from "@/lib/types";
import type {
  DispatchBoardFilters,
  DriverReviewEntry,
  LoadReviewEntry,
} from "@/lib/services";

type DispatchBoardProps = {
  drivers: Driver[];
  driverEntries: DriverReviewEntry[];
  loadEntries: LoadReviewEntry[];
  filters: DispatchBoardFilters;
  selectedLead?: Lead | null;
  selectedOpportunity?: LoadOpportunity | null;
  preselectedDriverId?: string | null;
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "TBD";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDateTimeInput(value: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 16);
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

function buildDispatchBaseHref({
  selectedLeadId,
  selectedOpportunityId,
  preselectedDriverId,
}: {
  selectedLeadId?: string | null;
  selectedOpportunityId?: string | null;
  preselectedDriverId?: string | null;
}) {
  const params = new URLSearchParams();

  if (selectedLeadId) {
    params.set("leadId", selectedLeadId);
  }
  if (selectedOpportunityId) {
    params.set("opportunityId", selectedOpportunityId);
  }
  if (preselectedDriverId) {
    params.set("driverId", preselectedDriverId);
  }

  const query = params.toString();
  return query ? `/dashboard/dispatch?${query}` : "/dashboard/dispatch";
}

function DriverFiltersForm({
  filters,
  selectedLead,
  selectedOpportunity,
  preselectedDriverId,
}: {
  filters: DispatchBoardFilters;
  selectedLead?: Lead | null;
  selectedOpportunity?: LoadOpportunity | null;
  preselectedDriverId?: string | null;
}) {
  const clearHref = buildDispatchBaseHref({
    selectedLeadId: selectedLead?.id,
    selectedOpportunityId: selectedOpportunity?.id,
    preselectedDriverId,
  });

  return (
    <form
      action="/dashboard/dispatch"
      method="get"
      className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]"
    >
      {selectedLead ? <input type="hidden" name="leadId" value={selectedLead.id} /> : null}
      {selectedOpportunity ? (
        <input type="hidden" name="opportunityId" value={selectedOpportunity.id} />
      ) : null}
      {preselectedDriverId ? (
        <input type="hidden" name="driverId" value={preselectedDriverId} />
      ) : null}
      {filters.loadStatus !== "all" ? (
        <input type="hidden" name="loadStatus" value={filters.loadStatus} />
      ) : null}
      {filters.loadQuery ? (
        <input type="hidden" name="loadQuery" value={filters.loadQuery} />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr),14rem,auto,auto]">
        <input
          type="search"
          name="driverQuery"
          defaultValue={filters.driverQuery}
          placeholder="Search driver, phone, company, unit"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:bg-white"
        />
        <select
          name="driverStatus"
          defaultValue={filters.driverStatus}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        >
          <option value="all">All driver statuses</option>
          {driverStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-strong)]"
        >
          Apply
        </button>
        <Link
          href={clearHref}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          Clear
        </Link>
      </div>
    </form>
  );
}

function LoadFiltersForm({
  filters,
  selectedLead,
  selectedOpportunity,
  preselectedDriverId,
}: {
  filters: DispatchBoardFilters;
  selectedLead?: Lead | null;
  selectedOpportunity?: LoadOpportunity | null;
  preselectedDriverId?: string | null;
}) {
  const clearHref = buildDispatchBaseHref({
    selectedLeadId: selectedLead?.id,
    selectedOpportunityId: selectedOpportunity?.id,
    preselectedDriverId,
  });

  return (
    <form
      action="/dashboard/dispatch"
      method="get"
      className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]"
    >
      {selectedLead ? <input type="hidden" name="leadId" value={selectedLead.id} /> : null}
      {selectedOpportunity ? (
        <input type="hidden" name="opportunityId" value={selectedOpportunity.id} />
      ) : null}
      {preselectedDriverId ? (
        <input type="hidden" name="driverId" value={preselectedDriverId} />
      ) : null}
      {filters.driverStatus !== "all" ? (
        <input type="hidden" name="driverStatus" value={filters.driverStatus} />
      ) : null}
      {filters.driverQuery ? (
        <input type="hidden" name="driverQuery" value={filters.driverQuery} />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr),14rem,auto,auto]">
        <input
          type="search"
          name="loadQuery"
          defaultValue={filters.loadQuery}
          placeholder="Search route, broker, ref, customer"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:bg-white"
        />
        <select
          name="loadStatus"
          defaultValue={filters.loadStatus}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        >
          <option value="all">All load statuses</option>
          {dispatchLoadStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-strong)]"
        >
          Apply
        </button>
        <Link
          href={clearHref}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          Clear
        </Link>
      </div>
    </form>
  );
}

function CreateDriverForm() {
  return (
    <form
      action={createDriverAction}
      className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.22)]"
    >
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          Add Driver / Unit
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Add a Daniel Gruas LLC driver or unit so loads and movement can be
          assigned cleanly.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <input
          name="company"
          defaultValue="Daniel Gruas LLC"
          placeholder="Company"
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="driverName"
          placeholder="Driver / unit name"
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="phone"
          placeholder="Phone"
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="truckType"
          placeholder="Equipment type"
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="homeBase"
          placeholder="Home base"
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <select
          name="status"
          defaultValue="available"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        >
          {driverStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <textarea
        name="notes"
        rows={4}
        placeholder="Unit notes"
        className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
      />

      <button
        type="submit"
        className="mt-4 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-strong)]"
      >
        Create Driver
      </button>
    </form>
  );
}

function CreateLoadForm({
  drivers,
  selectedLead,
  selectedOpportunity,
  preselectedDriverId,
}: {
  drivers: Driver[];
  selectedLead?: Lead | null;
  selectedOpportunity?: LoadOpportunity | null;
  preselectedDriverId?: string | null;
}) {
  const defaultStatus = selectedOpportunity ? "posted" : "posted";

  return (
    <form
      action={createLoadAction}
      className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.22)]"
    >
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          Create Load
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Create the real booked/posted load record. If this came from an
          opportunity, route, notes, and vehicle data carry forward.
        </p>
      </div>

      {selectedLead ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
          Creating from lead <strong>{selectedLead.firstName} {selectedLead.lastName}</strong> •{" "}
          {selectedLead.truckType} • {selectedLead.preferredLanes}
        </div>
      ) : null}

      {selectedOpportunity ? (
        <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-800">
          Handoff from <strong>{selectedOpportunity.source}</strong> •{" "}
          {selectedOpportunity.origin} {"->"} {selectedOpportunity.destination}
        </div>
      ) : null}

      <input type="hidden" name="sourceLeadId" value={selectedLead?.id ?? ""} />
      <input
        type="hidden"
        name="sourceOpportunityId"
        value={selectedOpportunity?.id ?? ""}
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <input
          name="company"
          defaultValue={selectedOpportunity?.company ?? ""}
          placeholder="Customer / company"
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="broker"
          placeholder="Broker / carrier company"
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="referenceNumber"
          defaultValue={selectedOpportunity?.sourceReference ?? ""}
          placeholder="Reference number"
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="contactName"
          defaultValue={selectedOpportunity?.contactName ?? ""}
          placeholder="Primary contact name"
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="contactPhone"
          defaultValue={selectedOpportunity?.contactPhone ?? ""}
          placeholder="Primary contact phone"
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="customerName"
          defaultValue={selectedOpportunity?.customerName ?? ""}
          placeholder="Customer name"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="customerPhone"
          defaultValue={selectedOpportunity?.customerPhone ?? ""}
          placeholder="Customer phone"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="customerEmail"
          defaultValue={selectedOpportunity?.customerEmail ?? ""}
          placeholder="Customer email"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="origin"
          defaultValue={selectedOpportunity?.origin ?? ""}
          placeholder="Origin"
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="destination"
          defaultValue={selectedOpportunity?.destination ?? ""}
          placeholder="Destination"
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Pickup date
          <input
            name="pickupDate"
            type="datetime-local"
            defaultValue={formatDateTimeInput(selectedOpportunity?.pickupWindow ?? null)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Delivery date
          <input
            name="deliveryDate"
            type="datetime-local"
            defaultValue={formatDateTimeInput(selectedOpportunity?.deliveryWindow ?? null)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
        </label>
        <input
          name="rate"
          type="number"
          min="0"
          step="0.01"
          defaultValue={selectedOpportunity?.rate ?? ""}
          placeholder="Posted / booked rate"
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="customerPrice"
          type="number"
          min="0"
          step="0.01"
          defaultValue={selectedOpportunity?.customerPrice ?? ""}
          placeholder="Customer price"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="carrierPay"
          type="number"
          min="0"
          step="0.01"
          defaultValue={selectedOpportunity?.carrierPay ?? ""}
          placeholder="Carrier pay"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <select
          name="status"
          defaultValue={defaultStatus}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        >
          {dispatchLoadStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <select
          name="driverId"
          defaultValue={preselectedDriverId ?? ""}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white md:col-span-2"
        >
          <option value="">Unassigned unit</option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.driverName} • {driver.company}
            </option>
          ))}
        </select>
      </div>

      <textarea
        name="notes"
        rows={4}
        defaultValue={selectedOpportunity?.notes ?? ""}
        placeholder="Notes / handoff context"
        className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
      />

      <button
        type="submit"
        className="mt-4 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-strong)]"
      >
        Create Load
      </button>
    </form>
  );
}

function DriversSection({
  entries,
  filters,
  selectedLead,
  selectedOpportunity,
  preselectedDriverId,
}: {
  entries: DriverReviewEntry[];
  filters: DispatchBoardFilters;
  selectedLead?: Lead | null;
  selectedOpportunity?: LoadOpportunity | null;
  preselectedDriverId?: string | null;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          Drivers
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Available units, active execution, and lightweight status control.
        </p>
      </div>

      <DriverFiltersForm
        filters={filters}
        selectedLead={selectedLead}
        selectedOpportunity={selectedOpportunity}
        preselectedDriverId={preselectedDriverId}
      />

      {!entries.length ? (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white px-6 py-5 text-sm text-slate-500">
          No drivers match the current filter.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {entries.map(({ driver, metrics }) => (
            <article
              key={driver.id}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-heading text-xl font-semibold text-slate-950">
                    {driver.driverName}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {driver.company} • {driver.truckType}
                  </p>
                </div>
                <DriverStatusBadge status={driver.status} />
              </div>

              <dl className="mt-4 grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-slate-500">Assigned loads</dt>
                  <dd className="mt-1">{metrics.assignedLoadsCount}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Last load date</dt>
                  <dd className="mt-1">{formatDateTime(metrics.lastLoadDate)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Location</dt>
                  <dd className="mt-1">{driver.currentLocation ?? driver.homeBase}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Capacity</dt>
                  <dd className="mt-1">
                    {driver.capacity ? `${driver.capacity} cars` : "TBD"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-semibold text-slate-500">Current active load</dt>
                  <dd className="mt-2">
                    {metrics.activeLoad ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <LoadStatusBadge status={metrics.activeLoad.status} />
                        <span>
                          {metrics.activeLoad.origin} {"->"} {metrics.activeLoad.destination}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500">No active load</span>
                    )}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <a
                  href={`tel:${driver.phone}`}
                  className="text-sm font-semibold text-[var(--color-primary)] transition hover:text-[var(--color-primary-strong)]"
                >
                  {driver.phone}
                </a>
                <CopyButton value={driver.phone} label="Copy phone" />
                {driver.truckUnitNumber ? (
                  <StatusBadge label={`Truck ${driver.truckUnitNumber}`} />
                ) : null}
              </div>

              <form
                action={updateDriverStatusAction}
                className="mt-4 flex flex-wrap items-center gap-2"
              >
                <input type="hidden" name="driverId" value={driver.id} />
                <select
                  name="status"
                  defaultValue={driver.status}
                  className="min-w-[12rem] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
                >
                  {driverStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                >
                  Save Status
                </button>
              </form>

              <form action={saveDriverNotesAction} className="mt-4 space-y-2">
                <input type="hidden" name="driverId" value={driver.id} />
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={driver.notes ?? ""}
                  placeholder="Dispatcher notes"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
                />
                <button
                  type="submit"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                >
                  Save Notes
                </button>
              </form>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function LoadsSection({
  entries,
  drivers,
  filters,
  selectedLead,
  selectedOpportunity,
  preselectedDriverId,
}: {
  entries: LoadReviewEntry[];
  drivers: Driver[];
  filters: DispatchBoardFilters;
  selectedLead?: Lead | null;
  selectedOpportunity?: LoadOpportunity | null;
  preselectedDriverId?: string | null;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          Loads
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Booked and active work with status, economics, quick contacts, and
          one-click detail access.
        </p>
      </div>

      <LoadFiltersForm
        filters={filters}
        selectedLead={selectedLead}
        selectedOpportunity={selectedOpportunity}
        preselectedDriverId={preselectedDriverId}
      />

      {!entries.length ? (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white px-6 py-5 text-sm text-slate-500">
          No loads match the current filter.
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <article
              key={entry.load.id}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-heading text-xl font-semibold text-slate-950">
                    {entry.load.origin} {"->"} {entry.load.destination}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {entry.load.company} • Ref {entry.load.referenceNumber ?? "TBD"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <LoadStatusBadge status={entry.load.status} />
                  {entry.problemCount ? (
                    <StatusBadge label={`${entry.problemCount} problems`} tone="border-rose-200 bg-rose-50 text-rose-700" />
                  ) : null}
                  {entry.missingCount ? (
                    <StatusBadge label={`${entry.missingCount} missing`} tone="border-amber-200 bg-amber-50 text-amber-700" />
                  ) : null}
                  {entry.isLowMargin ? (
                    <StatusBadge label="low margin" tone="border-amber-200 bg-amber-50 text-amber-700" />
                  ) : null}
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr,1fr]">
                <div className="space-y-3 text-sm text-slate-700">
                  <p>
                    <span className="font-semibold text-slate-900">Assigned:</span>{" "}
                    {entry.assignedDriverName ?? "Unassigned"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Pickup / delivery:</span>{" "}
                    {formatDateTime(entry.load.pickupDate)} • {formatDateTime(entry.load.deliveryDate)}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Broker / carrier:</span>{" "}
                    {entry.load.broker || entry.load.carrierCompany || "TBD"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Customer:</span>{" "}
                    {entry.load.customerName || "TBD"} • {entry.load.customerPhone || "No phone"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Last touched:</span>{" "}
                    {formatDateTime(entry.lastTouchedAt)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-950">Economics & contacts</p>
                  <div className="mt-3 space-y-2">
                    <p>
                      Customer: {formatCurrency(entry.load.customerPrice)} • Carrier:{" "}
                      {formatCurrency(entry.load.carrierPay)}
                    </p>
                    <p>
                      Gross profit: {formatCurrency(entry.grossProfit)} • Per vehicle:{" "}
                      {formatCurrency(entry.profitPerVehicle)}
                    </p>
                    <p>
                      Posted rate: {formatCurrency(entry.load.rate)}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {entry.load.contactPhone ? (
                      <>
                        <a
                          href={`tel:${entry.load.contactPhone}`}
                          className="text-[var(--color-primary)] transition hover:text-[var(--color-primary-strong)]"
                        >
                          Call contact
                        </a>
                        <CopyButton value={entry.load.contactPhone} label="Copy phone" />
                      </>
                    ) : null}
                    {entry.load.referenceNumber ? (
                      <CopyButton value={entry.load.referenceNumber} label="Copy ref" />
                    ) : null}
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/dashboard/dispatch/${entry.load.id}`}
                      className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                    >
                      Open Details
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <form action={updateLoadStatusAction} className="space-y-2">
                  <input type="hidden" name="loadId" value={entry.load.id} />
                  <select
                    name="status"
                    defaultValue={entry.load.status}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
                  >
                    {dispatchLoadStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    Save Status
                  </button>
                </form>

                <form action={assignLoadAction} className="space-y-2">
                  <input type="hidden" name="loadId" value={entry.load.id} />
                  <select
                    name="driverId"
                    defaultValue={entry.load.driverId ?? ""}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
                  >
                    <option value="">Unassigned unit</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.driverName} • {driver.company}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    Save Assignment
                  </button>
                </form>

                <form action={saveLoadNotesAction} className="space-y-2">
                  <input type="hidden" name="loadId" value={entry.load.id} />
                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={entry.load.notes ?? ""}
                    placeholder="Dispatcher notes"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    Save Notes
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function DispatchBoard({
  drivers,
  driverEntries,
  loadEntries,
  filters,
  selectedLead,
  selectedOpportunity,
  preselectedDriverId,
}: DispatchBoardProps) {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
          Dispatch Operations
        </p>
        <h1 className="font-heading text-3xl font-semibold text-slate-950 sm:text-4xl">
          Book it, assign it, and keep it moving.
        </h1>
        <p className="max-w-3xl text-base leading-7 text-slate-600">
          This board stays operational: driver readiness, booked loads,
          pricing, contact shortcuts, and links into the full detail record.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr,1.2fr]">
        <CreateDriverForm />
        <CreateLoadForm
          drivers={drivers}
          selectedLead={selectedLead}
          selectedOpportunity={selectedOpportunity}
          preselectedDriverId={preselectedDriverId}
        />
      </div>

      <DriversSection
        entries={driverEntries}
        filters={filters}
        selectedLead={selectedLead}
        selectedOpportunity={selectedOpportunity}
        preselectedDriverId={preselectedDriverId}
      />

      <LoadsSection
        entries={loadEntries}
        drivers={drivers}
        filters={filters}
        selectedLead={selectedLead}
        selectedOpportunity={selectedOpportunity}
        preselectedDriverId={preselectedDriverId}
      />
    </section>
  );
}
