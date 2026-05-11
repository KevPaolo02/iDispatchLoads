-- iDispatchLoads Phase 4: broker / dealer / shipper memory
-- See claude-handoff/plan.md §Phase 4 for rationale.
-- Adds: public.contacts table, broker_id/dealer_id FKs on public.loads.
-- Safe to re-run.

------------------------------------------------------------------------------------------
-- 1. contacts table
------------------------------------------------------------------------------------------

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('broker', 'dealer', 'shipper')),
  phone text,
  avg_wait_minutes integer check (avg_wait_minutes is null or avg_wait_minutes >= 0),
  payment_speed text check (payment_speed is null or payment_speed in ('fast', 'normal', 'slow', 'never')),
  notes text,
  tags text[],
  created_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists contacts_type_idx on public.contacts (type, name);

-- Reuses the existing public.set_updated_at() trigger function from the
-- baseline schema (already locked-down with search_path in the 20260506
-- hardening migration).
drop trigger if exists set_contacts_updated_at on public.contacts;
create trigger set_contacts_updated_at
  before update on public.contacts
  for each row
  execute function public.set_updated_at();

alter table public.contacts enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'contacts'
      and policyname = 'contacts_authenticated_all'
  ) then
    create policy contacts_authenticated_all
      on public.contacts
      for all
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;

------------------------------------------------------------------------------------------
-- 2. Link contacts to loads
------------------------------------------------------------------------------------------

alter table public.loads add column if not exists broker_id uuid references public.contacts(id) on delete set null;
alter table public.loads add column if not exists dealer_id uuid references public.contacts(id) on delete set null;

create index if not exists loads_broker_id_idx on public.loads (broker_id) where broker_id is not null;
create index if not exists loads_dealer_id_idx on public.loads (dealer_id) where dealer_id is not null;
