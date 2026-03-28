import { ContactForm } from "@/components/marketing/contact-form";
import { SectionHeading } from "@/components/shared/section-heading";
import { SectionShell } from "@/components/shared/section-shell";

export default function ContactPage() {
  return (
    <SectionShell tone="light" className="pt-14">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <SectionHeading
            eyebrow="Contact"
            title="Talk with a dispatch team that understands owner operators."
            description="Share a few details about your operation and we’ll reach out to discuss how iDispatchLoads.com can help keep your trucks moving."
            align="left"
          />
          <div className="mt-8 rounded-[2rem] bg-slate-900 p-8 text-slate-200">
            <h2 className="text-xl font-semibold text-white">
              What to include
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-7">
              <li>Truck or equipment type</li>
              <li>Preferred freight lanes or regions</li>
              <li>Current dispatch challenges</li>
              <li>How soon you want to get started</li>
            </ul>
          </div>
        </div>
        <ContactForm buttonLabel="Get a Dispatcher Today" />
      </div>
    </SectionShell>
  );
}
