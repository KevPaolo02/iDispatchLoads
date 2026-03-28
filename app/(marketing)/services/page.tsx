import { SectionHeading } from "@/components/shared/section-heading";
import { SectionShell } from "@/components/shared/section-shell";

const serviceDetails = [
  {
    title: "Load Booking",
    description:
      "We identify strong freight opportunities, confirm details, and secure loads that support your weekly revenue goals.",
    points: [
      "Targeted load search based on your lanes",
      "Fast confirmations and dispatch details",
      "Support for steady backhaul planning",
    ],
  },
  {
    title: "Rate Negotiation",
    description:
      "We communicate directly with brokers to push for better rates and stronger terms whenever possible.",
    points: [
      "Market-aware pricing strategy",
      "Confident, professional broker negotiation",
      "Focus on protecting your margins",
    ],
  },
  {
    title: "Broker Communication",
    description:
      "We manage load updates, check calls, and issue handling so the communication side never slows you down.",
    points: [
      "Clear broker follow-up",
      "Timely updates and coordination",
      "Responsive support when plans change",
    ],
  },
  {
    title: "Paperwork Handling",
    description:
      "Rate confirmations, instructions, and documents are organized to help every load move smoothly from dispatch to delivery.",
    points: [
      "Rate con review and organization",
      "Dispatch sheet and load detail management",
      "Cleaner handoff from booking to completion",
    ],
  },
];

export default function ServicesPage() {
  return (
    <SectionShell tone="light" className="pt-14">
      <SectionHeading
        eyebrow="Services"
        title="Dispatch services built for owner operators who want consistency."
        description="iDispatchLoads.com provides hands-on support across booking, negotiation, communication, and paperwork so you can stay focused on the road."
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
