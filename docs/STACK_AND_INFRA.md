# Stack and Infrastructure

This document turns the product map into a practical execution stack for `iDispatchLoads.com`.

It is staged on purpose:

- `V1` = launch-ready lead machine
- `V2` = internal dispatch CRM
- `V3` = platform and portal expansion

The rule is the same as the product map:

Build only what is useful now, but choose services that reduce rebuild cost later.

## Core Principle

V1 should launch on the same foundation that V2 and V3 can grow from.

That means:

- production hosting now
- production database now
- basic analytics now
- observability now or immediately after launch
- communications staged in when they become operationally useful
- billing only when the business model needs it

## Required Services by Version

### V1: Required Now

- `GitHub`
  - Source control and deployment workflow.
- `Vercel`
  - Hosting for the Next.js marketing site and server actions.
- `Supabase`
  - Production Postgres database for structured lead storage.
- `PostHog`
  - Basic V1 analytics for page visits, CTA clicks, and form submissions.

### V1: Recommended Before or Shortly After Launch

- `Sentry`
  - Error tracking for production issues in the site and server actions.

### V2: Needed When CRM Work Starts

- internal dashboard auth
  - lightweight owner/dispatcher access to internal pages without exposing operations publicly.
- `Resend`
  - Outbound transactional email for follow-ups, notifications, and CRM communication.
- `Twilio`
  - SMS and voice workflows for dispatch communication and follow-up.

### V1: Operationally Useful Now

- `Resend`
  - Optional immediate email alert for new lead creation.
- `Twilio`
  - Optional immediate SMS alert for new lead creation.

### V3: Needed Later

- `Stripe`
  - Billing, invoicing, subscriptions, or payment workflows once the product includes financial flows.

## What Each Service Does

### GitHub

Needed in:

- `V1`
- `V2`
- `V3`

Purpose:

- version control
- pull requests
- deployment source for Vercel
- history of infrastructure and schema changes

### Vercel

Needed in:

- `V1`
- `V2`
- `V3`

Purpose:

- deploy the public marketing app now
- host server actions and future route handlers
- scale the Next.js app without changing the core deployment model later

### Supabase

Needed in:

- `V1`
- `V2`
- `V3`

Purpose:

- production Postgres database
- stores structured leads now
- grows into CRM and portal data later
- can support auth later if we adopt Supabase Auth for dashboard/portal users

### Internal Dashboard Auth

Needed in:

- `V2 dispatch-lite`

Purpose:

- protect internal leads, movement, and dispatch routes
- give the owner and hired dispatcher separate credentials
- stay lightweight until a fuller CRM or portal auth system is justified

### PostHog

Needed in:

- `V1`

Purpose:

- page visits
- CTA click tracking
- form submission tracking
- future funnel measurement for onboarding and portal usage

### Sentry

Needed in:

- `V1` recommended
- `V2`
- `V3`

Purpose:

- runtime error monitoring
- server action failure visibility
- deployment confidence during launch

### Resend

Needed in:

- `V2`

Purpose:

- outbound CRM notifications
- follow-up email flows
- future lead acknowledgment or onboarding email sequences

### Twilio

Needed in:

- `V2`
- `V3`

Purpose:

- dispatcher-to-driver communication
- SMS reminders
- call workflows or notifications

### Stripe

Needed in:

- `V3` or late `V2` if billing becomes productized

Purpose:

- subscriptions
- invoices
- payment collection
- future client billing workflows

## What Is Needed Right Now

Launch-ready V1 requires:

- GitHub repo
- Vercel project
- Supabase project
- PostHog project

Strongly recommended:

- Sentry project

Not required yet:

- Twilio
- Resend
- Stripe

## Current V1 Environment Variables

### Required for V1 launch

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

### Recommended for V1 observability

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `POSTHOG_API_KEY`
- `POSTHOG_HOST`
- `SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_DSN`
- `LEAD_ALERT_EMAIL_TO`
- `LEAD_ALERT_SMS_TO`

## V2 / V3 Environment Variables Later

- `AUTH_SESSION_SECRET`
- `OWNER_LOGIN_EMAIL`
- `OWNER_LOGIN_PASSWORD`
- `DISPATCHER_LOGIN_EMAIL`
- `DISPATCHER_LOGIN_PASSWORD`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Deployment Dependencies

### V1 deployment checklist

- GitHub repository connected to Vercel
- Vercel project configured with production environment variables
- Supabase project created
- lead schema migration applied in Supabase
- PostHog project created and keys added to Vercel
- production domain connected in Vercel
- DNS configured for `iDispatchLoads.com`

### V2 dispatch-lite operational checklist

- owner and dispatcher credentials added to Vercel
- internal dashboard login tested on production
- dispatch-lite migration applied
- movement board migration applied
- dispatcher-ready ops migration applied

## Observability and Analytics

### V1 now

- `PostHog`
  - page views
  - CTA clicks
  - lead form submissions
- `Vercel`
  - deploy logs
  - runtime logs

### V1 recommended

- `Sentry`
  - frontend and server-side exception capture

## Communication Tools

### V1 now

- no communication platform is required to launch the site
- manual follow-up is acceptable if operations are still lean

### V2 later

- `Resend` for structured outbound email
- `Twilio` for SMS and phone workflows

## Billing Tools

### Not needed in V1

Do not add billing infrastructure yet.

### Add later when needed

- `Stripe`
  - only after the business model needs productized billing, subscriptions, invoices, or portal payments

## Why This Stack Fits the Product Map

- `Supabase` gives V1 structured data that becomes V2 operational data.
- `Vercel` keeps deployment simple now and scalable later.
- `PostHog` gives immediate conversion visibility without requiring CRM features.
- `Sentry` reduces launch risk without changing product scope.
- `Resend`, `Twilio`, and `Stripe` are staged for when the business actually needs them.

This keeps V1 practical, keeps rebuild risk low, and avoids pretending the CRM or platform already exists.
