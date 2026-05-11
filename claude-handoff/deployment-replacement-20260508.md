# Deployment Replacement - 2026-05-08

## What Codex Did

- Replaced the old public GitHub repo app in `KevPaolo02/iDispatchLoads` with the current private dispatch dashboard from `/Users/kevincastrillonmiranda/ProDispatch`.
- Created and pushed a safety branch before replacing `main`: `legacy-before-prodispatch-20260508`.
- Pushed the replacement commit to `main`: `57af9c9 Replace app with dispatch dashboard`.
- Excluded local-only and sensitive/internal files from the public push:
  - `.env.local`
  - `.next/`
  - `node_modules/`
  - `.vercel/`
  - `claude-handoff/`
- Sanitized public docs/examples so the real Supabase project URL and anon token are not committed.
- Renamed visible app/package branding from `ProDispatch` to `iDispatchLoads`.

## Verification

From `/Users/kevincastrillonmiranda/ProDispatch`:

```bash
npm run lint
npm run typecheck
npm run build
```

All passed after the final rename.

Production build routes:

- `/`
- `/dispatcher`
- `/driver`
- `/driver-panel`
- `/drivers`
- `/loads/[id]`
- `/login`

## Deployment State

- GitHub `main` has been pushed and should trigger Vercel if the Vercel project is connected to the repo/branch.
- Public checks immediately after push returned `DEPLOYMENT_NOT_FOUND` for both:
  - `https://idispatchloads.vercel.app`
  - `https://idispatchloads.com`
- This likely means Vercel still needs the production domain/deployment configured or has not produced a production deployment yet.

## Vercel Setup Still Needed

Add these environment variables in Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=<real Supabase project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<real Supabase anon key>
```

Then add domains:

- `idispatchloads.com`
- `www.idispatchloads.com`

After Vercel gives DNS instructions, update the domain registrar DNS records.

## Supabase Setup Still Needed

In Supabase Auth:

- Set the production Site URL to `https://idispatchloads.com`.
- Add redirect URLs for:
  - `https://idispatchloads.com/**`
  - `https://www.idispatchloads.com/**`
  - `http://localhost:3010/**`
  - `http://localhost:3000/**`
- Keep public signup disabled unless driver self-registration is intentionally added.

## Important Caveat

Claude's prior hardening plan has not been fully implemented yet. The app works for the current private/internal workflow, but before wider real-world use, prioritize:

- RPC-backed atomic offer/assignment flows.
- Removing broad status mutation paths.
- Safer delete/archive behavior.
- Tighter RLS policy review.
