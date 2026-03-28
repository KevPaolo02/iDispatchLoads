import { ContactForm } from "@/components/marketing/contact-form";
import { Hero } from "@/components/marketing/hero";
import { SectionHeading } from "@/components/shared/section-heading";
import { SectionShell } from "@/components/shared/section-shell";

const services = [
  {
    title: "Load Booking",
    description:
      "We search, filter, and book loads that match your lanes so you stop burning hours hunting freight.",
  },
  {
    title: "Rate Negotiation",
    description:
      "We push for stronger rates so you do not leave money on the table every time you accept a load.",
  },
  {
    title: "Broker Communication",
    description:
      "We handle the broker calls, updates, and back-and-forth so you can stay focused on driving.",
  },
  {
    title: "Paperwork Handling",
    description:
      "We keep rate confirmations and dispatch details organized so every load moves with less friction.",
  },
];

const benefits = [
  "Save hours every week by getting off the load board and out of constant broker calls.",
  "Get better rates with a dispatcher negotiating every load with revenue in mind.",
  "Stay loaded with consistent freight planning that keeps your truck moving.",
];

const steps = [
  {
    step: "01",
    title: "Tell Us Your Lanes",
    description:
      "Tell us your equipment, preferred lanes, and goals so we know what loads make sense for your operation.",
  },
  {
    step: "02",
    title: "We Book and Negotiate",
    description:
      "We find consistent freight, negotiate stronger rates, and deal directly with brokers on your behalf.",
  },
  {
    step: "03",
    title: "You Keep Rolling",
    description:
      "You drive, deliver, and keep earning while we handle the details that slow owner-operators down.",
  },
];

const trustSignals = [
  {
    title: "Owner-Operator Focused",
    description:
      "The messaging, intake, and dispatch process are built specifically for owner-operators and small fleets, not a generic freight audience.",
  },
  {
    title: "Direct Dispatcher Support",
    description:
      "You get a real dispatch team handling broker communication, rate negotiation, and the details that slow drivers down.",
  },
  {
    title: "Structured From Day One",
    description:
      "Every lead comes in with truck type, preferred lanes, and clear contact details so operations can scale cleanly into the CRM later.",
  },
];

export default function Home() {
  return (
    <>
      <Hero />

      <SectionShell id="services" tone="light">
        <SectionHeading
          eyebrow="Services"
          title="Everything slowing you down, handled for you."
          description="If you are still searching load boards, calling brokers, and handling every detail yourself, you are losing time and leaving money behind."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <article
              key={service.title}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.45)]"
            >
              <div className="mb-4 h-1.5 w-14 rounded-full bg-[var(--color-accent)]" />
              <h3 className="text-xl font-semibold text-slate-900">
                {service.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="benefits" tone="dark">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Benefits
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              More driving. Less chasing. Better-paying loads.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-300">
              Our dispatch service is built for owner-operators who want to
              protect their time, improve revenue, and stay consistently booked.
            </p>
          </div>
          <div className="grid gap-4">
            {benefits.map((benefit, index) => (
              <div
                key={benefit}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="text-sm font-semibold text-cyan-300">
                  0{index + 1}
                </div>
                <p className="mt-2 text-lg leading-8 text-slate-100">
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell id="home-how-it-works" tone="light">
        <SectionHeading
          eyebrow="How It Works"
          title="Three steps to getting loads off your mind."
          description="We keep the process simple so you can get dispatch support fast and start focusing on the road again."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.step}
              className="rounded-[2rem] border border-slate-200 bg-slate-50 p-7"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
                Step {step.step}
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="trust" tone="brand">
        <SectionHeading
          eyebrow="Trust Signals"
          title="Built to launch cleanly, sell clearly, and scale operationally."
          description="We are not using placeholder reviews or inflated claims. This section highlights what is true about the service and the system behind it."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {trustSignals.map((signal) => (
            <article
              key={signal.title}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.35)]"
            >
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
                Trust
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-slate-900">
                {signal.title}
              </h3>
              <p className="mt-4 text-base leading-8 text-slate-600">
                {signal.description}
              </p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="contact" tone="light">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Contact"
              title="Ready to stop chasing loads on your own?"
              description="Tell us about your truck and lanes. We will show you how to save time, improve rates, and keep your schedule full."
              align="left"
            />
            <div className="mt-8 grid gap-4 text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                Save time every week
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                Get better rates
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                Stay loaded consistently
              </div>
            </div>
          </div>
          <ContactForm buttonLabel="Get a Dispatcher Today" />
        </div>
      </SectionShell>
    </>
  );
}
