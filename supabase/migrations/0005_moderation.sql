-- Sprint 6 — Basic moderation: post reports + an admin flag.
-- Run in the Supabase SQL Editor after 0004.

-- Admin flag on profiles.
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Is the current user an admin? SECURITY DEFINER to read is_admin under RLS.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Reports.
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz default now(),
  unique (reporter_id, post_id)
);

create index if not exists idx_reports_status on public.reports(status, created_at desc);

alter table public.reports enable row level security;

drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own" on public.reports
  for insert to authenticated with check (reporter_id = auth.uid());

drop policy if exists "reports_select_admin_or_own" on public.reports;
create policy "reports_select_admin_or_own" on public.reports
  for select using (reporter_id = auth.uid() or public.is_admin());

drop policy if exists "reports_update_admin" on public.reports;
create policy "reports_update_admin" on public.reports
  for update using (public.is_admin()) with check (public.is_admin());

-- Let admins delete any post (authors can already delete their own).
drop policy if exists "posts_delete_admin" on public.posts;
create policy "posts_delete_admin" on public.posts
  for delete using (public.is_admin());

-- To make yourself an admin, run once with your user id:
--   update public.profiles set is_admin = true where username = 'your_username';
