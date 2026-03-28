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
| `created_at` | `TEXT NOT NULL` | ISO timestamp |
| `updated_at` | `TEXT NOT NULL` | ISO timestamp |

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
