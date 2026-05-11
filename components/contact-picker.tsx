"use client";

import { useState } from "react";

import type { ContactRow } from "@/lib/data";

type ContactPickerProps = {
  /** Hidden form field name — e.g. "broker_id". */
  name: string;
  label: string;
  contactType: "broker" | "dealer" | "shipper";
  contacts: ContactRow[];
  defaultContactId?: string | null;
};

const WARNING_TAGS = new Set([
  "slow_pay",
  "long_wait",
  "bad_neighborhood",
  "always_late",
  "no_show",
]);

/**
 * Phase 4.3 — searchable picker for broker / dealer / shipper contacts.
 *
 * Client component so the inline summary card updates immediately when the
 * dispatcher selects a contact. The plan calls this out as the moment of
 * decision: memory has to surface before they take or skip the load.
 */
export function ContactPicker({
  name,
  label,
  contactType,
  contacts,
  defaultContactId,
}: ContactPickerProps) {
  const filtered = contacts.filter((c) => c.type === contactType);
  const [selectedId, setSelectedId] = useState<string>(defaultContactId ?? "");

  const selected = filtered.find((c) => c.id === selectedId) ?? null;
  const warningTags = selected?.tags?.filter((t) => WARNING_TAGS.has(t.toLowerCase())) ?? [];

  return (
    <div className="space-y-2">
      <label className="block space-y-2 text-sm text-slate-300">
        {label}
        <select
          name={name}
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-sky-400/50"
        >
          <option value="">— None —</option>
          {filtered.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.name}
              {contact.payment_speed ? ` · ${contact.payment_speed}` : ""}
            </option>
          ))}
        </select>
      </label>

      {selected ? (
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-xs text-slate-300">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-white">{selected.name}</span>
            {selected.phone ? <span className="text-slate-400">{selected.phone}</span> : null}
            {selected.avg_wait_minutes != null ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                ~{selected.avg_wait_minutes}m wait
              </span>
            ) : null}
            {selected.payment_speed ? (
              <span
                className={`rounded-full border px-2 py-0.5 ${
                  selected.payment_speed === "slow" || selected.payment_speed === "never"
                    ? "border-rose-400/30 bg-rose-400/10 text-rose-100"
                    : "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                }`}
              >
                pays {selected.payment_speed}
              </span>
            ) : null}
          </div>

          {warningTags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {warningTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-rose-400/30 bg-rose-400/10 px-2 py-0.5 text-rose-100"
                >
                  ⚠ {tag.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          ) : null}

          {selected.notes ? (
            <p className="mt-2 whitespace-pre-line text-slate-300">{selected.notes}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
