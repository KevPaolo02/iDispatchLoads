# iDispatchLoads — Plan v3 (Source of Truth)

> v3 — 2026-05-11. Supersedes v2 (preserved in git history at the previous commit of this file). Going forward this is the canonical plan; either side proposes edits via PR-style turn in this folder before merging.

**Project:** `iDispatchLoads` — private car hauler dispatch tool. Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase. One dispatcher, 1→3 drivers, 2-car open trailer, local + regional routes.

**Philosophy:** Dispatcher operating system, not trucking SaaS. Every feature answers one of five questions faster: where is my driver, what load should I take next, where does the truck go empty, what do I remember about this broker, what patterns should I know. If a feature doesn't serve one of those questions it doesn't belong in v1.

**Working directory:** `/Users/kevincastrillonmiranda/ProDispatch`
**Run after every phase:** `npm run lint && npm run typecheck && npm run build` — fix all errors before moving to the next phase.

---

## Phase 1 — Already shipped ✅

All Phase 1 items are complete in the current codebase (commit `78af20c`, deployed to Vercel). Do not redo this work.

| Item | Status | Evidence |
|---|---|---|
| 1.1 Login error masking | ✅ Done | `app/(auth)/actions.ts` uses capture-then-redirect |
| 1.2 `send_offer` RPC | ✅ Done | `sendOfferAction` calls `supabase.rpc("send_offer", ...)` |
| 1.3 `set_driver_progress` RPC | ✅ Done | `updateDriverLoadStatusAction` routes through it |
| 1.4 `assign_load` RPC | ✅ Done | `assignLoadAction` uses it |
| 1.5 `unassign_load` RPC | ✅ Done | `unassignLoadAction` exists |
| 1.6 Status dropdown locked | ✅ Done | `LoadForm.lockCoreFields`, explicit Unassign button |
| 1.7 `deleteLoadAction` guard | ✅ Done | Refuses non-NEW, wrapped in `ConfirmForm` |

Supporting work also shipped: `accept_offer` pending-status guard, CHECK constraint on loads, `external_source/external_id` columns, safe `return_to` helper, zero-row update detection, `console.error` in every catch.

**Before starting Phase 2:** run the smoke test on the live deploy. Walk through: create load → send offer → accept from `/driver` → en_route → picked_up → delivered. Then verify the regression cases: stale offer rejection (B6), completed-back-to-assigned refusal (B4), delete guard on assigned load (B3). Do not skip this. A bug in Phase 1 RPC routing on the live site is a corruption risk before adding photo paths on top.

---

## Phase 2 — Photo capture

Photos document vehicle condition at pickup and delivery. Legal protection for car hauling — not optional.

- [ ] **2.1 Schema migration**
Create `supabase/migrations/20260511_photos.sql`. Add a private `load_photos` Supabase Storage bucket. Add a `load_photos` table: `id uuid PK`, `load_id uuid FK → loads(id) ON DELETE CASCADE`, `driver_id uuid FK → drivers(id)`, `stage text CHECK (stage IN ('pickup','delivery'))`, `storage_path text NOT NULL`, `created_by uuid REFERENCES auth.users(id)`, `uploaded_at timestamptz NOT NULL DEFAULT now()`. RLS: authenticated users can do all. Storage policy: authenticated users can insert/select objects at paths prefixed by the load UUID.

- [ ] **2.2 Upload action**
`app/(dashboard)/actions.ts` — add `uploadLoadPhotoAction(formData)`. Accepts `load_id`, `driver_id`, `stage`, `file`. Uploads to `{load_id}/{stage}/{uuid}.jpg` in the storage bucket. Inserts a row into `load_photos` with `created_by` set to the authenticated user's ID. Redirects with error on failure.

- [ ] **2.3 Driver upload UI**
`app/(dashboard)/driver/page.tsx` — on the active load card, add two photo slots: pickup and delivery. Each has a file input with `accept="image/*" capture="environment"` for mobile camera. Show thumbnails of already-uploaded photos using signed URLs with 24-hour expiry (internal tool — longer expiry prevents broken thumbnails after the dispatcher walks away for lunch). Only show the delivery slot after the driver has marked the load `picked_up`. Keep it compact — this UI is used on a phone.

- [ ] **2.4 Dispatcher photo view**
`app/(dashboard)/loads/[id]/page.tsx` — add a "Photos" section. Query `load_photos` grouped by stage. Generate 24-hour signed URLs for each. Show pickup and delivery thumbnails in a grid. Show a count badge: "Pickup: 2 · Delivery: 0."

- [ ] **2.5 Type generation**
After adding the `load_photos` table, regenerate `types/database.ts` against the live project. Add this to `package.json` scripts (one-time setup):
```json
"supabase:types": "supabase gen types typescript --project-id gedubzboospcdappafkl > types/database.ts"
```
Note: **do not use `--local`** — that flag points at a local Supabase dev container we are not running. Use `--project-id gedubzboospcdappafkl` to generate against the live schema. Requires `supabase login` once on the developer's machine. Alternative: `supabase link --project-ref gedubzboospcdappafkl` once, then `supabase gen types typescript --linked` in subsequent runs.

