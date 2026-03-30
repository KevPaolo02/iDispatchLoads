"use server";

import { revalidatePath } from "next/cache";

import { requireDashboardSession } from "@/lib/auth";
import {
  assignLoadToDriverFromFormData,
  createProblemFlagFromFormData,
  createDriverFromFormData,
  createLoadFromFormData,
  createLoadVehicleFromFormData,
  deleteLoadVehicleFromFormData,
  resolveProblemFlagFromFormData,
  updateDriverNotesFromFormData,
  updateDriverProfileFromFormData,
  updateDriverStatusFromFormData,
  updateLoadNotesFromFormData,
  updateLoadOperationalFromFormData,
  updateLoadStatusFromFormData,
  updateLoadVehicleFromFormData,
} from "@/lib/services";

export async function createDriverAction(formData: FormData) {
  await requireDashboardSession();
  await createDriverFromFormData(formData);
  revalidatePath("/dashboard/dispatch");
  revalidatePath("/dashboard/movement");
  revalidatePath("/dashboard");
}

export async function createLoadAction(formData: FormData) {
  await requireDashboardSession();
  await createLoadFromFormData(formData);
  revalidatePath("/dashboard/dispatch");
  revalidatePath("/dashboard/movement");
  revalidatePath("/dashboard");
}

export async function updateDriverStatusAction(formData: FormData) {
  await requireDashboardSession();
  await updateDriverStatusFromFormData(formData);
  revalidatePath("/dashboard/dispatch");
  revalidatePath("/dashboard/movement");
  revalidatePath("/dashboard");
}

export async function saveDriverNotesAction(formData: FormData) {
  await requireDashboardSession();
  await updateDriverNotesFromFormData(formData);
  revalidatePath("/dashboard/dispatch");
  revalidatePath("/dashboard/movement");
}

export async function saveDriverProfileAction(formData: FormData) {
  await requireDashboardSession();
  const driverId = String(formData.get("driverId") ?? "");
  await updateDriverProfileFromFormData(formData);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/dispatch");
  revalidatePath("/dashboard/movement");
  if (driverId) {
    revalidatePath(`/dashboard/units/${driverId}`);
  }
}

export async function updateLoadStatusAction(formData: FormData) {
  await requireDashboardSession();
  const loadId = String(formData.get("loadId") ?? "");
  await updateLoadStatusFromFormData(formData);
  revalidatePath("/dashboard/dispatch");
  if (loadId) {
    revalidatePath(`/dashboard/dispatch/${loadId}`);
  }
  revalidatePath("/dashboard/movement");
  revalidatePath("/dashboard");
}

export async function saveLoadNotesAction(formData: FormData) {
  await requireDashboardSession();
  const loadId = String(formData.get("loadId") ?? "");
  await updateLoadNotesFromFormData(formData);
  revalidatePath("/dashboard/dispatch");
  if (loadId) {
    revalidatePath(`/dashboard/dispatch/${loadId}`);
  }
  revalidatePath("/dashboard/movement");
}

export async function assignLoadAction(formData: FormData) {
  await requireDashboardSession();
  const loadId = String(formData.get("loadId") ?? "");
  await assignLoadToDriverFromFormData(formData);
  revalidatePath("/dashboard/dispatch");
  if (loadId) {
    revalidatePath(`/dashboard/dispatch/${loadId}`);
  }
  revalidatePath("/dashboard/movement");
  revalidatePath("/dashboard");
}

export async function saveLoadDetailsAction(formData: FormData) {
  await requireDashboardSession();
  const loadId = String(formData.get("loadId") ?? "");
  await updateLoadOperationalFromFormData(formData);
  revalidatePath("/dashboard/dispatch");
  if (loadId) {
    revalidatePath(`/dashboard/dispatch/${loadId}`);
  }
  revalidatePath("/dashboard/movement");
  revalidatePath("/dashboard");
}

export async function createLoadVehicleAction(formData: FormData) {
  await requireDashboardSession();
  const loadId = String(formData.get("loadId") ?? "");
  await createLoadVehicleFromFormData(formData);
  revalidatePath("/dashboard/dispatch");
  if (loadId) {
    revalidatePath(`/dashboard/dispatch/${loadId}`);
  }
  revalidatePath("/dashboard/movement");
}

export async function updateLoadVehicleAction(formData: FormData) {
  await requireDashboardSession();
  await updateLoadVehicleFromFormData(formData);
  revalidatePath("/dashboard/dispatch");
  revalidatePath("/dashboard/movement");
}

export async function deleteLoadVehicleAction(formData: FormData) {
  await requireDashboardSession();
  await deleteLoadVehicleFromFormData(formData);
  revalidatePath("/dashboard/dispatch");
  revalidatePath("/dashboard/movement");
}

export async function createLoadProblemFlagAction(formData: FormData) {
  await requireDashboardSession();
  const entityId = String(formData.get("entityId") ?? "");
  await createProblemFlagFromFormData(formData);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/dispatch");
  if (entityId) {
    revalidatePath(`/dashboard/dispatch/${entityId}`);
  }
  revalidatePath("/dashboard/movement");
}

export async function resolveLoadProblemFlagAction(formData: FormData) {
  await requireDashboardSession();
  await resolveProblemFlagFromFormData(formData);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/dispatch");
  revalidatePath("/dashboard/movement");
}
