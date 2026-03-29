# V1 Foundation Schema

This document translates the product map into an implementation foundation for `iDispatchLoads.com`.

## Current Storage Strategy

Version 1 uses Supabase Postgres for structured lead capture.

Why:

- It gives V1 real production persistence immediately.
- It keeps the lead pipeline structured instead of email-only.
- It preserves the repository and service boundaries so storage can evolve without rewriting the marketing site.

## Migration File

The current production database schema for V1 lives in:

- [supabase/migrations/20260328190000_initial_leads.sql](/Users/kevincastrillonmiranda/idispatchloads/supabase/migrations/20260328190000_initial_leads.sql)

## Active V1 Table

### `leads`

This is the only persisted business table in V1 right now.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `TEXT PRIMARY KEY` | Stable UUID |
| `first_name` | `TEXT NOT NULL` | Lead first name |
| `last_name` | `TEXT NOT NULL` | Lead last name |
| `phone` | `TEXT NOT NULL` | Contact number |
| `email` | `TEXT NOT NULL` | Contact email |
| `truck_type` | `TEXT NOT NULL` | Equipment or truck type |
| `preferred_lanes` | `TEXT NOT NULL` | Target freight lanes |
| `notes` | `TEXT` | Optional lead notes |
| `status` | `TEXT NOT NULL` | `new`, `contacted`, `qualified`, `onboarded`, `lost` |
| `source` | `TEXT NOT NULL` | Traffic source like `website` or `google` |
| `campaign` | `TEXT` | Optional campaign marker like `spring-owner-ops` |
| `last_contacted_at` | `TIMESTAMPTZ` | Lightweight last-touch marker |
| `created_at` | `TEXT NOT NULL` | ISO timestamp |
| `updated_at` | `TEXT NOT NULL` | ISO timestamp |

## Dispatch Lite Tables

The current V2 dispatch-lite layer adds two operational tables without jumping
to full CRM or TMS scope.

Migration:

- [20260328194000_dispatch_lite.sql](/Users/kevincastrillonmiranda/idispatchloads/supabase/migrations/20260328194000_dispatch_lite.sql)

### `drivers`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `UUID PRIMARY KEY` | Stable UUID |
| `source_lead_id` | `UUID NULL` | Optional source lead for traceability |
| `company` | `TEXT NOT NULL` | Fleet or company name |
| `driver_name` | `TEXT NOT NULL` | Driver display name |
| `phone` | `TEXT NOT NULL` | Contact number |
| `truck_type` | `TEXT NOT NULL` | Equipment or truck type |
| `preferred_lanes` | `TEXT` | Copied from lead when useful |
| `home_base` | `TEXT NOT NULL` | Base city or region |
| `status` | `TEXT NOT NULL` | `available`, `assigned`, `in_transit` |
| `notes` | `TEXT` | Optional notes |
| `created_at` | `TIMESTAMPTZ NOT NULL` | Insert timestamp |
| `updated_at` | `TIMESTAMPTZ NOT NULL` | Last update timestamp |

### `loads`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `UUID PRIMARY KEY` | Stable UUID |
| `driver_id` | `UUID NULL` | Optional assigned driver |
| `source_lead_id` | `UUID NULL` | Optional originating lead |
| `company` | `TEXT NOT NULL` | Customer / company |
| `origin` | `TEXT NOT NULL` | Origin |
| `destination` | `TEXT NOT NULL` | Destination |
| `pickup_date` | `TIMESTAMPTZ` | Planned pickup |
| `delivery_date` | `TIMESTAMPTZ` | Planned delivery |
| `broker` | `TEXT NOT NULL` | Broker name |
| `rate` | `NUMERIC(10,2)` | Rate |
| `status` | `TEXT NOT NULL` | `searching`, `booked`, `dispatched`, `picked_up`, `delivered` |
| `notes` | `TEXT` | Optional notes |
| `created_at` | `TIMESTAMPTZ NOT NULL` | Insert timestamp |
| `updated_at` | `TIMESTAMPTZ NOT NULL` | Last update timestamp |

Additional migration for lightweight activity tracking and lead-to-load traceability:

- [20260328203000_lead_activity_and_load_source.sql](/Users/kevincastrillonmiranda/idispatchloads/supabase/migrations/20260328203000_lead_activity_and_load_source.sql)
- [20260328212000_driver_source_lead_and_lanes.sql](/Users/kevincastrillonmiranda/idispatchloads/supabase/migrations/20260328212000_driver_source_lead_and_lanes.sql)

## Future Evolution Path

The architecture assumes this funnel:

`visitor -> lead -> qualified lead -> onboarded driver -> active driver -> loads -> platform workflows`

That means the lead table is intentionally shaped so it can become operational data later.

## Planned V2 / V3 Entity Expansion

These are not fully persisted yet, but the shared types and folder structure already reserve space for them:

- `users`
- `roles`
- `drivers`
- `carriers`
- `trucks`
- `brokers`
- `loads`
- `documents`
- `tasks`
- `communications`
- `notes`

## Relationship Direction

Recommended growth path:

- `leads` remain the top-of-funnel intake record.
- `drivers` and `carriers` should later keep a `source_lead_id` reference for traceability.
- `loads` should later connect to `brokers`, `drivers`, `carriers`, and `trucks`.
- `documents`, `tasks`, `communications`, and `notes` should attach to business entities rather than pages.

## Implementation Rule

Keep domain types in camelCase for application code and map them to snake_case database columns at the repository layer.

That gives us:

- cleaner TypeScript in the app
- stable SQL naming in the database
- easier migration later if storage changes
