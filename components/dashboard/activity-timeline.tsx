import type { ActivityEvent } from "@/lib/types";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatValue(value: Record<string, unknown> | null) {
  if (!value) {
    return null;
  }

  return Object.entries(value)
    .filter(([, entryValue]) => entryValue !== null && entryValue !== "")
    .map(([key, entryValue]) => `${key}: ${String(entryValue)}`)
    .join(" • ");
}

export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  if (!events.length) {
    return (
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-sm text-slate-500">
        No activity has been logged yet.
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]">
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          Activity Timeline
        </h2>
        <p className="text-sm text-slate-600">
          Status changes, notes, pricing, scheduling, assignments, and problem
          escalations are logged here for dispatcher handoff clarity.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {events.map((event) => {
          const oldValue = formatValue(event.oldValue);
          const newValue = formatValue(event.newValue);

          return (
            <article
              key={event.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {event.actionType.replaceAll("_", " ")}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {event.actorEmail} • {event.actorRole}
                  </p>
                </div>
                <p className="text-sm text-slate-500">
                  {formatDateTime(event.createdAt)}
                </p>
              </div>

              {event.noteBody ? (
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {event.noteBody}
                </p>
              ) : null}

              {oldValue || newValue ? (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">Previous</p>
                    <p className="mt-1">{oldValue ?? "—"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">Updated</p>
                    <p className="mt-1">{newValue ?? "—"}</p>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
