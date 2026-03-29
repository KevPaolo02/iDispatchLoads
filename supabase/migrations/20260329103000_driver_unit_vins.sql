alter table public.drivers
  add column if not exists truck_unit_number text,
  add column if not exists truck_vin text,
  add column if not exists trailer_unit_number text,
  add column if not exists trailer_vin text;
