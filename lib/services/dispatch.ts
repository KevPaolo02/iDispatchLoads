import {
  assignLoadToDriver,
  createDriver,
  createLoad,
  getDriverBySourceLeadId,
  getLeadById,
  updateLeadActivity,
  updateDriverNotes,
  updateDriverStatus,
  updateLoadNotes,
  updateLoadStatus,
} from "@/lib/db";
import type {
  DispatchLoadStatus,
  DriverCreateInput,
  DriverNotesUpdateInput,
  DriverStatus,
  LeadActivityUpdateInput,
  LeadToDriverConversionInput,
  LoadAssignmentInput,
  LoadCreateInput,
  LoadNotesUpdateInput,
  LoadStatusUpdateInput,
  DriverStatusUpdateInput,
} from "@/lib/types";
import {
  dispatchLoadStatuses,
  driverStatuses,
} from "@/lib/types";
import { normalizeOptionalText, normalizePhone, normalizeText } from "@/lib/utils";
import { z } from "zod";

const driverCreateSchema = z.object({
  sourceLeadId: z.string().uuid().nullable(),
  company: z
    .string()
    .min(1, "Company is required.")
    .max(120, "Company must be under 120 characters."),
  driverName: z
    .string()
    .min(1, "Driver name is required.")
    .max(120, "Driver name must be under 120 characters."),
  phone: z
    .string()
    .min(1, "Phone is required.")
    .refine((value) => value.replace(/\D/g, "").length >= 7, {
      message: "Enter a valid phone number.",
    }),
  truckType: z
    .string()
    .min(1, "Truck type is required.")
    .max(120, "Truck type must be under 120 characters."),
  preferredLanes: z
    .string()
    .max(200, "Preferred lanes must be under 200 characters.")
    .nullable(),
  homeBase: z
    .string()
    .min(1, "Home base is required.")
    .max(120, "Home base must be under 120 characters."),
  status: z.enum(driverStatuses),
  notes: z.string().max(1000, "Notes must be under 1,000 characters.").nullable(),
});

const leadToDriverConversionSchema = z.object({
  leadId: z.string().uuid("Invalid lead id."),
  company: z
    .string()
    .min(1, "Company is required.")
    .max(120, "Company must be under 120 characters."),
  homeBase: z
    .string()
    .min(1, "Home base is required.")
    .max(120, "Home base must be under 120 characters."),
});

const loadCreateSchema = z.object({
  driverId: z.string().uuid().nullable(),
  sourceLeadId: z.string().uuid().nullable(),
  company: z
    .string()
    .min(1, "Company is required.")
    .max(120, "Company must be under 120 characters."),
  origin: z
    .string()
    .min(1, "Origin is required.")
    .max(160, "Origin must be under 160 characters."),
  destination: z
    .string()
    .min(1, "Destination is required.")
    .max(160, "Destination must be under 160 characters."),
  pickupDate: z.string().min(1, "Pickup date is required."),
  deliveryDate: z.string().nullable(),
  broker: z
    .string()
    .min(1, "Broker is required.")
    .max(120, "Broker must be under 120 characters."),
  rate: z.number().nonnegative("Rate must be zero or greater.").nullable(),
  status: z.enum(dispatchLoadStatuses),
  notes: z.string().max(1000, "Notes must be under 1,000 characters.").nullable(),
});

const driverStatusUpdateSchema = z.object({
  driverId: z.string().uuid("Invalid driver id."),
  status: z.enum(driverStatuses),
});

const driverNotesUpdateSchema = z.object({
  driverId: z.string().uuid("Invalid driver id."),
  notes: z
    .string()
    .max(1000, "Notes must be under 1,000 characters.")
    .nullable(),
});

const loadStatusUpdateSchema = z.object({
  loadId: z.string().uuid("Invalid load id."),
  status: z.enum(dispatchLoadStatuses),
});

const loadNotesUpdateSchema = z.object({
  loadId: z.string().uuid("Invalid load id."),
  notes: z
    .string()
    .max(1000, "Notes must be under 1,000 characters.")
    .nullable(),
});

const loadAssignmentSchema = z.object({
  loadId: z.string().uuid("Invalid load id."),
  driverId: z.string().uuid("Invalid driver id.").nullable(),
});

function normalizeOptionalUuid(value: FormDataEntryValue | null) {
  const normalized = normalizeText(value);
  return normalized.length > 0 ? normalized : null;
}

function normalizeOptionalDateTime(value: FormDataEntryValue | null) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return null;
  }

  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function normalizeOptionalNumber(value: FormDataEntryValue | null) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function parseDriverCreateInput(formData: FormData): DriverCreateInput {
  return {
    sourceLeadId: null,
    company: normalizeText(formData.get("company")),
    driverName: normalizeText(formData.get("driverName")),
    phone: normalizePhone(formData.get("phone")),
    truckType: normalizeText(formData.get("truckType")),
    preferredLanes: null,
    homeBase: normalizeText(formData.get("homeBase")),
    status: (normalizeText(formData.get("status")) || "available") as DriverStatus,
    notes: normalizeOptionalText(formData.get("notes")),
  };
}

function parseLoadCreateInput(formData: FormData): LoadCreateInput {
  return {
    driverId: normalizeOptionalUuid(formData.get("driverId")),
    sourceLeadId: normalizeOptionalUuid(formData.get("sourceLeadId")),
    company: normalizeText(formData.get("company")),
    origin: normalizeText(formData.get("origin")),
    destination: normalizeText(formData.get("destination")),
    pickupDate: normalizeOptionalDateTime(formData.get("pickupDate")),
    deliveryDate: normalizeOptionalDateTime(formData.get("deliveryDate")),
    broker: normalizeText(formData.get("broker")),
    rate: normalizeOptionalNumber(formData.get("rate")),
    status: (normalizeText(formData.get("status")) || "searching") as DispatchLoadStatus,
    notes: normalizeOptionalText(formData.get("notes")),
  };
}

