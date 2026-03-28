import type { Lead, LeadStatus } from "@/lib/types/entities";

export type LeadFormField =
  | "firstName"
  | "lastName"
  | "phone"
  | "email"
  | "truckType"
  | "preferredLanes"
  | "notes";

export type LeadFormErrors = Partial<Record<LeadFormField, string>>;

export interface LeadFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  truckType: string;
  preferredLanes: string;
  notes: string;
}

export interface LeadCaptureInput {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  truckType: string;
  preferredLanes: string;
  notes: string | null;
  source: string;
  campaign: string | null;
}

export interface LeadCreateInput extends LeadCaptureInput {
  status: LeadStatus;
}

export interface LeadSubmissionState {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors: LeadFormErrors;
  values: LeadFormValues;
  leadId?: Lead["id"];
}

export const initialLeadFormValues: LeadFormValues = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  truckType: "",
  preferredLanes: "",
  notes: "",
};

export const initialLeadSubmissionState: LeadSubmissionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
  values: initialLeadFormValues,
};
