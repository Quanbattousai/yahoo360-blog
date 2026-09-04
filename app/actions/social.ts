"use server";

import { createClient } from "@/lib/supabase/server";

type ReactionType = "heart" | "sad" | "laugh" | "fire";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

// ── Reactions ────────────────────────────────────────────────────────────────
export async function toggleReaction(postId: string, type: ReactionType) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Log in to react." };

  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .eq("type", type)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("reactions").delete().eq("id", existing.id);
    if (error) return { error: error.message };
    return { active: false };
  }

  const { error } = await supabase
    .from("reactions")
    .insert({ post_id: postId, user_id: user.id, type });
  if (error) return { error: error.message };
  return { active: true };
}

// ── Comments ─────────────────────────────────────────────────────────────────
export async function addComment(postId: string, body: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Log in to comment." };
  const text = body.trim();
  if (!text) return { error: "Comment can't be empty." };
  if (text.length > 2000) return { error: "Comment is too long." };

  const { error } = await supabase
    .from("comments")
    .insert({ post_id: postId, author_id: user.id, body: text });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function deleteComment(commentId: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Log in first." };
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) return { error: error.message };
  return { ok: true };
}

// ── Friendships ──────────────────────────────────────────────────────────────
export async function sendFriendRequest(receiverId: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Log in to add friends." };
  if (user.id === receiverId) return { error: "You can't friend yourself." };

  // If they already requested you, accept it instead of creating a duplicate.
  const { data: reverse } = await supabase
    .from("friendships")
    .select("id, status")
    .eq("requester_id", receiverId)
    .eq("receiver_id", user.id)
    .maybeSingle();
  if (reverse) {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", reverse.id);
    if (error) return { error: error.message };
    return { status: "accepted" as const };
  }

  const { error } = await supabase
    .from("friendships")
    .insert({ requester_id: user.id, receiver_id: receiverId, status: "pending" });
  if (error) return { error: error.message };
  return { status: "pending" as const };
}

export async function respondFriendRequest(requesterId: string, accept: boolean) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Log in first." };
  const { error } = await supabase
    .from("friendships")
    .update({ status: accept ? "accepted" : "declined" })
    .eq("requester_id", requesterId)
    .eq("receiver_id", user.id);
  if (error) return { error: error.message };
  return { ok: true };
}

export async function removeFriend(otherId: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Log in first." };
  // Delete the friendship in whichever direction it exists.
  const { error } = await supabase
    .from("friendships")
    .delete()
    .or(
      `and(requester_id.eq.${user.id},receiver_id.eq.${otherId}),and(requester_id.eq.${otherId},receiver_id.eq.${user.id})`
    );
  if (error) return { error: error.message };
  return { ok: true };
}

// ── Guestbook ────────────────────────────────────────────────────────────────
export async function signGuestbook(profileId: string, message: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Log in to sign the guestbook." };
  const text = message.trim();
  if (!text) return { error: "Message can't be empty." };
  if (text.length > 500) return { error: "Message is too long." };

  const { error } = await supabase
    .from("guestbook_entries")
    .insert({ profile_id: profileId, author_id: user.id, message: text });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function deleteGuestbookEntry(entryId: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { error: "Log in first." };
  const { error } = await supabase
    .from("guestbook_entries")
    .delete()
    .eq("id", entryId);
  if (error) return { error: error.message };
  return { ok: true };
}