Run `npm run supabase:types` at the end of every phase that touches the schema.

---

## Phase 3 — Visual route chain map

The most important feature in the app. Dispatching is a spatial problem — text lists are weak for spatial reasoning. A map that shows where the truck goes empty and what loads are nearby changes dispatch quality immediately.

- [ ] **3.1 Map component setup**
Install `leaflet` and `react-leaflet`. Create `components/dispatch-map.tsx` as a client component — Leaflet requires the browser. Use OpenStreetMap tiles (no API key needed). Handle SSR with dynamic import and `ssr: false` in the page that uses it — without this you get "window is not defined" build errors. Export a `DispatchMap` component that accepts driver position, active route, and candidate loads as props.

- [ ] **3.2 Geocoding utility**
Create `lib/geocode.ts`. Export `geocodeCity(city: string, state: string): Promise<[number, number] | null>`. Use the Nominatim API: `https://nominatim.openstreetmap.org/search?q={city},{state},USA&format=json&limit=1`. Add a module-level `Map<string, [number, number]>` cache — same city should never hit the API twice in a session. Enforce a 1-second minimum between uncached requests (Nominatim's terms require it). Accept the UX cost: a dispatcher page with 10 uncached candidate loads takes up to 10 seconds to fully resolve on first load, then is fast. This is acceptable for v1. Log a note in the code: "upgrade to Mapbox or LocationIQ if cold-load time becomes a problem."

- [ ] **3.3 Route chain visualization**
`app/(dashboard)/dispatcher/page.tsx` — add a map view alongside the existing TAKE/MAYBE/RISKY list (keep the list, don't remove it — some dispatchers prefer scanning text). The map shows:
  - Driver's current location as a distinct truck pin (geocode `driver.current_location`)
  - Active load route as a solid polyline: pickup → delivery
  - The delivery endpoint marked "Empty here" with a dashed circle of ~80-mile radius showing the reload opportunity zone
  - Candidate `NEW`/`OFFERED` loads as pins color-coded by verdict: green (TAKE), amber (MAYBE), red (RISKY)
  - Clicking a pin shows a popup: pickup city → delivery city, payout, verdict, link to load detail page

- [ ] **3.4 Driver location update — dispatcher side**
`app/(dashboard)/drivers/page.tsx` — add an inline editable location field on each driver card. Click to edit, saves on blur or Enter. Format: "City, ST". The map is only as good as the location data feeding it.

- [ ] **3.5 Driver location update — driver side**
`app/(dashboard)/driver/page.tsx` — add a compact "Mi ubicación" input at the top of the driver view. One tap to update their current city. Saves immediately. In Spanish to match the rest of the driver UI. Note: this already exists as `updateDriverLocationAction`; verify it is reachable from the active driver card.

- [ ] **3.6 Run `npm run supabase:types`** (no-op if no schema changed; harmless to run).

---

## Phase 4 — Broker and dealer memory

Operational knowledge currently lives in your head, WhatsApp, and screenshots. It needs to live in the app. This becomes a competitive advantage as you scale to 3 trucks — and it's impossible to reconstruct retroactively.

- [ ] **4.1 Schema migration**
Create `supabase/migrations/20260511_memory.sql`. Add a `contacts` table: `id uuid PK`, `name text NOT NULL`, `type text CHECK (type IN ('broker','dealer','shipper'))`, `phone text`, `avg_wait_minutes integer CHECK (avg_wait_minutes >= 0)`, `payment_speed text CHECK (payment_speed IN ('fast','normal','slow','never'))`, `notes text`, `tags text[]`, `created_by uuid REFERENCES auth.users(id)`, `created_at timestamptz NOT NULL DEFAULT now()`, `updated_at timestamptz NOT NULL DEFAULT now()`. Add the `set_updated_at` trigger. RLS: authenticated can do all. Index on `type`. Add `broker_id uuid REFERENCES contacts(id) ON DELETE SET NULL` and `dealer_id uuid REFERENCES contacts(id) ON DELETE SET NULL` to `loads` in the same migration.

- [ ] **4.2 Contact management page**
Create `app/(dashboard)/contacts/page.tsx`. Show contacts grouped by type. Each card shows name, phone, avg wait, payment speed, tags, notes. Add/edit via inline form. Add link to nav in `components/app-shell.tsx`.

- [ ] **4.3 Contact picker on load form**
`components/load-form.tsx` — add optional broker and dealer searchable selectors populated from `contacts`. When a contact is selected, show a compact summary inline: avg wait, payment speed, any tags that contain warning signals (e.g. `slow_pay`, `long_wait`, `bad_neighborhood`). This surfaces memory at the exact moment you're deciding whether to take a load.

- [ ] **4.4 Quick-save contact from load detail**
`app/(dashboard)/loads/[id]/page.tsx` — add "Remember this broker" and "Remember this dealer" shortcuts. A minimal form (name, wait time, payment speed, one-line note) lets you save a contact immediately after completing a load, while the experience is fresh.

- [ ] **4.5 Run `npm run supabase:types`**

---

## Phase 5 — Operational analytics

Answers "what patterns should I know" without becoming a financial dashboard. Spatial and behavioral — not accounting.

- [ ] **5.1 Schema addition**
Add to `supabase/migrations/20260511_analytics.sql`. Add `deadhead_miles integer CHECK (deadhead_miles >= 0)` to `loads`. Nullable — manual entry, dispatcher fills it in when creating or closing a load. Accept the data quality cost for v1: it will be missing often. Add a note in the migration: "long-term: derive from geocoded distance between last delivery city and this pickup city."

- [ ] **5.2 Operational summary strip**
`app/(dashboard)/dispatcher/page.tsx` — add a single-row stats strip above the map. For the last 30 days show: loads completed, total loaded miles (sum of `distance_miles`), total deadhead miles (sum of `deadhead_miles` where not null), and the ratio. Keep it one row — glanceable, not a report.

- [ ] **5.3 Broker scorecard**
`app/(dashboard)/contacts/page.tsx` — on broker contact cards, add an auto-calculated scorecard from linked loads: number of completed loads, average payout, any `payment_speed='slow'` or `'never'` flags. Derived from history — no manual entry.

- [ ] **5.4 Run `npm run supabase:types`**

---

## Phase 6 — Hygiene (do last, not first)

Small things that are cheap now and hard to backfill later.

- [ ] **6.1 Soft-archive loads and drivers**
Add `archived_at timestamptz` to both `loads` and `drivers` via migration. Update `deleteLoadAction` and any driver delete action to set `archived_at = now()` instead of hard-deleting. Filter archived records out of all queries by default. Add an "Archived" toggle on the loads board and drivers page to show them. This preserves audit trail.

- [ ] **6.2 Data quality CHECK constraints**
Add to a migration: `pickup_state ~ '^[A-Z]{2}$'`, `delivery_state ~ '^[A-Z]{2}$'`, `distance_miles >= 0`, `price` scale already enforced. Cheap now, prevents garbage data forever.

- [ ] **6.3 Auth config documentation**
Create `claude-handoff/auth-config.md`. Document the required Supabase Auth settings: public signup disabled, Site URL set to production domain, redirect URLs for local and production. This file exists so these settings can be verified after any Supabase project migration or team handoff — configuration drift is silent and painful.

- [ ] **6.4 Deploy checklist in README**
Add a "Pre-deploy checklist" to `README.md`: apply all migrations in order, disable public Supabase signup, set Site URL + redirect URLs, add env vars to Vercel, run smoke test (create load → send offer → accept → en_route → picked_up → delivered → photo upload → mark complete).

- [ ] **6.5 Run `npm run supabase:types`** one final time after all migrations are applied.

---

## What NOT to build in this version

- No payment ledger — deadhead is where profit leaks, not payment tracking
- No in-app messaging — WhatsApp is fine, don't rebuild communication tools
- No real-time Supabase subscriptions — page refresh is acceptable
- No SMS or external API integrations beyond Nominatim geocoding
- No automated tests
- No enterprise permissions or multi-tenant separation
- Do not replace Super Dispatch for BOL signatures — capture photos alongside it
- Do not modify `supabase/schema.sql` — reference only, all changes go in numbered migration files
- Do not change the Spanish in `app/(dashboard)/driver/page.tsx`

---

## The five questions every feature must answer

Before marking any phase done, verify each feature helps the dispatcher answer one of these faster:

1. Where is my driver and what capacity do they have?
2. What load should I take next to avoid empty miles?
3. Where does the truck go empty and what's nearby?
4. What do I remember about this broker or dealer?
5. What patterns should I know about my operation?

If a feature doesn't serve one of those, it doesn't belong here yet.

---

## Open notes (informational; not part of any phase)

- **§3.5 from v2 (Super Dispatch ingestion readiness) is still in the schema.** Columns `external_source`, `external_id`, `external_url`, `external_payload`, `external_synced_at` exist on `loads` plus the partial unique index. No code change needed in v3; the slot is preserved for Phase 4-or-later Super Dispatch connector work if you ever pursue it.
- **Central Dispatch paste form is still mounted.** v2 flagged this as a §3.5 plan violation but the user opted to keep it. Its dedupe now uses `external_source/external_id`. Leave it for now.
- **Type-gen script setup** is in 2.5. It's listed as a Phase 2 task but is a one-time setup that benefits every phase from then on.
