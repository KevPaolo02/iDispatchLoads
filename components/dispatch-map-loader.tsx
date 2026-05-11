"use client";

import dynamic from "next/dynamic";

/**
 * Client-side loader for DispatchMap. Leaflet touches `window` during module
 * evaluation, which crashes Next's server render. `ssr: false` is only valid
 * inside a client component — this thin wrapper exists purely to provide
 * that escape hatch when the parent (e.g. /dispatcher) is a server component.
 */
const DispatchMap = dynamic(
  () => import("./dispatch-map").then((mod) => mod.DispatchMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[520px] w-full items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60 text-sm text-slate-400">
        Loading map…
      </div>
    ),
  },
);

export default DispatchMap;
