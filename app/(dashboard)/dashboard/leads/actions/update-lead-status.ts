"use server";

import { revalidatePath } from "next/cache";

import { requireDashboardSession } from "@/lib/auth";
import { updateLeadStatusFromFormData } from "@/lib/services";

export async function updateLeadStatusAction(formData: FormData) {
  await requireDashboardSession();
  await updateLeadStatusFromFormData(formData);
  revalidatePath("/dashboard/leads");
}
