import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getTheme, resolveTheme, backgroundStyle } from "@/lib/themes";
import { parseBlocks, defaultBlocks } from "@/lib/blocks";
import { ProfileGrid } from "@/components/profile/ProfileGrid";
import type { BlockData } from "@/components/blocks/BlockRenderers";
import {
  getFriends,
  getGuestbook,
  getFriendStatus,
  getIncomingRequests,
} from "@/lib/social";
import { FriendButton } from "@/components/social/FriendButton";
import { FriendRequests } from "@/components/social/FriendRequests";

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

  const baseTheme = getTheme(profile.profile_theme?.name);
  const wp = profile.profile_wallpaper;
  const wallpaper = wp ? { url: wp.url, name: wp.name } : null;
  const overlay = wp?.overlay_opacity ?? 0;
  const theme = resolveTheme(baseTheme, wallpaper, overlay);
  const bg = backgroundStyle(baseTheme, wallpaper);

  const cols = profile.grid_columns ?? 3;
  const stored = parseBlocks(profile.profile_layout);
  const blocks = stored.length > 0 ? stored : defaultBlocks(cols);

  const [friends, guestbook, friendStatus, incoming] = await Promise.all([
    getFriends(profile.id),
    getGuestbook(profile.id),
    getFriendStatus(user?.id ?? null, profile.id),
    isOwner && user ? getIncomingRequests(user.id) : Promise.resolve([]),
  ]);

  const data: BlockData = {
    profile: {
      username: profile.username,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      mood: profile.mood,
    },
    posts: posts ?? [],
    friends,
    guestbook,
    viewerId: user?.id ?? null,
    ownerId: profile.id,
  };

  return (
    <main
      className="relative min-h-[calc(100vh-57px)] px-4 py-6"
      style={{ ...bg, color: theme.text }}
    >
      {wallpaper && (
        <div
          className="pointer-events-none fixed inset-0"
          style={{ background: `rgba(0,0,0,${overlay})` }}
        />
      )}
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-4 flex items-center justify-end gap-2">
          {isOwner ? (
            <>
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
            </>
          ) : (
            <FriendButton
              targetId={profile.id}
              status={friendStatus}
              accent={theme.accent}
            />
          )}
        </div>

        {isOwner && (
          <FriendRequests
            requests={incoming}
            accent={theme.accent}
            card={theme.card}
            cardBorder={theme.cardBorder}
          />
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
