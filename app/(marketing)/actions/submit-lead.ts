"use server";

import type { LeadSubmissionState } from "@/lib/types";
import { captureLeadFromFormData } from "@/lib/services";

export async function submitLeadAction(
  _previousState: LeadSubmissionState,
  formData: FormData,
): Promise<LeadSubmissionState> {
  return captureLeadFromFormData(formData);
}
