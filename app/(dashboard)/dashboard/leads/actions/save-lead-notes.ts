"use server";

import { revalidatePath } from "next/cache";

import { updateLeadNotesFromFormData } from "@/lib/services";

export async function saveLeadNotesAction(formData: FormData) {
  await updateLeadNotesFromFormData(formData);
  revalidatePath("/dashboard/leads");
}
