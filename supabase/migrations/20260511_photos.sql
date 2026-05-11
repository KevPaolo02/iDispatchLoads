-- iDispatchLoads Phase 2: photo capture
-- See claude-handoff/plan.md §Phase 2 for rationale.
-- Adds: load-photos storage bucket, load_photos table, RLS policies for both.
-- Safe to re-run.

------------------------------------------------------------------------------------------
-- 1. Storage bucket
------------------------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'load-photos',
  'load-photos',
  false,                           -- private bucket; access via signed URLs only
  10485760,                        -- 10 MB cap per object
  array['image/jpeg', 'image/png', 'image/heic', 'image/webp']
)
on conflict (id) do nothing;

------------------------------------------------------------------------------------------
-- 2. load_photos table (audit/metadata for the storage objects)
------------------------------------------------------------------------------------------

create table if not exists public.load_photos (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null references public.loads(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete set null,
  stage text not null check (stage in ('pickup', 'delivery')),
  storage_path text not null,
  created_by uuid references auth.users(id),
  uploaded_at timestamptz not null default timezone('utc', now())
);

create index if not exists load_photos_load_id_stage_idx
  on public.load_photos (load_id, stage, uploaded_at desc);

alter table public.load_photos enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'load_photos'
      and policyname = 'load_photos_authenticated_all'
  ) then
    create policy load_photos_authenticated_all
      on public.load_photos
      for all
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;

------------------------------------------------------------------------------------------
-- 3. Storage policies on storage.objects scoped to the load-photos bucket
------------------------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'load_photos_authenticated_select'
  ) then
    create policy load_photos_authenticated_select
      on storage.objects
      for select
      to authenticated
      using (bucket_id = 'load-photos');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'load_photos_authenticated_insert'
  ) then
    create policy load_photos_authenticated_insert
      on storage.objects
      for insert
      to authenticated
      with check (bucket_id = 'load-photos');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'load_photos_authenticated_delete'
  ) then
    create policy load_photos_authenticated_delete
      on storage.objects
      for delete
      to authenticated
      using (bucket_id = 'load-photos');
  end if;
end $$;
