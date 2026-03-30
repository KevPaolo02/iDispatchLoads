import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { saveDriverProfileAction } from "@/app/(dashboard)/dashboard/dispatch/actions/dispatch-actions";
import { DriverStatusBadge } from "@/components/dashboard/status-badge";
import { CopyButton } from "@/components/shared/copy-button";
import {
  getDispatcherAccountOptions,
  requireDashboardSession,
} from "@/lib/auth";
import {
  getDriverById,
  listLoadOpportunities,
  listLoads,
} from "@/lib/db";
import {
  buildDriverReviewEntries,
  canAccessDriver,
} from "@/lib/services";
import { driverStatuses } from "@/lib/types";

type UnitDetailPageProps = {
  params: Promise<{
    driverId: string;
  }>;
};

export const metadata: Metadata = {
  title: "Unit Profile | iDispatchLoads",
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

function getDispatcherLabel(
  email: string | null,
  dispatcherOptions: Array<{ email: string; label: string }>,
) {
  if (!email) {
    return "Unassigned";
  }

  return (
    dispatcherOptions.find((option) => option.email === email)?.label ?? email
  );
}

export default async function UnitDetailPage({ params }: UnitDetailPageProps) {
  const session = await requireDashboardSession();
  const { driverId } = await params;
  const driver = await getDriverById(driverId);

  if (!driver) {
    notFound();
  }

  if (!canAccessDriver(driver, session)) {
    notFound();
  }

  const dispatcherOptions = getDispatcherAccountOptions();
  const [loads, opportunities] = await Promise.all([
    listLoads(),
    listLoadOpportunities(),
  ]);

  const driverMetrics = buildDriverReviewEntries([driver], loads).find(
    (entry) => entry.driver.id === driver.id,
  )?.metrics;

  const assignedOpportunities = opportunities.filter(
    (opportunity) => opportunity.assignedDriverId === driver.id,
  );
  const activeLoads = loads.filter(
    (load) =>
      load.driverId === driver.id &&
      load.status !== "delivered" &&
      load.status !== "closed",
  );

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Link
            href="/dashboard/movement"
            className="text-sm font-semibold text-[var(--color-primary)] transition hover:text-[var(--color-primary-strong)]"
          >
            Back to Movement
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
            Unit Profile
          </p>
          <h1 className="font-heading text-3xl font-semibold text-slate-950 sm:text-4xl">
            {driver.driverName}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-slate-600">
            {driver.company} • {driver.truckType} • {getDispatcherLabel(
              driver.assignedDispatcherEmail,
              dispatcherOptions,
            )}
          </p>
        </div>
        <DriverStatusBadge status={driver.status} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr,0.8fr]">
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]">
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-semibold text-slate-950">
              Unit Snapshot
            </h2>
            <p className="text-sm text-slate-600">
              Everything a dispatcher needs to understand this truck and trailer setup.
            </p>
          </div>

          <dl className="mt-5 grid gap-4 text-sm text-slate-700 md:grid-cols-2">
            <div>
              <dt className="font-semibold text-slate-500">Phone</dt>
              <dd className="mt-2 flex flex-wrap items-center gap-2">
                <span>{driver.phone}</span>
                <CopyButton value={driver.phone} label="Copy phone" />
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Home base</dt>
              <dd className="mt-1">{driver.homeBase}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Current location</dt>
              <dd className="mt-1">{driver.currentLocation ?? "TBD"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Available from</dt>
              <dd className="mt-1">{formatDateTime(driver.availableFrom)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Truck number</dt>
              <dd className="mt-1">{driver.truckUnitNumber ?? "TBD"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Trailer number</dt>
              <dd className="mt-1">{driver.trailerUnitNumber ?? "TBD"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Truck VIN</dt>
              <dd className="mt-2 flex flex-wrap items-center gap-2">
                <span>{driver.truckVin ?? "TBD"}</span>
                {driver.truckVin ? (
                  <CopyButton value={driver.truckVin} label="Copy truck VIN" />
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Trailer VIN</dt>
              <dd className="mt-2 flex flex-wrap items-center gap-2">
                <span>{driver.trailerVin ?? "TBD"}</span>
                {driver.trailerVin ? (
                  <CopyButton value={driver.trailerVin} label="Copy trailer VIN" />
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Capacity</dt>
              <dd className="mt-1">
                {driver.capacity ? `${driver.capacity} cars` : "TBD"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Preferred lanes</dt>
              <dd className="mt-1">{driver.preferredLanes ?? "TBD"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Assigned loads</dt>
              <dd className="mt-1">{driverMetrics?.assignedLoadsCount ?? 0}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Last load date</dt>
              <dd className="mt-1">{formatDateTime(driverMetrics?.lastLoadDate ?? null)}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]">
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-semibold text-slate-950">
              Workload
            </h2>
            <p className="text-sm text-slate-600">
              Current work attached to this unit.
            </p>
          </div>
          <div className="mt-5 space-y-4 text-sm text-slate-700">
            <div>
              <p className="font-semibold text-slate-950">Active loads</p>
              <p className="mt-1">
                {activeLoads.length
                  ? activeLoads.map((load) => `${load.origin} -> ${load.destination}`).join(", ")
                  : "No active loads"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-950">Assigned opportunities</p>
              <p className="mt-1">
                {assignedOpportunities.length
                  ? assignedOpportunities
                      .map(
                        (opportunity) =>
                          `${opportunity.origin} -> ${opportunity.destination}`,
                      )
                      .join(", ")
                  : "No assigned opportunities"}
              </p>
            </div>
          </div>
        </section>
      </div>

      <form
        action={saveDriverProfileAction}
        className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]"
      >
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-semibold text-slate-950">
            Edit Complete Unit Profile
          </h2>
          <p className="text-sm text-slate-600">
            Keep all truck, trailer, dispatcher, and movement details in one place.
          </p>
        </div>

        <input type="hidden" name="driverId" value={driver.id} />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            name="company"
            defaultValue={driver.company}
            placeholder="Company"
            required
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="driverName"
            defaultValue={driver.driverName}
            placeholder="Driver / unit name"
            required
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="phone"
            defaultValue={driver.phone}
            placeholder="Phone"
            required
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="truckType"
            defaultValue={driver.truckType}
            placeholder="Equipment type"
            required
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="homeBase"
            defaultValue={driver.homeBase}
            placeholder="Home base"
            required
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="preferredLanes"
            defaultValue={driver.preferredLanes ?? ""}
            placeholder="Preferred lanes"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="currentLocation"
            defaultValue={driver.currentLocation ?? ""}
            placeholder="Current location"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Available from
            <input
              name="availableFrom"
              type="datetime-local"
              defaultValue={formatDateTimeInput(driver.availableFrom)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
            />
          </label>
          <input
            name="truckUnitNumber"
            defaultValue={driver.truckUnitNumber ?? ""}
            placeholder="Truck number"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="trailerUnitNumber"
            defaultValue={driver.trailerUnitNumber ?? ""}
            placeholder="Trailer number"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="truckVin"
            defaultValue={driver.truckVin ?? ""}
            placeholder="Truck VIN"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm uppercase outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="trailerVin"
            defaultValue={driver.trailerVin ?? ""}
            placeholder="Trailer VIN"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm uppercase outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="capacity"
            type="number"
            min="1"
            step="1"
            defaultValue={driver.capacity ?? ""}
            placeholder="Capacity"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <select
            name="status"
            defaultValue={driver.status}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          >
            {driverStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          {session.role === "admin" ? (
            <select
              name="assignedDispatcherEmail"
              defaultValue={driver.assignedDispatcherEmail ?? ""}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white md:col-span-2"
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
              value={driver.assignedDispatcherEmail ?? ""}
            />
          )}
        </div>

        <textarea
          name="notes"
          rows={5}
          defaultValue={driver.notes ?? ""}
          placeholder="Unit notes"
          className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />

        <button
          type="submit"
          className="mt-4 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-strong)]"
        >
          Save Unit Profile
        </button>
      </form>
    </section>
  );
}
