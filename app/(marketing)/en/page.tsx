import type { Metadata } from "next";

import { ContactForm } from "@/components/marketing/contact-form";
import { Hero } from "@/components/marketing/hero";
import { SectionHeading } from "@/components/shared/section-heading";
import { SectionShell } from "@/components/shared/section-shell";

export const metadata: Metadata = {
  title: "Dispatch Services for NY, NJ, CT & PA Owner-Operators",
  description:
    "Dispatch services for owner-operators running from, through, or to New York, New Jersey, Connecticut, and Pennsylvania. Save time, get better rates, and stay loaded.",
  keywords: [
    "dispatch services for owner operators",
    "truck dispatch services New York",
    "truck dispatch services New Jersey",
    "truck dispatch services Connecticut",
    "truck dispatch services Pennsylvania",
    "Northeast dispatch services",
    "owner operator dispatch NY NJ CT PA",
  ],
  alternates: {
    canonical: "/en",
    languages: {
      en: "/en",
      es: "/",
    },
  },
  category: "Transportation",
  openGraph: {
    title: "Dispatch Services for NY, NJ, CT & PA Owner-Operators",
    description:
      "Dispatch services for owner-operators running from, through, or to New York, New Jersey, Connecticut, and Pennsylvania.",
    url: "https://idispatchloads.com/en",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Dispatch services for Northeast owner-operators",
      },
    ],
  },
  twitter: {
    title: "Dispatch Services for NY, NJ, CT & PA Owner-Operators",
    description:
      "Dispatch support for owner-operators working NY, NJ, CT, and PA lanes.",
    images: ["/twitter-image"],
  },
};

const services = [
  {
    title: "Load Booking",
    description:
      "We search, filter, and book loads that fit your Northeast lanes so you stop burning hours chasing random freight.",
  },
  {
    title: "Rate Negotiation",
    description:
      "We push for stronger rates on NY, NJ, CT, and PA freight so you do not leave money on the table.",
  },
  {
    title: "Broker Communication",
    description:
      "We handle the broker calls, updates, and back-and-forth so you can stay focused on driving.",
  },
  {
    title: "Paperwork Handling",
    description:
      "We keep rate confirmations and dispatch details organized so each load runs with less friction.",
  },
];

const benefits = [
  "Save hours every week by getting off the boards and out of constant broker calls.",
  "Get better rates with a dispatcher negotiating NY, NJ, CT, and PA freight with revenue in mind.",
  "Stay loaded with planning built around Northeast freight instead of random one-off loads.",
];

const steps = [
  {
    step: "01",
    title: "Tell Us Where You Run",
    description:
      "Tell us your equipment, your home base, and whether you run from, through, or to New York, New Jersey, Connecticut, and Pennsylvania.",
  },
  {
    step: "02",
    title: "We Target Northeast Freight",
    description:
      "We target Northeast freight, negotiate stronger rates, and deal directly with brokers on your behalf.",
  },
  {
    step: "03",
    title: "You Stay Moving",
    description:
      "You drive, deliver, and keep earning while we keep your next Northeast move in sight.",
  },
];

const trustSignals = [
  {
    title: "Northeast Lane Focus",
    description:
      "We are not trying to dispatch every lane in the country. The offer is built around drivers running from, through, or to NY, NJ, CT, and PA.",
  },
  {
    title: "Direct Dispatcher Support",
    description:
      "You get a real dispatch team handling broker communication, rate negotiation, and the details that slow drivers down.",
  },
  {
    title: "Built for Real Operations",
    description:
      "Every lead comes in with truck type, preferred lanes, and clear contact details so we can qualify the right Northeast drivers fast.",
  },
];

const fitPoints = [
  "You regularly run from, through, or to New York, New Jersey, Connecticut, or Pennsylvania.",
  "You want more consistent Northeast freight instead of random one-off loads.",
  "You want dispatch support that helps you save time, negotiate better, and stay moving.",
];

const serviceAreas = [
  {
    title: "New York Dispatch Support",
    description:
      "We work with owner-operators moving into, out of, and through New York lanes who need tighter dispatch planning and fewer wasted broker calls.",
  },
  {
    title: "New Jersey Dispatch Support",
    description:
      "We help drivers running New Jersey freight stay more organized with stronger rate negotiation and cleaner dispatch coordination.",
  },
  {
    title: "Connecticut Dispatch Support",
    description:
      "For drivers crossing Connecticut lanes, we focus on consistent freight and practical route planning.",
  },
  {
    title: "Pennsylvania Dispatch Support",
    description:
      "We support Pennsylvania freight lanes with dispatch help built around better planning, stronger load selection, and steadier movement.",
  },
];

const pricingOptions = [
  {
    title: "10% per load",
    description:
      "Best if you prefer to pay based on the freight being moved and want dispatch cost tied directly to load activity.",
  },
  {
    title: "$500 per month",
    description:
      "Best if you want a fixed monthly dispatch cost and prefer a simple flat-fee setup for your operation.",
  },
];

