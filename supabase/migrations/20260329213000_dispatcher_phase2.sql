create extension if not exists pgcrypto;

alter table public.load_opportunities
  drop constraint if exists load_opportunities_status_check;

alter table public.loads
  drop constraint if exists loads_status_check;

update public.load_opportunities
set status = case
  when status = 'reviewing' then 'needs_review'
  when status = 'booked' then 'closed_won'
  when status = 'passed' then 'closed_lost'
  else status
end
where status in ('reviewing', 'booked', 'passed');

update public.loads
set status = case
  when status = 'searching' then 'posted'
  when status = 'dispatched' then 'assigned'
  else status
end
where status in ('searching', 'dispatched');

alter table public.load_opportunities
  add constraint load_opportunities_status_check
  check (
    status in (
      'new',
      'needs_review',
      'needs_quote',
      'awaiting_customer',
      'ready_to_post',
      'closed_won',
      'closed_lost',
      'on_hold'
    )
  );

alter table public.loads
  add constraint loads_status_check
  check (
    status in (
      'posted',
      'negotiating',
      'booked',
      'assigned',
      'pickup_scheduled',
      'picked_up',
      'in_transit',
      'delivered',
      'closed',
      'problem_hold'
    )
  );

alter table public.load_opportunities
  add column if not exists pickup_city text,
  add column if not exists pickup_state text,
  add column if not exists pickup_zip text,
  add column if not exists delivery_city text,
  add column if not exists delivery_state text,
  add column if not exists delivery_zip text,
  add column if not exists trailer_type text,
  add column if not exists customer_name text,
  add column if not exists customer_phone text,
  add column if not exists customer_email text,
  add column if not exists first_available_date timestamptz,
  add column if not exists customer_price numeric(10, 2),
  add column if not exists carrier_pay numeric(10, 2);

alter table public.loads
  add column if not exists pickup_city text,
  add column if not exists pickup_state text,
  add column if not exists pickup_zip text,
  add column if not exists delivery_city text,
  add column if not exists delivery_state text,
  add column if not exists delivery_zip text,
  add column if not exists trailer_type text,
  add column if not exists customer_name text,
  add column if not exists customer_phone text,
  add column if not exists customer_email text,
  add column if not exists customer_price numeric(10, 2),
  add column if not exists carrier_pay numeric(10, 2),
  add column if not exists deposit_collected boolean not null default false,
  add column if not exists cod_amount numeric(10, 2),
  add column if not exists reference_number text,
  add column if not exists contact_name text,
  add column if not exists contact_phone text,
  add column if not exists pickup_contact_name text,
  add column if not exists pickup_contact_phone text,
  add column if not exists delivery_contact_name text,
  add column if not exists delivery_contact_phone text,
  add column if not exists carrier_company text,
  add column if not exists carrier_mc_number text,
  add column if not exists carrier_dispatcher_name text,
  add column if not exists carrier_dispatcher_phone text,
  add column if not exists carrier_driver_name text,
  add column if not exists carrier_driver_phone text,
  add column if not exists truck_trailer_type text,
  add column if not exists source_opportunity_id uuid;

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

alter table public.load_vehicles
  add column if not exists lot_number text;

create table if not exists public.load_opportunity_vehicles (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.load_opportunities(id) on delete cascade,
  year integer,
  make text not null,
  model text not null,
  vin text,
  lot_number text,
  operability text not null default 'operable'
    check (operability in ('operable', 'inop')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('load', 'load_opportunity')),
  entity_id uuid not null,
  action_type text not null check (
    action_type in (
      'status_changed',
      'notes_saved',
      'pricing_updated',
      'assignment_updated',
      'schedule_updated',
      'problem_flag_created',
      'problem_flag_resolved',
      'details_updated',
      'vehicle_added',
      'vehicle_updated',
      'vehicle_removed',
      'record_created'
    )
  ),
  actor_email text not null,
  actor_role text not null check (actor_role in ('admin', 'dispatcher', 'support')),
  note_body text,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.problem_flags (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('load', 'load_opportunity')),
  entity_id uuid not null,
  flag_type text not null check (
    flag_type in (
      'late_pickup',
      'late_delivery',
      'no_carrier_response',
      'no_customer_response',
      'pricing_issue',
      'damage_issue',
      'missing_docs',
      'reschedule_needed'
    )
  ),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  note_body text not null,
  resolved_at timestamptz,
  resolved_by_email text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_load_opportunities_status_created_at
  on public.load_opportunities(status, created_at desc);

create index if not exists idx_loads_status_created_at
  on public.loads(status, created_at desc);

create index if not exists idx_loads_pickup_date
  on public.loads(pickup_date);

create index if not exists idx_loads_delivery_date
  on public.loads(delivery_date);

create index if not exists idx_load_vehicles_load_id
  on public.load_vehicles(load_id);

create index if not exists idx_load_opportunity_vehicles_opportunity_id
  on public.load_opportunity_vehicles(opportunity_id);

create index if not exists idx_activity_events_entity
  on public.activity_events(entity_type, entity_id, created_at desc);

create index if not exists idx_problem_flags_entity
  on public.problem_flags(entity_type, entity_id, created_at desc);

create index if not exists idx_problem_flags_open
  on public.problem_flags(resolved_at)
  where resolved_at is null;
