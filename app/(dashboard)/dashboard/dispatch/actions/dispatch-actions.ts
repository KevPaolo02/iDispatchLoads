"use server";

import { revalidatePath } from "next/cache";

import {
  assignLoadToDriverFromFormData,
  createDriverFromFormData,
  createLoadFromFormData,
  updateDriverNotesFromFormData,
  updateDriverStatusFromFormData,
  updateLoadNotesFromFormData,
  updateLoadStatusFromFormData,
} from "@/lib/services";

export async function createDriverAction(formData: FormData) {
  await createDriverFromFormData(formData);
  revalidatePath("/dashboard/dispatch");
}

export async function createLoadAction(formData: FormData) {
  await createLoadFromFormData(formData);
  revalidatePath("/dashboard/dispatch");
}

export async function updateDriverStatusAction(formData: FormData) {
  await updateDriverStatusFromFormData(formData);
  revalidatePath("/dashboard/dispatch");
}

export async function saveDriverNotesAction(formData: FormData) {
  await updateDriverNotesFromFormData(formData);
  revalidatePath("/dashboard/dispatch");
}

export async function updateLoadStatusAction(formData: FormData) {
  await updateLoadStatusFromFormData(formData);
  revalidatePath("/dashboard/dispatch");
}

export async function saveLoadNotesAction(formData: FormData) {
  await updateLoadNotesFromFormData(formData);
  revalidatePath("/dashboard/dispatch");
}

export async function assignLoadAction(formData: FormData) {
  await assignLoadToDriverFromFormData(formData);
  revalidatePath("/dashboard/dispatch");
}
