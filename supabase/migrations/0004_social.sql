-- Sprint 5 — Social layer. Enforces friends-only post visibility.
-- The comments / reactions / friendships / guestbook tables and their base RLS
-- policies already exist from 0001_init.sql; this migration adds the friendship
-- check and widens post visibility to accepted friends.

-- Are two users accepted friends? SECURITY DEFINER so it can be called from the
-- posts RLS policy without recursing into friendships' own RLS.
create or replace function public.are_friends(a uuid, b uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and (
        (f.requester_id = a and f.receiver_id = b)
        or (f.requester_id = b and f.receiver_id = a)
      )
  );
$$;

-- Widen post SELECT: published+public to everyone; the author always; and
-- published 'friends' posts to accepted friends of the author.
drop policy if exists "posts_select_visible" on public.posts;
create policy "posts_select_visible" on public.posts
  for select using (
    (status = 'published' and visibility = 'public')
    or author_id = auth.uid()
    or (
      status = 'published'
      and visibility = 'friends'
      and auth.uid() is not null
      and public.are_friends(author_id, auth.uid())
    )
  );

-- Make accepted friendships world-readable so friends lists show on public
-- profiles; pending requests stay visible only to the two parties.
drop policy if exists "friendships_select_involved" on public.friendships;
drop policy if exists "friendships_select" on public.friendships;
create policy "friendships_select" on public.friendships
  for select using (
    status = 'accepted'
    or requester_id = auth.uid()
    or receiver_id = auth.uid()
  );
