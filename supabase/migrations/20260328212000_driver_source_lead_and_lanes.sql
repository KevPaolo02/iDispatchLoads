alter table if exists public.drivers
  add column if not exists source_lead_id uuid references public.leads(id) on delete set null,
  add column if not exists preferred_lanes text;

create unique index if not exists idx_drivers_source_lead_id
  on public.drivers(source_lead_id)
  where source_lead_id is not null;
