"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify, excerptFromDoc } from "@/lib/posts";
import type { Json, PostStatus, PostVisibility } from "@/types/database";

export interface SavePostInput {
  id?: string;
  title: string;
  body: Json;
  mood: string | null;
  status: PostStatus;
  visibility: PostVisibility;
}

export interface SavePostResult {
  id?: string;
  slug?: string;
  username?: string;
  error?: string;
}

async function uniqueSlug(
  supabase: ReturnType<typeof createClient>,
  authorId: string,
  base: string,
  ignoreId?: string
): Promise<string> {
  const { data } = await supabase
    .from("posts")
    .select("id, slug")
    .eq("author_id", authorId)
    .like("slug", `${base}%`);

  const taken = new Set(
    (data ?? []).filter((p) => p.id !== ignoreId).map((p) => p.slug)
  );

  let slug = base;
  let n = 2;
  while (taken.has(slug)) slug = `${base}-${n++}`;
  return slug;
}

export async function savePost(input: SavePostInput): Promise<SavePostResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();
  if (!profile) return { error: "Profile not found." };

  const title = input.title.trim() || "Untitled";
  const excerpt = excerptFromDoc(input.body);
  const base = slugify(title);
  const slug = await uniqueSlug(supabase, user.id, base, input.id);

  if (input.id) {
    // Preserve the original published_at; set it the first time we publish.
    const { data: current } = await supabase
      .from("posts")
      .select("published_at")
      .eq("id", input.id)
      .single();

    const published_at =
      input.status === "published"
        ? current?.published_at ?? new Date().toISOString()
        : current?.published_at ?? null;

    const { error } = await supabase
      .from("posts")
      .update({
        title,
        slug,
        body: input.body,
        excerpt,
        mood: input.mood,
        status: input.status,
        visibility: input.visibility,
        published_at,
      })
      .eq("id", input.id)
      .eq("author_id", user.id);

    if (error) return { error: error.message };

    revalidatePath(`/${profile.username}`);
    revalidatePath(`/${profile.username}/${slug}`);
    return { id: input.id, slug, username: profile.username };
  }

  const published_at =
    input.status === "published" ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      title,
      slug,
      body: input.body,
      excerpt,
      mood: input.mood,
      status: input.status,
      visibility: input.visibility,
      published_at,
    })
    .select("id, slug")
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/${profile.username}`);
  return { id: data.id, slug: data.slug, username: profile.username };
}

export async function deletePost(
  id: string
): Promise<{ username?: string; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) return { error: error.message };

  if (profile) revalidatePath(`/${profile.username}`);
  return { username: profile?.username };
}
