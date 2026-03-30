import Link from "next/link";
import type { Metadata } from "next";

import { SectionHeading } from "@/components/shared/section-heading";
import { SectionShell } from "@/components/shared/section-shell";

export const metadata: Metadata = {
  title: "How Northeast Dispatch Works",
  description:
    "See how iDispatchLoads.com helps owner-operators running NY, NJ, CT, and PA lanes with onboarding, daily dispatch execution, and ongoing support.",
  alternates: {
    canonical: "/how-it-works",
  },
};

const steps = [
  {
    step: "01",
    title: "Onboarding Call",
    description:
      "We learn your equipment type, preferred freight lanes, operating style, and weekly revenue targets so we know whether the fit is right.",
  },
  {
    step: "02",
    title: "Daily Dispatch Execution",
    description:
      "We search, qualify, negotiate, and coordinate loads while keeping communication clear and efficient.",
  },
  {
    step: "03",
    title: "Ongoing Support",
    description:
      "We stay involved with paperwork, broker updates, and load flow so your operation keeps moving with less friction and fewer distractions.",
  },
];

export default function HowItWorksPage() {
  return (
    <SectionShell tone="light" className="pt-14">
      <SectionHeading
        eyebrow="How It Works"
        title="A simple dispatch process built to keep you loaded and moving."
        description="Our workflow is built to cut admin friction, improve communication, and help Northeast owner-operators run with more consistency."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {steps.map((step) => (
          <article
            key={step.step}
            className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8"
          >
            <div className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
              Step {step.step}
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">
              {step.title}
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              {step.description}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-[2rem] bg-slate-900 px-8 py-10 text-white">
        <h3 className="text-2xl font-semibold tracking-tight">
          Ready to get started?
        </h3>
        <p className="mt-3 max-w-2xl text-base leading-8 text-slate-300">
          The fastest way to begin is to tell us about your truck, your lanes,
          and the kind of dispatch help you need right now.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-flex rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[var(--color-accent-strong)]"
        >
          Talk to Our Team
        </Link>
      </div>
    </SectionShell>
  );
}
