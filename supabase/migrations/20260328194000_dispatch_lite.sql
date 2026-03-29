create extension if not exists pgcrypto;

create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  driver_name text not null,
  phone text not null,
  truck_type text not null,
  home_base text not null,
  status text not null check (status in ('available', 'assigned', 'in_transit')),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.loads (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid references public.drivers(id) on delete set null,
  company text not null,
  origin text not null,
  destination text not null,
  pickup_date timestamptz,
  delivery_date timestamptz,
  broker text not null,
  rate numeric(10,2),
  status text not null check (status in ('searching', 'booked', 'dispatched', 'picked_up', 'delivered')),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_drivers_status on public.drivers(status);
create index if not exists idx_drivers_created_at on public.drivers(created_at desc);
create index if not exists idx_loads_status on public.loads(status);
create index if not exists idx_loads_driver_id on public.loads(driver_id);
create index if not exists idx_loads_created_at on public.loads(created_at desc);
