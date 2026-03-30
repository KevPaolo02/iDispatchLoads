"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { submitLeadAction } from "@/app/(marketing)/actions/submit-lead";
import { initialLeadSubmissionState } from "@/lib/types";
import { trackLeadConversion } from "@/lib/utils/ad-tracking";
import { buildWhatsAppHref } from "@/lib/utils";

type ContactFormProps = {
  buttonLabel?: string;
  pendingLabel?: string;
  successMessage?: string;
  helperText?: string;
  whatsAppLabel?: string;
  whatsAppMessage?: string;
  idPrefix?: string;
  formLocation?: string;
  compact?: boolean;
  showNotes?: boolean;
  showWhatsAppButton?: boolean;
  labels?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    truckType: string;
    preferredLanes: string;
    notes: string;
  };
  placeholders?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    truckType: string;
    preferredLanes: string;
    notes: string;
  };
};

type FieldErrorProps = {
  message?: string;
};

function FieldError({ message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-rose-600">{message}</p>;
}

function getTrackingDefaults() {
  if (typeof window === "undefined") {
    return {
      source: "website",
      campaign: "",
    };
  }

  const params = new URLSearchParams(window.location.search);

  return {
    source: params.get("utm_source")?.trim() || "website",
    campaign: params.get("utm_campaign")?.trim() || "",
  };
}

export function ContactForm({
  buttonLabel = "Get Started",
  pendingLabel = "Submitting...",
  successMessage,
  helperText,
  whatsAppLabel = "Chat on WhatsApp",
  whatsAppMessage,
  idPrefix = "contact",
  formLocation = "marketing_contact_form",
  compact = false,
  showNotes = true,
  showWhatsAppButton = true,
  labels = {
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone",
    truckType: "Truck / Trailer Type",
    preferredLanes: "Preferred Lanes / Northeast Coverage",
    notes: "Notes",
  },
  placeholders = {
    firstName: "First name",
    lastName: "Last name",
    email: "name@email.com",
    phone: "(555) 123-4567",
    truckType: "Car hauler, hotshot, dry van...",
    preferredLanes: "NY to PA, through NJ, CT corridor...",
    notes:
      "Tell us about your operation, your home base, and how you run NY / NJ / CT / PA lanes.",
  },
}: ContactFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitLeadAction,
    initialLeadSubmissionState,
  );
  const [tracking] = useState(getTrackingDefaults);
  const formRef = useRef<HTMLFormElement>(null);
  const lastTrackedLeadId = useRef<string | undefined>(undefined);
  const whatsAppHref = buildWhatsAppHref(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    whatsAppMessage ?? "Hello, I want to review my operation with iDispatchLoads.",
  );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    if (state.leadId && lastTrackedLeadId.current === state.leadId) {
      return;
    }

    trackLeadConversion({
      lead_id: state.leadId,
      form_location: formLocation,
    });

    lastTrackedLeadId.current = state.leadId;
  }, [formLocation, state.leadId, state.status]);

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      className={`rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_60px_-35px_rgba(15,23,42,0.35)] ${
        compact ? "p-5 sm:p-6" : "p-8"
      }`}
    >
      <input type="hidden" name="source" value={tracking.source} />
      <input type="hidden" name="campaign" value={tracking.campaign} />

      <div className={`grid ${compact ? "gap-4" : "gap-5"}`}>
        {helperText ? (
          <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
            {helperText}
          </div>
        ) : null}

        <div className={`grid ${compact ? "gap-4 sm:grid-cols-2" : "gap-5 sm:grid-cols-2"}`}>
          <div>
            <label
              htmlFor={`${idPrefix}-firstName`}
              className="text-sm font-semibold text-slate-800"
            >
              {labels.firstName}
            </label>
            <input
              id={`${idPrefix}-firstName`}
              name="firstName"
              type="text"
              required
              placeholder={placeholders.firstName}
              defaultValue={state.values.firstName}
              aria-invalid={Boolean(state.fieldErrors.firstName)}
              aria-describedby={
                state.fieldErrors.firstName
                  ? `${idPrefix}-firstName-error`
                  : undefined
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:bg-white"
            />
            <div id={`${idPrefix}-firstName-error`}>
              <FieldError message={state.fieldErrors.firstName} />
            </div>
          </div>

          <div>
            <label
              htmlFor={`${idPrefix}-lastName`}
              className="text-sm font-semibold text-slate-800"
            >
              {labels.lastName}
            </label>
            <input
              id={`${idPrefix}-lastName`}
              name="lastName"
              type="text"
              required
              placeholder={placeholders.lastName}
              defaultValue={state.values.lastName}
              aria-invalid={Boolean(state.fieldErrors.lastName)}
              aria-describedby={
                state.fieldErrors.lastName ? `${idPrefix}-lastName-error` : undefined
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:bg-white"
            />
            <div id={`${idPrefix}-lastName-error`}>
              <FieldError message={state.fieldErrors.lastName} />
            </div>
          </div>
        </div>

        <div className={`grid ${compact ? "gap-4 sm:grid-cols-2" : "gap-5 sm:grid-cols-2"}`}>
          <div>
            <label
              htmlFor={`${idPrefix}-email`}
              className="text-sm font-semibold text-slate-800"
            >
              {labels.email}
            </label>
            <input
              id={`${idPrefix}-email`}
              name="email"
              type="email"
              required
              placeholder={placeholders.email}
              defaultValue={state.values.email}
              aria-invalid={Boolean(state.fieldErrors.email)}
              aria-describedby={
                state.fieldErrors.email ? `${idPrefix}-email-error` : undefined
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:bg-white"
            />
            <div id={`${idPrefix}-email-error`}>
              <FieldError message={state.fieldErrors.email} />
            </div>
          </div>

          <div>
            <label
              htmlFor={`${idPrefix}-phone`}
              className="text-sm font-semibold text-slate-800"
            >
              {labels.phone}
            </label>
            <input
              id={`${idPrefix}-phone`}
              name="phone"
              type="tel"
              required
              placeholder={placeholders.phone}
              defaultValue={state.values.phone}
              aria-invalid={Boolean(state.fieldErrors.phone)}
              aria-describedby={
                state.fieldErrors.phone ? `${idPrefix}-phone-error` : undefined
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:bg-white"
            />
            <div id={`${idPrefix}-phone-error`}>
              <FieldError message={state.fieldErrors.phone} />
            </div>
          </div>
        </div>

        <div className={`grid ${compact ? "gap-4 sm:grid-cols-2" : "gap-5 sm:grid-cols-2"}`}>
          <div>
            <label
              htmlFor={`${idPrefix}-truckType`}
              className="text-sm font-semibold text-slate-800"
            >
              {labels.truckType}
            </label>
            <input
              id={`${idPrefix}-truckType`}
              name="truckType"
              type="text"
              required
              placeholder={placeholders.truckType}
              defaultValue={state.values.truckType}
              aria-invalid={Boolean(state.fieldErrors.truckType)}
              aria-describedby={
                state.fieldErrors.truckType
                  ? `${idPrefix}-truckType-error`
                  : undefined
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:bg-white"
            />
            <div id={`${idPrefix}-truckType-error`}>
              <FieldError message={state.fieldErrors.truckType} />
            </div>
          </div>

          <div>
            <label
              htmlFor={`${idPrefix}-preferredLanes`}
              className="text-sm font-semibold text-slate-800"
            >
              {labels.preferredLanes}
            </label>
            <input
              id={`${idPrefix}-preferredLanes`}
              name="preferredLanes"
              type="text"
              required
              placeholder={placeholders.preferredLanes}
              defaultValue={state.values.preferredLanes}
              aria-invalid={Boolean(state.fieldErrors.preferredLanes)}
              aria-describedby={
                state.fieldErrors.preferredLanes
                  ? `${idPrefix}-preferredLanes-error`
                  : undefined
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:bg-white"
            />
            <div id={`${idPrefix}-preferredLanes-error`}>
              <FieldError message={state.fieldErrors.preferredLanes} />
            </div>
          </div>
        </div>

        {showNotes ? (
          <div>
            <label
              htmlFor={`${idPrefix}-notes`}
              className="text-sm font-semibold text-slate-800"
            >
              {labels.notes}
            </label>
            <textarea
              id={`${idPrefix}-notes`}
              name="notes"
              rows={compact ? 4 : 6}
              placeholder={placeholders.notes}
              defaultValue={state.values.notes}
              aria-invalid={Boolean(state.fieldErrors.notes)}
              aria-describedby={
                state.fieldErrors.notes ? `${idPrefix}-notes-error` : undefined
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:bg-white"
            />
            <div id={`${idPrefix}-notes-error`}>
              <FieldError message={state.fieldErrors.notes} />
            </div>
          </div>
        ) : (
          <input type="hidden" name="notes" value="" />
        )}

        {state.status === "success" ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            {successMessage ?? state.message}
          </div>
        ) : null}

        {state.status === "error" && state.message ? (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {state.message}
          </div>
        ) : null}

        <div className={`grid gap-3 ${showWhatsAppButton ? "sm:grid-cols-2" : ""}`}>
          <button
            type="submit"
            disabled={isPending}
            data-analytics-event="cta_clicked"
            data-analytics-label={buttonLabel}
            data-analytics-location="lead-form"
            className="inline-flex justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? pendingLabel : buttonLabel}
          </button>

          {showWhatsAppButton && whatsAppHref ? (
            <a
              href={whatsAppHref}
              target="_blank"
              rel="noreferrer"
              data-analytics-event="cta_clicked"
              data-analytics-label={whatsAppLabel}
              data-analytics-location="lead-form-whatsapp"
              className="inline-flex justify-center rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-100"
            >
              {whatsAppLabel}
            </a>
          ) : null}
        </div>
      </div>
    </form>
  );
}
