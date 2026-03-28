export function normalizeText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ");
}

export function normalizeOptionalText(value: FormDataEntryValue | null) {
  const normalized = normalizeText(value);
  return normalized.length > 0 ? normalized : null;
}

export function normalizeEmail(value: FormDataEntryValue | null) {
  return normalizeText(value).toLowerCase();
}

export function normalizePhone(value: FormDataEntryValue | null) {
  return normalizeText(value);
}
