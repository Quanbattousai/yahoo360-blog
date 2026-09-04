import { createClient } from "@/lib/supabase/server";
import type { FriendStatus } from "@/components/social/FriendButton";
import type { GuestbookEntry } from "@/components/social/GuestbookBlock";
import type { IncomingRequest } from "@/components/social/FriendRequests";

export interface FriendSummary {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export async function getFriends(profileId: string): Promise<FriendSummary[]> {
  const supabase = createClient();
  const { data: rows } = await supabase
    .from("friendships")
    .select("requester_id, receiver_id")
    .eq("status", "accepted")
    .or(`requester_id.eq.${profileId},receiver_id.eq.${profileId}`);

  const ids = (rows ?? []).map((r) =>
    r.requester_id === profileId ? r.receiver_id : r.requester_id
  );
  if (ids.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url")
    .in("id", ids);
  return profiles ?? [];
}

export async function getGuestbook(profileId: string): Promise<GuestbookEntry[]> {
  const supabase = createClient();
  const { data: entries } = await supabase
    .from("guestbook_entries")
    .select("id, message, created_at, author_id")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (!entries || entries.length === 0) return [];

  const authorIds = [...new Set(entries.map((e) => e.author_id))];
  const { data: authors } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", authorIds);
  const byId = new Map((authors ?? []).map((a) => [a.id, a]));

  return entries.map((e) => {
    const a = byId.get(e.author_id);
    return {
      id: e.id,
      message: e.message,
      created_at: e.created_at,
      author_id: e.author_id,
      author: a
        ? { username: a.username, display_name: a.display_name }
        : null,
    };
  });
}

export async function getFriendStatus(
  viewerId: string | null,
  targetId: string
): Promise<FriendStatus> {
  if (!viewerId) return "logged_out";
  if (viewerId === targetId) return "self";

  const supabase = createClient();
  const { data } = await supabase
    .from("friendships")
    .select("requester_id, receiver_id, status")
    .or(
      `and(requester_id.eq.${viewerId},receiver_id.eq.${targetId}),and(requester_id.eq.${targetId},receiver_id.eq.${viewerId})`
    )
    .limit(1)
    .maybeSingle();

  if (!data) return "none";
  if (data.status === "accepted") return "friends";
  if (data.status === "declined") return "none";
  return data.requester_id === viewerId ? "pending_out" : "pending_in";
}

export async function getIncomingRequests(
  viewerId: string
): Promise<IncomingRequest[]> {
  const supabase = createClient();
  const { data: rows } = await supabase
    .from("friendships")
    .select("requester_id")
    .eq("receiver_id", viewerId)
    .eq("status", "pending");
  const ids = (rows ?? []).map((r) => r.requester_id);
  if (ids.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .in("id", ids);
  return (profiles ?? []).map((p) => ({
    requesterId: p.id,
    username: p.username,
    display_name: p.display_name,
    avatar_url: p.avatar_url,
  }));
}
