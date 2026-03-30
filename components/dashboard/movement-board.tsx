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
  ProblemFlagBadge,
  ReloadPriorityBadge,
  StatusBadge,
} from "@/components/dashboard/status-badge";
import { PagePlaybook } from "@/components/dashboard/page-playbook";
import { OpportunityVehicleFields } from "@/components/dashboard/opportunity-vehicle-fields";
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
  dispatcherOptions: Array<{
    email: string;
    label: string;
  }>;
  isOwner: boolean;
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

function getDispatcherLabel(
  email: string | null,
  dispatcherOptions: Array<{
    email: string;
    label: string;
  }>,
) {
  if (!email) {
    return "Unassigned";
  }

  return (
    dispatcherOptions.find((option) => option.email === email)?.label ?? email
  );
}

function MovementHelpCard({ isOwner }: { isOwner: boolean }) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.22)]">
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          How dispatchers use this page
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Fleet Movement is for possible work. Add board posts here, attach them
          to the right unit, and only move them into Dispatch once the move is
          real.
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            1. Capture
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Add the board post with route, pickup and delivery windows, contact
            info, and the vehicles being moved.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            2. Match
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Use the reload queue and Daniel Gruas LLC unit cards below to decide
            which truck should take the next move.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            3. Handoff
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            When the job is confirmed, open Create Load so the real booked move
            continues on the Dispatch board.
          </p>
        </div>
      </div>

      <p className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-6 text-sky-800">
        {isOwner
          ? "Owner tip: assign each unit to a dispatcher so work and accountability stay clear."
          : "Dispatcher tip: only work the units assigned to you and keep movement details current before booking the next move."}
      </p>
    </div>
  );
}

