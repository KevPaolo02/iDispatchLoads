import Link from "next/link";

import {
  saveDriverNotesAction,
  updateDriverStatusAction,
} from "@/app/(dashboard)/dashboard/dispatch/actions/dispatch-actions";
import {
  assignLoadOpportunityAction,
  createLoadOpportunityAction,
  saveLoadOpportunityNotesAction,
  updateDriverMovementAction,
  updateLoadOpportunityStatusAction,
} from "@/app/(dashboard)/dashboard/movement/actions/movement-actions";
import {
  DriverStatusBadge,
  LoadStatusBadge,
  OpportunityStatusBadge,
  ReloadPriorityBadge,
  StatusBadge,
} from "@/components/dashboard/status-badge";
import { CopyButton } from "@/components/shared/copy-button";
import type { Driver } from "@/lib/types";
import { driverStatuses, loadOpportunityStatuses } from "@/lib/types";
import type {
  FleetMovementEntry,
  OpportunityBoardEntry,
  ReloadPriorityEntry,
} from "@/lib/services";

type MovementBoardProps = {
  drivers: Driver[];
  fleetEntries: FleetMovementEntry[];
  opportunityEntries: OpportunityBoardEntry[];
  reloadPriorityEntries: ReloadPriorityEntry[];
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

function CreateFleetUnitForm() {
  return (
    <form
      action={updateDriverMovementAction}
      className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.22)]"
    >
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          Update Unit Movement
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Use the Dispatch board to add units. Use this section to keep current
          location, trailer details, and reload timing up to date.
        </p>
      </div>
      <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
        Pick a unit below and use its card to update movement. This board keeps
        the work dispatcher-first instead of opening giant admin forms here.
      </p>
    </form>
  );
}

function CreateOpportunityForm({ drivers }: { drivers: Driver[] }) {
  return (
    <form
      action={createLoadOpportunityAction}
      className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.22)]"
    >
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          Add Opportunity
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Capture a Central Dispatch, Super Dispatch, ACV, or other board post
          fast, then finish the operational detail on the opportunity page.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <input
          name="source"
          placeholder="Source board"
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="sourceReference"
          placeholder="Reference / post id"
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="sourceUrl"
          placeholder="Source URL"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white md:col-span-2"
        />
        <input
          name="company"
          placeholder="Customer / auction / dealer"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="vehiclesCount"
          type="number"
          min="1"
          step="1"
          defaultValue="1"
          required
          placeholder="Vehicles"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="origin"
          placeholder="Origin"
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="destination"
          placeholder="Destination"
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Pickup window
          <input
            name="pickupWindow"
            type="datetime-local"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
        </label>
        <input
          name="rate"
          type="number"
          min="0"
          step="0.01"
          placeholder="Quoted rate"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="contactName"
          placeholder="Contact name"
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="contactPhone"
          placeholder="Contact phone"
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <select
          name="assignedDriverId"
          defaultValue=""
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        >
          <option value="">Unassigned unit</option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.driverName} • {driver.company}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue="new"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        >
          {loadOpportunityStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <textarea
        name="notes"
        rows={4}
        placeholder="Notes / instructions"
        className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
      />

      <button
        type="submit"
        className="mt-4 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-strong)]"
      >
        Add Opportunity
      </button>
    </form>
  );
}

