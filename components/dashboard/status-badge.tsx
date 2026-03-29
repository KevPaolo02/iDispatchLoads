import type {
  DispatchLoadStatus,
  DriverStatus,
  LoadOpportunityStatus,
  ProblemPriorityLevel,
} from "@/lib/types";
import type { ReloadPriorityLevel } from "@/lib/services";

type StatusBadgeProps = {
  label: string;
  tone?: string;
};

function getLoadTone(status: DispatchLoadStatus) {
  switch (status) {
    case "posted":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "negotiating":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "booked":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "assigned":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "pickup_scheduled":
      return "border-cyan-200 bg-cyan-50 text-cyan-700";
    case "picked_up":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "in_transit":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";
    case "delivered":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "closed":
      return "border-slate-300 bg-slate-200 text-slate-700";
    case "problem_hold":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function getOpportunityTone(status: LoadOpportunityStatus) {
  switch (status) {
    case "new":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "needs_review":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "needs_quote":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "awaiting_customer":
      return "border-cyan-200 bg-cyan-50 text-cyan-700";
    case "ready_to_post":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "closed_won":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "closed_lost":
      return "border-slate-300 bg-slate-200 text-slate-700";
    case "on_hold":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function getDriverTone(status: DriverStatus) {
  switch (status) {
    case "available":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "assigned":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "in_transit":
      return "border-sky-200 bg-sky-50 text-sky-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function getReloadTone(level: ReloadPriorityLevel) {
  switch (level) {
    case "reload_now":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "reload_soon":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "watch":
      return "border-sky-200 bg-sky-50 text-sky-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function getProblemTone(priority: ProblemPriorityLevel) {
  switch (priority) {
    case "high":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "medium":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "low":
      return "border-sky-200 bg-sky-50 text-sky-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${tone ?? "border-slate-200 bg-slate-100 text-slate-700"}`}
    >
      {label.replaceAll("_", " ")}
    </span>
  );
}

export function LoadStatusBadge({ status }: { status: DispatchLoadStatus }) {
  return <StatusBadge label={status} tone={getLoadTone(status)} />;
}

export function OpportunityStatusBadge({
  status,
}: {
  status: LoadOpportunityStatus;
}) {
  return <StatusBadge label={status} tone={getOpportunityTone(status)} />;
}

export function DriverStatusBadge({ status }: { status: DriverStatus }) {
  return <StatusBadge label={status} tone={getDriverTone(status)} />;
}

export function ReloadPriorityBadge({
  level,
}: {
  level: ReloadPriorityLevel;
}) {
  return <StatusBadge label={level} tone={getReloadTone(level)} />;
}

export function ProblemPriorityBadge({
  priority,
}: {
  priority: ProblemPriorityLevel;
}) {
  return <StatusBadge label={priority} tone={getProblemTone(priority)} />;
}
