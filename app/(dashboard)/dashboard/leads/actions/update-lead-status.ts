"use server";

import { revalidatePath } from "next/cache";

import { updateLeadStatusFromFormData } from "@/lib/services";

export async function updateLeadStatusAction(formData: FormData) {
  await updateLeadStatusFromFormData(formData);
  revalidatePath("/dashboard/leads");
}
