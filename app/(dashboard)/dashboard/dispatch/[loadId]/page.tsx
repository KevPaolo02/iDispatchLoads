import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { MissingChecklist } from "@/components/dashboard/missing-checklist";
import { ProblemFlagsPanel } from "@/components/dashboard/problem-flags-panel";
import { LoadStatusBadge } from "@/components/dashboard/status-badge";
import { CopyButton } from "@/components/shared/copy-button";
import {
  assignLoadAction,
  createLoadProblemFlagAction,
  createLoadVehicleAction,
  deleteLoadVehicleAction,
  resolveLoadProblemFlagAction,
  saveLoadDetailsAction,
  saveLoadNotesAction,
  updateLoadStatusAction,
  updateLoadVehicleAction,
} from "@/app/(dashboard)/dashboard/dispatch/actions/dispatch-actions";
import {
  getLoadById,
  listActivityEventsByEntity,
  listDrivers,
  listLoadVehiclesByLoadId,
  listProblemFlagsByEntity,
} from "@/lib/db";
import { requireDashboardSession } from "@/lib/auth";
import { loadVehicleOperabilityStatuses, dispatchLoadStatuses } from "@/lib/types";
import {
  canAccessLoad,
  filterDriversForAccess,
  getLoadMarginSnapshot,
  getLoadMissingChecklist,
} from "@/lib/services";
import {
  buildDriverRouteMessage,
  buildGoogleMapsRouteUrl,
} from "@/lib/utils/route-share";

type LoadDetailPageProps = {
  params: Promise<{
    loadId: string;
  }>;
};

