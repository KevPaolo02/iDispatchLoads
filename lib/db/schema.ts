import { leadStatuses } from "@/lib/types/entities";

const leadStatusCheck = leadStatuses.map((status) => `'${status}'`).join(", ");

export const leadTableName = "leads";

export const initialLeadSchemaSql = `
  create extension if not exists pgcrypto;

  create table if not exists public.${leadTableName} (
    id uuid primary key default gen_random_uuid(),
    first_name text not null,
    last_name text not null,
    phone text not null,
    email text not null,
    truck_type text not null,
    preferred_lanes text not null,
    notes text,
    status text not null check (status in (${leadStatusCheck})),
    source text not null default 'website',
    campaign text,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
  );

  create index if not exists idx_leads_status on public.${leadTableName}(status);
  create index if not exists idx_leads_created_at on public.${leadTableName}(created_at desc);
  create index if not exists idx_leads_email on public.${leadTableName}(email);
`;
