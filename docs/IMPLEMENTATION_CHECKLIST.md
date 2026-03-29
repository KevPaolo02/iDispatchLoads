# Implementation Checklist

This checklist converts the current strategy into practical next steps for
`iDispatchLoads.com`.

## Current Stage

- `V1` lead machine: live foundation complete
- `V2` dispatch-lite board: implemented
- `V3`: not started, intentionally deferred

## Immediate Execution Priorities

### Revenue / Speed To Lead

- [x] Store leads in Supabase first
- [x] Keep lead creation from failing when notifications fail
- [x] Trigger internal email/SMS lead alerts server-side
- [ ] Configure production Resend/Twilio env vars
- [ ] Verify alert delivery in production
- [ ] Improve phone normalization to E.164-style formatting

### Lead Operations

- [x] Internal leads review page
- [x] Lightweight lead status updates
- [x] Lightweight lead notes editing
- [x] `last_contacted_at` support
- [x] Lead-to-load traceability with `loads.source_lead_id`
- [x] Lead-to-driver conversion flow
- [ ] Highlight uncontacted leads with an ops-first metric

### Dispatch Lite

- [x] Drivers table
- [x] Loads table
- [x] Create driver
- [x] Create load
- [x] Assign load to driver
- [x] Update driver status
- [x] Update load status
- [ ] Add a lightweight `lead -> driver -> load` KPI view

### Hardening

- [ ] Apply latest Supabase migrations in production
- [ ] Add rate limiting to the public lead form
- [ ] Add production smoke tests for lead creation and dispatch flow
- [ ] Move notification work to a non-blocking post-response pattern if needed

## Rules

- Do not build a full CRM yet
- Do not build auth yet
- Do not build messaging inboxes or automation engines
- Keep everything server-rendered and operationally useful
- Prefer direct traceability over more UI
