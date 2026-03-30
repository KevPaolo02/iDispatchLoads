function normalizeWhatsAppNumber(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.replace(/[^\d]/g, "");
}

export function buildWhatsAppHref(
  number: string | null | undefined,
  message: string,
) {
  const normalizedNumber = normalizeWhatsAppNumber(number);

  if (!normalizedNumber) {
    return null;
  }

  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}
