const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class InputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InputError";
  }
}

function readValue(formData: FormData, key: string) {
  const rawValue = formData.get(key);
  if (typeof rawValue !== "string") {
    return "";
  }

  return rawValue.trim();
}

export function requiredString(formData: FormData, key: string, label: string) {
  const value = readValue(formData, key);

  if (!value) {
    throw new InputError(`${label} is required.`);
  }

  return value;
}

export function optionalString(formData: FormData, key: string) {
  const value = readValue(formData, key);
  return value.length > 0 ? value : null;
}

export function optionalNumber(formData: FormData, key: string) {
  const value = readValue(formData, key);

  if (!value) {
    return null;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new InputError(`"${key}" must be a valid number.`);
  }

  return parsed;
}

export function requiredNumber(formData: FormData, key: string, label: string) {
  const parsed = optionalNumber(formData, key);

  if (parsed === null) {
    throw new InputError(`${label} is required.`);
  }

  return parsed;
}

export function optionalUuid(formData: FormData, key: string) {
  const value = readValue(formData, key);

  if (!value) {
    return null;
  }

  if (!uuidPattern.test(value)) {
    throw new InputError(`"${key}" is invalid.`);
  }

  return value;
}

export function requiredUuid(formData: FormData, key: string, label: string) {
  const value = optionalUuid(formData, key);

  if (!value) {
    throw new InputError(`${label} is required.`);
  }

  return value;
}

export function requiredDate(formData: FormData, key: string, label: string) {
  const value = readValue(formData, key);

  if (!value) {
    throw new InputError(`${label} is required.`);
  }

  if (Number.isNaN(Date.parse(value))) {
    throw new InputError(`${label} must be a valid date.`);
  }

  return value;
}

export function booleanFromCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export function parsePreferredRoutes(input: string | null) {
  if (!input) {
    return [];
  }

  return input
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);
}

export function preferredRoutesInput(value: unknown) {
  if (!Array.isArray(value)) {
    return "";
  }

  return value.filter((item): item is string => typeof item === "string").join(", ");
}
