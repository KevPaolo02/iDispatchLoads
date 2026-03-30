import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { MissingChecklist } from "@/components/dashboard/missing-checklist";
import { ProblemFlagsPanel } from "@/components/dashboard/problem-flags-panel";
import { OpportunityStatusBadge } from "@/components/dashboard/status-badge";
import { CopyButton } from "@/components/shared/copy-button";
import {
  assignLoadOpportunityAction,
  createLoadOpportunityVehicleAction,
  createOpportunityProblemFlagAction,
  deleteLoadOpportunityVehicleAction,
  resolveOpportunityProblemFlagAction,
  saveLoadOpportunityDetailsAction,
  saveLoadOpportunityNotesAction,
  updateLoadOpportunityStatusAction,
  updateLoadOpportunityVehicleAction,
} from "@/app/(dashboard)/dashboard/movement/actions/movement-actions";
import {
  getLoadOpportunityById,
  listActivityEventsByEntity,
  listDrivers,
  listLoadOpportunityVehiclesByOpportunityId,
  listProblemFlagsByEntity,
} from "@/lib/db";
import { requireDashboardSession } from "@/lib/auth";
import { loadVehicleOperabilityStatuses } from "@/lib/types";
import {
  canAccessOpportunity,
  filterDriversForAccess,
  getOpportunityMissingChecklist,
} from "@/lib/services";

type OpportunityDetailPageProps = {
  params: Promise<{
    opportunityId: string;
  }>;
};

