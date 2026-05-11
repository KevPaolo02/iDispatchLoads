import { trailerTypeOptions } from "@/lib/constants";
import { preferredRoutesInput } from "@/lib/form-utils";
import type { Database } from "@/types/database";

type DriverRow = Database["public"]["Tables"]["drivers"]["Row"];

type DriverFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  returnTo: string;
  driver?: Partial<DriverRow>;
};

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400/50";

const labelClassName = "space-y-2 text-sm text-slate-300";

export function DriverForm({ action, submitLabel, returnTo, driver }: DriverFormProps) {
  return (
    <form action={action} className="space-y-4">
      {driver?.id ? <input type="hidden" name="id" value={driver.id} /> : null}
      <input type="hidden" name="return_to" value={returnTo} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClassName}>
          Name
          <input className={inputClassName} name="name" defaultValue={driver?.name ?? ""} placeholder="Jose Ramirez" />
        </label>
        <label className={labelClassName}>
          Phone
          <input className={inputClassName} name="phone" defaultValue={driver?.phone ?? ""} placeholder="(555) 123-4567" />
        </label>
      </div>

      <label className={labelClassName}>
        Current location
        <input className={inputClassName} name="current_location" defaultValue={driver?.current_location ?? ""} placeholder="Dallas, TX" />
      </label>

      <label className={labelClassName}>
        Preferred routes / zones
        <input
          className={inputClassName}
          name="preferred_routes"
          defaultValue={preferredRoutesInput(driver?.preferred_routes)}
          placeholder="NJ, NY, CT, PA, North Jersey local, Philly okay"
        />
      </label>

      <label className={labelClassName}>
        Trailer type
        <input
          className={inputClassName}
          name="trailer_type"
          defaultValue={driver?.trailer_type ?? ""}
          placeholder="Open 3-car"
          list="trailer-type-options"
        />
        <datalist id="trailer-type-options">
          {trailerTypeOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </label>

      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-200">
        <input
          type="checkbox"
          name="is_available"
          defaultChecked={driver?.is_available ?? true}
          className="size-4 rounded border-white/20 bg-slate-950"
        />
        Driver is available for new loads
      </label>

      <button className="rounded-2xl bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
        {submitLabel}
      </button>
    </form>
  );
}
