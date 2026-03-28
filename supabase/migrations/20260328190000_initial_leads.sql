create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text not null,
  truck_type text not null,
  preferred_lanes text not null,
  notes text,
  status text not null check (status in ('new', 'contacted', 'qualified', 'onboarded', 'lost')),
  source text not null default 'website',
  campaign text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_created_at on public.leads(created_at desc);
create index if not exists idx_leads_email on public.leads(email);
