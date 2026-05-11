import { vehicleTypeOptions } from "@/lib/constants";
import type { Database } from "@/types/database";

type LoadRow = Database["public"]["Tables"]["loads"]["Row"];

type LoadFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  returnTo: string;
  load?: Partial<LoadRow>;
  /**
   * When true, route/price/date inputs are disabled. Used for OFFERED, ASSIGNED,
   * and COMPLETED loads where changing those fields after offers have gone out
   * would invalidate the audit trail. Notes remain editable.
   */
  lockCoreFields?: boolean;
};

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400/50 disabled:cursor-not-allowed disabled:opacity-60";

const labelClassName = "space-y-2 text-sm text-slate-300";

export function LoadForm({ action, submitLabel, returnTo, load, lockCoreFields = false }: LoadFormProps) {
  return (
    <form action={action} className="space-y-4">
      {load?.id ? <input type="hidden" name="id" value={load.id} /> : null}
      <input type="hidden" name="return_to" value={returnTo} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClassName}>
          Pickup city
          <input
            className={inputClassName}
            name="pickup_city"
            defaultValue={load?.pickup_city ?? ""}
            placeholder="Houston"
            disabled={lockCoreFields}
          />
        </label>
        <label className={labelClassName}>
          Pickup state
          <input
            className={inputClassName}
            name="pickup_state"
            defaultValue={load?.pickup_state ?? ""}
            placeholder="TX"
            maxLength={2}
            disabled={lockCoreFields}
          />
        </label>
        <label className={labelClassName}>
          Delivery city
          <input
            className={inputClassName}
            name="delivery_city"
            defaultValue={load?.delivery_city ?? ""}
            placeholder="Atlanta"
            disabled={lockCoreFields}
          />
        </label>
        <label className={labelClassName}>
          Delivery state
          <input
            className={inputClassName}
            name="delivery_state"
            defaultValue={load?.delivery_state ?? ""}
            placeholder="GA"
            maxLength={2}
            disabled={lockCoreFields}
          />
        </label>
        <label className={labelClassName}>
          Vehicle type
          <input
            className={inputClassName}
            name="vehicle_type"
            defaultValue={load?.vehicle_type ?? ""}
            placeholder="Sedan"
            list="vehicle-type-options"
            disabled={lockCoreFields}
          />
          <datalist id="vehicle-type-options">
            {vehicleTypeOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </label>
        <label className={labelClassName}>
          Price
          <input
            className={inputClassName}
            name="price"
            type="number"
            step="0.01"
            defaultValue={load?.price ?? ""}
            placeholder="900"
            disabled={lockCoreFields}
          />
        </label>
        <label className={labelClassName}>
          Distance (optional)
          <input
            className={inputClassName}
            name="distance_miles"
            type="number"
            step="1"
            defaultValue={load?.distance_miles ?? ""}
            placeholder="820"
            disabled={lockCoreFields}
          />
        </label>
        <label className={labelClassName}>
          Pickup date
          <input
            className={inputClassName}
            name="pickup_date"
            type="date"
            defaultValue={load?.pickup_date ?? new Date().toISOString().slice(0, 10)}
            disabled={lockCoreFields}
          />
        </label>
      </div>

      <label className={labelClassName}>
        Notes
        <textarea
          className={`${inputClassName} min-h-28 resize-y`}
          name="notes"
          defaultValue={load?.notes ?? ""}
          placeholder="Gate codes, customer timing, inop notes, broker details..."
        />
      </label>

      {lockCoreFields ? (
        <p className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
          Route, price, and pickup date are locked once an offer goes out. Use Unassign to roll the load back to NEW before changing them.
        </p>
      ) : null}

      <button className="rounded-2xl bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
        {submitLabel}
      </button>
    </form>
  );
}
