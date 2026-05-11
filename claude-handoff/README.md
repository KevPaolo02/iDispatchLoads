# Claude Handoff: ProDispatch Audit Brief

This folder is for Claude to review the current ProDispatch implementation and reply back with findings, risks, and recommended fixes.

## Project Location

```text
/Users/kevincastrillonmiranda/ProDispatch
```

## What Was Built

ProDispatch is a private internal dispatch dashboard for a small car transport dispatcher managing roughly 2 to 10 drivers.

It uses:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase for auth and Postgres
- Supabase SSR client utilities
- Server actions for database mutations

This is not a public marketplace. The app is meant to sit between external load boards and internal drivers.

## Main User Flows

1. Dispatcher signs in through Supabase Auth at `/login`.
2. Dispatcher creates and manages loads from `/`.
3. Dispatcher views and edits drivers at `/drivers`.
4. Dispatcher opens a load detail page at `/loads/[id]`.
5. App ranks available drivers for that load with simple rule-based matching.
6. Dispatcher sends mock SMS offers from the ranked list.
7. Driver accepts or rejects offers through the internal `/driver-panel` route.
8. Accepted offer assigns the load, stores `driver_id`, stores `agreed_price`, and rejects other pending offers.
9. Driver updates load progress through `en_route`, `picked_up`, and `delivered`.

## Important Files To Review

```text
app/(dashboard)/actions.ts
app/(dashboard)/page.tsx
app/(dashboard)/loads/[id]/page.tsx
app/(dashboard)/drivers/page.tsx
app/(dashboard)/driver-panel/page.tsx
app/(auth)/actions.ts
app/(auth)/login/page.tsx
lib/data.ts
lib/matching.ts
lib/supabase/server.ts
lib/supabase/client.ts
lib/supabase/middleware.ts
supabase/schema.sql
types/database.ts
README.md
package.json
```

## Verification Already Run

These passed after the latest cleanup:

```bash
npm run lint
npm run typecheck
npm run build
npm audit --audit-level=moderate
```

`npm audit` reported `0 vulnerabilities` after adding a `postcss` override in `package.json`.

## Current Local URL

The dev server was last started on:

```text
http://localhost:3002
```

If that port is stale, run:

```bash
npm run dev
```

Next will print the active localhost URL.

## Known Non-Code Setup

The SQL schema has already been run in Supabase according to the user.

The app still requires at least one Supabase Auth user to log in:

```text
Supabase Dashboard -> Authentication -> Users -> Add user
```

## Audit Request For Claude

Please audit this as a production-readiness review, not just a style review.

Focus especially on:

- Supabase auth correctness
- RLS policy scope
- Whether server actions expose unsafe mutation paths
- Race conditions in offer acceptance and direct assignment
- Whether `accept_offer()` properly prevents late acceptances
- Data validation gaps
- Whether using the anon key in SSR clients is appropriate here
- Whether the hand-written `types/database.ts` is accurate enough
- Deployment readiness for Vercel
- Any places where a dispatcher could accidentally corrupt workflow state

Please reply with:

1. Blocking issues
2. High-priority issues
3. Medium-priority issues
4. Nice-to-have improvements
5. Specific file and line references when possible
6. Concrete suggested patches or SQL changes when useful
