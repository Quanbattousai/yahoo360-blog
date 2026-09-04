"use server";

import { createClient } from "@/lib/supabase/server";

export async function reportPost(postId: string, reason: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Log in to report." };
  const text = reason.trim();
  if (!text) return { error: "Please give a reason." };

  const { error } = await supabase
    .from("reports")
    .upsert(
      { reporter_id: user.id, post_id: postId, reason: text, status: "open" },
      { onConflict: "reporter_id,post_id" }
    );
  if (error) return { error: error.message };
  return { ok: true };
}

export async function resolveReport(reportId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("reports")
    .update({ status: "resolved" })
    .eq("id", reportId);
  if (error) return { error: error.message };
  return { ok: true };
}

// Admin-only (enforced by the posts_delete_admin RLS policy).
export async function adminDeletePost(postId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) return { error: error.message };
  return { ok: true };
}
