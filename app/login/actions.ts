"use server";

import { redirect } from "next/navigation";

import { createDashboardSession, findDashboardCredential } from "@/lib/auth";
import { normalizeEmail, normalizeText } from "@/lib/utils";

export type LoginActionState = {
  error: string | null;
};

const DEFAULT_LOGIN_STATE: LoginActionState = {
  error: null,
};

function getSafeNextPath(value: string) {
  if (value.startsWith("/dashboard")) {
    return value;
  }

  return "/dashboard";
}

export async function loginAction(
  previousState: LoginActionState = DEFAULT_LOGIN_STATE,
  formData: FormData,
): Promise<LoginActionState> {
  void previousState;
  const email = normalizeEmail(formData.get("email"));
  const password = normalizeText(formData.get("password"));
  const nextPath = getSafeNextPath(normalizeText(formData.get("next")));

  if (!email || !password) {
    return {
      error: "Enter the dashboard email and password.",
    };
  }

  const credential = findDashboardCredential(email, password);

  if (!credential) {
    return {
      error: "The dashboard login was not recognized.",
    };
  }

  await createDashboardSession(credential);
  redirect(nextPath);
}