function ReloadQueue({
  entries,
}: {
  entries: ReloadPriorityEntry[];
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          Reload Priority Queue
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          This is the first list a hired dispatcher should check.
        </p>
      </div>

      {!entries.length ? (
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-6 py-5 text-sm text-emerald-700">
          Every unit either has an active move or a next opportunity attached.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          {entries.map((entry) => (
            <article
              key={entry.driver.id}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]"
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
                Ready at: {formatDateTime(entry.readyAt)}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function FleetUnitsSection({
  fleetEntries,
}: {
  fleetEntries: FleetMovementEntry[];
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          Daniel Gruas LLC Units
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Keep unit status, location, capacity, and reload visibility in one
          place.
        </p>
      </div>

      {!fleetEntries.length ? (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white px-6 py-5 text-sm text-slate-500">
          No units yet. Add one from the Dispatch board first.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {fleetEntries.map((entry) => (
            <article
              key={entry.driver.id}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-heading text-xl font-semibold text-slate-950">
                    {entry.driver.driverName}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {entry.driver.company}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <DriverStatusBadge status={entry.driver.status} />
                  {entry.reloadPriorityLevel ? (
                    <ReloadPriorityBadge level={entry.reloadPriorityLevel} />
                  ) : null}
                </div>
              </div>

              <dl className="mt-4 grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-slate-500">Current location</dt>
                  <dd className="mt-1">{entry.driver.currentLocation ?? "TBD"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Capacity</dt>
                  <dd className="mt-1">
                    {entry.driver.capacity ? `${entry.driver.capacity} cars` : "TBD"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Assigned loads</dt>
                  <dd className="mt-1">{entry.assignedLoadsCount}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-500">Last load date</dt>
                  <dd className="mt-1">{formatDateTime(entry.lastLoadDate)}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-semibold text-slate-500">Current load</dt>
                  <dd className="mt-2">
                    {entry.activeLoad ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <LoadStatusBadge status={entry.activeLoad.status} />
                        <span>
                          {entry.activeLoad.origin} {"->"} {entry.activeLoad.destination}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500">No active load</span>
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-semibold text-slate-500">Next opportunity</dt>
                  <dd className="mt-2">
                    {entry.nextOpportunity ? (
                      <div className="space-y-1">
                        <p>
                          {entry.nextOpportunity.origin} {"->"}{" "}
                          {entry.nextOpportunity.destination}
                        </p>
                        <p className="text-slate-500">
                          {entry.nextOpportunity.source} •{" "}
                          {formatCurrency(entry.nextOpportunity.rate)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-500">No next opportunity yet</span>
                    )}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <a
                  href={`tel:${entry.driver.phone}`}
                  className="text-sm font-semibold text-[var(--color-primary)] transition hover:text-[var(--color-primary-strong)]"
                >
                  {entry.driver.phone}
                </a>
                <CopyButton value={entry.driver.phone} label="Copy phone" />
                {entry.driver.truckUnitNumber ? (
                  <StatusBadge label={`Truck ${entry.driver.truckUnitNumber}`} />
                ) : null}
              </div>

              <form
                action={updateDriverStatusAction}
                className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4"
              >
                <input type="hidden" name="driverId" value={entry.driver.id} />
                <select
                  name="status"
                  defaultValue={entry.driver.status}
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
                  className="rounded-xl bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-strong)]"
                >
                  Save Status
                </button>
              </form>

              <form
                action={updateDriverMovementAction}
                className="mt-4 grid gap-3 sm:grid-cols-2"
              >
                <input type="hidden" name="driverId" value={entry.driver.id} />
                <input
                  name="currentLocation"
                  defaultValue={entry.driver.currentLocation ?? ""}
                  placeholder="Current location"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
                />
                <label className="grid gap-2 text-sm text-slate-700">
                  Available from
                  <input
                    name="availableFrom"
                    type="datetime-local"
                    defaultValue={formatDateTimeInput(entry.driver.availableFrom)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
                  />
                </label>
                <input
                  name="truckUnitNumber"
                  defaultValue={entry.driver.truckUnitNumber ?? ""}
                  placeholder="Truck number"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
                />
                <input
                  name="trailerUnitNumber"
                  defaultValue={entry.driver.trailerUnitNumber ?? ""}
                  placeholder="Trailer number"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
                />
                <input
                  name="truckVin"
                  defaultValue={entry.driver.truckVin ?? ""}
                  placeholder="Truck VIN"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm uppercase outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
                />
                <input
                  name="trailerVin"
                  defaultValue={entry.driver.trailerVin ?? ""}
                  placeholder="Trailer VIN"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm uppercase outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
                />
                <input
                  name="capacity"
                  type="number"
                  min="1"
                  step="1"
                  defaultValue={entry.driver.capacity ?? ""}
                  placeholder="Capacity"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
                />
                <button
                  type="submit"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                >
                  Save Movement
                </button>
              </form>

              <form action={saveDriverNotesAction} className="mt-4 space-y-2">
                <input type="hidden" name="driverId" value={entry.driver.id} />
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={entry.driver.notes ?? ""}
                  placeholder="Unit notes"
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

function OpportunitySection({
  drivers,
  entries,
}: {
  drivers: Driver[];
  entries: OpportunityBoardEntry[];
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-semibold text-slate-950">
            Opportunities
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            Review board posts, assign them to a unit, and move complete ones
            into booked loads.
          </p>
        </div>
        <Link
          href="/dashboard/dispatch"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          Open Dispatch Board
        </Link>
      </div>

      {!entries.length ? (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white px-6 py-5 text-sm text-slate-500">
          No opportunities captured yet.
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <article
              key={entry.opportunity.id}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-heading text-xl font-semibold text-slate-950">
                    {entry.opportunity.origin} {"->"} {entry.opportunity.destination}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {entry.opportunity.source} • {entry.opportunity.company ?? "No customer yet"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <OpportunityStatusBadge status={entry.opportunity.status} />
                  {entry.problemCount ? (
                    <StatusBadge label={`${entry.problemCount} problems`} tone="border-rose-200 bg-rose-50 text-rose-700" />
                  ) : null}
                  {entry.missingCount ? (
                    <StatusBadge label={`${entry.missingCount} missing`} tone="border-amber-200 bg-amber-50 text-amber-700" />
                  ) : null}
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr,1fr]">
                <div className="space-y-3 text-sm text-slate-700">
                  <p>
                    <span className="font-semibold text-slate-900">Vehicles:</span>{" "}
                    {entry.vehicleCount || entry.opportunity.vehiclesCount}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Rate:</span>{" "}
                    {formatCurrency(entry.opportunity.rate)}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Contact:</span>{" "}
                    {entry.opportunity.contactName || "TBD"} •{" "}
                    {entry.opportunity.contactPhone || "TBD"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Assigned unit:</span>{" "}
                    {entry.assignedDriverName ?? "Unassigned"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Last touched:</span>{" "}
                    {formatDateTime(entry.lastTouchedAt)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-950">Quick access</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {entry.opportunity.contactPhone ? (
                      <>
                        <a
                          href={`tel:${entry.opportunity.contactPhone}`}
                          className="text-[var(--color-primary)] transition hover:text-[var(--color-primary-strong)]"
                        >
                          Call contact
                        </a>
                        <CopyButton
                          value={entry.opportunity.contactPhone}
                          label="Copy phone"
                        />
                      </>
                    ) : null}
                    {entry.opportunity.sourceReference ? (
                      <CopyButton
                        value={entry.opportunity.sourceReference}
                        label="Copy ref"
                      />
                    ) : null}
                    {entry.opportunity.sourceUrl ? (
                      <Link
                        href={entry.opportunity.sourceUrl}
                        target="_blank"
                        className="text-[var(--color-primary)] transition hover:text-[var(--color-primary-strong)]"
                      >
                        Open source
                      </Link>
                    ) : null}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/movement/${entry.opportunity.id}`}
                      className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                    >
                      Open Details
                    </Link>
                    <Link
                      href={`/dashboard/dispatch?opportunityId=${entry.opportunity.id}${entry.opportunity.assignedDriverId ? `&driverId=${entry.opportunity.assignedDriverId}` : ""}`}
                      className="rounded-full bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-strong)]"
                    >
                      Create Load
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <form action={updateLoadOpportunityStatusAction} className="space-y-2">
                  <input
                    type="hidden"
                    name="opportunityId"
                    value={entry.opportunity.id}
                  />
                  <select
                    name="status"
                    defaultValue={entry.opportunity.status}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
                  >
                    {loadOpportunityStatuses.map((status) => (
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

                <form action={assignLoadOpportunityAction} className="space-y-2">
                  <input
                    type="hidden"
                    name="opportunityId"
                    value={entry.opportunity.id}
                  />
                  <select
                    name="driverId"
                    defaultValue={entry.opportunity.assignedDriverId ?? ""}
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

                <form action={saveLoadOpportunityNotesAction} className="space-y-2">
                  <input
                    type="hidden"
                    name="opportunityId"
                    value={entry.opportunity.id}
                  />
                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={entry.opportunity.notes ?? ""}
                    placeholder="Notes"
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

export function MovementBoard({
  drivers,
  fleetEntries,
  opportunityEntries,
  reloadPriorityEntries,
}: MovementBoardProps) {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
          Fleet Movement
        </p>
        <h1 className="font-heading text-3xl font-semibold text-slate-950 sm:text-4xl">
          Keep Daniel Gruas LLC moving.
        </h1>
        <p className="max-w-3xl text-base leading-7 text-slate-600">
          Capture opportunities, attach them to the right unit, and keep reload
          risk visible before trucks sit.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,1.3fr]">
        <CreateFleetUnitForm />
        <CreateOpportunityForm drivers={drivers} />
      </div>

      <ReloadQueue entries={reloadPriorityEntries} />
      <FleetUnitsSection fleetEntries={fleetEntries} />
      <OpportunitySection drivers={drivers} entries={opportunityEntries} />
    </section>
  );
}
