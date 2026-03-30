import {
  activityActionTypes,
  activityEntityTypes,
  dispatchLoadStatuses,
  driverStatuses,
  leadStatuses,
  loadOpportunityStatuses,
  loadVehicleOperabilityStatuses,
  problemFlagTypes,
  problemPriorityLevels,
} from "@/lib/types/entities";

const leadStatusCheck = leadStatuses.map((status) => `'${status}'`).join(", ");
const driverStatusCheck = driverStatuses
  .map((status) => `'${status}'`)
  .join(", ");
const dispatchLoadStatusCheck = dispatchLoadStatuses
  .map((status) => `'${status}'`)
  .join(", ");
const loadOpportunityStatusCheck = loadOpportunityStatuses
  .map((status) => `'${status}'`)
  .join(", ");
const loadVehicleOperabilityCheck = loadVehicleOperabilityStatuses
  .map((status) => `'${status}'`)
  .join(", ");
const activityEntityTypeCheck = activityEntityTypes
  .map((type) => `'${type}'`)
  .join(", ");
const activityActionTypeCheck = activityActionTypes
  .map((type) => `'${type}'`)
  .join(", ");
const problemFlagTypeCheck = problemFlagTypes
  .map((type) => `'${type}'`)
  .join(", ");
const problemPriorityCheck = problemPriorityLevels
  .map((level) => `'${level}'`)
  .join(", ");

export const leadTableName = "leads";
export const driverTableName = "drivers";
export const loadTableName = "loads";
export const loadOpportunityTableName = "load_opportunities";
export const loadVehicleTableName = "load_vehicles";
export const loadOpportunityVehicleTableName = "load_opportunity_vehicles";
export const activityEventTableName = "activity_events";
export const problemFlagTableName = "problem_flags";

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
    assigned_dispatcher_email text,
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
  create index if not exists idx_drivers_assigned_dispatcher on public.${driverTableName}(assigned_dispatcher_email);
  create unique index if not exists idx_drivers_source_lead_id on public.${driverTableName}(source_lead_id)
    where source_lead_id is not null;
  create index if not exists idx_drivers_created_at on public.${driverTableName}(created_at desc);
  create index if not exists idx_loads_status on public.${loadTableName}(status);
  create index if not exists idx_loads_driver_id on public.${loadTableName}(driver_id);
  create index if not exists idx_loads_created_at on public.${loadTableName}(created_at desc);
`;

export const movementBoardSchemaSql = `
  alter table public.${driverTableName}
    add column if not exists truck_unit_number text,
    add column if not exists truck_vin text,
    add column if not exists trailer_unit_number text,
    add column if not exists trailer_vin text,
    add column if not exists current_location text,
    add column if not exists available_from timestamptz,
    add column if not exists capacity integer;

  alter table public.${loadTableName}
    add column if not exists source_opportunity_id uuid;

  create table if not exists public.${loadOpportunityTableName} (
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
    status text not null default 'new' check (status in (${loadOpportunityStatusCheck})),
    assigned_driver_id uuid references public.${driverTableName}(id) on delete set null,
    notes text,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
  );

  do $$
  begin
    if not exists (
      select 1
      from pg_constraint
      where conname = 'loads_source_opportunity_fk'
    ) then
      alter table public.${loadTableName}
        add constraint loads_source_opportunity_fk
        foreign key (source_opportunity_id)
        references public.${loadOpportunityTableName}(id)
        on delete set null;
    end if;
  end $$;

  create index if not exists idx_drivers_available_from on public.${driverTableName}(available_from);
  create index if not exists idx_load_opportunities_status on public.${loadOpportunityTableName}(status);
  create index if not exists idx_load_opportunities_assigned_driver on public.${loadOpportunityTableName}(assigned_driver_id);
  create index if not exists idx_load_opportunities_created_at on public.${loadOpportunityTableName}(created_at desc);
  create index if not exists idx_loads_source_opportunity_id on public.${loadTableName}(source_opportunity_id);
