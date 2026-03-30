import Link from "next/link";

import { convertLeadToDriverAction } from "@/app/(dashboard)/dashboard/leads/actions/convert-lead-to-driver";
import { saveLeadNotesAction } from "@/app/(dashboard)/dashboard/leads/actions/save-lead-notes";
import { updateLeadStatusAction } from "@/app/(dashboard)/dashboard/leads/actions/update-lead-status";
import type { Lead, V1LeadStatus } from "@/lib/types";
import { leadStatuses, v1LeadStatuses } from "@/lib/types";
import type {
  LeadFollowUpFlags,
  LeadReviewEntry,
  LeadReviewFilters,
} from "@/lib/services";
import { LEAD_STALE_THRESHOLD_HOURS } from "@/lib/services";

type LeadsReviewProps = {
  leadEntries: LeadReviewEntry[];
  totalCount: number;
  filters: LeadReviewFilters;
  dispatcherOptions: Array<{
    email: string;
    label: string;
  }>;
};

function getSelectableStatuses(status: Lead["status"]) {
  if (status === "onboarded") {
    return ["onboarded", ...v1LeadStatuses] as const;
  }

  return v1LeadStatuses;
}

function formatLeadDate(value: string | null) {
  if (!value) {
    return "Not contacted yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusClasses(status: Lead["status"]) {
  switch (status) {
    case "new":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "contacted":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "qualified":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "onboarded":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "lost":
      return "border-slate-200 bg-slate-100 text-slate-600";
    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function LeadStatusBadge({ status }: Pick<Lead, "status">) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getStatusClasses(
        status,
      )}`}
    >
      {status}
    </span>
  );
}

function getStatusLabel(status: Lead["status"] | V1LeadStatus) {
  return status.replaceAll("_", " ");
}

function LeadStatusUpdateForm({ lead }: { lead: Lead }) {
  const selectableStatuses = getSelectableStatuses(lead.status);

  return (
    <form action={updateLeadStatusAction} className="space-y-2">
      <input type="hidden" name="leadId" value={lead.id} />

      <label
        htmlFor={`lead-status-${lead.id}`}
        className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
      >
        Update status
      </label>

      <div className="flex items-center gap-2">
        <select
          id={`lead-status-${lead.id}`}
          name="status"
          defaultValue={lead.status}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        >
          {selectableStatuses.map((status) => (
            <option key={status} value={status}>
              {getStatusLabel(status)}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded-xl bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-strong)]"
        >
          Save
        </button>
      </div>
    </form>
  );
}

function LeadNotesForm({ lead }: { lead: Lead }) {
  return (
    <form action={saveLeadNotesAction} className="space-y-2">
      <input type="hidden" name="leadId" value={lead.id} />

      <label
        htmlFor={`lead-notes-${lead.id}`}
        className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
      >
        Notes
      </label>

      <textarea
        id={`lead-notes-${lead.id}`}
        name="notes"
        rows={3}
        defaultValue={lead.notes ?? ""}
        placeholder="Quick notes"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:bg-white"
      />

      <div className="flex items-center justify-between gap-3">
        <button
          type="submit"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          Save Notes
        </button>

        <Link
          href={`/dashboard/dispatch?leadId=${lead.id}`}
          className="inline-flex text-sm font-semibold text-[var(--color-primary)] transition hover:text-[var(--color-primary-strong)]"
        >
          Create load from lead
        </Link>
      </div>
    </form>
  );
}

function getFollowUpFlagClasses(flag: "new" | "contact" | "stale") {
  switch (flag) {
    case "new":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "contact":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "stale":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function getLeadSurfaceClasses(flags: LeadFollowUpFlags) {
  if (flags.isStale) {
    return "border-rose-200 bg-rose-50/40";
  }

  if (flags.isNew || flags.needsContact) {
    return "border-amber-200 bg-amber-50/30";
  }

  return "border-slate-200 bg-white";
}

function getLeadRowClasses(flags: LeadFollowUpFlags) {
  if (flags.isStale) {
    return "bg-rose-50/40";
  }

  if (flags.isNew || flags.needsContact) {
    return "bg-amber-50/30";
  }

  return "";
}

function FollowUpFlags({ flags }: { flags: LeadFollowUpFlags }) {
  const items: Array<{
    key: "new" | "contact" | "stale";
    label: string;
  }> = [];

  if (flags.isNew) {
    items.push({ key: "new", label: "New" });
  }

  if (flags.needsContact) {
    items.push({ key: "contact", label: "No contact yet" });
  }

  if (flags.isStale) {
    items.push({ key: "stale", label: "Stale" });
  }

  if (!items.length) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item.key}
          className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${getFollowUpFlagClasses(
            item.key,
          )}`}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}

