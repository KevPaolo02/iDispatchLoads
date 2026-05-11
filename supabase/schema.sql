create extension if not exists pgcrypto;

create type public.load_status as enum ('NEW', 'OFFERED', 'ASSIGNED', 'COMPLETED');
create type public.offer_status as enum ('pending', 'accepted', 'rejected');
create type public.driver_progress_status as enum ('assigned', 'en_route', 'picked_up', 'delivered');

create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  current_location text not null,
  preferred_routes jsonb not null default '[]'::jsonb,
  trailer_type text not null,
  is_available boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.loads (
  id uuid primary key default gen_random_uuid(),
  pickup_city text not null,
  pickup_state text not null,
  delivery_city text not null,
  delivery_state text not null,
  vehicle_type text not null,
  price numeric(10, 2) not null check (price >= 0),
  distance_miles integer,
  pickup_date date not null,
  notes text,
  status public.load_status not null default 'NEW',
  driver_id uuid references public.drivers(id) on delete set null,
  agreed_price numeric(10, 2) check (agreed_price is null or agreed_price >= 0),
  driver_status public.driver_progress_status,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null references public.loads(id) on delete cascade,
  driver_id uuid not null references public.drivers(id) on delete cascade,
  status public.offer_status not null default 'pending',
  offered_price numeric(10, 2) check (offered_price is null or offered_price >= 0),
  message_body text not null,
  responded_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists loads_status_pickup_date_idx on public.loads(status, pickup_date);
create index if not exists loads_driver_id_idx on public.loads(driver_id);
create index if not exists drivers_available_idx on public.drivers(is_available);
create index if not exists offers_load_id_idx on public.offers(load_id, created_at desc);
create index if not exists offers_driver_id_idx on public.offers(driver_id, created_at desc);

create unique index if not exists offers_one_pending_per_driver_load_idx
  on public.offers(load_id, driver_id)
  where status = 'pending';

create unique index if not exists offers_one_accepted_per_load_idx
  on public.offers(load_id)
  where status = 'accepted';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_loads_updated_at on public.loads;

create trigger set_loads_updated_at
before update on public.loads
for each row
execute function public.set_updated_at();

create or replace function public.accept_offer(
  p_offer_id uuid,
  p_agreed_price numeric default null
)
returns jsonb
language plpgsql
security invoker
as $$
declare
  v_load_id uuid;
  v_driver_id uuid;
  v_load_price numeric;
  v_load_status public.load_status;
begin
  select
    o.load_id,
    o.driver_id,
    l.price,
    l.status
  into
    v_load_id,
    v_driver_id,
    v_load_price,
    v_load_status
  from public.offers o
  join public.loads l on l.id = o.load_id
  where o.id = p_offer_id
  for update of o, l;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'offer_not_found');
  end if;

  if v_load_status in ('ASSIGNED', 'COMPLETED') then
    update public.offers
    set status = 'rejected', responded_at = timezone('utc', now())
    where id = p_offer_id and status = 'pending';

    return jsonb_build_object('ok', false, 'reason', 'load_unavailable');
  end if;

  if exists (
    select 1
    from public.offers
    where load_id = v_load_id
      and status = 'accepted'
      and id <> p_offer_id
  ) then
    update public.offers
    set status = 'rejected', responded_at = timezone('utc', now())
    where id = p_offer_id and status = 'pending';

    return jsonb_build_object('ok', false, 'reason', 'already_accepted');
  end if;

  update public.offers
  set status = 'accepted', responded_at = timezone('utc', now())
  where id = p_offer_id;

  update public.offers
  set status = 'rejected', responded_at = coalesce(responded_at, timezone('utc', now()))
  where load_id = v_load_id
    and id <> p_offer_id
    and status = 'pending';

  update public.loads
  set
    status = 'ASSIGNED',
    driver_id = v_driver_id,
    agreed_price = coalesce(p_agreed_price, v_load_price),
    driver_status = 'assigned'
  where id = v_load_id;

  return jsonb_build_object(
    'ok', true,
    'load_id', v_load_id,
    'driver_id', v_driver_id
  );
end;
$$;

grant execute on function public.accept_offer(uuid, numeric) to authenticated;

alter table public.drivers enable row level security;
alter table public.loads enable row level security;
alter table public.offers enable row level security;

drop policy if exists "drivers_authenticated_all" on public.drivers;
create policy "drivers_authenticated_all"
  on public.drivers
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "loads_authenticated_all" on public.loads;
create policy "loads_authenticated_all"
  on public.loads
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "offers_authenticated_all" on public.offers;
create policy "offers_authenticated_all"
  on public.offers
  for all
  to authenticated
  using (true)
  with check (true);
