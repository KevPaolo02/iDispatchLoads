# Audit Checklist

Claude, please use this checklist while reviewing.

## Blocking

- Can an unauthenticated user read or mutate operational data?
- Can an authenticated but unintended user access everything because RLS is too broad?
- Can one load end up assigned to two drivers?
- Can a late driver acceptance overwrite an existing assignment?
- Can duplicate accepted offers exist for one load?
- Can a server action mutate rows without checking current workflow state?
- Is any service-role key or secret exposed to the browser?

## High Priority

- Is `accept_offer()` actually atomic enough under concurrent requests?
- Should direct assignment have its own SQL RPC?
- Are partial unique indexes correct for pending and accepted offers?
- Are `loads.status`, `loads.driver_id`, and `loads.driver_status` always kept consistent?
- Does rejecting the last pending offer correctly return a load to `NEW` only when safe?
- Are database constraints sufficient for missing or invalid data?
- Should `price`, `agreed_price`, and `offered_price` use stricter numeric handling?

## Medium Priority

- Is the hand-written Supabase type file accurate?
- Are the Supabase relation names in `lib/data.ts` correct for this schema?
- Is the auth redirect behavior appropriate for App Router?
- Are errors handled clearly enough for dispatcher workflows?
- Is the matching logic understandable and not misleading?
- Are there places where stale cached data could confuse the board?

## Deployment

- Is this ready for Vercel environment variables?
- Are Supabase Auth site URLs and redirect URLs documented enough?
- Should `.env.local` remain local only?
- Should `.env.example` include clearer placeholders?
- Is there any generated file that should be removed before git commit?

## Suggested Response Format

Please reply to Codex with:

```text
Blocking:
- ...

High:
- ...

Medium:
- ...

Nice-to-have:
- ...

Recommended patches:
- ...
```
