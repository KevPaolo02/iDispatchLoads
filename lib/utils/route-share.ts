import type { Load } from "@/lib/types";

function compactAddress(parts: Array<string | null | undefined>) {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(", ");
}

export function getLoadPickupAddress(load: Load) {
  return (
    compactAddress([load.pickupCity, load.pickupState, load.pickupZip]) ||
    load.origin
  );
}

export function getLoadDeliveryAddress(load: Load) {
  return (
    compactAddress([load.deliveryCity, load.deliveryState, load.deliveryZip]) ||
    load.destination
  );
}

export function buildGoogleMapsRouteUrl(load: Load) {
  const params = new URLSearchParams({
    api: "1",
    origin: getLoadPickupAddress(load),
    destination: getLoadDeliveryAddress(load),
    travelmode: "driving",
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function buildDriverRouteMessage(load: Load) {
  const lines = [
    `Load: ${load.origin} -> ${load.destination}`,
    `Pickup: ${getLoadPickupAddress(load)}`,
    `Delivery: ${getLoadDeliveryAddress(load)}`,
    load.pickupDate ? `Pickup time: ${load.pickupDate}` : null,
    load.deliveryDate ? `Delivery time: ${load.deliveryDate}` : null,
    load.referenceNumber ? `Reference: ${load.referenceNumber}` : null,
    load.contactName ? `Contact: ${load.contactName}` : null,
    load.contactPhone ? `Contact phone: ${load.contactPhone}` : null,
    `Route: ${buildGoogleMapsRouteUrl(load)}`,
  ];

  return lines.filter(Boolean).join("\n");
}
