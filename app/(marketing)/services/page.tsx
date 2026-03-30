import type { Metadata } from "next";

import { SectionHeading } from "@/components/shared/section-heading";
import { SectionShell } from "@/components/shared/section-shell";

export const metadata: Metadata = {
  title: "Northeast Dispatch Services",
  description:
    "Load booking, rate negotiation, broker communication, and paperwork handling for owner-operators running NY, NJ, CT, and PA lanes.",
  alternates: {
    canonical: "/services",
  },
};

const serviceDetails = [
  {
    title: "Load Booking",
    description:
      "We search Northeast freight, confirm the details, and secure loads that support your weekly revenue goals instead of wasting time on weak options.",
    points: [
      "Focused search across NY / NJ / CT / PA lanes",
      "Fast confirmations with clear load details",
      "Support for steadier reload and backhaul planning",
    ],
  },
  {
    title: "Rate Negotiation",
    description:
      "We communicate directly with brokers to push for better rates and stronger terms on the Northeast freight you actually want to run.",
    points: [
      "Market-aware pricing strategy",
      "Confident, professional broker negotiation",
      "Clear focus on protecting your margins",
    ],
  },
  {
    title: "Broker Communication",
    description:
      "We manage load updates, check calls, and issue handling so broker communication does not keep pulling you away from the road.",
    points: [
      "Clear broker follow-up",
      "Timely updates and coordination",
      "Responsive support when plans change",
    ],
  },
  {
    title: "Paperwork Handling",
    description:
      "Rate confirmations, instructions, and dispatch paperwork are organized to help every Northeast move run more smoothly from booking to delivery.",
    points: [
      "Rate confirmation review and organization",
      "Dispatch sheet and load detail management",
      "Cleaner handoff from booking through delivery",
    ],
  },
];

export default function ServicesPage() {
  return (
    <SectionShell tone="light" className="pt-14">
      <SectionHeading
        eyebrow="Services"
        title="Dispatch services for drivers running the Northeast corridor."
        description="iDispatchLoads.com provides hands-on dispatch support across booking, negotiation, communication, and paperwork for owner-operators working from, through, or to NY, NJ, CT, and PA."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {serviceDetails.map((service) => (
          <article
            key={service.title}
            className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.45)]"
          >
            <h2 className="text-2xl font-semibold text-slate-900">
              {service.title}
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              {service.description}
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              {service.points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[var(--color-accent)]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
