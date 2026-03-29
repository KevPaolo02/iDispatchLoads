alter table public.drivers
  add column if not exists current_location text,
  add column if not exists available_from timestamptz,
  add column if not exists capacity integer;

alter table public.loads
  add column if not exists source_opportunity_id uuid;

create table if not exists public.load_opportunities (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_url text,
  source_reference text,
  company text,
  origin text not null,
  destination text not null,
  pickup_window timestamptz,
  delivery_window timestamptz,
  vehicles_count integer not null default 1,
  rate numeric(10,2),
  status text not null default 'new',
  assigned_driver_id uuid references public.drivers(id) on delete set null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint load_opportunities_status_check
    check (status in ('new', 'reviewing', 'booked', 'passed'))
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'loads_source_opportunity_fk'
  ) then
    alter table public.loads
      add constraint loads_source_opportunity_fk
      foreign key (source_opportunity_id)
      references public.load_opportunities(id)
      on delete set null;
  end if;
end $$;

create index if not exists idx_drivers_available_from
  on public.drivers (available_from);

create index if not exists idx_load_opportunities_status
  on public.load_opportunities (status);

create index if not exists idx_load_opportunities_assigned_driver
  on public.load_opportunities (assigned_driver_id);

create index if not exists idx_load_opportunities_created_at
  on public.load_opportunities (created_at desc);

create index if not exists idx_loads_source_opportunity_id
  on public.loads (source_opportunity_id);