`;

export const dispatcherReadyOpsSchemaSql = `
  alter table public.${loadOpportunityTableName}
    drop constraint if exists load_opportunities_status_check;

  alter table public.${loadOpportunityTableName}
    add constraint load_opportunities_status_check
    check (status in (${loadOpportunityStatusCheck}));

  alter table public.${loadTableName}
    drop constraint if exists loads_status_check;

  alter table public.${loadTableName}
    add constraint loads_status_check
    check (status in (${dispatchLoadStatusCheck}));

  update public.${loadOpportunityTableName}
    set status = case
      when status = 'reviewing' then 'needs_review'
      when status = 'booked' then 'closed_won'
      when status = 'passed' then 'closed_lost'
      else status
    end;

  update public.${loadTableName}
    set status = case
      when status = 'searching' then 'posted'
      when status = 'dispatched' then 'assigned'
      else status
    end;

  alter table public.${loadOpportunityTableName}
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
    add column if not exists customer_price numeric(10,2),
    add column if not exists carrier_pay numeric(10,2),
    add column if not exists contact_name text,
    add column if not exists contact_phone text;

  alter table public.${loadTableName}
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
    add column if not exists customer_price numeric(10,2),
    add column if not exists carrier_pay numeric(10,2),
    add column if not exists deposit_collected boolean not null default false,
    add column if not exists cod_amount numeric(10,2),
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
    add column if not exists truck_trailer_type text;

  create table if not exists public.${loadVehicleTableName} (
    id uuid primary key default gen_random_uuid(),
    load_id uuid not null references public.${loadTableName}(id) on delete cascade,
    year integer,
    make text not null,
    model text not null,
    vin text,
    lot_number text,
    operability text not null default 'operable' check (operability in (${loadVehicleOperabilityCheck})),
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
  );

  create table if not exists public.${loadOpportunityVehicleTableName} (
    id uuid primary key default gen_random_uuid(),
    opportunity_id uuid not null references public.${loadOpportunityTableName}(id) on delete cascade,
    year integer,
    make text not null,
    model text not null,
    vin text,
    lot_number text,
    operability text not null default 'operable' check (operability in (${loadVehicleOperabilityCheck})),
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
  );

  create table if not exists public.${activityEventTableName} (
    id uuid primary key default gen_random_uuid(),
    entity_type text not null check (entity_type in (${activityEntityTypeCheck})),
    entity_id uuid not null,
    action_type text not null check (action_type in (${activityActionTypeCheck})),
    actor_email text not null,
    actor_role text not null,
    note_body text,
    old_value jsonb,
    new_value jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
  );

  create table if not exists public.${problemFlagTableName} (
    id uuid primary key default gen_random_uuid(),
    entity_type text not null check (entity_type in (${activityEntityTypeCheck})),
    entity_id uuid not null,
    flag_type text not null check (flag_type in (${problemFlagTypeCheck})),
    priority text not null check (priority in (${problemPriorityCheck})),
    note_body text not null,
    resolved_at timestamptz,
    resolved_by_email text,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
  );

  create index if not exists idx_loads_reference_number on public.${loadTableName}(reference_number);
  create index if not exists idx_loads_contact_phone on public.${loadTableName}(contact_phone);
  create index if not exists idx_load_opportunities_contact_phone on public.${loadOpportunityTableName}(contact_phone);
  create index if not exists idx_load_vehicles_load_id on public.${loadVehicleTableName}(load_id);
  create index if not exists idx_load_opportunity_vehicles_opportunity_id on public.${loadOpportunityVehicleTableName}(opportunity_id);
  create index if not exists idx_activity_events_entity on public.${activityEventTableName}(entity_type, entity_id, created_at desc);
  create index if not exists idx_problem_flags_entity on public.${problemFlagTableName}(entity_type, entity_id, created_at desc);
  create index if not exists idx_problem_flags_open on public.${problemFlagTableName}(resolved_at) where resolved_at is null;
`;

export const dispatcherAccessSchemaSql = `
  alter table public.${driverTableName}
    add column if not exists assigned_dispatcher_email text;

  create index if not exists idx_drivers_assigned_dispatcher
    on public.${driverTableName}(assigned_dispatcher_email);
`;
