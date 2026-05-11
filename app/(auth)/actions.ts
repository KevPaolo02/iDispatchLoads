"use server";

import { redirect } from "next/navigation";

import { InputError, requiredString } from "@/lib/form-utils";
import { createClient } from "@/lib/supabase/server";
import { withMessage } from "@/lib/utils";

function authRedirect(type: "error" | "success", message: string): never {
  redirect(withMessage("/login", type, message));
}

export async function signInAction(formData: FormData) {
  // B1: keep redirect() outside the try/catch so a NEXT_REDIRECT thrown by
  // a successful redirect cannot be caught and replaced with the generic
  // "Unable to sign in right now" message.
  let errorMessage: string | null = null;

  try {
    const email = requiredString(formData, "email", "Email");
    const password = requiredString(formData, "password", "Password");
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      errorMessage = error.message;
    }
  } catch (error) {
    if (error instanceof InputError) {
      errorMessage = error.message;
    } else {
      console.error("[signInAction] unexpected error", error);
      errorMessage = "Unable to sign in right now.";
    }
  }

  if (errorMessage) {
    authRedirect("error", errorMessage);
  }

  redirect("/");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
