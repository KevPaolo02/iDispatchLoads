-- ProDispatch Phase 1 hardening migration
-- See claude-handoff/plan.md §3 Phase 1 for the full rationale.
-- This migration is additive. Do NOT rerun supabase/schema.sql against an existing project.
--
-- Idempotency: every block is safe to re-run. CREATE OR REPLACE is used for functions.
-- ALTER TABLE ... ADD COLUMN IF NOT EXISTS is used for new columns.
-- Constraints are added with `IF NOT EXISTS` semantics via DO blocks.
--
-- The CHECK constraint on loads is added as NOT VALID. After running this migration,
-- inspect existing rows for violations and then run:
--   ALTER TABLE public.loads VALIDATE CONSTRAINT loads_status_driver_consistent;
-- This avoids breaking the migration on any inconsistent rows that pre-date the constraint.

------------------------------------------------------------------------------------------
-- 1. Integration readiness columns (plan §3.5)
------------------------------------------------------------------------------------------

alter table public.loads add column if not exists external_source text not null default 'manual';
alter table public.loads add column if not exists external_id text;
alter table public.loads add column if not exists external_url text;
alter table public.loads add column if not exists external_payload jsonb;
alter table public.loads add column if not exists external_synced_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'loads_external_source_check'
      and conrelid = 'public.loads'::regclass
  ) then
    alter table public.loads
      add constraint loads_external_source_check
      check (external_source in ('manual', 'super_dispatch', 'central_dispatch'));
  end if;
end $$;

create unique index if not exists loads_external_idx
  on public.loads (external_source, external_id)
  where external_id is not null;

------------------------------------------------------------------------------------------
-- 2. Workflow integrity CHECK constraint (Codex's three-branch version)
------------------------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'loads_status_driver_consistent'
      and conrelid = 'public.loads'::regclass
  ) then
    alter table public.loads
      add constraint loads_status_driver_consistent
      check (
        (status in ('NEW', 'OFFERED')
          and driver_id is null
          and agreed_price is null
          and driver_status is null)
        or (status = 'ASSIGNED'
          and driver_id is not null
          and agreed_price is not null
          and driver_status in ('assigned', 'en_route', 'picked_up'))
        or (status = 'COMPLETED'
          and driver_id is not null
          and agreed_price is not null
          and driver_status = 'delivered')
      ) not valid;
  end if;
end $$;

------------------------------------------------------------------------------------------
-- 3. set_updated_at trigger function — add search_path lockdown
------------------------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

------------------------------------------------------------------------------------------
-- 4. accept_offer — patched with pending-status guard (B6) and search_path lockdown
------------------------------------------------------------------------------------------

