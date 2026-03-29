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
import type { Driver, DriverStatus, Lead, Load } from "@/lib/types";
import {
  dispatchLoadStatuses,
  driverStatuses,
} from "@/lib/types";
import type {
  DispatchBoardFilters,
  DriverReviewEntry,
  LoadReviewEntry,
} from "@/lib/services";

type DispatchBoardProps = {
  drivers: Driver[];
  loads: Load[];
  driverEntries: DriverReviewEntry[];
  loadEntries: LoadReviewEntry[];
  filters: DispatchBoardFilters;
  selectedLead?: Lead | null;
  preselectedDriverId?: string | null;
};

function formatDate(value: string | null) {
  if (!value) {
    return "TBD";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
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

function getDriverStatusClasses(status: DriverStatus) {
  switch (status) {
    case "available":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "assigned":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "in_transit":
      return "border-sky-200 bg-sky-50 text-sky-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function getLoadStatusClasses(status: Load["status"]) {
  switch (status) {
    case "searching":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "booked":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "dispatched":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "picked_up":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "delivered":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function StatusPill({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${className}`}
    >
      {label.replaceAll("_", " ")}
    </span>
  );
}

function buildDispatchBaseHref({
  selectedLeadId,
  preselectedDriverId,
}: {
  selectedLeadId?: string | null;
  preselectedDriverId?: string | null;
}) {
  const params = new URLSearchParams();

  if (selectedLeadId) {
    params.set("leadId", selectedLeadId);
  }

  if (preselectedDriverId) {
    params.set("driverId", preselectedDriverId);
  }

  const query = params.toString();
  return query ? `/dashboard/dispatch?${query}` : "/dashboard/dispatch";
}

function CreateDriverForm() {
  return (
    <form
      action={createDriverAction}
      className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.22)]"
    >
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          Add Driver
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Keep this lightweight. Add a driver, mark availability, and start
          assigning loads.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <input
          name="company"
          placeholder="Company"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="driverName"
          placeholder="Driver name"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="phone"
          placeholder="Phone"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="truckType"
          placeholder="Truck type"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="homeBase"
          placeholder="Home base"
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
        placeholder="Notes"
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

function DriverFiltersForm({
  filters,
  selectedLead,
  preselectedDriverId,
}: {
  filters: DispatchBoardFilters;
  selectedLead?: Lead | null;
  preselectedDriverId?: string | null;
}) {
  const clearHref = buildDispatchBaseHref({
    selectedLeadId: selectedLead?.id,
    preselectedDriverId,
  });

  return (
    <form
      action="/dashboard/dispatch"
      method="get"
      className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]"
    >
      {selectedLead ? (
        <input type="hidden" name="leadId" value={selectedLead.id} />
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
          placeholder="Search driver, phone, company"
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
  preselectedDriverId,
}: {
  filters: DispatchBoardFilters;
  selectedLead?: Lead | null;
  preselectedDriverId?: string | null;
}) {
  const clearHref = buildDispatchBaseHref({
    selectedLeadId: selectedLead?.id,
    preselectedDriverId,
  });

  return (
    <form
      action="/dashboard/dispatch"
      method="get"
      className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]"
    >
      {selectedLead ? (
        <input type="hidden" name="leadId" value={selectedLead.id} />
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
          placeholder="Search route, broker, driver"
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

function CreateLoadForm({
  drivers,
  selectedLead,
  preselectedDriverId,
}: {
  drivers: Driver[];
  selectedLead?: Lead | null;
  preselectedDriverId?: string | null;
}) {
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
          Add a load, leave it unassigned if needed, and update status as it
          moves from searching to delivered.
        </p>
      </div>

      {selectedLead ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
          Creating this load from lead <strong>{selectedLead.firstName} {selectedLead.lastName}</strong>.
          Truck: {selectedLead.truckType}. Preferred lanes: {selectedLead.preferredLanes}.
        </div>
      ) : null}

      <input
        type="hidden"
        name="sourceLeadId"
        value={selectedLead?.id ?? ""}
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <input
          name="company"
          placeholder="Customer / company"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="broker"
          placeholder="Broker"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="origin"
          placeholder="Origin"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="destination"
          placeholder="Destination"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Pickup date
          <input
            name="pickupDate"
            type="datetime-local"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Delivery date
          <input
            name="deliveryDate"
            type="datetime-local"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
        </label>
        <input
          name="rate"
          type="number"
          min="0"
          step="0.01"
          placeholder="Rate"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <select
          name="status"
          defaultValue="searching"
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
          <option value="">Unassigned</option>
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
        placeholder="Notes"
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
  driverEntries,
  totalDriversCount,
  filters,
  selectedLead,
  preselectedDriverId,
}: {
  driverEntries: DriverReviewEntry[];
  totalDriversCount: number;
  filters: DispatchBoardFilters;
  selectedLead?: Lead | null;
  preselectedDriverId?: string | null;
}) {
  if (!totalDriversCount) {
    return (
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-semibold text-slate-950">
            Drivers
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            No drivers yet. Add one above to start assigning loads.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          Drivers
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          See who is available, assigned, or already moving freight.
        </p>
      </div>

      <DriverFiltersForm
        filters={filters}
        selectedLead={selectedLead}
        preselectedDriverId={preselectedDriverId}
      />

      <p className="text-sm leading-6 text-slate-600">
        Showing {driverEntries.length} of {totalDriversCount} drivers.
      </p>

      {!driverEntries.length ? (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-8 text-sm leading-6 text-slate-600">
          No drivers match the current filter.
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {driverEntries.map(({ driver, metrics }) => (
          <article
            key={driver.id}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.22)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-heading text-xl font-semibold text-slate-950">
                  {driver.driverName}
                </p>
                <p className="mt-1 text-sm text-slate-600">{driver.company}</p>
              </div>

              <StatusPill
                label={driver.status}
                className={getDriverStatusClasses(driver.status)}
              />
            </div>

            <dl className="mt-5 grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-slate-500">Phone</dt>
                <dd className="mt-1">{driver.phone}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Truck Type</dt>
                <dd className="mt-1">{driver.truckType}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Home Base</dt>
                <dd className="mt-1">{driver.homeBase}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Created</dt>
                <dd className="mt-1">{formatDate(driver.createdAt)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Assigned Loads</dt>
                <dd className="mt-1">{metrics.assignedLoadsCount}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Last Load Date</dt>
                <dd className="mt-1">{formatDate(metrics.lastLoadDate)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-semibold text-slate-500">Active Load</dt>
                <dd className="mt-2">
                  {metrics.activeLoad ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill
                        label={metrics.activeLoad.status}
                        className={getLoadStatusClasses(metrics.activeLoad.status)}
                      />
                      <span className="font-medium text-slate-700">
                        {metrics.activeLoad.origin} to {metrics.activeLoad.destination}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-500">No active load assigned</span>
                  )}
                </dd>
              </div>
            </dl>

            <form
              action={updateDriverStatusAction}
              className="mt-5 flex items-center gap-2 border-t border-slate-200 pt-4"
            >
              <input type="hidden" name="driverId" value={driver.id} />
              <select
                name="status"
                defaultValue={driver.status}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
              >
                {driverStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="rounded-xl bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-strong)]"
              >
                Save
              </button>
            </form>

            <form
              action={saveDriverNotesAction}
              className="mt-4 space-y-2 border-t border-slate-200 pt-4"
            >
              <input type="hidden" name="driverId" value={driver.id} />
              <label
                htmlFor={`driver-notes-${driver.id}`}
                className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
              >
                Notes
              </label>
              <textarea
                id={`driver-notes-${driver.id}`}
                name="notes"
                rows={3}
                defaultValue={driver.notes ?? ""}
                placeholder="Driver notes"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:bg-white"
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
    </section>
  );
}

function LoadsSection({
  loadEntries,
  drivers,
  totalLoadsCount,
  filters,
  selectedLead,
  preselectedDriverId,
}: {
  loadEntries: LoadReviewEntry[];
  drivers: Driver[];
  totalLoadsCount: number;
  filters: DispatchBoardFilters;
  selectedLead?: Lead | null;
  preselectedDriverId?: string | null;
}) {
  const driverNameById = new Map(
    drivers.map((driver) => [driver.id, driver.driverName]),
  );

  if (!totalLoadsCount) {
    return (
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-semibold text-slate-950">
            Loads
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            No loads yet. Create one above and assign it when ready.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          Loads
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Track what is searching, booked, dispatched, in motion, or delivered.
        </p>
      </div>

      <LoadFiltersForm
        filters={filters}
        selectedLead={selectedLead}
        preselectedDriverId={preselectedDriverId}
      />

      <p className="text-sm leading-6 text-slate-600">
        Showing {loadEntries.length} of {totalLoadsCount} loads.
      </p>

      {!loadEntries.length ? (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-8 text-sm leading-6 text-slate-600">
          No loads match the current filter.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_60px_-35px_rgba(15,23,42,0.22)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Driver</th>
                <th className="px-6 py-4 font-semibold">Route</th>
                <th className="px-6 py-4 font-semibold">Broker</th>
                <th className="px-6 py-4 font-semibold">Rate</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Pickup / Delivery</th>
                <th className="px-6 py-4 font-semibold">Assign</th>
                <th className="px-6 py-4 font-semibold">Update</th>
                <th className="px-6 py-4 font-semibold">Notes</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loadEntries.map(({ load, assignedDriverName }) => (
                <tr key={load.id} className="align-top">
                  <td className="px-6 py-5 text-slate-700">
                    {assignedDriverName ??
                      (load.driverId
                        ? driverNameById.get(load.driverId) ?? "Unknown"
                        : "Unassigned")}
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-semibold text-slate-950">{load.origin}</p>
                    <p className="mt-1 text-slate-600">{load.destination}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.12em] text-slate-500">
                      {load.company}
                    </p>
                  </td>
                  <td className="px-6 py-5 text-slate-700">{load.broker}</td>
                  <td className="px-6 py-5 text-slate-700">{formatCurrency(load.rate)}</td>
                  <td className="px-6 py-5">
                    <StatusPill
                      label={load.status}
                      className={getLoadStatusClasses(load.status)}
                    />
                  </td>
                  <td className="px-6 py-5 text-slate-700">
                    <p>{formatDate(load.pickupDate)}</p>
                    <p className="mt-1 text-slate-500">{formatDate(load.deliveryDate)}</p>
                  </td>
                  <td className="px-6 py-5">
                    <form action={assignLoadAction} className="space-y-2">
                      <input type="hidden" name="loadId" value={load.id} />
                      <select
                        name="driverId"
                        defaultValue={load.driverId ?? ""}
                        className="min-w-[12rem] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
                      >
                        <option value="">Unassigned</option>
                        {drivers.map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.driverName}
                          </option>
                        ))}
                      </select>

                      <button
                        type="submit"
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                      >
                        Assign
                      </button>
                    </form>
                  </td>
                  <td className="px-6 py-5">
                    <form action={updateLoadStatusAction} className="space-y-2">
                      <input type="hidden" name="loadId" value={load.id} />
                      <select
                        name="status"
                        defaultValue={load.status}
                        className="min-w-[11rem] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
                      >
                        {dispatchLoadStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>

                      <button
                        type="submit"
                        className="rounded-xl bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-strong)]"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-6 py-5">
                    <form action={saveLoadNotesAction} className="space-y-2">
                      <input type="hidden" name="loadId" value={load.id} />
                      <textarea
                        name="notes"
                        rows={3}
                        defaultValue={load.notes ?? ""}
                        placeholder="Load notes"
                        className="min-w-[14rem] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:bg-white"
                      />

                      <button
                        type="submit"
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                      >
                        Save Notes
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function DispatchBoard({
  drivers,
  loads,
  driverEntries,
  loadEntries,
  filters,
  selectedLead,
  preselectedDriverId,
}: DispatchBoardProps) {
  const activeLoads = loads.filter((load) => load.status !== "delivered").length;
  const availableDrivers = drivers.filter(
    (driver) => driver.status === "available",
  ).length;

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
          Dispatch Lite
        </p>
        <div className="max-w-3xl space-y-3">
          <h1 className="font-heading text-3xl font-semibold text-slate-950 sm:text-4xl">
            Run real dispatch operations without jumping straight into a full
            TMS.
          </h1>
          <p className="text-base leading-7 text-slate-600">
            This board is intentionally minimal. Add drivers, create loads,
            assign freight, and update statuses so Monday operations can happen
            inside the same app foundation that the larger product will grow
            from.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.25)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Drivers
          </p>
          <p className="mt-3 font-heading text-4xl font-semibold text-slate-950">
            {drivers.length}
          </p>
        </article>
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.25)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Available
          </p>
          <p className="mt-3 font-heading text-4xl font-semibold text-slate-950">
            {availableDrivers}
          </p>
        </article>
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.25)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Loads
          </p>
          <p className="mt-3 font-heading text-4xl font-semibold text-slate-950">
            {loads.length}
          </p>
        </article>
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.25)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Active Loads
          </p>
          <p className="mt-3 font-heading text-4xl font-semibold text-slate-950">
            {activeLoads}
          </p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <CreateDriverForm />
        <CreateLoadForm
          drivers={drivers}
          selectedLead={selectedLead}
          preselectedDriverId={preselectedDriverId}
        />
      </div>

      <DriversSection
        driverEntries={driverEntries}
        totalDriversCount={drivers.length}
        filters={filters}
        selectedLead={selectedLead}
        preselectedDriverId={preselectedDriverId}
      />
      <LoadsSection
        loadEntries={loadEntries}
        drivers={drivers}
        totalLoadsCount={loads.length}
        filters={filters}
        selectedLead={selectedLead}
        preselectedDriverId={preselectedDriverId}
      />
    </section>
  );
}
