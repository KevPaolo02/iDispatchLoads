import type { ProblemFlag } from "@/lib/types";
import { problemFlagTypes, problemPriorityLevels } from "@/lib/types";

import { ProblemPriorityBadge } from "@/components/dashboard/status-badge";

type ProblemFlagsPanelProps = {
  entityType: "load" | "load_opportunity";
  entityId: string;
  flags: ProblemFlag[];
  createAction: (formData: FormData) => Promise<void>;
  resolveAction: (formData: FormData) => Promise<void>;
};

export function ProblemFlagsPanel({
  entityType,
  entityId,
  flags,
  createAction,
  resolveAction,
}: ProblemFlagsPanelProps) {
  const openFlags = flags.filter((flag) => !flag.resolvedAt);
  const resolvedFlags = flags.filter((flag) => flag.resolvedAt);

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]">
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          Problem Flags
        </h2>
        <p className="text-sm text-slate-600">
          Escalate anything that blocks dispatch flow, then keep it visible
          until it is resolved.
        </p>
      </div>

      <form action={createAction} className="mt-6 grid gap-3 md:grid-cols-2">
        <input type="hidden" name="entityType" value={entityType} />
        <input type="hidden" name="entityId" value={entityId} />
        <select
          name="flagType"
          defaultValue="late_pickup"
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        >
          {problemFlagTypes.map((flagType) => (
            <option key={flagType} value={flagType}>
              {flagType.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <select
          name="priority"
          defaultValue="medium"
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        >
          {problemPriorityLevels.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
        <textarea
          name="noteBody"
          rows={3}
          required
          placeholder="Required escalation note"
          className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
        />
        <button
          type="submit"
          className="w-fit rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
        >
          Create Problem Flag
        </button>
      </form>

      <div className="mt-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
            Open
          </h3>
          {!openFlags.length ? (
            <p className="mt-2 text-sm text-slate-500">
              No open problem flags.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {openFlags.map((flag) => (
                <article
                  key={flag.id}
                  className="rounded-2xl border border-rose-200 bg-rose-50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">
                        {flag.flagType.replaceAll("_", " ")}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {flag.noteBody}
                      </p>
                    </div>
                    <ProblemPriorityBadge priority={flag.priority} />
                  </div>
                  <form action={resolveAction} className="mt-3">
                    <input type="hidden" name="problemFlagId" value={flag.id} />
                    <button
                      type="submit"
                      className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-white"
                    >
                      Resolve Flag
                    </button>
                  </form>
                </article>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
            Resolved
          </h3>
          {!resolvedFlags.length ? (
            <p className="mt-2 text-sm text-slate-500">
              No resolved problem flags yet.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {resolvedFlags.map((flag) => (
                <article
                  key={flag.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">
                        {flag.flagType.replaceAll("_", " ")}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {flag.noteBody}
                      </p>
                    </div>
                    <ProblemPriorityBadge priority={flag.priority} />
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    Resolved {flag.resolvedAt ? new Date(flag.resolvedAt).toLocaleString() : ""}
                    {flag.resolvedByEmail ? ` • ${flag.resolvedByEmail}` : ""}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