create or replace function public.accept_offer(
  p_offer_id uuid,
  p_agreed_price numeric default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_offer_status public.offer_status;
  v_load_id uuid;
  v_driver_id uuid;
  v_load_price numeric;
  v_load_status public.load_status;
begin
  select
    o.status,
    o.load_id,
    o.driver_id,
    l.price,
    l.status
  into
    v_offer_status,
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

  -- B6: refuse to flip a non-pending offer.
  if v_offer_status <> 'pending' then
    return jsonb_build_object('ok', false, 'reason', 'offer_not_pending');
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

------------------------------------------------------------------------------------------
-- 5. send_offer RPC (B5) — replaces the multi-statement sendOfferAction body
------------------------------------------------------------------------------------------

create or replace function public.send_offer(
  p_load_id uuid,
  p_driver_id uuid,
  p_offered_price numeric,
  p_message_body text
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_load_status public.load_status;
  v_load_driver_id uuid;
  v_offer_id uuid;
begin
  select status, driver_id
  into v_load_status, v_load_driver_id
  from public.loads
  where id = p_load_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'load_not_found');
  end if;

  if v_load_status not in ('NEW', 'OFFERED') or v_load_driver_id is not null then
    return jsonb_build_object('ok', false, 'reason', 'load_unavailable');
  end if;

  if exists (
    select 1 from public.offers
    where load_id = p_load_id and driver_id = p_driver_id and status = 'pending'
  ) then
    return jsonb_build_object('ok', false, 'reason', 'pending_offer_exists');
  end if;

  if exists (
    select 1 from public.offers
    where load_id = p_load_id and status = 'accepted'
  ) then
    return jsonb_build_object('ok', false, 'reason', 'already_accepted');
  end if;

  insert into public.offers (load_id, driver_id, status, offered_price, message_body)
  values (p_load_id, p_driver_id, 'pending', p_offered_price, p_message_body)
  returning id into v_offer_id;

  if v_load_status = 'NEW' then
    update public.loads set status = 'OFFERED' where id = p_load_id;
  end if;

  return jsonb_build_object('ok', true, 'offer_id', v_offer_id);
end;
$$;

------------------------------------------------------------------------------------------
-- 6. assign_load RPC (H1) — atomic direct assignment
------------------------------------------------------------------------------------------

create or replace function public.assign_load(
  p_load_id uuid,
  p_driver_id uuid,
  p_agreed_price numeric default null,
  p_message_body text default 'Direct assign'
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_load_status public.load_status;
  v_load_driver_id uuid;
  v_load_price numeric;
  v_agreed_value numeric;
begin
  select status, driver_id, price
  into v_load_status, v_load_driver_id, v_load_price
  from public.loads
  where id = p_load_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'load_not_found');
  end if;

  if v_load_status not in ('NEW', 'OFFERED') or v_load_driver_id is not null then
    return jsonb_build_object('ok', false, 'reason', 'load_unavailable');
  end if;

  v_agreed_value := coalesce(p_agreed_price, v_load_price);

  -- Reject all pending offers on this load (including any to the chosen driver).
  update public.offers
  set status = 'rejected', responded_at = timezone('utc', now())
  where load_id = p_load_id and status = 'pending';

  -- Insert the accepted offer as the audit record. The unique partial index
  -- offers_one_accepted_per_load_idx is the final safety net against races.
  insert into public.offers (
    load_id, driver_id, status, offered_price, message_body, responded_at
  )
  values (
    p_load_id, p_driver_id, 'accepted',
    v_agreed_value, p_message_body, timezone('utc', now())
  );

  update public.loads
  set status = 'ASSIGNED',
      driver_id = p_driver_id,
      agreed_price = v_agreed_value,
      driver_status = 'assigned'
  where id = p_load_id;

  return jsonb_build_object('ok', true, 'load_id', p_load_id, 'driver_id', p_driver_id);
end;
$$;

------------------------------------------------------------------------------------------
-- 7. unassign_load RPC (B2) — clean rollback to NEW
------------------------------------------------------------------------------------------

create or replace function public.unassign_load(
  p_load_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_load_status public.load_status;
begin
  select status
  into v_load_status
  from public.loads
  where id = p_load_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'load_not_found');
  end if;

  if v_load_status = 'COMPLETED' then
    return jsonb_build_object('ok', false, 'reason', 'load_completed');
  end if;

  -- Reject any accepted or pending offers.
  update public.offers
  set status = 'rejected',
      responded_at = coalesce(responded_at, timezone('utc', now()))
  where load_id = p_load_id and status in ('pending', 'accepted');

  update public.loads
  set status = 'NEW',
      driver_id = null,
      agreed_price = null,
      driver_status = null
  where id = p_load_id;

  return jsonb_build_object('ok', true);
end;
$$;

------------------------------------------------------------------------------------------
-- 8. set_driver_progress RPC (B4) — gated transitions, no COMPLETED → ASSIGNED regression
------------------------------------------------------------------------------------------

create or replace function public.set_driver_progress(
  p_load_id uuid,
  p_driver_status public.driver_progress_status
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_load_status public.load_status;
  v_load_driver_id uuid;
begin
  select status, driver_id
  into v_load_status, v_load_driver_id
  from public.loads
  where id = p_load_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'load_not_found');
  end if;

  if v_load_status <> 'ASSIGNED' or v_load_driver_id is null then
    return jsonb_build_object('ok', false, 'reason', 'wrong_status');
  end if;

  if p_driver_status = 'delivered' then
    update public.loads
    set status = 'COMPLETED',
        driver_status = 'delivered'
    where id = p_load_id;
  else
    update public.loads
    set driver_status = p_driver_status
    where id = p_load_id;
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

------------------------------------------------------------------------------------------
-- 9. Grants
------------------------------------------------------------------------------------------

grant execute on function public.accept_offer(uuid, numeric) to authenticated;
grant execute on function public.send_offer(uuid, uuid, numeric, text) to authenticated;
grant execute on function public.assign_load(uuid, uuid, numeric, text) to authenticated;
grant execute on function public.unassign_load(uuid) to authenticated;
grant execute on function public.set_driver_progress(uuid, public.driver_progress_status) to authenticated;
