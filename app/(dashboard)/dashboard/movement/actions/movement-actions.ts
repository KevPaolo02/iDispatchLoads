"use server";

import { revalidatePath } from "next/cache";

import { requireDashboardSession } from "@/lib/auth";
import {
  assignLoadOpportunityToDriverFromFormData,
  createLoadOpportunityVehicleFromFormData,
  createProblemFlagFromFormData,
  createLoadOpportunityFromFormData,
  deleteLoadOpportunityVehicleFromFormData,
  resolveProblemFlagFromFormData,
  updateDriverMovementFromFormData,
  updateLoadOpportunityNotesFromFormData,
  updateLoadOpportunityOperationalFromFormData,
  updateLoadOpportunityStatusFromFormData,
  updateLoadOpportunityVehicleFromFormData,
} from "@/lib/services";

export async function updateDriverMovementAction(formData: FormData) {
  await requireDashboardSession();
  await updateDriverMovementFromFormData(formData);
  revalidatePath("/dashboard/movement");
  revalidatePath("/dashboard/dispatch");
  revalidatePath("/dashboard");
}

export async function createLoadOpportunityAction(formData: FormData) {
  await requireDashboardSession();
  await createLoadOpportunityFromFormData(formData);
  revalidatePath("/dashboard/movement");
  revalidatePath("/dashboard");
}

export async function updateLoadOpportunityStatusAction(formData: FormData) {
  await requireDashboardSession();
  const opportunityId = String(formData.get("opportunityId") ?? "");
  await updateLoadOpportunityStatusFromFormData(formData);
  revalidatePath("/dashboard/movement");
  if (opportunityId) {
    revalidatePath(`/dashboard/movement/${opportunityId}`);
  }
  revalidatePath("/dashboard/dispatch");
  revalidatePath("/dashboard");
}

export async function saveLoadOpportunityNotesAction(formData: FormData) {
  await requireDashboardSession();
  const opportunityId = String(formData.get("opportunityId") ?? "");
  await updateLoadOpportunityNotesFromFormData(formData);
  revalidatePath("/dashboard/movement");
  if (opportunityId) {
    revalidatePath(`/dashboard/movement/${opportunityId}`);
  }
}

export async function assignLoadOpportunityAction(formData: FormData) {
  await requireDashboardSession();
  const opportunityId = String(formData.get("opportunityId") ?? "");
  await assignLoadOpportunityToDriverFromFormData(formData);
  revalidatePath("/dashboard/movement");
  if (opportunityId) {
    revalidatePath(`/dashboard/movement/${opportunityId}`);
  }
  revalidatePath("/dashboard/dispatch");
  revalidatePath("/dashboard");
}

export async function saveLoadOpportunityDetailsAction(formData: FormData) {
  await requireDashboardSession();
  const opportunityId = String(formData.get("opportunityId") ?? "");
  await updateLoadOpportunityOperationalFromFormData(formData);
  revalidatePath("/dashboard/movement");
  if (opportunityId) {
    revalidatePath(`/dashboard/movement/${opportunityId}`);
  }
  revalidatePath("/dashboard/dispatch");
  revalidatePath("/dashboard");
}

export async function createLoadOpportunityVehicleAction(formData: FormData) {
  await requireDashboardSession();
  const opportunityId = String(formData.get("opportunityId") ?? "");
  await createLoadOpportunityVehicleFromFormData(formData);
  revalidatePath("/dashboard/movement");
  if (opportunityId) {
    revalidatePath(`/dashboard/movement/${opportunityId}`);
  }
}

export async function updateLoadOpportunityVehicleAction(formData: FormData) {
  await requireDashboardSession();
  await updateLoadOpportunityVehicleFromFormData(formData);
  revalidatePath("/dashboard/movement");
}

export async function deleteLoadOpportunityVehicleAction(formData: FormData) {
  await requireDashboardSession();
  await deleteLoadOpportunityVehicleFromFormData(formData);
  revalidatePath("/dashboard/movement");
}

export async function createOpportunityProblemFlagAction(formData: FormData) {
  await requireDashboardSession();
  const entityId = String(formData.get("entityId") ?? "");
  await createProblemFlagFromFormData(formData);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/movement");
  if (entityId) {
    revalidatePath(`/dashboard/movement/${entityId}`);
  }
  revalidatePath("/dashboard/dispatch");
}

export async function resolveOpportunityProblemFlagAction(formData: FormData) {
  await requireDashboardSession();
  await resolveProblemFlagFromFormData(formData);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/movement");
  revalidatePath("/dashboard/dispatch");
}
