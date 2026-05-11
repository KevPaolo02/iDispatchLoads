import { InputError } from "@/lib/form-utils";

type ParsedCentralDispatchLoad = {
  pickup_city: string;
  pickup_state: string;
  delivery_city: string;
  delivery_state: string;
  vehicle_type: string;
  price: number;
  distance_miles: number | null;
  pickup_date: string;
  notes: string;
  externalLoadId: string | null;
};

function normalizeLines(input: string) {
  return input
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function findValueAfterLabel(lines: string[], label: string) {
  const normalizedLabel = label.toLowerCase();
  const index = lines.findIndex((line) => line.toLowerCase() === normalizedLabel);
  return index >= 0 ? lines[index + 1] ?? null : null;
}

function findLastValueAfterLabel(lines: string[], label: string) {
  const normalizedLabel = label.toLowerCase();
  const matches = lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => line.toLowerCase() === normalizedLabel);
  const match = matches.at(-1);
  return match ? lines[match.index + 1] ?? null : null;
}

function parseMoney(input: string) {
  const match = input.match(/\$\s*([\d,]+(?:\.\d{1,2})?)/);
  return match ? Number(match[1].replaceAll(",", "")) : null;
}

function parseDistance(lines: string[]) {
  const distanceLine = lines.find((line) => /\bmi\b/i.test(line) && /@\s*\$/.test(line));
  const match = distanceLine?.match(/([\d,]+)\s*mi/i);
  return match ? Number(match[1].replaceAll(",", "")) : null;
}

function parseLocation(rawValue: string | null, label: string) {
  if (!rawValue) {
    throw new InputError(`${label} location is missing from the pasted load.`);
  }

  const match = rawValue.match(/^([A-Z]{2})\s*:\s*([^,]+),?\s*(.*)$/i);

  if (!match) {
    throw new InputError(`${label} location could not be parsed.`);
  }

  return {
    state: match[1].toUpperCase(),
    city: titleCase(match[2]),
    postalCode: match[3]?.trim() || null,
    raw: rawValue,
  };
}

function parseDate(rawValue: string | null) {
  if (!rawValue || rawValue === "--") {
    return null;
  }

  const match = rawValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);

  if (!match) {
    return null;
  }

  const month = match[1].padStart(2, "0");
  const day = match[2].padStart(2, "0");
  const year = match[3].length === 2 ? `20${match[3]}` : match[3];

  return `${year}-${month}-${day}`;
}

function titleCase(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function inferVehicleType(vehicle: string | null, vehicleType: string | null) {
  const text = `${vehicle ?? ""} ${vehicleType ?? ""}`.toLowerCase();

  if (text.includes("motorcycle")) return "Motorcycle";
  if (text.includes("suv")) return "SUV";
  if (text.includes("pickup") || text.includes("truck")) return "Pickup";
  if (text.includes("van")) return "Van";
  if (text.includes("sedan")) return "Sedan";
  if (text.includes("coupe")) return "Coupe";
  if (text.includes("convertible")) return "Convertible";
  if (text.includes("inop") || text.includes("non-running")) return "Inoperable";

  return vehicleType || vehicle || "Vehicle";
}

function compactNotes(lines: Array<string | null | undefined>) {
  return lines.filter((line): line is string => Boolean(line && line.trim())).join("\n");
}

export function parseCentralDispatchLoad(input: string): ParsedCentralDispatchLoad {
  const lines = normalizeLines(input);

  if (lines.length < 8) {
    throw new InputError("Paste the full Central Dispatch load details first.");
  }

  const price = parseMoney(findLastValueAfterLabel(lines, "Price") ?? lines[0] ?? "");

  if (!price) {
    throw new InputError("Price is missing from the pasted load.");
  }

  const pickup = parseLocation(findLastValueAfterLabel(lines, "Pick-Up Location"), "Pickup");
  const delivery = parseLocation(findLastValueAfterLabel(lines, "Delivery Location"), "Delivery");
  const pickupDate = parseDate(findLastValueAfterLabel(lines, "Pick-Up on or After Date"));

  if (!pickupDate) {
    throw new InputError("Pickup date is missing or invalid in the pasted load.");
  }

  const vehicle = findLastValueAfterLabel(lines, "Vehicle") ?? findValueAfterLabel(lines, "Vehicle Info");
  const vehicleType = findLastValueAfterLabel(lines, "Vehicle Type");
  const distance = parseDistance(lines);
  const loadId = findLastValueAfterLabel(lines, "Load ID");
  const company = findLastValueAfterLabel(lines, "Company Name") ?? findValueAfterLabel(lines, "Company");
  const phone = findLastValueAfterLabel(lines, "Phone Number");
  const hours = findLastValueAfterLabel(lines, "Hours");
  const terms = findLastValueAfterLabel(lines, "Load-Specific Terms");
  const postedDate = findLastValueAfterLabel(lines, "Posted Date");
  const desiredDeliveryDate = findLastValueAfterLabel(lines, "Desired Delivery Date");
  const payment = lines.find((line) => /cash|certified|cod/i.test(line)) ?? null;
  const rateLine = lines.find((line) => /\bmi\b/i.test(line) && /@\s*\$/.test(line)) ?? null;

  return {
    pickup_city: pickup.city,
    pickup_state: pickup.state,
    delivery_city: delivery.city,
    delivery_state: delivery.state,
    vehicle_type: inferVehicleType(vehicle, vehicleType),
    price,
    distance_miles: distance,
    pickup_date: pickupDate,
    externalLoadId: loadId,
    notes: compactNotes([
      "Source: Central Dispatch paste",
      loadId ? `CD Load ID: ${loadId}` : null,
      vehicle ? `Vehicle: ${vehicle}` : null,
      vehicleType ? `Vehicle Type: ${vehicleType}` : null,
      `Pickup: ${pickup.raw}`,
      `Delivery: ${delivery.raw}`,
      payment ? `Payment: ${payment}` : null,
      rateLine ? `Rate: ${rateLine}` : null,
      company ? `Company: ${company}` : null,
      phone ? `Phone: ${phone}` : null,
      hours ? `Hours: ${hours}` : null,
      postedDate ? `Posted: ${postedDate}` : null,
      desiredDeliveryDate && desiredDeliveryDate !== "--" ? `Desired Delivery: ${desiredDeliveryDate}` : null,
      terms ? `Terms: ${terms}` : null,
    ]),
  };
}
