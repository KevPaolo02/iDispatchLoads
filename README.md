# iDispatchLoads

Private full-stack dispatch dashboard for a small car transport operation using Next.js App Router, TypeScript, Tailwind CSS, and Supabase.

## 1. Project Structure

```text
app/
  (auth)/login/page.tsx
  (auth)/actions.ts
  (dashboard)/page.tsx
  (dashboard)/dispatcher/page.tsx
  (dashboard)/driver/page.tsx
  (dashboard)/drivers/page.tsx
  (dashboard)/driver-panel/page.tsx
  (dashboard)/loads/[id]/page.tsx
  (dashboard)/layout.tsx
  (dashboard)/actions.ts
  globals.css
  layout.tsx
components/
  app-shell.tsx
  central-dispatch-paste-form.tsx
  driver-form.tsx
  flash-banner.tsx
  load-form.tsx
  load-table.tsx
  match-card.tsx
  offer-card.tsx
  section-card.tsx
  status-badge.tsx
  summary-card.tsx
lib/
  central-dispatch-parser.ts
  constants.ts
  data.ts
  form-utils.ts
  matching.ts
  route-planning.ts
  supabase/
    client.ts
    middleware.ts
    server.ts
  utils.ts
supabase/
  schema.sql
types/
  database.ts
middleware.ts
```

## 2. Database Schema

Main schema lives in [`supabase/schema.sql`](supabase/schema.sql).

Highlights:

- `loads` stores route, vehicle, price, pickup date, notes, board status, assignment, and driver progress.
- `drivers` stores contact info, current location, preferred routes, trailer type, and availability.
- `offers` stores mock SMS offers, offered price, response status, and timestamps.
- `accept_offer()` prevents late acceptances from overwriting an already assigned load.
- Partial unique indexes block duplicate pending offers and more than one accepted offer per load.
- RLS allows only authenticated users to access the internal tool.

## 3. Step-by-Step Implementation

1. Apply the SQL in Supabase to create tables, enums, indexes, RLS, and the `accept_offer()` RPC.
2. Add your Supabase URL and anon key to `.env.local`.
3. Install dependencies with `npm install`.
4. Start the app with `npm run dev`.
5. Create at least one authenticated user in Supabase Auth, then sign in at `/login`.
6. Add drivers on `/drivers`, paste Central Dispatch loads or create loads manually on `/`, and manage offers or assignments from `/loads/[id]`.
7. Use `/dispatcher` to organize routes, avoid empty miles, and find better driver/load pairings.
8. Use `/driver` for the Spanish mobile driver view and `/driver-panel` to simulate internal driver-side testing.

## 4. Full Working Code

Key entry points:

- Dashboard board and Central Dispatch quick paste: [`app/(dashboard)/page.tsx`](app/(dashboard)/page.tsx)
- Dispatcher route planner: [`app/(dashboard)/dispatcher/page.tsx`](app/(dashboard)/dispatcher/page.tsx)
- Spanish mobile driver view: [`app/(dashboard)/driver/page.tsx`](app/(dashboard)/driver/page.tsx)
- Load detail, matching, offers, and assignment workflow: [`app/(dashboard)/loads/[id]/page.tsx`](app/(dashboard)/loads/[id]/page.tsx)
- Driver management: [`app/(dashboard)/drivers/page.tsx`](app/(dashboard)/drivers/page.tsx)
- Server actions and edge-case guards: [`app/(dashboard)/actions.ts`](app/(dashboard)/actions.ts)
- Rule-based matching logic: [`lib/matching.ts`](lib/matching.ts)
- Route planning logic: [`lib/route-planning.ts`](lib/route-planning.ts)
- Supabase SSR setup: [`lib/supabase/server.ts`](lib/supabase/server.ts), [`lib/supabase/middleware.ts`](lib/supabase/middleware.ts), [`middleware.ts`](middleware.ts)

## 5. Run Locally

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Then run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Connect this repository to Vercel.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel Environment Variables.
3. Add the production domain, for example `idispatchloads.com` and `www.idispatchloads.com`.
4. In Supabase Auth, set the Site URL to the production domain and add local/production redirect URLs.
5. Keep public signup disabled unless driver self-registration is intentionally added.

## 6. Suggested V2 Features

- Real geocoding and mileage scoring instead of text-based lane proximity.
- Twilio or other SMS integration for live offer delivery and reply webhooks.
- Broker/customer entities plus load source tracking from Central Dispatch or Super Dispatch.
- Multi-user roles for dispatcher vs. driver.
- Uploads for BOL, gate passes, and delivered photos.
- Profit reporting with broker price, driver pay, fuel, and net margin.
