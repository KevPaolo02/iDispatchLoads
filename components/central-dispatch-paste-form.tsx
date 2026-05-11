import { createLoadFromCentralDispatchAction } from "@/app/(dashboard)/actions";

const samplePlaceholder = `$1,800
1836 mi @ $0.98 / mi
Cash / Certified
Vehicle Info
1998 Bmw 3 Series Sedan
Pick-Up Location
AB: Alberta Beach, T6E 6T9
Delivery Location
AZ: Tucson, 85701
Pick-Up on or After Date
05/08/26
Load ID
BCBMCA`;

export function CentralDispatchPasteForm() {
  return (
    <form action={createLoadFromCentralDispatchAction} className="space-y-4">
      <input type="hidden" name="return_to" value="/" />
      <label className="block space-y-2 text-sm text-slate-300">
        Paste Central Dispatch load
        <textarea
          name="central_dispatch_text"
          className="min-h-56 w-full resize-y rounded-2xl border border-sky-400/30 bg-slate-950/80 px-3 py-3 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-300 sm:text-sm"
          placeholder={samplePlaceholder}
        />
      </label>
      <button className="w-full rounded-2xl bg-sky-400 px-4 py-3 text-base font-semibold text-slate-950 transition hover:bg-sky-300 sm:w-auto sm:text-sm">
        Create from paste
      </button>
      <p className="text-xs leading-5 text-slate-500">
        Pulls route, price, miles, pickup date, vehicle, broker, phone, load ID, and terms into the load record.
      </p>
    </form>
  );
}
