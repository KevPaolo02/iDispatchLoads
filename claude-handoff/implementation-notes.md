# Implementation Notes For Claude

This document explains what I built and why. Please challenge any choices that look risky or incomplete.

## 1. Private Internal Tool Assumption

The user explicitly asked for a private dashboard, not a marketplace. I optimized for dispatcher speed and internal workflows rather than public listing, SEO, marketplace search, payment flows, or public driver onboarding.

Because of that, all dashboard routes sit behind Supabase Auth in `app/(dashboard)/layout.tsx`.

Reason:

- Keep all operational data private.
- Avoid building public-facing complexity that the user did not need.
- Make the first deploy usable for one dispatcher or a very small team.

Main files:

```text
app/(dashboard)/layout.tsx
app/(auth)/login/page.tsx
app/(auth)/actions.ts
middleware.ts
lib/supabase/middleware.ts
```

## 2. Supabase SSR Client Pattern

I used `@supabase/ssr` with:

- `createServerClient` for server components and server actions
- `createBrowserClient` for future client components
- middleware session refresh via `supabase.auth.getUser()`

Reason:

- This follows the modern Supabase + Next App Router SSR pattern.
- It avoids putting service-role keys in the app.
- It keeps auth session cookies flowing through middleware.

Important note:

The app uses the anon key, not a service-role key. Database access depends on RLS policies.

Main files:

```text
lib/supabase/server.ts
lib/supabase/client.ts
lib/supabase/middleware.ts
middleware.ts
```

Claude should verify whether the RLS policies are appropriately scoped for a private one-company tool.

## 3. RLS Policy Choice

The schema enables RLS and grants full CRUD to authenticated users:

```sql
for all
to authenticated
using (true)
with check (true)
```

Reason:

- This is a private internal app.
- The first version assumes every authenticated user is trusted dispatch staff.
- It is simple and avoids service-role patterns.

Concern:

This is too broad if drivers and dispatchers eventually share the same auth project. For production with separate roles, it should be tightened with a `profiles` or `organization_members` table and role-aware policies.

Main file:

```text
supabase/schema.sql
```

## 4. Database Tables

The requested schema was implemented with a few practical additions.

`loads` includes:

- requested route, vehicle, price, pickup date, notes, status, driver assignment fields
- `distance_miles`
- `agreed_price`
- `driver_status`
- `updated_at`

`drivers` includes:

- requested driver fields
- `preferred_routes` as `jsonb`

`offers` includes:

- requested offer relationship fields
- `offered_price`
- `message_body`
- `responded_at`

Reason:

- `distance_miles` was requested as optional.
- `agreed_price` is needed for assignment flow.
- `driver_status` supports the optional driver panel.
- `message_body` gives an audit trail for the mock SMS offer.
- `responded_at` helps distinguish stale pending offers from real responses.

Main file:

```text
supabase/schema.sql
```

## 5. Offer Acceptance Race Protection

I added a Postgres RPC function:

```sql
public.accept_offer(p_offer_id uuid, p_agreed_price numeric default null)
```

Reason:

- If two drivers accept around the same time, the database should decide atomically.
- Server action-only checks are not enough for this workflow.
- The function locks the offer and load rows, checks whether the load is still available, accepts one offer, rejects other pending offers, and assigns the load.

Supporting indexes:

```sql
offers_one_pending_per_driver_load_idx
offers_one_accepted_per_load_idx
```

Main files:

```text
supabase/schema.sql
app/(dashboard)/actions.ts
```

Claude should scrutinize the locking behavior and the partial unique indexes.

## 6. Duplicate Offer Handling

`sendOfferAction` checks:

- load exists
- driver exists
- load is not already assigned/completed
- driver is available
- trailer is compatible
- no pending offer already exists for the same load and driver
- no accepted offer already exists for the load

Reason:

- Prevent dispatcher double-sending the same offer.
- Prevent new offers after assignment.
- Prevent obvious workflow confusion.

Main file:

```text
app/(dashboard)/actions.ts
```

## 7. Direct Assignment

`assignLoadAction` supports direct assigning a matched driver without waiting for offer acceptance.

Reason:

- Dispatchers often call/text manually and need to lock a load quickly.
- This keeps the workflow realistic.

Implementation detail:

- If there is a pending offer for that driver, it routes through `accept_offer()`.
- If there is no pending offer, it inserts an accepted offer as an audit record, assigns the load, and rejects other pending offers.

Concern:

The no-pending-offer direct assignment path is less atomic than `accept_offer()` because it performs several operations from the server action. Claude should decide whether this needs a dedicated `assign_load()` RPC for production.

Main file:

```text
app/(dashboard)/actions.ts
```

## 8. Matching Logic

The matching logic is intentionally simple and rule-based.

It filters drivers by:

- `is_available`
- trailer compatibility

Then scores by:

- exact pickup city match
- pickup state match
- preferred route overlap
- trailer type fit

Reason:

- The prompt asked for simple rule-based matching.
- Real geocoding and distance APIs would add cost, keys, and deployment complexity.
- The first version should remain understandable to the dispatcher.

Concern:

`distance from pickup` is currently approximated from text fields, not true mileage. This should become a real geocoding/mileage service in v2.

Main file:

```text
lib/matching.ts
```

## 9. Validation

I avoided adding a validation library to keep dependencies minimal.

Instead, form parsing lives in:

```text
lib/form-utils.ts
```

Reason:

- The prompt said no unnecessary libraries.
- Server actions need clear missing-field handling.
- The forms are simple enough for small helper functions.

Concern:

For production, a schema validator like Zod would give stronger, reusable validation and better error messages.

## 10. UI Approach

The UI is intentionally operational:

- dashboard table
- quick driver snapshots
- driver roster
- load detail page
- offer cards
- internal driver panel

Reason:

- The user explicitly requested speed and usability over design fluff.
- Dispatchers need scan-friendly tables and direct actions.

Main files:

```text
app/(dashboard)/page.tsx
components/load-table.tsx
components/load-form.tsx
components/driver-form.tsx
components/match-card.tsx
components/offer-card.tsx
```

Concern:

The UI has not yet been browser-smoke-tested with real Supabase data after the SQL was run.

## 11. Dependency Cleanup

`npm audit` initially reported a moderate advisory through Next's nested PostCSS dependency.

I added:

```json
"overrides": {
  "postcss": "^8.5.14"
}
```

Reason:

- `npm audit fix --force` wanted to install an old breaking Next version.
- The override resolves the nested vulnerable PostCSS version without downgrading Next.

Current result:

```bash
npm audit --audit-level=moderate
# found 0 vulnerabilities
```

Main file:

```text
package.json
```

Claude should verify whether this override is acceptable for the selected Next version.

## 12. Not Yet Done

These are intentionally not complete yet:

- Real SMS provider integration
- Real distance/geocoding
- Role-based RLS
- Organizations/multi-tenant separation
- Driver mobile auth model
- Vercel deployment
- Custom domain
- Automated tests
- Full manual browser smoke test
- Git repo initialization and first commit

These should be part of the finish plan after Claude's audit.
