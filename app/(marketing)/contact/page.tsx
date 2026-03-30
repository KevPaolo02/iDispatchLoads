import type { Metadata } from "next";

import { ContactForm } from "@/components/marketing/contact-form";
import { SectionHeading } from "@/components/shared/section-heading";
import { SectionShell } from "@/components/shared/section-shell";

export const metadata: Metadata = {
  title: "Contact Northeast Dispatch Team",
  description:
    "Talk with iDispatchLoads.com about dispatch services for owner-operators running from, through, or to NY, NJ, CT, and PA.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <SectionShell tone="light" className="pt-14">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <SectionHeading
            eyebrow="Contact"
            title="Talk with a dispatch team built for Northeast owner-operators."
            description="Share a few details about your operation and we’ll reach out if you run from, through, or to New York, New Jersey, Connecticut, and Pennsylvania."
            align="left"
          />
          <div className="mt-8 rounded-[2rem] bg-slate-900 p-8 text-slate-200">
            <h2 className="text-xl font-semibold text-white">
              What to include
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-7">
              <li>Truck or trailer type</li>
              <li>The NY / NJ / CT / PA lanes you usually run</li>
              <li>Your biggest dispatch challenge right now</li>
              <li>How soon you want dispatch support</li>
            </ul>
          </div>
        </div>
        <ContactForm buttonLabel="Get a Dispatcher Today" />
      </div>
    </SectionShell>
  );
}