function LeadToDriverForm({
  lead,
  dispatcherOptions,
}: {
  lead: Lead;
  dispatcherOptions: Array<{
    email: string;
    label: string;
  }>;
}) {
  return (
    <form action={convertLeadToDriverAction} className="space-y-2">
      <input type="hidden" name="leadId" value={lead.id} />

      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        Convert to Driver
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        <input
          name="company"
          placeholder="Company"
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:bg-white"
        />
        <input
          name="homeBase"
          placeholder="Home base"
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:bg-white"
        />
      </div>

      <select
        name="assignedDispatcherEmail"
        defaultValue={dispatcherOptions[0]?.email ?? ""}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
      >
        <option value="">Select dispatcher</option>
        {dispatcherOptions.map((option) => (
          <option key={option.email} value={option.email}>
            {option.label}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      >
        Onboard Driver
      </button>
    </form>
  );
}

function LeadFiltersForm({ filters }: { filters: LeadReviewFilters }) {
  return (
    <form
      action="/dashboard/leads"
      method="get"
      className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.18)]"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr),14rem,auto,auto]">
        <input
          type="search"
          name="query"
          defaultValue={filters.query}
          placeholder="Search by name, phone, or email"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:bg-white"
        />
        <select
          name="status"
          defaultValue={filters.status}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        >
          <option value="all">All statuses</option>
          {leadStatuses.map((status) => (
            <option key={status} value={status}>
              {getStatusLabel(status)}
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
          href="/dashboard/leads"
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          Clear
        </Link>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        New and uncontacted leads are highlighted first. Stale means an active
        lead has not been updated in {LEAD_STALE_THRESHOLD_HOURS} hours.
      </p>
    </form>
  );
}

export function LeadsReview({
  leadEntries,
  totalCount,
  filters,
  dispatcherOptions,
}: LeadsReviewProps) {
  const hasActiveFilters = filters.status !== "all" || filters.query.length > 0;

  if (!totalCount) {
    return (
      <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-8 py-14 text-center shadow-[0_18px_60px_-35px_rgba(15,23,42,0.2)]">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          No leads yet
        </h2>
        <p className="mt-3 text-base leading-7 text-slate-600">
          When someone submits the dispatch form, the lead will appear here with
          contact details, equipment, lane preference, and source metadata.
        </p>
      </section>
    );
  }

  if (!leadEntries.length) {
    return (
      <section className="space-y-4">
        <LeadFiltersForm filters={filters} />

        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-8 py-14 text-center shadow-[0_18px_60px_-35px_rgba(15,23,42,0.2)]">
          <h2 className="font-heading text-2xl font-semibold text-slate-950">
            No leads match the current filter
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            Try a different status or clear the search to get back to the full
            review queue.
          </p>
          {hasActiveFilters ? (
            <Link
              href="/dashboard/leads"
              className="mt-5 inline-flex rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              Clear filters
            </Link>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          Incoming Leads
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Most recent submissions appear first. This keeps V1 useful for daily
          lead review while preserving the same data foundation that V2 will use
          for lead pipeline and onboarding work.
        </p>
      </div>

      <LeadFiltersForm filters={filters} />

      <p className="text-sm leading-6 text-slate-600">
        Showing {leadEntries.length} of {totalCount} leads.
      </p>

      <div className="grid gap-4 md:hidden">
        {leadEntries.map(({ lead, flags }) => (
          <article
            key={lead.id}
            className={`rounded-[1.75rem] border p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.22)] ${getLeadSurfaceClasses(
              flags,
            )}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-heading text-xl font-semibold text-slate-950">
                  {lead.firstName} {lead.lastName}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Added {formatLeadDate(lead.createdAt)}
                </p>
                <FollowUpFlags flags={flags} />
              </div>

              <LeadStatusBadge status={lead.status} />
            </div>

            <dl className="mt-5 grid gap-4 text-sm text-slate-700">
              <div>
                <dt className="font-semibold text-slate-500">Phone</dt>
                <dd className="mt-1">
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-[var(--color-primary)] transition hover:text-[var(--color-primary-strong)]"
                  >
                    {lead.phone}
                  </a>
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-slate-500">Email</dt>
                <dd className="mt-1 break-all">
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-[var(--color-primary)] transition hover:text-[var(--color-primary-strong)]"
                  >
                    {lead.email}
                  </a>
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-slate-500">Truck Type</dt>
                <dd className="mt-1">{lead.truckType}</dd>
              </div>

              <div>
                <dt className="font-semibold text-slate-500">Preferred Lanes</dt>
                <dd className="mt-1">{lead.preferredLanes}</dd>
              </div>

              <div>
                <dt className="font-semibold text-slate-500">Source</dt>
                <dd className="mt-1 uppercase tracking-[0.12em] text-slate-600">
                  {lead.source}
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-slate-500">Last Contacted</dt>
                <dd
                  className={`mt-1 ${
                    flags.needsContact ? "font-semibold text-amber-700" : "text-slate-700"
                  }`}
                >
                  {formatLeadDate(lead.lastContactedAt)}
                </dd>
              </div>
            </dl>

            <div className="mt-5 border-t border-slate-200 pt-4">
              <LeadStatusUpdateForm lead={lead} />
              <div className="mt-4 border-t border-slate-200 pt-4">
                <LeadNotesForm lead={lead} />
              </div>
              <div className="mt-4 border-t border-slate-200 pt-4">
                <LeadToDriverForm
                  lead={lead}
                  dispatcherOptions={dispatcherOptions}
                />
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_60px_-35px_rgba(15,23,42,0.22)] md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Phone</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Truck Type</th>
                <th className="px-6 py-4 font-semibold">Preferred Lanes</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Source</th>
                <th className="px-6 py-4 font-semibold">Created</th>
                <th className="px-6 py-4 font-semibold">Last Contacted</th>
                <th className="px-6 py-4 font-semibold">Update</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {leadEntries.map(({ lead, flags }) => (
                <tr
                  key={lead.id}
                  className={`align-top ${getLeadRowClasses(flags)}`}
                >
                  <td className="px-6 py-5">
                    <div>
                      <p className="font-semibold text-slate-950">
                        {lead.firstName} {lead.lastName}
                      </p>
                      <FollowUpFlags flags={flags} />
                    </div>
                  </td>

                  <td className="px-6 py-5 text-slate-700">
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-[var(--color-primary)] transition hover:text-[var(--color-primary-strong)]"
                    >
                      {lead.phone}
                    </a>
                  </td>

                  <td className="px-6 py-5 text-slate-700">
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-[var(--color-primary)] transition hover:text-[var(--color-primary-strong)]"
                    >
                      {lead.email}
                    </a>
                  </td>

                  <td className="px-6 py-5 text-slate-700">{lead.truckType}</td>
                  <td className="px-6 py-5 text-slate-700">
                    {lead.preferredLanes}
                  </td>
                  <td className="px-6 py-5">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td className="px-6 py-5 uppercase tracking-[0.12em] text-slate-600">
                    {lead.source}
                  </td>
                  <td className="px-6 py-5 text-slate-700">
                    {formatLeadDate(lead.createdAt)}
                  </td>
                  <td
                    className={`px-6 py-5 ${
                      flags.needsContact ? "font-semibold text-amber-700" : "text-slate-700"
                    }`}
                  >
                    {formatLeadDate(lead.lastContactedAt)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-4">
                      <LeadStatusUpdateForm lead={lead} />
                      <div className="border-t border-slate-200 pt-4">
                        <LeadNotesForm lead={lead} />
                      </div>
                      <div className="border-t border-slate-200 pt-4">
                        <LeadToDriverForm
                          lead={lead}
                          dispatcherOptions={dispatcherOptions}
                        />
                      </div>
                    </div>
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
