"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { convertLeadToDriverFromFormData } from "@/lib/services";

export async function convertLeadToDriverAction(formData: FormData) {
  const result = await convertLeadToDriverFromFormData(formData);

  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/dispatch");

  redirect(`/dashboard/dispatch?leadId=${result.leadId}&driverId=${result.driverId}`);
}
