"use client";

import { useState } from "react";

type VehicleDraft = {
  year: string;
  make: string;
  model: string;
  vin: string;
  lotNumber: string;
  operability: "operable" | "inop";
};

const EMPTY_VEHICLE: VehicleDraft = {
  year: "",
  make: "",
  model: "",
  vin: "",
  lotNumber: "",
  operability: "operable",
};

export function OpportunityVehicleFields() {
  const [vehicles, setVehicles] = useState<VehicleDraft[]>([{ ...EMPTY_VEHICLE }]);

  function updateVehicle(
    index: number,
    key: keyof VehicleDraft,
    value: string,
  ) {
    setVehicles((current) =>
      current.map((vehicle, vehicleIndex) =>
        vehicleIndex === index ? { ...vehicle, [key]: value } : vehicle,
      ),
    );
  }

  function addVehicle() {
    setVehicles((current) => [...current, { ...EMPTY_VEHICLE }]);
  }

  function removeVehicle(index: number) {
    setVehicles((current) =>
      current.length === 1
        ? current
        : current.filter((_, vehicleIndex) => vehicleIndex !== index),
    );
  }

  return (
    <div className="mt-6 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
      <input type="hidden" name="vehiclesCount" value={String(vehicles.length)} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-950">Vehicles</h3>
          <p className="text-sm leading-6 text-slate-600">
            Add every vehicle included in this opportunity. Start with one, then
            use Add another vehicle if needed.
          </p>
        </div>

        <button
          type="button"
          onClick={addVehicle}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          Add another vehicle
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {vehicles.map((vehicle, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                Vehicle {index + 1}
              </p>
              {vehicles.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeVehicle(index)}
                  className="text-sm font-semibold text-rose-600 transition hover:text-rose-700"
                >
                  Remove
                </button>
              ) : null}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input
                name="vehicleYear"
                type="number"
                min="1900"
                max="2100"
                value={vehicle.year}
                onChange={(event) =>
                  updateVehicle(index, "year", event.target.value)
                }
                placeholder="Vehicle year"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
              />
              <select
                name="vehicleOperability"
                value={vehicle.operability}
                onChange={(event) =>
                  updateVehicle(index, "operability", event.target.value)
                }
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
              >
                <option value="operable">Operable</option>
                <option value="inop">Inop</option>
              </select>
              <input
                name="vehicleMake"
                value={vehicle.make}
                onChange={(event) =>
                  updateVehicle(index, "make", event.target.value)
                }
                placeholder="Vehicle make"
                required
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
              />
              <input
                name="vehicleModel"
                value={vehicle.model}
                onChange={(event) =>
                  updateVehicle(index, "model", event.target.value)
                }
                placeholder="Vehicle model"
                required
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
              />
              <input
                name="vehicleVin"
                value={vehicle.vin}
                onChange={(event) =>
                  updateVehicle(index, "vin", event.target.value.toUpperCase())
                }
                placeholder="Vehicle VIN (optional)"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm uppercase outline-none transition focus:border-[var(--color-primary)] md:col-span-2"
              />
              <input
                name="vehicleLotNumber"
                value={vehicle.lotNumber}
                onChange={(event) =>
                  updateVehicle(index, "lotNumber", event.target.value)
                }
                placeholder="Lot number (optional)"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] md:col-span-2"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
