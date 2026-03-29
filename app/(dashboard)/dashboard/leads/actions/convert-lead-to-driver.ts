"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireDashboardSession } from "@/lib/auth";
import { convertLeadToDriverFromFormData } from "@/lib/services";

export async function convertLeadToDriverAction(formData: FormData) {
  await requireDashboardSession();
  const result = await convertLeadToDriverFromFormData(formData);

  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/dispatch");
  revalidatePath("/dashboard/movement");

  redirect(`/dashboard/dispatch?leadId=${result.leadId}&driverId=${result.driverId}`);
}