export const metadata: Metadata = {
  title: "Opportunity Detail | iDispatchLoads",
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

export default async function OpportunityDetailPage({
  params,
}: OpportunityDetailPageProps) {
  const session = await requireDashboardSession();
  const { opportunityId } = await params;
  const opportunity = await getLoadOpportunityById(opportunityId);

  if (!opportunity) {
    notFound();
  }

  const [drivers, vehicles, events, flags] = await Promise.all([
    listDrivers(),
    listLoadOpportunityVehiclesByOpportunityId(opportunity.id),
    listActivityEventsByEntity("load_opportunity", opportunity.id),
    listProblemFlagsByEntity("load_opportunity", opportunity.id),
  ]);

  const scopedDrivers = filterDriversForAccess(drivers, session);
  const visibleDriverIds = new Set(scopedDrivers.map((driver) => driver.id));

  if (!canAccessOpportunity(opportunity, visibleDriverIds, session)) {
    notFound();
  }

  const missingChecklist = getOpportunityMissingChecklist(opportunity, vehicles);

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
            Opportunity Detail
          </p>
          <h1 className="font-heading text-3xl font-semibold text-slate-950 sm:text-4xl">
            {opportunity.origin} {"->"} {opportunity.destination}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-slate-600">
            {opportunity.source} • {opportunity.company ?? "No customer captured yet"} •{" "}
            {opportunity.vehiclesCount} vehicle{opportunity.vehiclesCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OpportunityStatusBadge status={opportunity.status} />
          <Link
            href={`/dashboard/dispatch?opportunityId=${opportunity.id}${opportunity.assignedDriverId ? `&driverId=${opportunity.assignedDriverId}` : ""}`}
            className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-strong)]"
          >
            Create Load
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]">
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-semibold text-slate-950">
              Quick Access
            </h2>
            <p className="text-sm text-slate-600">
              Contact, references, windows, and pricing in one place.
            </p>
          </div>
          <dl className="mt-5 grid gap-4 text-sm text-slate-700 md:grid-cols-2">
            <div>
              <dt className="font-semibold text-slate-500">Customer</dt>
              <dd className="mt-1">{opportunity.customerName ?? "TBD"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Contact</dt>
              <dd className="mt-1">{opportunity.contactName ?? "TBD"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Contact phone</dt>
              <dd className="mt-2 flex flex-wrap items-center gap-2">
                <span>{opportunity.contactPhone ?? "TBD"}</span>
                {opportunity.contactPhone ? (
                  <CopyButton value={opportunity.contactPhone} label="Copy phone" />
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Reference</dt>
              <dd className="mt-2 flex flex-wrap items-center gap-2">
                <span>{opportunity.sourceReference ?? "TBD"}</span>
                {opportunity.sourceReference ? (
                  <CopyButton value={opportunity.sourceReference} label="Copy ref" />
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Pickup window</dt>
              <dd className="mt-1">{formatDateTime(opportunity.pickupWindow)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Delivery window</dt>
              <dd className="mt-1">{formatDateTime(opportunity.deliveryWindow)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Customer price</dt>
              <dd className="mt-1">{formatCurrency(opportunity.customerPrice)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Carrier pay</dt>
              <dd className="mt-1">{formatCurrency(opportunity.carrierPay)}</dd>
            </div>
          </dl>
        </section>

        <MissingChecklist
          title="Missing Info Checklist"
          items={missingChecklist}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]">
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-semibold text-slate-950">
              Operational Status
            </h2>
            <p className="text-sm text-slate-600">
              Move the opportunity forward only when its checklist is complete.
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <form action={updateLoadOpportunityStatusAction} className="space-y-2">
              <input type="hidden" name="opportunityId" value={opportunity.id} />
              <select
                name="status"
                defaultValue={opportunity.status}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
              >
                {[
                  "new",
                  "needs_review",
                  "needs_quote",
                  "awaiting_customer",
                  "ready_to_post",
                  "closed_won",
                  "closed_lost",
                  "on_hold",
                ].map((status) => (
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

            <form action={assignLoadOpportunityAction} className="space-y-2">
              <input type="hidden" name="opportunityId" value={opportunity.id} />
              <select
                name="driverId"
                defaultValue={opportunity.assignedDriverId ?? ""}
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
          action={saveLoadOpportunityNotesAction}
          className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]"
        >
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-semibold text-slate-950">
              Notes
            </h2>
            <p className="text-sm text-slate-600">
              Keep context here instead of in text threads.
            </p>
          </div>
          <input type="hidden" name="opportunityId" value={opportunity.id} />
          <textarea
            name="notes"
            rows={10}
            defaultValue={opportunity.notes ?? ""}
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
        action={saveLoadOpportunityDetailsAction}
        className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]"
      >
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-semibold text-slate-950">
            Operational Details
          </h2>
          <p className="text-sm text-slate-600">
            Fill the fields that unlock Ready to Post and a clean handoff into
            a booked load.
          </p>
        </div>

        <input type="hidden" name="opportunityId" value={opportunity.id} />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            name="sourceReference"
            defaultValue={opportunity.sourceReference ?? ""}
            placeholder="Reference number"
            required
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="trailerType"
            defaultValue={opportunity.trailerType ?? ""}
            placeholder="Trailer type"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="pickupCity"
            defaultValue={opportunity.pickupCity ?? ""}
            placeholder="Pickup city"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="pickupState"
            defaultValue={opportunity.pickupState ?? ""}
            placeholder="Pickup state"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="pickupZip"
            defaultValue={opportunity.pickupZip ?? ""}
            placeholder="Pickup zip"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="deliveryCity"
            defaultValue={opportunity.deliveryCity ?? ""}
            placeholder="Delivery city"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="deliveryState"
            defaultValue={opportunity.deliveryState ?? ""}
            placeholder="Delivery state"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="deliveryZip"
            defaultValue={opportunity.deliveryZip ?? ""}
            placeholder="Delivery zip"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            First available
            <input
              name="firstAvailableDate"
              type="datetime-local"
              defaultValue={formatDateTimeInput(opportunity.firstAvailableDate)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Pickup window
            <input
              name="pickupWindow"
              type="datetime-local"
              defaultValue={formatDateTimeInput(opportunity.pickupWindow)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Delivery window
            <input
              name="deliveryWindow"
              type="datetime-local"
              defaultValue={formatDateTimeInput(opportunity.deliveryWindow)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
            />
          </label>
          <input
            name="customerName"
            defaultValue={opportunity.customerName ?? ""}
            placeholder="Customer name"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="customerPhone"
            defaultValue={opportunity.customerPhone ?? ""}
            placeholder="Customer phone"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="customerEmail"
            defaultValue={opportunity.customerEmail ?? ""}
            placeholder="Customer email"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="contactName"
            defaultValue={opportunity.contactName ?? ""}
            placeholder="Primary contact name"
            required
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="contactPhone"
            defaultValue={opportunity.contactPhone ?? ""}
            placeholder="Primary contact phone"
            required
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="customerPrice"
            type="number"
            min="0"
            step="0.01"
            defaultValue={opportunity.customerPrice ?? ""}
            placeholder="Customer price"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
          <input
            name="carrierPay"
            type="number"
            min="0"
            step="0.01"
            defaultValue={opportunity.carrierPay ?? ""}
            placeholder="Carrier pay"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
          />
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
            These vehicle details carry forward when the opportunity becomes a
            load.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {vehicles.map((vehicle) => (
            <form
              key={vehicle.id}
              action={updateLoadOpportunityVehicleAction}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <input
                type="hidden"
                name="opportunityVehicleId"
                value={vehicle.id}
              />
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
                  formAction={deleteLoadOpportunityVehicleAction}
                  type="submit"
                  className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-white"
                >
                  Remove
                </button>
              </div>
            </form>
          ))}

          <form
            action={createLoadOpportunityVehicleAction}
            className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4"
          >
            <input type="hidden" name="opportunityId" value={opportunity.id} />
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
          entityType="load_opportunity"
          entityId={opportunity.id}
          flags={flags}
          createAction={createOpportunityProblemFlagAction}
          resolveAction={resolveOpportunityProblemFlagAction}
        />
        <ActivityTimeline events={events} />
      </div>
    </section>
  );
}
