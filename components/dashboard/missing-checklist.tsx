export function MissingChecklist({
  title,
  items,
}: {
  title: string;
  items: Array<{ key: string; label: string }>;
}) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.16)]">
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          {title}
        </h2>
        <p className="text-sm text-slate-600">
          This checklist blocks status progression when required operational
          information is still missing.
        </p>
      </div>

      {!items.length ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          All required operational fields are complete.
        </div>
      ) : (
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <li
              key={item.key}
              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
