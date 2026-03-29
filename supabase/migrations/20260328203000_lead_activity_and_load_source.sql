alter table if exists public.leads
  add column if not exists last_contacted_at timestamptz;

alter table if exists public.loads
  add column if not exists source_lead_id uuid references public.leads(id) on delete set null;

create index if not exists idx_leads_last_contacted_at on public.leads(last_contacted_at desc);
create index if not exists idx_loads_source_lead_id on public.loads(source_lead_id);
