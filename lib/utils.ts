export function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}

export function formatCurrency(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function routeLabel(input: {
  pickup_city: string;
  pickup_state: string;
  delivery_city: string;
  delivery_state: string;
}) {
  return `${input.pickup_city}, ${input.pickup_state} -> ${input.delivery_city}, ${input.delivery_state}`;
}

export function withMessage(path: string, type: "error" | "success", message: string) {
  const params = new URLSearchParams();
  params.set(type, message);
  return `${path}?${params.toString()}`;
}

/**
 * Restrict a `return_to` value to safe internal app paths.
 *
 * Hidden form inputs are user-controlled. Without this guard a crafted
 * `return_to=//evil.com` or `return_to=https://evil.com` becomes an
 * open-redirect surface in every server action.
 */
export function safeReturnTo(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  if (value.length === 0) return fallback;
  if (!value.startsWith("/")) return fallback;
  // protocol-relative URLs and Windows-style backslashes
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  // any whitespace, control chars, or backslashes
  if (/[\s\\\x00-\x1f]/.test(value)) return fallback;
  return value;
}

export function normalizeArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string" && value.length > 0) {
    return [value];
  }

  return [];
}
