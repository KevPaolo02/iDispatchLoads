alter table public.drivers
  add column if not exists assigned_dispatcher_email text;

create index if not exists idx_drivers_assigned_dispatcher
  on public.drivers (assigned_dispatcher_email);
