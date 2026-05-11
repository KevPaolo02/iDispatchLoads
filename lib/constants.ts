export const loadStatuses = ["NEW", "OFFERED", "ASSIGNED", "COMPLETED"] as const;
export const offerStatuses = ["pending", "accepted", "rejected"] as const;
export const driverProgressStatuses = ["assigned", "en_route", "picked_up", "delivered"] as const;

export type LoadStatus = (typeof loadStatuses)[number];
export type OfferStatus = (typeof offerStatuses)[number];
export type DriverProgressStatus = (typeof driverProgressStatuses)[number];

export const vehicleTypeOptions = [
  "Sedan",
  "SUV",
  "Pickup",
  "Van",
  "Motorcycle",
  "Inoperable",
  "Enclosed Request",
] as const;

export const trailerTypeOptions = [
  "Open 3-car",
  "Open 5-car",
  "Open 7-car",
  "Enclosed",
  "Hotshot",
  "Single-car",
] as const;
