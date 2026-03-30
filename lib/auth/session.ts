import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  getDashboardRoleLabel,
  getDispatcherAccountOptions,
  type DashboardAuthRole,
  type DashboardCredential,
} from "@/lib/auth/config";
import { getRequiredEnv } from "@/lib/utils";

const DASHBOARD_SESSION_COOKIE = "idispatchloads_dashboard_session";
const DASHBOARD_SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

type DashboardSessionPayload = {
  email: string;
  role: DashboardAuthRole;
  exp: number;
};

export type DashboardSession = {
  email: string;
  role: DashboardAuthRole;
  roleLabel: string;
  expiresAt: number;
};

function getSessionSecret() {
  return getRequiredEnv("AUTH_SESSION_SECRET");
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

function encodeSession(payload: DashboardSessionPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function decodeSession(token: string): DashboardSession | null {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as DashboardSessionPayload;

    if (!parsed.email || !parsed.role || typeof parsed.exp !== "number") {
      return null;
    }

    if (parsed.exp <= Date.now()) {
      return null;
    }

    return {
      email: parsed.email,
      role: parsed.role,
      roleLabel: getDashboardRoleLabel(parsed.role),
      expiresAt: parsed.exp,
    };
  } catch {
    return null;
  }
}

export async function getDashboardSession(): Promise<DashboardSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(DASHBOARD_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return decodeSession(token);
}

export async function createDashboardSession(credential: DashboardCredential) {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + DASHBOARD_SESSION_TTL_SECONDS * 1000;
  const token = encodeSession({
    email: credential.email,
    role: credential.role,
    exp: expiresAt,
  });

  cookieStore.set(DASHBOARD_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DASHBOARD_SESSION_TTL_SECONDS,
  });
}

export async function clearDashboardSession() {
  const cookieStore = await cookies();
  cookieStore.delete(DASHBOARD_SESSION_COOKIE);
}

export async function requireDashboardSession() {
  const session = await getDashboardSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireOwnerSession() {
  const session = await requireDashboardSession();

  if (session.role !== "admin") {
    redirect("/dashboard");
  }

  return session;
}

export function canOverrideStatusTransitions(
  session: Pick<DashboardSession, "role"> | null,
) {
  return session?.role === "admin";
}

export function canEditFinancials(
  session: Pick<DashboardSession, "role"> | null,
) {
  return session?.role === "admin" || session?.role === "dispatcher";
}

export function isOwnerSession(
  session: Pick<DashboardSession, "role"> | null,
): boolean {
  return session?.role === "admin";
}

export function isDispatcherSession(
  session: Pick<DashboardSession, "role"> | null,
): boolean {
  return session?.role === "dispatcher";
}

export function getSessionScopedDispatcherEmail(
  session: Pick<DashboardSession, "role" | "email"> | null,
) {
  if (!session || session.role !== "dispatcher") {
    return null;
  }

  return session.email.trim().toLowerCase();
}

export function getKnownDispatcherEmails() {
  return getDispatcherAccountOptions().map((account) => account.email);
}
