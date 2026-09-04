import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getTheme } from "@/lib/themes";
import { formatPostDate } from "@/lib/posts";

interface Props {
  params: { username: string };
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, bio")
    .eq("username", params.username)
    .maybeSingle();

  if (!profile) return { title: "Not found · 360°" };

  const name = profile.display_name || `@${profile.username}`;
  return {
    title: `${name} · 360°`,
    description: profile.bio ?? `${name}'s 360° page.`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .maybeSingle();

  if (!profile) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === profile.id;

  const { data: published } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, mood, published_at")
    .eq("author_id", profile.id)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const { data: drafts } = isOwner
    ? await supabase
        .from("posts")
        .select("id, title, slug, updated_at")
        .eq("author_id", profile.id)
        .eq("status", "draft")
        .order("updated_at", { ascending: false })
    : { data: null };

  const theme = getTheme(profile.profile_theme?.name);
  const displayName = profile.display_name || profile.username;
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <main
      className="min-h-[calc(100vh-57px)] px-4 py-10"
      style={{ background: theme.bg, color: theme.text }}
    >
      <div className="mx-auto max-w-2xl">
        {/* Profile card (avatar_bio, static) */}
        <section
          className="rounded-2xl border p-8 text-center backdrop-blur"
          style={{ background: theme.card, borderColor: theme.cardBorder }}
        >
          <div
            className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-cover bg-center text-5xl"
            style={{
              border: `3px solid ${theme.accent}66`,
              boxShadow: `0 0 24px ${theme.accent}33`,
              background: profile.avatar_url
                ? `center / cover no-repeat url(${profile.avatar_url})`
                : `linear-gradient(135deg, ${theme.accent}44, ${theme.accent})`,
            }}
          >
            {!profile.avatar_url && "🌸"}
          </div>

          <h1 className="text-2xl font-bold">{displayName}</h1>
          <p className="mt-0.5 text-sm opacity-60">@{profile.username}</p>

          {profile.bio && (
            <p className="mx-auto mt-3 max-w-md whitespace-pre-wrap text-[15px] leading-relaxed opacity-85">
              {profile.bio}
            </p>
          )}

          {profile.mood && (
            <div
              className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm"
              style={{ background: `${theme.accent}18` }}
            >
              <span className="opacity-70">Mood:</span>
              <span>{profile.mood}</span>
            </div>
          )}

          <p className="mt-4 text-xs opacity-45">Member since {memberSince}</p>

          {isOwner && (
            <div className="mt-6">
              <Link
                href={`/${profile.username}/edit`}
                className="inline-block rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
                style={{ background: theme.accent }}
              >
                Edit profile
              </Link>
            </div>
          )}
        </section>

        {/* Blog feed */}
        <section
          className="mt-6 rounded-2xl border p-6 backdrop-blur"
          style={{ background: theme.card, borderColor: theme.cardBorder }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Posts</h2>
            {isOwner && (
              <Link
                href="/write"
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white"
                style={{ background: theme.accent }}
              >
                ✍️ Write a post
              </Link>
            )}
          </div>

          {published && published.length > 0 ? (
            <ul>
              {published.map((p, i) => (
                <li
                  key={p.id}
                  className="border-b py-3 last:border-b-0"
                  style={{
                    borderColor: i < published.length - 1 ? theme.cardBorder : "transparent",
                  }}
                >
                  <Link href={`/${profile.username}/${p.slug}`} className="block group">
                    <div className="font-semibold group-hover:underline">{p.title}</div>
                    <div className="mt-0.5 text-xs opacity-50">
                      {formatPostDate(p.published_at)}
                      {p.mood ? ` · ${p.mood}` : ""}
                    </div>
                    {p.excerpt && (
                      <p className="mt-1 text-sm opacity-80">{p.excerpt}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-sm opacity-60">
              {isOwner
                ? "No posts yet. Write your first one!"
                : `${displayName} hasn't published any posts yet.`}
            </p>
          )}

          {isOwner && drafts && drafts.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide opacity-50">
                Drafts
              </h3>
              <ul>
                {drafts.map((d) => (
                  <li key={d.id} className="py-2">
                    <Link
                      href={`/write/${d.id}`}
                      className="flex items-center gap-2 text-sm hover:underline"
                    >
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: `${theme.accent}22` }}
                      >
                        Draft
                      </span>
                      {d.title || "Untitled"}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* The drag-and-drop block builder arrives in Sprint 3. */}
        <p className="mt-4 text-center text-xs opacity-40">
          Customizable profile blocks are coming in a future update.
        </p>
      </div>
    </main>
  );
}
