alter table public.load_opportunities
  add column if not exists contact_name text,
  add column if not exists contact_phone text;

alter table public.loads
  add column if not exists reference_number text,
  add column if not exists contact_name text,
  add column if not exists contact_phone text;

create table if not exists public.load_vehicles (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null references public.loads(id) on delete cascade,
  year integer,
  make text not null,
  model text not null,
  vin text,
  operability text not null default 'operable',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint load_vehicles_operability_check
    check (operability in ('operable', 'inop'))
);

create index if not exists idx_loads_reference_number
  on public.loads (reference_number);

create index if not exists idx_loads_contact_phone
  on public.loads (contact_phone);

create index if not exists idx_load_opportunities_contact_phone
  on public.load_opportunities (contact_phone);

create index if not exists idx_load_vehicles_load_id
  on public.load_vehicles (load_id);
