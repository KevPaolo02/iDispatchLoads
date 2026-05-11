import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: string | null | undefined;
};

const statusStyles: Record<string, string> = {
  NEW: "border-sky-400/30 bg-sky-400/10 text-sky-100",
  OFFERED: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  ASSIGNED: "border-indigo-400/30 bg-indigo-400/10 text-indigo-100",
  COMPLETED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  pending: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  accepted: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  rejected: "border-rose-400/30 bg-rose-400/10 text-rose-100",
  assigned: "border-indigo-400/30 bg-indigo-400/10 text-indigo-100",
  en_route: "border-sky-400/30 bg-sky-400/10 text-sky-100",
  picked_up: "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-100",
  delivered: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  available: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  offline: "border-slate-400/20 bg-slate-400/10 text-slate-200",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const safeStatus = status ?? "unknown";

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        statusStyles[safeStatus] ?? "border-white/10 bg-white/5 text-slate-200",
      )}
    >
      {safeStatus.replaceAll("_", " ")}
    </span>
  );
}
