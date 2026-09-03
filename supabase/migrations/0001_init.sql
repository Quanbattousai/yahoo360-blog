-- 360° Blog Platform — Sprint 1 schema
-- Run this in the Supabase SQL Editor, or via `supabase db push` with the CLI.
-- It creates all core tables (profiles, posts, comments, reactions, friendships,
-- guestbook_entries), row-level security, an updated_at trigger, and an
-- auto-create-profile trigger on signup.

-- ─────────────────────────────────────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ─────────────────────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────────────────────

-- Users (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name text,
  avatar_url text,
  bio text,
  mood text,
  profile_theme jsonb default '{}'::jsonb,
  profile_wallpaper jsonb,             -- { url, name, overlay_opacity }
  profile_layout jsonb default '[]'::jsonb, -- array of block objects (Sprint 3)
  grid_columns int default 3,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Blog posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  slug text not null,
  body jsonb,                          -- Tiptap JSON (Sprint 2)
  excerpt text,
  mood text,
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  visibility text default 'public' check (visibility in ('public', 'friends', 'private')),
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (author_id, slug)
);

-- Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  created_at timestamptz default now()
);

-- Reactions
create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('heart', 'sad', 'laugh', 'fire')),
  created_at timestamptz default now(),
  unique (post_id, user_id, type)
);

-- Friendships
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz default now(),
  unique (requester_id, receiver_id),
  check (requester_id <> receiver_id)
);

-- Guestbook entries
create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────────────────────
create index if not exists idx_posts_author on public.posts(author_id, published_at desc);
create index if not exists idx_posts_slug on public.posts(author_id, slug);
create index if not exists idx_comments_post on public.comments(post_id, created_at);
create index if not exists idx_friendships_users on public.friendships(requester_id, receiver_id);
create index if not exists idx_guestbook_profile on public.guestbook_entries(profile_id, created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- updated_at trigger
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Auto-create a profile row when a new auth user signs up.
-- Uses username/display_name from signup metadata when present and available,
-- otherwise falls back to a generated username (OAuth users complete it later
-- on the /onboarding page).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  meta_username text := nullif(trim(new.raw_user_meta_data->>'username'), '');
  final_username text;
begin
  if meta_username is not null
     and meta_username ~ '^[a-z0-9_]{3,20}$'
     and not exists (select 1 from public.profiles where username = meta_username) then
    final_username := meta_username;
  else
    final_username := 'user_' || substr(replace(new.id::text, '-', ''), 1, 12);
  end if;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      final_username
    ),
    nullif(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.profiles          enable row level security;
alter table public.posts             enable row level security;
alter table public.comments          enable row level security;
alter table public.reactions         enable row level security;
alter table public.friendships       enable row level security;
alter table public.guestbook_entries enable row level security;

-- profiles: world-readable; each user manages only their own row.
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- posts: published+public visible to all; authors always see/manage their own.
-- NOTE: 'friends' visibility enforcement lands in Sprint 5; for now friends-only
-- posts are visible only to their author.
drop policy if exists "posts_select_visible" on public.posts;
create policy "posts_select_visible" on public.posts
  for select using (
    (status = 'published' and visibility = 'public')
    or author_id = auth.uid()
  );

drop policy if exists "posts_insert_own" on public.posts;
create policy "posts_insert_own" on public.posts
  for insert with check (author_id = auth.uid());

drop policy if exists "posts_update_own" on public.posts;
create policy "posts_update_own" on public.posts
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());

drop policy if exists "posts_delete_own" on public.posts;
create policy "posts_delete_own" on public.posts
  for delete using (author_id = auth.uid());

-- comments: readable by all (Sprint 1); authors manage their own.
drop policy if exists "comments_select_all" on public.comments;
create policy "comments_select_all" on public.comments
  for select using (true);

drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own" on public.comments
  for insert with check (author_id = auth.uid());

drop policy if exists "comments_delete_own" on public.comments;
create policy "comments_delete_own" on public.comments
  for delete using (author_id = auth.uid());

-- reactions: readable by all; users manage their own.
drop policy if exists "reactions_select_all" on public.reactions;
create policy "reactions_select_all" on public.reactions
  for select using (true);

drop policy if exists "reactions_insert_own" on public.reactions;
create policy "reactions_insert_own" on public.reactions
  for insert with check (user_id = auth.uid());

drop policy if exists "reactions_delete_own" on public.reactions;
create policy "reactions_delete_own" on public.reactions
  for delete using (user_id = auth.uid());

-- friendships: visible to the two parties; requester creates; receiver responds.
drop policy if exists "friendships_select_involved" on public.friendships;
create policy "friendships_select_involved" on public.friendships
  for select using (requester_id = auth.uid() or receiver_id = auth.uid());

drop policy if exists "friendships_insert_requester" on public.friendships;
create policy "friendships_insert_requester" on public.friendships
  for insert with check (requester_id = auth.uid());

drop policy if exists "friendships_update_receiver" on public.friendships;
create policy "friendships_update_receiver" on public.friendships
  for update using (receiver_id = auth.uid() or requester_id = auth.uid());

drop policy if exists "friendships_delete_involved" on public.friendships;
create policy "friendships_delete_involved" on public.friendships
  for delete using (requester_id = auth.uid() or receiver_id = auth.uid());

-- guestbook: readable by all; any authenticated user signs a book; the guestbook
-- owner or the message author may delete an entry.
drop policy if exists "guestbook_select_all" on public.guestbook_entries;
create policy "guestbook_select_all" on public.guestbook_entries
  for select using (true);

drop policy if exists "guestbook_insert_own" on public.guestbook_entries;
create policy "guestbook_insert_own" on public.guestbook_entries
  for insert with check (author_id = auth.uid());

drop policy if exists "guestbook_delete_owner_or_author" on public.guestbook_entries;
create policy "guestbook_delete_owner_or_author" on public.guestbook_entries
  for delete using (author_id = auth.uid() or profile_id = auth.uid());
