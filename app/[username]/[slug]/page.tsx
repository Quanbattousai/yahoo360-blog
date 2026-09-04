import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getTheme } from "@/lib/themes";
import { formatPostDate } from "@/lib/posts";
import { PostContent } from "@/components/PostContent";
import { DeletePostButton } from "@/components/DeletePostButton";

interface Props {
  params: { username: string; slug: string };
}

async function loadPost(username: string, slug: string) {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, profile_theme")
    .eq("username", username)
    .maybeSingle();
  if (!profile) return null;

  // RLS returns the row only if it's published+public or the viewer is the author.
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", profile.id)
    .eq("slug", slug)
    .maybeSingle();
  if (!post) return null;

  return { profile, post };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const loaded = await loadPost(params.username, params.slug);
  if (!loaded) return { title: "Not found · 360°" };
  const { profile, post } = loaded;
  const author = profile.display_name || `@${profile.username}`;
  return {
    title: `${post.title} · ${author}`,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.published_at ?? undefined,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const loaded = await loadPost(params.username, params.slug);
  if (!loaded) notFound();
  const { profile, post } = loaded;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === profile.id;

  const theme = getTheme(profile.profile_theme?.name);
  const author = profile.display_name || profile.username;

  return (
    <main
      className="min-h-[calc(100vh-57px)] px-4 py-10"
      style={{ background: theme.bg, color: theme.text }}
    >
      <article className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between text-sm">
          <Link href={`/${profile.username}`} className="font-semibold opacity-70 hover:opacity-100">
            ← {author}
          </Link>
          {isOwner && (
            <div className="flex items-center gap-2">
              {post.status !== "published" && (
                <span className="rounded-full bg-black/10 px-2.5 py-1 text-xs font-semibold">
                  {post.status}
                </span>
              )}
              <Link
                href={`/write/${post.id}`}
                className="rounded-lg border border-current px-3 py-1.5 font-semibold opacity-80 hover:opacity-100"
              >
                Edit
              </Link>
              <DeletePostButton id={post.id} username={profile.username} />
            </div>
          )}
        </div>

        <div
          className="rounded-2xl border p-8 backdrop-blur"
          style={{ background: theme.card, borderColor: theme.cardBorder }}
        >
          <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm opacity-60">
            <span>{author}</span>
            {post.published_at && <span>· {formatPostDate(post.published_at)}</span>}
            {post.mood && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5"
                style={{ background: `${theme.accent}18` }}
              >
                {post.mood}
              </span>
            )}
          </div>

          <div className="mt-6">
            <PostContent body={post.body} />
          </div>
        </div>
      </article>
    </main>
  );
}
