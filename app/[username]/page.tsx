import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getTheme } from "@/lib/themes";
import { parseBlocks, defaultBlocks } from "@/lib/blocks";
import { ProfileGrid } from "@/components/profile/ProfileGrid";
import type { BlockData } from "@/components/blocks/BlockRenderers";

interface Props {
  params: { username: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, published_at")
    .eq("author_id", profile.id)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const { data: drafts } = isOwner
    ? await supabase
        .from("posts")
        .select("id, title")
        .eq("author_id", profile.id)
        .eq("status", "draft")
        .order("updated_at", { ascending: false })
    : { data: null };

  const theme = getTheme(profile.profile_theme?.name);
  const cols = profile.grid_columns ?? 3;
  const stored = parseBlocks(profile.profile_layout);
  const blocks = stored.length > 0 ? stored : defaultBlocks(cols);

  const data: BlockData = {
    profile: {
      username: profile.username,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      mood: profile.mood,
    },
    posts: posts ?? [],
  };

  return (
    <main
      className="min-h-[calc(100vh-57px)] px-4 py-6"
      style={{ background: theme.bg, color: theme.text }}
    >
      <div className="mx-auto max-w-5xl">
        {isOwner && (
          <div className="mb-4 flex items-center justify-end gap-2">
            <Link
              href={`/${profile.username}/settings`}
              className="rounded-lg border px-3 py-1.5 text-sm font-semibold backdrop-blur"
              style={{ background: theme.card, borderColor: theme.cardBorder }}
            >
              Settings
            </Link>
            <Link
              href={`/${profile.username}/edit`}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white"
              style={{ background: theme.accent }}
            >
              ✨ Customize
            </Link>
          </div>
        )}

        <ProfileGrid blocks={blocks} cols={cols} theme={theme} data={data} />

        {isOwner && drafts && drafts.length > 0 && (
          <div
            className="mt-6 rounded-2xl border p-5 backdrop-blur"
            style={{ background: theme.card, borderColor: theme.cardBorder }}
          >
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide opacity-50">
              Your drafts
            </h3>
            <ul>
              {drafts.map((d) => (
                <li key={d.id} className="py-1.5">
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
      </div>
    </main>
  );
}
