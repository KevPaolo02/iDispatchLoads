import {
  dispatchLoadStatuses,
  driverStatuses,
  leadStatuses,
} from "@/lib/types/entities";

const leadStatusCheck = leadStatuses.map((status) => `'${status}'`).join(", ");
const driverStatusCheck = driverStatuses
  .map((status) => `'${status}'`)
  .join(", ");
const dispatchLoadStatusCheck = dispatchLoadStatuses
  .map((status) => `'${status}'`)
  .join(", ");

export const leadTableName = "leads";
export const driverTableName = "drivers";
export const loadTableName = "loads";

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
    last_contacted_at timestamptz,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
  );

  create index if not exists idx_leads_status on public.${leadTableName}(status);
  create index if not exists idx_leads_created_at on public.${leadTableName}(created_at desc);
  create index if not exists idx_leads_email on public.${leadTableName}(email);
`;

export const dispatchLiteSchemaSql = `
  create extension if not exists pgcrypto;

  create table if not exists public.${driverTableName} (
    id uuid primary key default gen_random_uuid(),
    source_lead_id uuid references public.${leadTableName}(id) on delete set null,
    company text not null,
    driver_name text not null,
    phone text not null,
    truck_type text not null,
    preferred_lanes text,
    home_base text not null,
    status text not null check (status in (${driverStatusCheck})),
    notes text,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
  );

  create table if not exists public.${loadTableName} (
    id uuid primary key default gen_random_uuid(),
    driver_id uuid references public.${driverTableName}(id) on delete set null,
    source_lead_id uuid references public.${leadTableName}(id) on delete set null,
    company text not null,
    origin text not null,
    destination text not null,
    pickup_date timestamptz,
    delivery_date timestamptz,
    broker text not null,
    rate numeric(10,2),
    status text not null check (status in (${dispatchLoadStatusCheck})),
    notes text,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
  );

  create index if not exists idx_drivers_status on public.${driverTableName}(status);
  create unique index if not exists idx_drivers_source_lead_id on public.${driverTableName}(source_lead_id)
    where source_lead_id is not null;
  create index if not exists idx_drivers_created_at on public.${driverTableName}(created_at desc);
  create index if not exists idx_loads_status on public.${loadTableName}(status);
  create index if not exists idx_loads_driver_id on public.${loadTableName}(driver_id);
  create index if not exists idx_loads_created_at on public.${loadTableName}(created_at desc);
`;
