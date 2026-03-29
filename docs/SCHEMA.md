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

- [20260328190000_initial_leads.sql](/Users/kevincastrillonmiranda/iDispatchLoads.com/supabase/migrations/20260328190000_initial_leads.sql)

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

- [20260328194000_dispatch_lite.sql](/Users/kevincastrillonmiranda/iDispatchLoads.com/supabase/migrations/20260328194000_dispatch_lite.sql)

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
| `status` | `TEXT NOT NULL` | `posted`, `negotiating`, `booked`, `assigned`, `pickup_scheduled`, `picked_up`, `in_transit`, `delivered`, `closed`, `problem_hold` |
| `notes` | `TEXT` | Optional notes |
| `created_at` | `TIMESTAMPTZ NOT NULL` | Insert timestamp |
| `updated_at` | `TIMESTAMPTZ NOT NULL` | Last update timestamp |

Additional migration for lightweight activity tracking and lead-to-load traceability:

- [20260328203000_lead_activity_and_load_source.sql](/Users/kevincastrillonmiranda/iDispatchLoads.com/supabase/migrations/20260328203000_lead_activity_and_load_source.sql)
- [20260328212000_driver_source_lead_and_lanes.sql](/Users/kevincastrillonmiranda/iDispatchLoads.com/supabase/migrations/20260328212000_driver_source_lead_and_lanes.sql)
- [20260329180000_dispatcher_ready_ops.sql](/Users/kevincastrillonmiranda/iDispatchLoads.com/supabase/migrations/20260329180000_dispatcher_ready_ops.sql)

## Fleet Movement Layer

The current ops-focused movement layer keeps Daniel Gruas LLC units visible
between outside load boards and the live dispatch board.

Migration:

- [20260329093000_movement_board.sql](/Users/kevincastrillonmiranda/iDispatchLoads.com/supabase/migrations/20260329093000_movement_board.sql)

### Driver extensions

The existing `drivers` table is still the operational unit record, but it now
stores enough movement context to help dispatching:

| Column | Type | Notes |
| --- | --- | --- |
| `current_location` | `TEXT` | Where the unit is now |
| `available_from` | `TIMESTAMPTZ` | When the unit can reload |
| `capacity` | `INTEGER` | Vehicle capacity |
| `truck_unit_number` | `TEXT` | Internal truck identifier |
| `truck_vin` | `TEXT` | Truck VIN |
| `trailer_unit_number` | `TEXT` | Internal trailer identifier |
| `trailer_vin` | `TEXT` | Trailer VIN |

### `load_opportunities`

This table stores opportunities from Central Dispatch, Super Dispatch, ACV, and
other boards before they become real booked loads.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `UUID PRIMARY KEY` | Stable UUID |
| `source` | `TEXT NOT NULL` | Board source like `Central Dispatch` |
| `source_url` | `TEXT` | External posting link |
| `source_reference` | `TEXT` | Optional post/reference id |
| `company` | `TEXT` | Dealer, auction, or customer |
| `origin` | `TEXT NOT NULL` | Pickup origin |
| `destination` | `TEXT NOT NULL` | Delivery destination |
| `pickup_window` | `TIMESTAMPTZ` | Pickup timing |
| `delivery_window` | `TIMESTAMPTZ` | Delivery timing |
| `vehicles_count` | `INTEGER NOT NULL` | Number of vehicles |
| `rate` | `NUMERIC(10,2)` | Payout |
| `contact_name` | `TEXT` | Quick-access contact name |
| `contact_phone` | `TEXT` | Quick-access contact phone |
| `status` | `TEXT NOT NULL` | `new`, `needs_review`, `needs_quote`, `awaiting_customer`, `ready_to_post`, `closed_won`, `closed_lost`, `on_hold` |
| `assigned_driver_id` | `UUID NULL` | Optional unit assignment |
| `notes` | `TEXT` | Lightweight dispatcher notes |
| `created_at` | `TIMESTAMPTZ NOT NULL` | Insert timestamp |
| `updated_at` | `TIMESTAMPTZ NOT NULL` | Last update timestamp |

## Dispatcher Readiness Phase 2

This layer makes the app usable for a hired dispatcher with clear operational
states, required-field gating, activity history, problem flags, and dashboard
queues.

Migration:

- [20260329213000_dispatcher_phase2.sql](/Users/kevincastrillonmiranda/iDispatchLoads.com/supabase/migrations/20260329213000_dispatcher_phase2.sql)

### Extended `load_opportunities`

Added fields:

- `pickup_city`, `pickup_state`, `pickup_zip`
- `delivery_city`, `delivery_state`, `delivery_zip`
- `trailer_type`
- `customer_name`, `customer_phone`, `customer_email`
- `first_available_date`
- `customer_price`, `carrier_pay`

### Extended `loads`

Added fields:

- `pickup_city`, `pickup_state`, `pickup_zip`
- `delivery_city`, `delivery_state`, `delivery_zip`
- `trailer_type`
- `customer_name`, `customer_phone`, `customer_email`
- `customer_price`, `carrier_pay`
- `deposit_collected`, `cod_amount`
- `reference_number`
- `contact_name`, `contact_phone`
- `pickup_contact_name`, `pickup_contact_phone`
- `delivery_contact_name`, `delivery_contact_phone`
- `carrier_company`, `carrier_mc_number`
- `carrier_dispatcher_name`, `carrier_dispatcher_phone`
- `carrier_driver_name`, `carrier_driver_phone`
- `truck_trailer_type`

### `load_opportunity_vehicles`

Stores pre-booking vehicle manifests so opportunities can convert into loads
without re-entering year/make/model/VIN data.

### `activity_events`

Stores the internal timeline for:

- status changes
- notes saved
- pricing updates
- assignment changes
- schedule updates
- vehicle changes
- problem flag creation and resolution

### `problem_flags`

Stores unresolved operational issues with a required note and priority:

- `late_pickup`
- `late_delivery`
- `no_carrier_response`
- `no_customer_response`
- `pricing_issue`
- `damage_issue`
- `missing_docs`
- `reschedule_needed`

### Load traceability

The existing `loads` table now also supports:

| Column | Type | Notes |
| --- | --- | --- |
| `source_opportunity_id` | `UUID NULL` | Originating board opportunity |
| `reference_number` | `TEXT` | Dispatcher reference / confirmation number |
| `contact_name` | `TEXT` | Quick-access load contact |
| `contact_phone` | `TEXT` | Quick-access load phone |

This creates the clean operational path:

`board opportunity -> assigned unit -> booked load -> live dispatch execution`

### `load_vehicles`

This is the lightweight booked-load vehicle manifest used for day-to-day auto
transport dispatching.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `UUID PRIMARY KEY` | Stable UUID |
| `load_id` | `UUID NOT NULL` | Parent booked load |
| `year` | `INTEGER` | Optional model year |
| `make` | `TEXT NOT NULL` | Vehicle make |
| `model` | `TEXT NOT NULL` | Vehicle model |
| `vin` | `TEXT` | Optional VIN |
| `operability` | `TEXT NOT NULL` | `operable` or `inop` |
| `created_at` | `TIMESTAMPTZ NOT NULL` | Insert timestamp |
| `updated_at` | `TIMESTAMPTZ NOT NULL` | Last update timestamp |

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
