import Link from "next/link";
import type { Metadata } from "next";

import { PagePlaybook } from "@/components/dashboard/page-playbook";
import { requireDashboardSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dispatcher Training | iDispatchLoads",
};

export const dynamic = "force-dynamic";

type ChecklistSectionProps = {
  title: string;
  description: string;
  items: string[];
};

function ChecklistSection({
  title,
  description,
  items,
}: ChecklistSectionProps) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]">
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          {title}
        </h2>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700">
              ✓
            </span>
            <p className="text-sm leading-6 text-slate-700">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RuleCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </article>
  );
}

export default async function DashboardTrainingPage() {
  const session = await requireDashboardSession();

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
          Dispatcher Training
        </p>
        <h1 className="font-heading text-3xl font-semibold text-slate-950 sm:text-4xl">
          New-hire checklist for daily dispatch work
        </h1>
        <p className="max-w-3xl text-base leading-7 text-slate-600">
          This page explains how to use iDispatchLoads day to day so a new
          dispatcher can work Daniel Gruas LLC units with less supervision and
          less Kevin-only context.
        </p>
      </div>

      <PagePlaybook
        eyebrow={session.role === "admin" ? "Owner View" : "Dispatcher View"}
        title="The simple operating flow"
        description="Keep this sequence in mind at all times. The system works best when everyone follows the same handoff pattern."
        steps={[
          {
            title: "Dashboard first",
            description:
              "Start with queues, reload risk, and anything urgent before looking for fresh work.",
          },
          {
            title: "Movement for possible work",
            description:
              "Board posts from Central Dispatch, Super Dispatch, ACV, and other boards belong in Fleet Movement as opportunities.",
          },
          {
            title: "Dispatch for real work",
            description:
              "Only confirmed moves become loads. Once booked, manage them from Dispatch until they are delivered and closed.",
          },
        ]}
        actions={[
          { label: "Open Dashboard", href: "/dashboard" },
          { label: "Open Fleet Movement", href: "/dashboard/movement" },
          { label: "Open Dispatch Board", href: "/dashboard/dispatch" },
        ]}
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <RuleCard
          title="Opportunity vs load"
          body="If the job is still being evaluated, it is an opportunity on Fleet Movement. If the job is actually confirmed, it becomes a load on Dispatch."
        />
        <RuleCard
          title="Keep the board truthful"
          body="If a status, note, contact, or assignment changes in real life, update the app right away. The board should always reflect reality."
        />
        <RuleCard
          title="Routes are still sent manually"
          body="Today the dispatcher still sends the route to the driver manually by text, WhatsApp, or call using the pickup, delivery, and contact details from the load."
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChecklistSection
          title="Start-of-day checklist"
          description="Do these before searching for new board posts."
          items={[
            "Open /dashboard and work Needs Follow-Up Now, Problem Loads, and Booked Missing Driver Info first.",
            "Check Reload Priority so you know which Daniel Gruas LLC unit needs the next move before it sits.",
            "Review any pickups today, pickups tomorrow, and in-transit loads that need an update.",
            "Confirm your assigned units have current location, status, and notes that match reality.",
          ]}
        />

        <ChecklistSection
          title="Opportunity checklist"
          description="Use this when a dispatcher finds a possible move on a board."
          items={[
            "Create the job as an opportunity on /dashboard/movement, not as a load yet.",
            "Enter the source board, reference, pickup route, delivery route, contact, and timing window.",
            "Add the vehicles being moved so another dispatcher can understand the job without extra messages.",
            "Assign the opportunity to the best-fit unit if you already know which truck should take it.",
            "Use notes for anything a replacement dispatcher would need to know later.",
          ]}
        />

        <ChecklistSection
          title="Booked load checklist"
          description="Use this after the move is real."
          items={[
            "Click Create Load from the opportunity so the real job moves into /dashboard/dispatch.",
            "Confirm unit assignment, pricing, pickup and delivery timing, contacts, and reference numbers.",
            "Keep load status updated from booked through delivered so the board stays operationally correct.",
            "Use the detail page if the move needs more complete contact, vehicle, or problem information.",
            "If the move hits a problem, flag it and update notes immediately so it shows in the dashboard queues.",
          ]}
        />

        <ChecklistSection
          title="Unit management checklist"
          description="Use this to keep Daniel Gruas LLC equipment easy to dispatch."
          items={[
            "Keep the unit profile complete: driver name, phone, truck number, truck VIN, trailer number, trailer VIN, and car capacity.",
            "Update current location and available-from time whenever the truck situation changes.",
            "Make sure each unit is assigned to the right dispatcher so work ownership stays clear.",
            "Use unit notes for recurring operational context like lane preferences or special handling.",
            "Open /dashboard/units/[unit] whenever unit data feels incomplete or spread across memory.",
          ]}
        />
      </div>

      <ChecklistSection
        title="How to send the route to the driver today"
        description="Route-sharing is still manual right now, so the dispatcher must handle the final handoff."
        items={[
          "Open the booked load on /dashboard/dispatch or the load detail page.",
          "Copy the pickup and delivery details, contact information, and reference number.",
          "Send the route manually to the driver by text, WhatsApp, or phone call.",
          "If timing or route details change, update the load first and then resend the corrected info.",
        ]}
      />

      <ChecklistSection
        title="End-of-day checklist"
        description="Use this before signing out so the next person is not guessing."
        items={[
          "Check that every active load has the right status and last notes.",
          "Make sure every unit reflects the real current location and next availability.",
          "Leave notes on any job that might need another dispatcher to step in tomorrow.",
          "Confirm open opportunities either have enough information to work or are clearly marked on hold / lost.",
        ]}
      />

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-slate-950">
              Quick links
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Keep these pages close during training and the first week.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/movement"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              Fleet Movement
            </Link>
            <Link
              href="/dashboard/dispatch"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              Dispatch
            </Link>
          </div>
        </div>
      </section>
    </section>
  );
}
