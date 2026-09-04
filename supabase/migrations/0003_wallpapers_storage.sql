-- Sprint 4 — Storage bucket for profile wallpapers.
-- Run in the Supabase SQL Editor after 0002.

insert into storage.buckets (id, name, public)
values ('wallpapers', 'wallpapers', true)
on conflict (id) do nothing;

drop policy if exists "wallpapers_public_read" on storage.objects;
create policy "wallpapers_public_read" on storage.objects
  for select using (bucket_id = 'wallpapers');

drop policy if exists "wallpapers_insert_own" on storage.objects;
create policy "wallpapers_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'wallpapers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "wallpapers_delete_own" on storage.objects;
create policy "wallpapers_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'wallpapers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