export async function createDriverFromFormData(formData: FormData) {
  const validation = driverCreateSchema.safeParse(parseDriverCreateInput(formData));

  if (!validation.success) {
    console.error("[dispatch-driver] Invalid create request", {
      issues: validation.error.flatten().fieldErrors,
    });
    throw new Error("Invalid driver request.");
  }

  return createDriver(validation.data);
}

export async function createLoadFromFormData(formData: FormData) {
  const validation = loadCreateSchema.safeParse(parseLoadCreateInput(formData));

  if (!validation.success) {
    console.error("[dispatch-load] Invalid create request", {
      issues: validation.error.flatten().fieldErrors,
    });
    throw new Error("Invalid load request.");
  }

  return createLoad(validation.data);
}

export async function updateDriverStatusFromFormData(formData: FormData) {
  const validation = driverStatusUpdateSchema.safeParse({
    driverId: normalizeText(formData.get("driverId")),
    status: normalizeText(formData.get("status")),
  });

  if (!validation.success) {
    console.error("[dispatch-driver] Invalid status update request", {
      issues: validation.error.flatten().fieldErrors,
    });
    throw new Error("Invalid driver status update request.");
  }

  const input: DriverStatusUpdateInput = validation.data;
  return updateDriverStatus(input.driverId, input.status);
}

export async function updateDriverNotesFromFormData(formData: FormData) {
  const validation = driverNotesUpdateSchema.safeParse({
    driverId: normalizeText(formData.get("driverId")),
    notes: normalizeOptionalText(formData.get("notes")),
  });

  if (!validation.success) {
    console.error("[dispatch-driver] Invalid notes update request", {
      issues: validation.error.flatten().fieldErrors,
    });
    throw new Error("Invalid driver notes update request.");
  }

  const input: DriverNotesUpdateInput = validation.data;
  return updateDriverNotes(input);
}

export async function convertLeadToDriverFromFormData(formData: FormData) {
  const leadId = normalizeText(formData.get("leadId"));
  const leadIdValidation = z.string().uuid("Invalid lead id.").safeParse(leadId);

  if (!leadIdValidation.success) {
    console.error("[lead-to-driver] Invalid lead id", {
      issues: leadIdValidation.error.flatten().fieldErrors,
    });
    throw new Error("Invalid lead conversion request.");
  }

  const existingDriver = await getDriverBySourceLeadId(leadIdValidation.data);

  if (existingDriver) {
    return {
      leadId: leadIdValidation.data,
      driverId: existingDriver.id,
    };
  }

  const validation = leadToDriverConversionSchema.safeParse({
    leadId: leadIdValidation.data,
    company: normalizeText(formData.get("company")),
    homeBase: normalizeText(formData.get("homeBase")),
  });

  if (!validation.success) {
    console.error("[lead-to-driver] Invalid conversion request", {
      issues: validation.error.flatten().fieldErrors,
    });
    throw new Error("Invalid lead conversion request.");
  }

  const input: LeadToDriverConversionInput = validation.data;
  const lead = await getLeadById(input.leadId);

  if (!lead) {
    throw new Error("Lead not found.");
  }

  const driver = await createDriver({
    sourceLeadId: lead.id,
    company: input.company,
    driverName: `${lead.firstName} ${lead.lastName}`.trim(),
    phone: lead.phone,
    truckType: lead.truckType,
    preferredLanes: lead.preferredLanes,
    homeBase: input.homeBase,
    status: "available",
    notes: lead.notes,
  });

  const leadActivityInput: LeadActivityUpdateInput = {
    leadId: lead.id,
    status: "onboarded",
    notes: lead.notes,
    lastContactedAt: new Date().toISOString(),
  };

  await updateLeadActivity(leadActivityInput);

  return {
    leadId: lead.id,
    driverId: driver.id,
  };
}

export async function updateLoadStatusFromFormData(formData: FormData) {
  const validation = loadStatusUpdateSchema.safeParse({
    loadId: normalizeText(formData.get("loadId")),
    status: normalizeText(formData.get("status")),
  });

  if (!validation.success) {
    console.error("[dispatch-load] Invalid status update request", {
      issues: validation.error.flatten().fieldErrors,
    });
    throw new Error("Invalid load status update request.");
  }

  const input: LoadStatusUpdateInput = validation.data;
  return updateLoadStatus(input.loadId, input.status);
}

export async function updateLoadNotesFromFormData(formData: FormData) {
  const validation = loadNotesUpdateSchema.safeParse({
    loadId: normalizeText(formData.get("loadId")),
    notes: normalizeOptionalText(formData.get("notes")),
  });

  if (!validation.success) {
    console.error("[dispatch-load] Invalid notes update request", {
      issues: validation.error.flatten().fieldErrors,
    });
    throw new Error("Invalid load notes update request.");
  }

  const input: LoadNotesUpdateInput = validation.data;
  return updateLoadNotes(input);
}

export async function assignLoadToDriverFromFormData(formData: FormData) {
  const validation = loadAssignmentSchema.safeParse({
    loadId: normalizeText(formData.get("loadId")),
    driverId: normalizeOptionalUuid(formData.get("driverId")),
  });

  if (!validation.success) {
    console.error("[dispatch-load] Invalid assignment request", {
      issues: validation.error.flatten().fieldErrors,
    });
    throw new Error("Invalid load assignment request.");
  }

  const input: LoadAssignmentInput = validation.data;
  return assignLoadToDriver(input.loadId, input.driverId);
}
