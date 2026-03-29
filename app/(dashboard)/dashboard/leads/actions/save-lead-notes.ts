"use server";

import { revalidatePath } from "next/cache";

import { requireDashboardSession } from "@/lib/auth";
import { updateLeadNotesFromFormData } from "@/lib/services";

export async function saveLeadNotesAction(formData: FormData) {
  await requireDashboardSession();
  await updateLeadNotesFromFormData(formData);
  revalidatePath("/dashboard/leads");
}
