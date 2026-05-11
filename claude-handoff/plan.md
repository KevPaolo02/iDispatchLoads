# ProDispatch — Master Plan (Source of Truth)

This file is the agreed plan for finishing ProDispatch. It is the single source of truth that Claude and Codex will both work from. Anything not in this file is out of scope until a phase explicitly adds it.

If a future change conflicts with this document, **edit this document first**, get the other side to ack, then change code.

Companion documents:
- [claude-response.md](claude-response.md) — full audit findings (the "what is wrong"). This plan is the "what we will do about it, in what order".
- [audit-checklist.md](audit-checklist.md) — Codex's original criteria. Used to verify each phase.
- [implementation-notes.md](implementation-notes.md) — Codex's record of what is built and why.
- [codex-plan-audit.md](codex-plan-audit.md) — Codex's red-team review of v1 of this plan. v2 of this file folds it in.

---

## 0. Codex audit absorbed (v2 deltas)

Codex red-teamed v1 of this plan in [codex-plan-audit.md](codex-plan-audit.md). The following changes are accepted and now live in this v2:

- **`sendOfferAction` is promoted from a friendly-error issue to a blocking data-integrity bug.** Codex correctly observed that the action's final `loads.update({ status: "OFFERED" })` has no state guard, so a concurrent direct-assign can be demoted back to `OFFERED` while `driver_id` remains set. Phase 1 now adds a `send_offer` RPC; the action becomes a single RPC call.
- **`accept_offer` pending-status guard is promoted to blocking.** Same severity bucket as the rest of B1–B4. The previous "high" framing understated it.
- **B4 quick-fix is replaced by a `set_driver_progress` RPC.** The two-line filter I proposed still allowed `COMPLETED → ASSIGNED` regression. Codex's stricter rule wins: progress only when `status = 'ASSIGNED'`, no exceptions, and `delivered` is the one-way door to `COMPLETED`.
- **CHECK constraint is rewritten** per Codex's three-branch version (NEW/OFFERED, ASSIGNED with valid `driver_status`, COMPLETED with `driver_status='delivered'`).
- **`return_to` is treated as untrusted input** and routed through a safe-redirect helper that only accepts internal app paths.
- **Zero-row updates must be detected.** Filtered Supabase updates that match no rows return success; every guarded action must `select` the result or use an RPC that returns a status object.
- **Editing OFFERED/ASSIGNED/COMPLETED loads is restricted** — moved into Phase 2 as part of audit-trail hardening. Notes-only edits for those states.
- **Public Supabase signup must be disabled before deploy**, otherwise broad RLS becomes a real authz hole. Phase 3 gate.
- **Additive migration filename is locked**: `supabase/migrations/20260506_dispatch_hardening.sql`. Do not rerun `supabase/schema.sql` against an existing project.
- **Cheap data-quality constraints** (state-code shape, `distance_miles >= 0`, etc.) join Phase 2.

Two items where I'm overruling Codex partially:

- Codex argued B1 (login redirect) is high, not blocking, because it doesn't corrupt data. Fair, but the cost of the fix is five lines and shipping with a login that hides "Invalid credentials" behind "Unable to sign in right now" makes onboarding the first dispatcher harder than it needs to be. Keeping it in Phase 1.
- Codex's broader RLS concern (their A4) is conditional on whether public signup is on. We satisfy it by gating Phase 3 on signup-disabled. Adding `profiles` + role-based RLS stays a Phase 4 item; Codex does not require it for v1 if signup is locked.

New cross-cutting concern added in v2 by user request: §3.5 Integration readiness (Super Dispatch). See that section.

---

## 1. Product framing (locked)

ProDispatch is a **private, single-tenant, internal dispatch tool** for one small car-transport dispatcher managing 2–10 drivers. Every authenticated user is trusted dispatch staff. This is not a marketplace.

Implications that bind every phase below:

- We can keep RLS simple (`to authenticated using (true)`) **only as long as no driver ever has a Supabase Auth account**. The moment that changes, we go to phase 4.
- We optimize for dispatcher speed, not for public UX, SEO, or onboarding flows.
- Audit trail (who did what to which load) matters more than feature breadth.
- The first deploy target is one dispatcher on a Vercel project pointed at one Supabase project.

