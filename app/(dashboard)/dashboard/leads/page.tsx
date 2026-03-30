import type { Metadata } from "next";

import { LeadsReview } from "@/components/dashboard/leads-review";
import { getDispatcherAccountOptions, requireOwnerSession } from "@/lib/auth";
import { listLeads } from "@/lib/db";
import {
  buildLeadReviewEntries,
  filterLeadReviewEntries,
  LEAD_STALE_THRESHOLD_HOURS,
  parseLeadReviewFilters,
} from "@/lib/services";

type DashboardLeadsPageProps = {
  searchParams?: Promise<{
    status?: string;
    query?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Internal Leads | iDispatchLoads",
};

export const dynamic = "force-dynamic";

function formatLastCaptured(createdAt?: string) {
  if (!createdAt) {
    return "No leads captured yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(createdAt));
}

export default async function DashboardLeadsPage({
  searchParams,
}: DashboardLeadsPageProps) {
  await requireOwnerSession();
  let leads = [];
  const dispatcherOptions = getDispatcherAccountOptions();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const filters = parseLeadReviewFilters(resolvedSearchParams ?? {});

  try {
    leads = await listLeads();
  } catch (error) {
    console.error("[dashboard-leads] Failed to load leads", error);

    return (
      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
            Version 1 Internal View
          </p>
          <h1 className="font-heading text-3xl font-semibold text-slate-950 sm:text-4xl">
            Lead review is temporarily unavailable.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            The internal leads page could not read from Supabase right now.
            Check the server logs for the latest repository error and confirm
            the production environment variables are still valid.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 px-6 py-5 text-sm leading-6 text-rose-700">
          Lead data could not be loaded. This page is intentionally lightweight,
          so it depends directly on the same repository layer the future CRM
          will use.
        </div>
      </section>
    );
  }

  const leadEntries = buildLeadReviewEntries(leads);
  const filteredLeadEntries = filterLeadReviewEntries(leadEntries, filters);
  const newLeadsCount = leadEntries.filter((entry) => entry.flags.isNew).length;
  const uncontactedLeadsCount = leadEntries.filter(
    (entry) => entry.flags.needsContact,
  ).length;
  const staleLeadsCount = leadEntries.filter(
    (entry) => entry.flags.isStale,
  ).length;

  const summaryItems = [
    {
      label: "Total Leads",
      value: leads.length,
      helper: `Last capture ${formatLastCaptured(leads[0]?.createdAt)}`,
    },
    {
      label: "New",
      value: newLeadsCount,
      helper: "Fresh submissions to review first",
    },
    {
      label: "No Contact Yet",
      value: uncontactedLeadsCount,
      helper: "Leads still missing a first follow-up",
    },
    {
      label: "Stale",
      value: staleLeadsCount,
      helper: `Open leads untouched for ${LEAD_STALE_THRESHOLD_HOURS}+ hours`,
    },
  ];

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
          Version 1 Internal View
        </p>
        <div className="max-w-3xl space-y-3">
          <h1 className="font-heading text-3xl font-semibold text-slate-950 sm:text-4xl">
            Review incoming owner-operator leads without jumping into CRM work
            too early.
          </h1>
          <p className="text-base leading-7 text-slate-600">
            This page stays intentionally lightweight for V1. It gives the team
            a clean way to review fresh submissions from the marketing site
            while keeping the route, data layer, and lead model aligned with the
            future dispatch CRM.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => (
          <article
            key={item.label}
            className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.25)]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              {item.label}
            </p>
            <p className="mt-3 font-heading text-4xl font-semibold text-slate-950">
              {item.value}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {item.helper}
            </p>
          </article>
        ))}
      </div>

      <LeadsReview
        leadEntries={filteredLeadEntries}
        totalCount={leadEntries.length}
        filters={filters}
        dispatcherOptions={dispatcherOptions}
      />
    </section>
  );
}