function CreateOpportunityForm({
  drivers,
  isOwner,
}: {
  drivers: Driver[];
  isOwner: boolean;
}) {
  return (
    <form
      action={createLoadOpportunityAction}
      className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.22)]"
    >
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          Capture Board Opportunity
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Capture a Central Dispatch, Super Dispatch, ACV, or other board post
          fast with enough detail for someone else to work it later.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <input
          name="source"
          placeholder="Source board (Central Dispatch, ACV, etc.)"
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
          name="origin"
          placeholder="Pickup city / state / zip"
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="destination"
          placeholder="Delivery city / state / zip"
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
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Delivery window
          <input
            name="deliveryWindow"
            type="datetime-local"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
        </label>
        <input
          name="rate"
          type="number"
          min="0"
          step="0.01"
          placeholder="Quoted or expected rate"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="contactName"
          placeholder="Posting contact name"
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="contactPhone"
          placeholder="Posting contact phone"
          required
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <select
          name="assignedDriverId"
          defaultValue={isOwner ? "" : drivers[0]?.id ?? ""}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        >
          {isOwner ? <option value="">Unassigned unit</option> : null}
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

      <OpportunityVehicleFields />

      <textarea
        name="notes"
        rows={4}
        placeholder="Notes / instructions / special handling"
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
  dispatcherOptions,
  isOwner,
}: {
  fleetEntries: FleetMovementEntry[];
  dispatcherOptions: Array<{
    email: string;
    label: string;
  }>;
  isOwner: boolean;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          Daniel Gruas LLC Units
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Keep unit status, location, capacity, and reload visibility in one
          place so a new hire can tell what each truck is doing without asking.
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
                  <dt className="font-semibold text-slate-500">Dispatcher</dt>
                  <dd className="mt-1">
                    {getDispatcherLabel(
                      entry.driver.assignedDispatcherEmail,
                      dispatcherOptions,
                    )}
                  </dd>
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
                <Link
                  href={`/dashboard/units/${entry.driver.id}`}
                  className="text-sm font-semibold text-[var(--color-primary)] transition hover:text-[var(--color-primary-strong)]"
                >
                  Open Unit
                </Link>
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
                {isOwner ? (
                  <select
                    name="assignedDispatcherEmail"
                    defaultValue={entry.driver.assignedDispatcherEmail ?? ""}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
                  >
                    <option value="">Unassigned dispatcher</option>
                    {dispatcherOptions.map((option) => (
                      <option key={option.email} value={option.email}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="hidden"
                    name="assignedDispatcherEmail"
                    value={entry.driver.assignedDispatcherEmail ?? ""}
                  />
                )}
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
  isOwner,
}: {
  drivers: Driver[];
  entries: OpportunityBoardEntry[];
  isOwner: boolean;
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-semibold text-slate-950">
            Board Opportunities
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
                  {entry.problemCount ? <ProblemFlagBadge /> : null}
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
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {entry.opportunity.contactPhone ? (
                      <>
                        <a
                          href={`tel:${entry.opportunity.contactPhone}`}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                        >
                          Call contact
                        </a>
                        <CopyButton
                          value={entry.opportunity.contactPhone}
                          label="Copy phone"
                          className="w-full justify-center px-3 py-2 text-sm"
                        />
                      </>
                    ) : null}
                    {entry.opportunity.sourceReference ? (
                      <CopyButton
                        value={entry.opportunity.sourceReference}
                        label="Copy ref"
                        className="w-full justify-center px-3 py-2 text-sm"
                      />
                    ) : null}
                    {entry.opportunity.sourceUrl ? (
                      <Link
                        href={entry.opportunity.sourceUrl}
                        target="_blank"
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                      >
                        Open source
                      </Link>
                    ) : null}
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <Link
                      href={`/dashboard/movement/${entry.opportunity.id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                    >
                      Open Details
                    </Link>
                    <Link
                      href={`/dashboard/dispatch?opportunityId=${entry.opportunity.id}${entry.opportunity.assignedDriverId ? `&driverId=${entry.opportunity.assignedDriverId}` : ""}`}
                      className="inline-flex items-center justify-center rounded-xl bg-[var(--color-primary)] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-strong)]"
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
                    defaultValue={
                      entry.opportunity.assignedDriverId ??
                      (isOwner ? "" : drivers[0]?.id ?? "")
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
                  >
                    {isOwner ? <option value="">Unassigned unit</option> : null}
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
  dispatcherOptions,
  isOwner,
}: MovementBoardProps) {
  return (
    <section className="space-y-8">
      <div className="rounded-[1.75rem] border border-sky-100 bg-gradient-to-r from-white via-sky-50 to-amber-50 px-5 py-5 shadow-[0_26px_70px_-50px_rgba(14,165,233,0.42)]">
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
      </div>

      <PagePlaybook
        eyebrow={isOwner ? "Owner Workflow" : "Dispatcher Workflow"}
        title="What this page is for"
        description={
          isOwner
            ? "Fleet Movement is where your team organizes possible work from external boards before it becomes a booked load."
            : "Use this page to capture outside board posts, match them to your assigned units, and hand confirmed work into Dispatch."
        }
        steps={[
          {
            title: "Watch the reload queue first",
            description:
              "Any unit in the queue is at risk of sitting soon and should get the next review before low-priority work.",
          },
          {
            title: "Capture complete opportunities",
            description:
              "Enter enough route, vehicle, contact, and timing detail so another dispatcher could work the record without extra context.",
          },
          {
            title: "Only convert real work",
            description:
              "Once the move is real, use Create Load and continue execution from the Dispatch board instead of managing it here.",
          },
        ]}
        actions={[
          { label: "Open Dispatch Board", href: "/dashboard/dispatch" },
          { label: "Open Main Dashboard", href: "/dashboard" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr,1.3fr]">
        <MovementHelpCard isOwner={isOwner} />
        <CreateOpportunityForm drivers={drivers} isOwner={isOwner} />
      </div>

      <ReloadQueue entries={reloadPriorityEntries} />
      <FleetUnitsSection
        fleetEntries={fleetEntries}
        dispatcherOptions={dispatcherOptions}
        isOwner={isOwner}
      />
      <OpportunitySection
        drivers={drivers}
        entries={opportunityEntries}
        isOwner={isOwner}
      />
    </section>
  );
}
