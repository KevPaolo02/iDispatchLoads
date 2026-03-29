import "server-only";

import type { UserRole } from "@/lib/types";
import { getRequiredEnv } from "@/lib/utils";

export type DashboardAuthRole = Extract<UserRole, "admin" | "dispatcher">;

export type DashboardCredential = {
  email: string;
  password: string;
  role: DashboardAuthRole;
};

export function getDashboardRoleLabel(role: DashboardAuthRole) {
  return role === "admin" ? "Owner" : "Dispatcher";
}

export function getDashboardCredentials(): DashboardCredential[] {
  return [
    {
      email: getRequiredEnv("OWNER_LOGIN_EMAIL").trim().toLowerCase(),
      password: getRequiredEnv("OWNER_LOGIN_PASSWORD"),
      role: "admin",
    },
    {
      email: getRequiredEnv("DISPATCHER_LOGIN_EMAIL").trim().toLowerCase(),
      password: getRequiredEnv("DISPATCHER_LOGIN_PASSWORD"),
      role: "dispatcher",
    },
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
