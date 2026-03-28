import { createLead } from "@/lib/db";
import type {
  LeadCreateInput,
  LeadFormErrors,
  LeadFormValues,
  LeadSubmissionState,
} from "@/lib/types";
import { captureServerAnalyticsEvent } from "@/lib/services/analytics";
import {
  normalizeEmail,
  normalizeOptionalText,
  normalizePhone,
  normalizeText,
} from "@/lib/utils";
import { z } from "zod";

const leadCaptureSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required.")
    .max(80, "First name must be under 80 characters."),
  lastName: z
    .string()
    .min(1, "Last name is required.")
    .max(80, "Last name must be under 80 characters."),
  phone: z
    .string()
    .min(1, "Phone is required.")
    .refine((value) => value.replace(/\D/g, "").length >= 7, {
      message: "Enter a valid phone number.",
    }),
  email: z.string().email("Enter a valid email address."),
  truckType: z
    .string()
    .min(1, "Truck type is required.")
    .max(120, "Truck type must be under 120 characters."),
  preferredLanes: z
    .string()
    .min(1, "Preferred lanes are required.")
    .max(200, "Preferred lanes must be under 200 characters."),
  notes: z
    .string()
    .max(1000, "Notes must be under 1,000 characters.")
    .nullable(),
  status: z.enum(["new", "contacted", "qualified", "onboarded", "lost"]),
  source: z.string().min(1).max(120),
  campaign: z.string().max(160).nullable(),
});

function mapInputToValues(input: LeadCreateInput): LeadFormValues {
  return {
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    email: input.email,
    truckType: input.truckType,
    preferredLanes: input.preferredLanes,
    notes: input.notes ?? "",
  };
}

export function extractLeadInput(formData: FormData): LeadCreateInput {
  return {
    firstName: normalizeText(formData.get("firstName")),
    lastName: normalizeText(formData.get("lastName")),
    phone: normalizePhone(formData.get("phone")),
    email: normalizeEmail(formData.get("email")),
    truckType: normalizeText(formData.get("truckType")),
    preferredLanes: normalizeText(formData.get("preferredLanes")),
    notes: normalizeOptionalText(formData.get("notes")),
    status: "new",
    source: normalizeText(formData.get("source")) || "website",
    campaign: normalizeOptionalText(formData.get("campaign")),
  };
}

export function validateLeadInput(input: LeadCreateInput) {
  const validation = leadCaptureSchema.safeParse(input);

  if (validation.success) {
    return {};
  }

  const fieldErrors: LeadFormErrors = {};
  const flattenedErrors = validation.error.flatten().fieldErrors;

  if (flattenedErrors.firstName?.[0]) {
    fieldErrors.firstName = flattenedErrors.firstName[0];
  }

  if (flattenedErrors.lastName?.[0]) {
    fieldErrors.lastName = flattenedErrors.lastName[0];
  }

  if (flattenedErrors.phone?.[0]) {
    fieldErrors.phone = flattenedErrors.phone[0];
  }

  if (flattenedErrors.email?.[0]) {
    fieldErrors.email = flattenedErrors.email[0];
  }

  if (flattenedErrors.truckType?.[0]) {
    fieldErrors.truckType = flattenedErrors.truckType[0];
  }

  if (flattenedErrors.preferredLanes?.[0]) {
    fieldErrors.preferredLanes = flattenedErrors.preferredLanes[0];
  }

  if (flattenedErrors.notes?.[0]) {
    fieldErrors.notes = flattenedErrors.notes[0];
  }

  return fieldErrors;
}

export function hasLeadValidationErrors(fieldErrors: LeadFormErrors) {
  return Object.keys(fieldErrors).length > 0;
}

export async function captureLeadFromFormData(formData: FormData): Promise<LeadSubmissionState> {
  const leadInput = extractLeadInput(formData);
  const fieldErrors = validateLeadInput(leadInput);
  const values = mapInputToValues(leadInput);

  if (hasLeadValidationErrors(fieldErrors)) {
    return {
      status: "error",
      message: "Please correct the highlighted fields and try again.",
      fieldErrors,
      values,
    };
  }

  try {
    const lead = await createLead(leadInput);

    await captureServerAnalyticsEvent({
      event: "lead_form_submitted",
      distinctId: lead.email,
      properties: {
        leadId: lead.id,
        truckType: lead.truckType,
        source: lead.source,
        campaign: lead.campaign,
        status: lead.status,
      },
    });

    return {
      status: "success",
      message:
        "Thanks. Your request has been received and our team will follow up shortly with next steps.",
      fieldErrors: {},
      values: {
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        truckType: "",
        preferredLanes: "",
        notes: "",
      },
      leadId: lead.id,
    };
  } catch (error) {
    console.error("[lead-capture] Failed to store lead", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      leadContext: {
        email: leadInput.email,
        phone: leadInput.phone,
        truckType: leadInput.truckType,
        preferredLanes: leadInput.preferredLanes,
        source: leadInput.source,
        campaign: leadInput.campaign,
        status: leadInput.status,
      },
    });

    return {
      status: "error",
      message:
        "We could not submit your request right now. Please try again in a moment or contact us directly.",
      fieldErrors: {},
      values,
    };
  }
}