export const metadata: Metadata = {
  title: "Load Detail | iDispatchLoads",
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

export default async function LoadDetailPage({ params }: LoadDetailPageProps) {
  const session = await requireDashboardSession();
  const { loadId } = await params;
  const load = await getLoadById(loadId);

  if (!load) {
    notFound();
  }

  const [drivers, vehicles, events, flags] = await Promise.all([
    listDrivers(),
    listLoadVehiclesByLoadId(load.id),
    listActivityEventsByEntity("load", load.id),
    listProblemFlagsByEntity("load", load.id),
  ]);

  const scopedDrivers = filterDriversForAccess(drivers, session);
  const visibleDriverIds = new Set(scopedDrivers.map((driver) => driver.id));

  if (!canAccessLoad(load, visibleDriverIds, session)) {
    notFound();
  }

  const missingChecklist = getLoadMissingChecklist(load);
  const margin = getLoadMarginSnapshot(load, vehicles.length);
  const googleMapsRouteUrl = buildGoogleMapsRouteUrl(load);
  const driverRouteMessage = buildDriverRouteMessage(load);

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Link
            href="/dashboard/dispatch"
            className="text-sm font-semibold text-[var(--color-primary)] transition hover:text-[var(--color-primary-strong)]"
          >
            Back to Dispatch
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
            Load Detail
          </p>
          <h1 className="font-heading text-3xl font-semibold text-slate-950 sm:text-4xl">
            {load.origin} {"->"} {load.destination}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-slate-600">
            {load.company} • Ref {load.referenceNumber ?? "TBD"} • {load.broker || load.carrierCompany || "No broker / carrier yet"}
          </p>
        </div>
        <LoadStatusBadge status={load.status} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]">
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-semibold text-slate-950">
              Quick Access
            </h2>
            <p className="text-sm text-slate-600">
              Pricing, contacts, and reference info without jumping between
              screens.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href={googleMapsRouteUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              Open in Google Maps
            </a>
            <CopyButton value={googleMapsRouteUrl} label="Copy Route Link" />
            <CopyButton
              value={driverRouteMessage}
              label="Copy Driver Message"
            />
          </div>
          <dl className="mt-5 grid gap-4 text-sm text-slate-700 md:grid-cols-2">
            <div>
              <dt className="font-semibold text-slate-500">Assigned unit</dt>
              <dd className="mt-1">
                {scopedDrivers.find((driver) => driver.id === load.driverId)?.driverName ?? "Unassigned"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Reference</dt>
              <dd className="mt-2 flex flex-wrap items-center gap-2">
                <span>{load.referenceNumber ?? "TBD"}</span>
                {load.referenceNumber ? (
                  <CopyButton value={load.referenceNumber} label="Copy ref" />
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Primary contact</dt>
              <dd className="mt-1">{load.contactName ?? "TBD"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Contact phone</dt>
              <dd className="mt-2 flex flex-wrap items-center gap-2">
                <span>{load.contactPhone ?? "TBD"}</span>
                {load.contactPhone ? (
                  <CopyButton value={load.contactPhone} label="Copy phone" />
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Pickup / delivery</dt>
              <dd className="mt-1">
                {formatDateTime(load.pickupDate)} • {formatDateTime(load.deliveryDate)}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Customer</dt>
              <dd className="mt-1">
                {load.customerName ?? "TBD"} • {load.customerPhone ?? "No phone"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Customer price</dt>
              <dd className="mt-1">{formatCurrency(load.customerPrice)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Carrier pay</dt>
              <dd className="mt-1">{formatCurrency(load.carrierPay)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Gross profit</dt>
              <dd className="mt-1">{formatCurrency(margin.grossProfit)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Profit / vehicle</dt>
              <dd className="mt-1">{formatCurrency(margin.profitPerVehicle)}</dd>
            </div>
          </dl>
        </section>

        <MissingChecklist title="Missing Info Checklist" items={missingChecklist} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]">
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-semibold text-slate-950">
              Execution Status
            </h2>
            <p className="text-sm text-slate-600">
              Keep status and assignment aligned with the real move.
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <form action={updateLoadStatusAction} className="space-y-2">
              <input type="hidden" name="loadId" value={load.id} />
              <select
                name="status"
                defaultValue={load.status}
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
                className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-strong)]"
              >
                Save Status
              </button>
            </form>

            <form action={assignLoadAction} className="space-y-2">
              <input type="hidden" name="loadId" value={load.id} />
              <select
                name="driverId"
                defaultValue={load.driverId ?? ""}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
              >
                <option value="">Unassigned unit</option>
                {scopedDrivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.driverName} • {driver.company}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                Save Assignment
              </button>
            </form>
          </div>
        </section>

        <form
          action={saveLoadNotesAction}
          className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]"
        >
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-semibold text-slate-950">
              Notes
            </h2>
            <p className="text-sm text-slate-600">
              Save context here instead of relying on memory.
            </p>
          </div>
          <input type="hidden" name="loadId" value={load.id} />
          <textarea
            name="notes"
            rows={10}
            defaultValue={load.notes ?? ""}
            placeholder="Internal notes"
            className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <button
            type="submit"
            className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            Save Notes
          </button>
        </form>
      </div>

      <form
        action={saveLoadDetailsAction}
        className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]"
      >
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-semibold text-slate-950">
            Operational Details
          </h2>
          <p className="text-sm text-slate-600">
            Pricing, assignment contacts, customer details, and schedule fields.
          </p>
        </div>

        <input type="hidden" name="loadId" value={load.id} />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            name="referenceNumber"
            defaultValue={load.referenceNumber ?? ""}
            placeholder="Reference number"
            required
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="truckTrailerType"
            defaultValue={load.truckTrailerType ?? ""}
            placeholder="Truck / trailer type"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="pickupCity"
            defaultValue={load.pickupCity ?? ""}
            placeholder="Pickup city"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="pickupState"
            defaultValue={load.pickupState ?? ""}
            placeholder="Pickup state"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="pickupZip"
            defaultValue={load.pickupZip ?? ""}
            placeholder="Pickup zip"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="deliveryCity"
            defaultValue={load.deliveryCity ?? ""}
            placeholder="Delivery city"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="deliveryState"
            defaultValue={load.deliveryState ?? ""}
            placeholder="Delivery state"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="deliveryZip"
            defaultValue={load.deliveryZip ?? ""}
            placeholder="Delivery zip"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Pickup date
            <input
              name="pickupDate"
              type="datetime-local"
              defaultValue={formatDateTimeInput(load.pickupDate)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Delivery date
            <input
              name="deliveryDate"
              type="datetime-local"
              defaultValue={formatDateTimeInput(load.deliveryDate)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
            />
          </label>
          <input
            name="customerName"
            defaultValue={load.customerName ?? ""}
            placeholder="Customer name"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="customerPhone"
            defaultValue={load.customerPhone ?? ""}
            placeholder="Customer phone"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="customerEmail"
            defaultValue={load.customerEmail ?? ""}
            placeholder="Customer email"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="contactName"
            defaultValue={load.contactName ?? ""}
            placeholder="Primary contact name"
            required
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="contactPhone"
            defaultValue={load.contactPhone ?? ""}
            placeholder="Primary contact phone"
            required
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="pickupContactName"
            defaultValue={load.pickupContactName ?? ""}
            placeholder="Pickup contact name"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="pickupContactPhone"
            defaultValue={load.pickupContactPhone ?? ""}
            placeholder="Pickup contact phone"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="deliveryContactName"
            defaultValue={load.deliveryContactName ?? ""}
            placeholder="Delivery contact name"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="deliveryContactPhone"
            defaultValue={load.deliveryContactPhone ?? ""}
            placeholder="Delivery contact phone"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="carrierCompany"
            defaultValue={load.carrierCompany ?? ""}
            placeholder="Carrier company"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="carrierMcNumber"
            defaultValue={load.carrierMcNumber ?? ""}
            placeholder="MC number"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="carrierDispatcherName"
            defaultValue={load.carrierDispatcherName ?? ""}
            placeholder="Carrier dispatcher name"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="carrierDispatcherPhone"
            defaultValue={load.carrierDispatcherPhone ?? ""}
            placeholder="Carrier dispatcher phone"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="carrierDriverName"
            defaultValue={load.carrierDriverName ?? ""}
            placeholder="Carrier driver name"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="carrierDriverPhone"
            defaultValue={load.carrierDriverPhone ?? ""}
            placeholder="Carrier driver phone"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="customerPrice"
            type="number"
            min="0"
            step="0.01"
            defaultValue={load.customerPrice ?? ""}
            placeholder="Customer price"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="carrierPay"
            type="number"
            min="0"
            step="0.01"
            defaultValue={load.carrierPay ?? ""}
            placeholder="Carrier pay"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="codAmount"
            type="number"
            min="0"
            step="0.01"
            defaultValue={load.codAmount ?? ""}
            placeholder="COD amount"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            <input
              name="depositCollected"
              type="checkbox"
              defaultChecked={load.depositCollected}
              className="h-4 w-4 rounded border-slate-300"
            />
            Deposit collected
          </label>
        </div>
        <button
          type="submit"
          className="mt-5 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-strong)]"
        >
          Save Operational Details
        </button>
      </form>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]">
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-semibold text-slate-950">
            Vehicle Manifest
          </h2>
          <p className="text-sm text-slate-600">
            VIN-level load detail for what this truck is moving.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {vehicles.map((vehicle) => (
            <form
              key={vehicle.id}
              action={updateLoadVehicleAction}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <input type="hidden" name="loadVehicleId" value={vehicle.id} />
              <div className="grid gap-3 md:grid-cols-[7rem,1fr,1fr,1fr]">
                <input
                  name="year"
                  type="number"
                  min="1900"
                  max="2100"
                  defaultValue={vehicle.year ?? ""}
                  placeholder="Year"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)]"
                />
                <input
                  name="make"
                  defaultValue={vehicle.make}
                  placeholder="Make"
                  required
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)]"
                />
                <input
                  name="model"
                  defaultValue={vehicle.model}
                  placeholder="Model"
                  required
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)]"
                />
                <select
                  name="operability"
                  defaultValue={vehicle.operability}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)]"
                >
                  {loadVehicleOperabilityStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status === "inop" ? "Inop" : "Operable"}
                    </option>
                  ))}
                </select>
                <input
                  name="vin"
                  defaultValue={vehicle.vin ?? ""}
                  placeholder="VIN"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm uppercase outline-none transition focus:border-[var(--color-primary)] md:col-span-2"
                />
                <input
                  name="lotNumber"
                  defaultValue={vehicle.lotNumber ?? ""}
                  placeholder="Lot number"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                >
                  Save Vehicle
                </button>
                <button
                  formAction={deleteLoadVehicleAction}
                  type="submit"
                  className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-white"
                >
                  Remove
                </button>
              </div>
            </form>
          ))}

          <form
            action={createLoadVehicleAction}
            className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4"
          >
            <input type="hidden" name="loadId" value={load.id} />
            <div className="grid gap-3 md:grid-cols-[7rem,1fr,1fr,1fr]">
              <input
                name="year"
                type="number"
                min="1900"
                max="2100"
                placeholder="Year"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)]"
              />
              <input
                name="make"
                placeholder="Make"
                required
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)]"
              />
              <input
                name="model"
                placeholder="Model"
                required
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)]"
              />
              <select
                name="operability"
                defaultValue="operable"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)]"
              >
                {loadVehicleOperabilityStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "inop" ? "Inop" : "Operable"}
                  </option>
                ))}
              </select>
              <input
                name="vin"
                placeholder="VIN"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm uppercase outline-none transition focus:border-[var(--color-primary)] md:col-span-2"
              />
              <input
                name="lotNumber"
                placeholder="Lot number"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)]"
              />
            </div>
            <button
              type="submit"
              className="mt-3 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-strong)]"
            >
              Add Vehicle
            </button>
          </form>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
        <ProblemFlagsPanel
          entityType="load"
          entityId={load.id}
          flags={flags}
          createAction={createLoadProblemFlagAction}
          resolveAction={resolveLoadProblemFlagAction}
        />
        <ActivityTimeline events={events} />
      </div>
    </section>
  );
}
