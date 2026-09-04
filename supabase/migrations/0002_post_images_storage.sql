-- Sprint 2 — Storage bucket for images embedded in blog posts.
-- Run this in the Supabase SQL Editor after 0001_init.sql.

-- Public bucket so <img> src URLs load without signed URLs.
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- Anyone can read post images.
drop policy if exists "post_images_public_read" on storage.objects;
create policy "post_images_public_read" on storage.objects
  for select using (bucket_id = 'post-images');

-- Authenticated users can upload only into their own folder: <uid>/<file>.
drop policy if exists "post_images_insert_own" on storage.objects;
create policy "post_images_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete only their own uploads.
drop policy if exists "post_images_delete_own" on storage.objects;
create policy "post_images_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