Anti-goals for this plan: marketplace search, public driver onboarding, payments, real SMS in v1, real geocoding/mileage in v1, multi-tenant separation in v1, role-based RLS in v1, automated tests in v1.

---

## 2. Current state snapshot (verified on disk)

Working today:
- Next.js App Router + Supabase SSR client wired correctly.
- `loads`, `drivers`, `offers` schema with sane indexes and partial uniques on offers.
- `accept_offer` RPC with row locking on `(o, l)`.
- Dashboard, drivers page, load detail, driver-panel, login.
- `npm run lint`, `typecheck`, `build`, `audit` all pass.

Broken or missing (full detail in [claude-response.md](claude-response.md) and [codex-plan-audit.md](codex-plan-audit.md)):
- B1: `signInAction` masks real auth errors.
- B2: load form's status dropdown can corrupt workflow state.
- B3: `deleteLoadAction` has no guards.
- B4: driver-progress action will flip any load to ASSIGNED/COMPLETED with no checks. v2 fix: `set_driver_progress` RPC, no `COMPLETED → ASSIGNED` regression.
- B5 (promoted by Codex): `sendOfferAction`'s status update has no state guard and can demote ASSIGNED loads to OFFERED.
- B6 (promoted by Codex): `accept_offer` does not assert the offer is still `pending`.
- A1 (Codex): hidden `return_to` field is an open-redirect surface.
- H1: direct-assign no-pending-offer path is multi-statement, not atomic.
- H2: rejecting an accepted offer orphans the load in ASSIGNED.
- H6: deleting a driver nulls historical loads (audit-trail loss).
- A3 (Codex): `updateLoadAction` lets a dispatcher rewrite route/price on accepted loads, breaking the audit trail.
- A4 (Codex): broad RLS is unsafe if Supabase public signup is enabled.
- A5 (Codex): filtered Supabase updates silently succeed on zero matches.
- M1: `.env.example` ships real project URL.
- Plus the medium / nice-to-have items in the audit.

Not yet started: Vercel deploy, Supabase Auth hardening (rate limit, captcha, Site URL), git init + first commit, browser smoke test against the live Supabase project.

---

## 3. Phases

Each phase has: **goal, scope, exit criteria.** No phase is "done" until exit criteria are satisfied. Do not start phase N+1 until phase N is signed off by both Claude and Codex via this file.

### Phase 0 — Working agreement (this file)
**Goal:** lock the plan and the division of work.

**Scope:**
- This `plan.md` exists and is acked by Codex.
- Codex audits this plan (red-team it: missing risks? wrong order? wrong scope cuts?). Reply lands in `codex-plan-audit.md` in this folder.
- Claude addresses Codex's audit, edits this file in place, and bumps the version stamp at the bottom.

**Exit criteria:** Both sides confirm in writing in this folder that they will execute against this version.

---

### Phase 1 — Workflow integrity (blocking fixes)
**Goal:** make it impossible for a single dispatcher click to corrupt load/offer/driver state. After this phase the app is safe to leave running on a laptop for one dispatcher, even with bugs in the UI layer.

**Scope (in order):**

