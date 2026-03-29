import "server-only";

import type { Lead } from "@/lib/types";
import { getOptionalEnv } from "@/lib/utils";

type NotificationResult = {
  channel: "email" | "sms";
  delivered: boolean;
  reason?: string;
};

function buildLeadSummary(lead: Lead) {
  return [
    `Lead ID: ${lead.id}`,
    `Name: ${lead.firstName} ${lead.lastName}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email}`,
    `Truck Type: ${lead.truckType}`,
    `Preferred Lanes: ${lead.preferredLanes}`,
    `Source: ${lead.source}`,
    `Campaign: ${lead.campaign ?? "none"}`,
    `Notes: ${lead.notes ?? "none"}`,
    `Created: ${lead.createdAt}`,
  ].join("\n");
}

async function sendLeadAlertEmail(lead: Lead): Promise<NotificationResult> {
  const apiKey = getOptionalEnv("RESEND_API_KEY");
  const from = getOptionalEnv("RESEND_FROM_EMAIL");
  const to = getOptionalEnv("LEAD_ALERT_EMAIL_TO");

  if (!apiKey || !from || !to) {
    return {
      channel: "email",
      delivered: false,
      reason: "missing_email_config",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `New iDispatchLoads lead: ${lead.firstName} ${lead.lastName}`,
      text: buildLeadSummary(lead),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend request failed: ${response.status} ${body}`);
  }

  return {
    channel: "email",
    delivered: true,
  };
}

async function sendLeadAlertSms(lead: Lead): Promise<NotificationResult> {
  const accountSid = getOptionalEnv("TWILIO_ACCOUNT_SID");
  const authToken = getOptionalEnv("TWILIO_AUTH_TOKEN");
  const from = getOptionalEnv("TWILIO_PHONE_NUMBER");
  const to = getOptionalEnv("LEAD_ALERT_SMS_TO");

  if (!accountSid || !authToken || !from || !to) {
    return {
      channel: "sms",
      delivered: false,
      reason: "missing_sms_config",
    };
  }

  const params = new URLSearchParams({
    From: from,
    To: to,
    Body: `New lead: ${lead.firstName} ${lead.lastName} | ${lead.phone} | ${lead.truckType} | ${lead.preferredLanes}`,
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Twilio request failed: ${response.status} ${body}`);
  }

  return {
    channel: "sms",
    delivered: true,
  };
}

export async function notifyOnLeadCreated(lead: Lead) {
  const results = await Promise.allSettled([
    sendLeadAlertEmail(lead),
    sendLeadAlertSms(lead),
  ]);

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      if (!result.value.delivered) {
        console.warn("[speed-to-lead] Notification skipped", {
          channel: result.value.channel,
          reason: result.value.reason,
          leadId: lead.id,
        });
      }

      return;
    }

    console.error("[speed-to-lead] Notification failed", {
      error: result.reason instanceof Error ? result.reason.message : String(result.reason),
      leadId: lead.id,
    });
  });
}
