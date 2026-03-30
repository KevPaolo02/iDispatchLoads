import Link from "next/link";

type PlaybookStep = {
  title: string;
  description: string;
};

type PlaybookAction = {
  label: string;
  href: string;
};

type PagePlaybookProps = {
  eyebrow?: string;
  title: string;
  description: string;
  steps: PlaybookStep[];
  actions?: PlaybookAction[];
};

export function PagePlaybook({
  eyebrow,
  title,
  description,
  steps,
  actions = [],
}: PagePlaybookProps) {
  return (
    <section className="rounded-[1.75rem] border border-sky-100 bg-gradient-to-br from-white via-sky-50/70 to-emerald-50/60 p-6 shadow-[0_24px_70px_-42px_rgba(14,165,233,0.45)]">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          {title}
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {steps.map((step, index) => (
          <article
            key={`${step.title}-${index}`}
            className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-[0_18px_40px_-34px_rgba(14,165,233,0.45)] backdrop-blur"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
              Step {index + 1}
            </p>
            <h3 className="mt-2 font-semibold text-slate-950">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {step.description}
            </p>
          </article>
        ))}
      </div>

      {actions.length ? (
        <div className="mt-5 flex flex-wrap gap-3">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-full border border-sky-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_12px_30px_-26px_rgba(14,165,233,0.5)] transition hover:border-[var(--color-primary)] hover:bg-sky-50 hover:text-[var(--color-primary)]"
            >
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
