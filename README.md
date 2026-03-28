# iDispatchLoads.com

Dispatch-focused product for owner-operators and small fleets, built in stages:

- `Version 1`: Lead machine
- `Version 2`: Dispatch CRM
- `Version 3`: Platform

The project is currently in `Version 1`, focused on a high-converting marketing site and structured lead capture.

## Source of Truth

Project direction, staging, and implementation guardrails live in [docs/PRODUCT_MAP.md](docs/PRODUCT_MAP.md).
Schema and storage decisions live in [docs/SCHEMA.md](docs/SCHEMA.md).
Stack, infrastructure, and environment requirements live in [docs/STACK_AND_INFRA.md](docs/STACK_AND_INFRA.md).

## Current Priorities

- Refine the public landing page for owner-operators
- Finalize conversion-focused homepage sections
- Build form submission flow from form to API/server action to database
- Store leads in structured tables from day one
- Keep the codebase organized for future dashboard and portal layers

## Current App Structure

```text
app/
  (marketing)/   public lead-generation site
  (dashboard)/   reserved for the future dispatch CRM
  (portal)/      reserved for future client and platform features

components/
  marketing/
  dashboard/
  shared/

lib/
  api/
  auth/
  db/
  services/
  types/
  utils/
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the landing page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Deploy on Vercel

Deploy the marketing site once the homepage, form flow, and lead storage are ready.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for details.
