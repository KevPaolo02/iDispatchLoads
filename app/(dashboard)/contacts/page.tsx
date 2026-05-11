import {
  createContactAction,
  deleteContactAction,
  updateContactAction,
} from "@/app/(dashboard)/actions";
import { ConfirmForm } from "@/components/confirm-form";
import { FlashBanner } from "@/components/flash-banner";
import { SectionCard } from "@/components/section-card";
import { getContacts, type ContactRow } from "@/lib/data";
import { normalizeArray } from "@/lib/utils";

const TYPE_LABELS: Record<ContactRow["type"], string> = {
  broker: "Brokers",
  dealer: "Dealers",
  shipper: "Shippers",
};

const PAYMENT_SPEED_OPTIONS: Array<NonNullable<ContactRow["payment_speed"]>> = [
  "fast",
  "normal",
  "slow",
  "never",
];

export default async function ContactsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const error = normalizeArray(params.error)[0];
  const success = normalizeArray(params.success)[0];
  const contacts = await getContacts();

  const brokers = contacts.filter((c) => c.type === "broker");
  const dealers = contacts.filter((c) => c.type === "dealer");
  const shippers = contacts.filter((c) => c.type === "shipper");

  return (
    <div className="space-y-8">
      {error ? <FlashBanner type="error" message={error} /> : null}
      {success ? <FlashBanner type="success" message={success} /> : null}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard
          title="Add Contact"
          description="Brokers, dealers, and shippers. Save the memory once, surface it on every future load."
        >
          <ContactCreateForm />
        </SectionCard>

        <SectionCard
          title="Why we remember"
          description="Operational knowledge that used to live in your head, WhatsApp, and screenshots."
        >
          <div className="space-y-3 text-sm text-slate-300">
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Tag a broker as <code>slow_pay</code> once. Next time the load comes up, the tag is already there.
            </p>
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Record &quot;~45 min wait&quot; on a dealer once. Future you sees it on every load to that lot.
            </p>
            <p className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Warning tags surface red on the load form: <code>slow_pay</code>, <code>long_wait</code>, <code>bad_neighborhood</code>, <code>always_late</code>, <code>no_show</code>.
            </p>
          </div>
        </SectionCard>
      </section>

      {[
        { label: TYPE_LABELS.broker, list: brokers },
        { label: TYPE_LABELS.dealer, list: dealers },
        { label: TYPE_LABELS.shipper, list: shippers },
      ].map(({ label, list }) => (
        <SectionCard
          key={label}
          title={label}
          description={`${list.length} saved.`}
        >
          <div className="space-y-4">
            {list.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-400">
                None yet.
              </p>
            ) : (
              list.map((contact) => <ContactCard key={contact.id} contact={contact} />)
            )}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400/50";

function ContactCreateForm() {
  return (
    <form action={createContactAction} className="space-y-4">
      <input type="hidden" name="return_to" value="/contacts" />

      <label className="space-y-2 text-sm text-slate-300">
        Name
        <input className={inputClassName} name="name" placeholder="ABC Auto Brokers" required />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-300">
          Type
          <select className={inputClassName} name="type" defaultValue="broker">
            <option value="broker">Broker</option>
            <option value="dealer">Dealer</option>
            <option value="shipper">Shipper</option>
          </select>
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          Phone
          <input className={inputClassName} name="phone" placeholder="(555) 123-4567" />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          Avg wait (minutes)
          <input className={inputClassName} name="avg_wait_minutes" type="number" min="0" placeholder="45" />
        </label>
        <label className="space-y-2 text-sm text-slate-300">
          Payment speed
          <select className={inputClassName} name="payment_speed" defaultValue="">
            <option value="">—</option>
            {PAYMENT_SPEED_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="space-y-2 text-sm text-slate-300">
        Tags (comma-separated)
        <input className={inputClassName} name="tags" placeholder="slow_pay, long_wait" />
      </label>

      <label className="space-y-2 text-sm text-slate-300">
        Notes
        <textarea className={`${inputClassName} min-h-20 resize-y`} name="notes" placeholder="Anything future you needs to know." />
      </label>

      <button className="rounded-2xl bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
        Save contact
      </button>
    </form>
  );
}

function ContactCard({ contact }: { contact: ContactRow }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{contact.name}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {contact.phone ?? "no phone"}
            {contact.avg_wait_minutes != null ? ` · ~${contact.avg_wait_minutes}m wait` : ""}
            {contact.payment_speed ? ` · pays ${contact.payment_speed}` : ""}
          </p>
        </div>

        <ConfirmForm
          action={deleteContactAction}
          confirmMessage={`Delete ${contact.name}? Loads linked to this contact will keep the link as null.`}
        >
          <input type="hidden" name="id" value={contact.id} />
          <input type="hidden" name="return_to" value="/contacts" />
          <button className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20">
            Delete
          </button>
        </ConfirmForm>
      </div>

      <form action={updateContactAction} className="space-y-4">
        <input type="hidden" name="id" value={contact.id} />
        <input type="hidden" name="return_to" value="/contacts" />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-300">
            Name
            <input className={inputClassName} name="name" defaultValue={contact.name} required />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            Type
            <select className={inputClassName} name="type" defaultValue={contact.type}>
              <option value="broker">Broker</option>
              <option value="dealer">Dealer</option>
              <option value="shipper">Shipper</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            Phone
            <input className={inputClassName} name="phone" defaultValue={contact.phone ?? ""} />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            Avg wait (minutes)
            <input className={inputClassName} name="avg_wait_minutes" type="number" min="0" defaultValue={contact.avg_wait_minutes ?? ""} />
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            Payment speed
            <select className={inputClassName} name="payment_speed" defaultValue={contact.payment_speed ?? ""}>
              <option value="">—</option>
              {PAYMENT_SPEED_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-300">
            Tags (comma-separated)
            <input className={inputClassName} name="tags" defaultValue={contact.tags?.join(", ") ?? ""} />
          </label>
        </div>

        <label className="space-y-2 text-sm text-slate-300">
          Notes
          <textarea className={`${inputClassName} min-h-20 resize-y`} name="notes" defaultValue={contact.notes ?? ""} />
        </label>

        <button className="rounded-2xl bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
          Update
        </button>
      </form>
    </div>
  );
}