1. **Schema patch — atomicity and invariants.** Delivered as one additive migration: **`supabase/migrations/20260506_dispatch_hardening.sql`**. Do **not** rerun `supabase/schema.sql` against the live project (it will fail on `create type ...` re-execution per Codex's note).

   The migration contains:
   - **B6:** patch `accept_offer` with `if v_offer_status <> 'pending'` guard at the top (single most important fix in the whole project).
   - Add `set search_path = public, pg_temp` on every `plpgsql` function (`accept_offer`, `set_updated_at`, and the new RPCs below).
   - **H1:** new RPC `public.assign_load(p_load_id uuid, p_driver_id uuid, p_agreed_price numeric)` — same locking shape as `accept_offer`, inserts an accepted offer + flips load to ASSIGNED + rejects pending offers, in one transaction.
   - **B2:** new RPC `public.unassign_load(p_load_id uuid)` — locks load, refuses if `COMPLETED`, rejects all accepted+pending offers, clears `driver_id`, `agreed_price`, `driver_status`, status -> `NEW`.
   - **B5 (Codex):** new RPC `public.send_offer(p_load_id uuid, p_driver_id uuid, p_offered_price numeric, p_message_body text)` — locks the load row, asserts `status in ('NEW','OFFERED')` and `driver_id is null`, asserts no `accepted` or `pending` conflict, inserts the pending offer, sets load to `OFFERED`. One transaction. This replaces the multi-statement `sendOfferAction` body.
   - **B4 (Codex):** new RPC `public.set_driver_progress(p_load_id uuid, p_driver_status driver_progress_status)` — locks load, requires `status = 'ASSIGNED'` and `driver_id is not null`. For `delivered`, sets `status = 'COMPLETED'`. Refuses any `COMPLETED → ASSIGNED` transition.
   - **CHECK constraint** `loads_status_driver_consistent` (Codex's three-branch version):
     ```sql
     (status in ('NEW','OFFERED')   and driver_id is null     and agreed_price is null and driver_status is null)
     or (status = 'ASSIGNED'        and driver_id is not null and agreed_price is not null and driver_status in ('assigned','en_route','picked_up'))
     or (status = 'COMPLETED'       and driver_id is not null and agreed_price is not null and driver_status = 'delivered')
     ```
   - **Integration readiness columns** (per §3.5): add to `loads`:
     - `external_source text not null default 'manual'` with CHECK in `('manual','super_dispatch','central_dispatch')`
     - `external_id text`, `external_url text`, `external_payload jsonb`, `external_synced_at timestamptz`
     - Unique partial index `loads_external_idx on loads(external_source, external_id) where external_id is not null`.

     Cost is one column-add today versus a live-table migration later. See §3.5 for why.
   - Grant execute on `assign_load`, `unassign_load`, `send_offer`, `set_driver_progress` to `authenticated`.

   Wrap any potentially-redoable parts in `do $$ begin ... exception when duplicate_object then null; end $$;` blocks so the migration is safe to re-run during dev.

2. **Server-action patch** (`app/(dashboard)/actions.ts`, `app/(auth)/actions.ts`):
   - **B1:** rewrite `signInAction` so `redirect()` is only called outside the try/catch.
   - **B2:** drop the status `<select>` from `LoadForm` and add an explicit "Unassign load" button that calls a new `unassignLoadAction` wrapping `unassign_load(p_load_id)`. (No restricted-dropdown variant — less surface area.)
   - **B3:** in `deleteLoadAction`, refuse when `status <> 'NEW'` OR when offers exist for that load. Hard-delete is now restricted to never-touched NEW loads. Anything else routes through Phase 2's archive flow.
   - **B4 (Codex):** replace the body of `updateDriverLoadStatusAction` with a single `supabase.rpc("set_driver_progress", ...)` call. Inspect the returned `ok/reason` and return a friendly `InputError` on `not_assigned` / `wrong_status` / `not_found`.
   - **B5 (Codex):** replace the body of `sendOfferAction` with a single `supabase.rpc("send_offer", ...)` call. Same `ok/reason` handling. The pre-flight `getLoadAndDriver` + `validateAssignableDriver` calls remain (trailer/lane compatibility is dispatcher UX, not a transactional invariant), but they no longer mutate.
   - **H1:** replace `assignLoadAction` body with a single `supabase.rpc("assign_load", ...)` call.
   - **H2:** in `updateOfferStatusAction`, refuse to act on offers whose current `status !== 'pending'`.
   - **A1 (Codex):** add `safeReturnTo(value: unknown, fallback: string)` helper in `lib/utils.ts`. Accept only paths starting with `/` and not `//`, reject absolute URLs and any value containing whitespace or control chars. Use it in every action's `getReturnPath` call.
   - **A5 (Codex):** every RPC return is checked for `ok=true`. For any non-RPC filtered update we keep, chain `.select("id")` and verify a row was returned. No silent zero-row successes.
   - 23505 translation: when an RPC or insert returns Postgres unique-violation, translate to `InputError("Another dispatcher just changed this load.")`.

3. **UI patch:**
   - Remove the dispatcher-side Reject button on already-accepted offers in `OfferCard`.
   - Add a small client-side confirm wrapper for Delete Load, Delete Driver, and Unassign buttons.

4. **Cheap observability:**
   - `console.error` at the top of every catch block in dashboard and auth actions, before the redirect, including the action name and the RPC's `reason` if present. So `vercel logs` is useful from day one.

**Exit criteria:**
- All B1–B6 and H1/H2 issues have fixes landed via the four new RPCs (`send_offer`, `assign_load`, `accept_offer` patched, `unassign_load`, `set_driver_progress`).
- A1 safe-redirect helper used in every action.
- A5 zero-row detection: every action surfaces real errors instead of silent success.
- The integration-readiness columns are present on `loads`, default `external_source = 'manual'` populates existing rows, and the unique partial index is in place. No connector code is written.
- Manual smoke test (Phase 3 covers the full list) at minimum passes: create load → send offer → accept via driver-panel → mark en_route → mark delivered. And: create load → direct assign → mark delivered. And: send offer → reject → re-send. And: send offer → accept → unassign → re-assign. **And Codex's must-haves:** stale rejected offer cannot be accepted; concurrent direct-assign + send-offer cannot leave a load demoted to OFFERED with a `driver_id`; clicking `en_route` on a NEW or COMPLETED load returns a real error and changes nothing.
- `npm run lint && npm run typecheck && npm run build` clean.
- Codex re-runs the blocking section of [audit-checklist.md](audit-checklist.md) and confirms each item in this folder.

---

### Phase 2 — Production hygiene
**Goal:** the app is now safe and is also defensible in code review and operationally observable.

**Scope:**

1. **Type generation:**
   - Add `npm run supabase:types` script that runs `supabase gen types typescript --project-id <ref>` and writes to `types/database.ts`. Run it once and commit the regenerated file.

2. **Validation tightening:**
   - Loosen UUID regex to accept any 8-4-4-4-12 hex (M5).
   - In `requiredNumber` for price fields, reject negatives and >2 decimals before hitting the DB (M6).
   - DB CHECK: `check (price = round(price, 2))` on `loads.price`, `loads.agreed_price`, `offers.offered_price`.
   - **A6 (Codex):** `check (distance_miles is null or distance_miles >= 0)`; state codes constrained to two uppercase letters (`check (pickup_state ~ '^[A-Z]{2}$' and delivery_state ~ '^[A-Z]{2}$')`); decide on phone normalization (defer real E.164 until SMS lands, but at least strip whitespace on insert).

3. **Audit-trail hardening:**
   - Add `created_by uuid references auth.users(id)` (nullable for now, default `auth.uid()`) to `loads` and `offers`. Cheap to add now; expensive to backfill later.
   - Switch `loads.driver_id` and `offers.driver_id` to `on delete restrict`, add `is_archived boolean default false` on drivers. Update `getDriversData` and matching to filter out archived drivers; `deleteDriverAction` flips the flag instead of deleting.
   - **A3 (Codex): edit-lock on non-NEW loads.** In `updateLoadAction`, when `status <> 'NEW'`, accept only `notes` updates. Route, vehicle, price, and date become immutable once an offer has gone out — otherwise the offer's `message_body` and the driver's accepted price become ambiguous. If a dispatcher genuinely needs to change a route after offers are out, they call `unassign_load` first (which is in Phase 1), then edit, then re-offer.
   - Add a soft-archive path for loads too: `loads.is_archived boolean default false`. `deleteLoadAction` only hard-deletes never-touched NEW loads; everything else flips `is_archived`.

4. **Match-logic cleanup:**
   - Either wire `distance_miles` into the score, or remove the field from the form. Picking one keeps the data honest.
   - Reword the matching note on `/drivers` to actually match the scoring rules in `lib/matching.ts`, or simplify the rules.

5. **`.env.example` sanitization:**
   - Replace the real Supabase URL with a placeholder. Move the real URL into a private setup note (this folder, or 1Password).

**Exit criteria:**
- Generated `types/database.ts` matches the live schema.
- Audit trail survives a driver "deletion" and a load "deletion".
- Edit-lock test: cannot change a route on an OFFERED/ASSIGNED load through the UI.
- All medium-priority items in the audit either fixed or explicitly deferred to phase 4 with rationale in this file.

---

### Phase 3 — Deploy + first real run
**Goal:** the dispatcher can use this from a browser tab against a deployed environment without surprise.

**Scope:**

1. **Git init + first commit:**
   - `git init`, verify `.gitignore` excludes `.env*.local`, `.next`, `node_modules`, `tsconfig.tsbuildinfo`. Commit. Push to a private GitHub repo.

2. **Vercel deploy:**
   - Create Vercel project from the repo.
   - Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as Vercel env vars (Production + Preview).
   - Confirm `npm run build` runs clean in Vercel.

3. **Supabase Auth hardening (gates the deploy — A4 from Codex):**
   - **Disable public signups in the Supabase Auth dashboard.** Users are created manually by the project owner. This is the precondition that lets us ship with `using(true)` RLS in v1. If signups are on, every internet user becomes an authenticated user with full CRUD on every row. Hard gate, not optional.
   - Set Site URL to the Vercel production domain.
   - Add Additional Redirect URLs for any preview domains we'll actually use.
   - Enable Captcha on auth (`hCaptcha` or Turnstile).
   - Tighten email rate limits.
   - Confirm SMTP is configured (or accept that auth emails go through Supabase's shared SMTP for now).
   - Confirm at least one dispatcher user exists.
   - **Document in this folder** (`phase3-auth-config.md`) the exact Auth settings applied, with a screenshot of "Allow new users to sign up" being off. So we can detect drift later.

4. **End-to-end smoke test on the deployed URL** (browser, not just curl):
   - Sign in.
   - Create one driver (open trailer, Houston TX, preferred routes "TX, GA").
   - Create one load Houston→Atlanta.
   - Confirm matching shows the driver.
   - Send offer.
   - In `/driver-panel`, accept it.
   - Mark `en_route`, then `picked_up`, then `delivered`. Confirm load goes to COMPLETED.
   - Repeat with two pending offers and accept one — confirm the other is auto-rejected.
   - Repeat with a direct assign (no pending offer).
   - Try the unassign button — confirm load returns to NEW and a new offer can be sent.
   - Confirm B3 guard: try to delete an ASSIGNED load — should refuse.

**Exit criteria:**
- App is live at a stable URL.
- Smoke test above is documented in this folder as `phase3-smoke-test.md` with date, URL, dispatcher email, and pass/fail per step.

---

### Phase 4 — Future, behind a gate
**Goal:** scope creep is parked here so we don't fold it into v1.

Each item below is locked out until both this plan and a separate per-feature plan say it's in scope.

- Driver Supabase Auth + driver mobile UX. Triggers the RLS rewrite (H5): add `profiles(user_id, role)`, replace `using(true)` with role-aware policies, gate `set_driver_progress` access to the matching driver.
- **Super Dispatch ingestion connector.** Builds on the readiness in §3.5. Adds `/api/integrations/super-dispatch/webhook`, a Vercel cron pull, and the status-mapping table in code. Should be its own mini-plan before any code lands.
- **Central Dispatch — deferred indefinitely.** No build path until/unless Cox Automotive's partner program is in scope. The §3.5 readiness slot is enough to add it as a 5-line config change later. Email-parsing and userscript shortcuts are explicitly **not** an option — see §3.5.
- Real SMS provider (Twilio/SignalWire). Replace `buildOfferMessage` consumer.
- Real geocoding + mileage. Replace string-based `parseLocation` matching.
- Multi-tenant / multi-company separation. Adds `organizations` and `organization_members`.
- Automated tests (Playwright for the workflow paths above).
- Background jobs (e.g., auto-expire pending offers older than N minutes).
- Notes / comments per offer, audit log table.

If a feature on this list becomes urgent, write a focused mini-plan in `claude-handoff/` and attach it to this file before touching code.

---

### §3.5 Integration readiness (Super Dispatch)

This section is cross-cutting: a small set of decisions taken in v1 that make the eventual Super Dispatch connector additive instead of a migration.

**Why we are doing this in v1, not later.** Three reasons:

1. **The columns are cheap now and expensive later.** Adding `external_source`, `external_id`, `external_url`, `external_payload`, `external_synced_at`, and the partial unique index in the same `20260506_dispatch_hardening.sql` migration costs us four `alter table` statements while the table is essentially empty. Doing it post-launch means a migration on a live table that the dispatcher is actively writing to — same SQL, more risk, and a coordination cost.
2. **The system-of-record decision shapes the workflow code we're writing right now.** If ProDispatch is the SoR for status (recommended), the RPCs in Phase 1 (`set_driver_progress`, `assign_load`, `unassign_load`) need to know they don't have to consult anything upstream before flipping state. If we said "upstream is SoR," the same RPCs would have to gate every transition on an external acknowledgement — totally different design. Locking this decision now keeps Phase 1 simple.
3. **Naming collisions are free to avoid up front.** Reserving `/api/integrations/super-dispatch/*` and the `SUPER_DISPATCH_*` env-var prefix costs nothing today and prevents a path/secret rename later.

**What we lock in now (no connector code is written):**

- **Schema slot.** The columns and unique partial index above ship in `20260506_dispatch_hardening.sql`. Existing rows default to `external_source = 'manual'`. The unique index is partial on `where external_id is not null`, so manual loads are not constrained.
- **System-of-record rule.** Once a load exists in `loads`, ProDispatch owns its status. Upstream boards are an inbox, not a master. Connectors in Phase 4 may *push* status changes upstream after a successful internal RPC, but they may not *block* an internal transition on upstream acknowledgement. This is the single most important architectural commitment in this section.
- **Status mapping decision.** Our internal `load_status` + `driver_progress_status` is the canonical model. When Super Dispatch ships, we add a separate `external_status text` column on `loads` that mirrors upstream verbatim. Internal status is never widened to fit upstream's vocabulary. This avoids the worst version of this problem (renaming our enum to fit a vendor's state machine).
- **Route namespace reserved.** Do not use `/api/integrations/super-dispatch/*` or `/api/integrations/central-dispatch/*` for anything else. Do not create the files yet.
- **Secrets boundary.** Upstream API keys live in server-only Vercel env vars (`SUPER_DISPATCH_API_KEY`, `SUPER_DISPATCH_WEBHOOK_SECRET`, etc — *no* `NEXT_PUBLIC_` prefix). They are never read by `lib/supabase/*`. They are read only inside route handlers under the reserved namespace above. Document this in the env-var README block before Phase 3 deploy.
- **Idempotency contract.** Future ingestion code upserts on `(external_source, external_id)`, never on `id`. The unique partial index makes that safe.
- **No shortcuts on Central Dispatch.** Email parsing and browser-extension scraping are explicitly out of scope and stay out of scope. They look cheap and are maintenance traps; the dispatcher loses trust faster from silent format-change drops than from typing loads in by hand.

**What v1 deliberately does *not* do:**

- No connector code. No webhook handler. No cron. No state-mapping table. No bidirectional push.
- No `external_status` column yet — added with the Super Dispatch mini-plan in Phase 4.
- No multi-source-per-load support. A load belongs to exactly one source.

**Acceptance test for §3.5 (verified at end of Phase 1):**

- `select count(*) from loads where external_source = 'manual'` returns the full row count post-migration.
- `insert into loads (..., external_source, external_id) values (..., 'super_dispatch', 'foo')` succeeds, and a second insert with the same `('super_dispatch','foo')` fails with `23505`.

That's the entire integration readiness work for v1.

---

## 4. Division of labor

Roughly:

- **Codex:** owns implementation. Writes the schema migration, the action edits, the UI changes, the deploy steps. Has root context on "what was built and why".
- **Claude:** owns review, atomic-correctness arguments, and the plan itself. Edits this file, writes audit replies, signs off phases.

Either side can red-team the other and propose edits to this file. Edits land via PR-style turn: write the edit, name it (`change: ...`), get the other side's ack in the same folder, then merge. Don't silently rewrite — the audit trail in this folder is the only memory we have.

---

## 5. Open questions

Resolved in v2 by absorbing Codex's audit:

1. ~~`unassign_load` semantics~~ — **resolved:** keep `rejected` in v1, add `notes_internal` in Phase 2.
2. ~~Status dropdown~~ — **resolved:** drop entirely, replace with explicit Unassign button.
3. ~~Hard-delete vs soft-delete drivers~~ — **resolved:** soft-delete in Phase 2 with `is_archived`. Phase 1 just blocks delete on active assignments.
4. ~~Migration discipline~~ — **resolved:** additive migrations starting with `supabase/migrations/20260506_dispatch_hardening.sql`. `schema.sql` is the "from scratch" baseline only.
5. ~~Logging~~ — **resolved:** `console.error` + Vercel logs in v1. Sentry deferred.
6. ~~Confirm UI~~ — **resolved:** native browser `confirm()` in v1, real modal deferred.

Still open in v2 (Codex: please pick a stance):

7. **Edit-lock granularity (A3 from Codex's audit).** Phase 2 currently says: when `status <> 'NEW'`, only `notes` are editable. Is that the right cut? Alternative: also allow `pickup_date` edits on OFFERED loads (broker reschedules happen). Default proposal: notes-only is fine for v1, expand in Phase 4 if dispatchers ask. Codex's call.
8. **`set_driver_progress` reachability.** With drivers having no Supabase Auth in v1, the action is dispatcher-only. Phase 4 will lock it to the assigned driver once they get auth. Anything we should design into the Phase 1 RPC signature now to make that swap cheap? Default proposal: the RPC takes no actor argument and relies on the row-level check `driver_id is not null`; in Phase 4 we add a separate `set_driver_progress_as_driver(load_id, driver_status)` that asserts `driver_id = auth.uid()`. No signature change to the dispatcher path.
9. **Super Dispatch system-of-record locked? (§3.5)** This v2 commits to ProDispatch as SoR for status. If Codex disagrees this is the moment to flag it — once Phase 1 ships, the RPCs assume it. Default: locked.

---

## 6. Definition of "done" for the project as a whole

- All exit criteria for phases 1, 2, 3 satisfied.
- A real dispatcher can log in to the deployed Vercel app, run the workflow end-to-end without a developer in the loop, and the database state stays consistent.
- The audit checklist in `audit-checklist.md` passes top to bottom.
- The README accurately describes the deploy + onboard-first-user flow.

When that holds, ProDispatch v1 ships. Phase 4 is the v2 backlog.

---

## 7. Version stamp

- v1 — 2026-05-06 — initial plan, drafted by Claude in response to Codex's handoff and the audit in [claude-response.md](claude-response.md). Awaiting Codex audit of this plan.
- v2 — 2026-05-06 — folded in [codex-plan-audit.md](codex-plan-audit.md): promoted `sendOfferAction` and `accept_offer` pending guard to blocking; replaced B4 quick-fix with `set_driver_progress` RPC; rewrote CHECK constraint with three branches; added `send_offer` and `set_driver_progress` RPCs to Phase 1; added safe `return_to` helper and zero-row detection; locked migration filename to `20260506_dispatch_hardening.sql`; added A3 edit-lock and A6 data-quality CHECKs to Phase 2; added soft-archive for loads; gated Phase 3 deploy on Supabase public-signup-disabled. **Also added §3.5 Integration readiness (Super Dispatch)** at user request: schema slot (`external_source`, `external_id`, `external_url`, `external_payload`, `external_synced_at`, partial unique index) lands in the same Phase 1 migration, system-of-record decision locked to ProDispatch, route namespace and secrets boundary reserved, no connector code in v1. Central Dispatch deferred indefinitely; no scraping shortcuts. Awaiting Codex audit of v2.
