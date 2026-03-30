import "server-only";

import type { UserRole } from "@/lib/types";
import { getRequiredEnv } from "@/lib/utils";

export type DashboardAuthRole = Extract<UserRole, "admin" | "dispatcher">;

export type DashboardCredential = {
  email: string;
  password: string;
  role: DashboardAuthRole;
  label?: string | null;
};

export type DispatcherAccountOption = {
  email: string;
  label: string;
};

export function getDashboardRoleLabel(role: DashboardAuthRole) {
  return role === "admin" ? "Owner" : "Dispatcher";
}

type DispatcherConfigRow = {
  email: string;
  password: string;
  label?: string;
};

function normalizeDispatcherRow(input: DispatcherConfigRow): DashboardCredential {
  return {
    email: input.email.trim().toLowerCase(),
    password: input.password,
    role: "dispatcher",
    label: input.label?.trim() || null,
  };
}

function getJsonDispatcherCredentials(): DashboardCredential[] {
  const raw = process.env.DISPATCHER_ACCOUNTS_JSON?.trim();

  if (!raw) {
    return [];
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      "DISPATCHER_ACCOUNTS_JSON must be valid JSON.",
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error("DISPATCHER_ACCOUNTS_JSON must be a JSON array.");
  }

  return parsed.map((row, index) => {
    if (
      !row ||
      typeof row !== "object" ||
      typeof row.email !== "string" ||
      typeof row.password !== "string"
    ) {
      throw new Error(
        `DISPATCHER_ACCOUNTS_JSON item ${index + 1} must include string email and password fields.`,
      );
    }

    return normalizeDispatcherRow(row as DispatcherConfigRow);
  });
}

export function getDispatcherCredentials(): DashboardCredential[] {
  const jsonCredentials = getJsonDispatcherCredentials();

  if (jsonCredentials.length > 0) {
    return jsonCredentials;
  }

  return [
    {
      email: getRequiredEnv("DISPATCHER_LOGIN_EMAIL").trim().toLowerCase(),
      password: getRequiredEnv("DISPATCHER_LOGIN_PASSWORD"),
      role: "dispatcher",
      label: null,
    },
  ];
}

export function getDispatcherAccountOptions(): DispatcherAccountOption[] {
  return getDispatcherCredentials().map((credential) => ({
    email: credential.email,
    label: credential.label?.trim() || credential.email,
  }));
}

export function getDashboardCredentials(): DashboardCredential[] {
  return [
    {
      email: getRequiredEnv("OWNER_LOGIN_EMAIL").trim().toLowerCase(),
      password: getRequiredEnv("OWNER_LOGIN_PASSWORD"),
      role: "admin",
      label: "Owner",
    },
    ...getDispatcherCredentials(),
  ];
}

export function findDashboardCredential(
  email: string,
  password: string,
): DashboardCredential | null {
  const normalizedEmail = email.trim().toLowerCase();

  return (
    getDashboardCredentials().find(
      (credential) =>
        credential.email === normalizedEmail && credential.password === password,
    ) ?? null
  );
}