const faqs = [
  {
    question:
      "What kind of drivers does iDispatchLoads.com work with in NY, NJ, CT, and PA?",
    answer:
      "We are focused on owner-operators and small fleets running from, through, or to New York, New Jersey, Connecticut, and Pennsylvania. The best fit is a driver who wants more consistent Northeast freight and help handling broker communication.",
  },
  {
    question: "Do you dispatch only Northeast lanes?",
    answer:
      "Our marketing and qualification focus is the Northeast corridor because that is where we want the strongest fit. If a driver regularly works NY, NJ, CT, and PA freight, that is exactly the kind of operation we want to support.",
  },
  {
    question: "How does your dispatch service help owner-operators save time?",
    answer:
      "We take over the load search, broker communication, rate negotiation, and dispatch coordination so the driver spends less time chasing freight and more time driving profitable loads.",
  },
  {
    question: "Can you help me get better rates on Northeast loads?",
    answer:
      "That is a core part of the offer. We negotiate with revenue in mind and focus on loads that make sense for the driver’s preferred lanes instead of accepting random low-paying freight.",
  },
  {
    question: "What information do I need to get started?",
    answer:
      "To qualify quickly, we need your name, phone, email, truck or trailer type, and the lanes you prefer to run in the Northeast. That helps us know whether your operation is a strong fit.",
  },
  {
    question: "How much does iDispatchLoads.com charge?",
    answer:
      "We keep pricing simple with two options: 10% per load or $500 per month. The right option depends on how you prefer to structure dispatch cost for your operation.",
  },
];

export default function HomeEn() {
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "iDispatchLoads.com",
      url: "https://idispatchloads.com/en",
      inLanguage: "en-US",
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "iDispatchLoads.com",
      url: "https://idispatchloads.com",
      logo: "https://idispatchloads.com/opengraph-image",
    },
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: "iDispatchLoads.com",
      url: "https://idispatchloads.com/en",
      description:
        "Dispatch services for owner-operators running from, through, or to New York, New Jersey, Connecticut, and Pennsylvania.",
      areaServed: [
        { "@type": "State", name: "New York" },
        { "@type": "State", name: "New Jersey" },
        { "@type": "State", name: "Connecticut" },
        { "@type": "State", name: "Pennsylvania" },
      ],
      serviceType: [
        "Load booking",
        "Rate negotiation",
        "Broker communication",
        "Paperwork handling",
      ],
      audience: {
        "@type": "Audience",
        audienceType: "Owner-operators and small fleets",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <Hero />

      <SectionShell id="services" tone="light">
        <SectionHeading
          eyebrow="Services"
          title="Northeast dispatch support built for serious owner-operators."
          description="If you run the NY, NJ, CT, and PA area and you are still searching load boards, calling brokers, and handling every detail yourself, you are losing time and leaving money on the table."
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
              More driving. Less chasing. Better Northeast loads.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-300">
              Our dispatch service is built for owner-operators who want to
              protect their time, improve revenue, and stay more consistently
              booked in the Northeast corridor.
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
          title="Three steps to taking load search off your plate."
          description="We keep the process simple so qualified Northeast drivers can get dispatch support fast and get back on the road."
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
          eyebrow="Who We Work With"
          title="This is for drivers running the Northeast, not every truck on the road."
          description="We want a better fit, not just more leads. If you work from, through, or to NY, NJ, CT, and PA, you are exactly the kind of driver we want to talk to."
        />
        <div className="mb-8 grid gap-4 lg:grid-cols-3">
          {fitPoints.map((point) => (
            <div
              key={point}
              className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm leading-7 text-slate-700 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.35)]"
            >
              {point}
            </div>
          ))}
        </div>
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

      <SectionShell id="areas-served" tone="light">
        <SectionHeading
          eyebrow="Areas Served"
          title="Dispatch services built around New York, New Jersey, Connecticut, and Pennsylvania."
          description="This landing page is intentionally focused on the Northeast corridor because that is where we want the strongest driver fit. If your operation regularly touches these states, the offer is built for you."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {serviceAreas.map((area) => (
            <article
              key={area.title}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)]"
            >
              <h3 className="text-xl font-semibold text-slate-900">
                {area.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {area.description}
              </p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="pricing" tone="light">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple pricing that is easy to understand."
          description="We do not use a complicated pricing structure. Right now there are two simple ways to work with us, so you can choose what fits your operation best."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {pricingOptions.map((option) => (
            <article
              key={option.title}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)]"
            >
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
                Option
              </div>
              <h3 className="mt-4 text-3xl font-semibold text-slate-900">
                {option.title}
              </h3>
              <p className="mt-4 text-base leading-8 text-slate-600">
                {option.description}
              </p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="faq" tone="brand">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions Northeast owner-operators ask before they start."
          description="Good landing pages answer the biggest objections clearly. These are the questions drivers usually have before reaching out."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {faqs.map((faq) => (
            <article
              key={faq.question}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)]"
            >
              <h3 className="text-xl font-semibold text-slate-900">
                {faq.question}
              </h3>
              <p className="mt-4 text-base leading-8 text-slate-600">
                {faq.answer}
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
              title="Run the NY / NJ / CT / PA area and need dispatch help?"
              description="Tell us about your truck and your Northeast lanes. We will show you how to save time, improve rates, and stay loaded in the region you actually work."
              align="left"
            />
            <div className="mt-8 grid gap-4 text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                Run the Northeast with less broker stress
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                Get better rates on corridor freight
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                Stay loaded in NY, NJ, CT, and PA lanes
              </div>
            </div>
          </div>
          <ContactForm buttonLabel="Get a Dispatcher Today" />
        </div>
      </SectionShell>
    </>
  );
}
