import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileBuilder } from "@/components/profile/ProfileBuilder";
import { parseBlocks, defaultBlocks } from "@/lib/blocks";
import type { BlockData } from "@/components/blocks/BlockRenderers";

export const metadata = { title: "Customize profile · 360°" };

interface Props {
  params: { username: string };
}

export default async function EditProfilePage({ params }: Props) {
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
  if (!user) redirect("/login");
  if (user.id !== profile.id) redirect(`/${params.username}`);

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, published_at")
    .eq("author_id", profile.id)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const cols = profile.grid_columns ?? 3;
  const stored = parseBlocks(profile.profile_layout);
  const blocks = stored.length > 0 ? stored : defaultBlocks(cols);

  const wp = profile.profile_wallpaper;
  const wallpaper = wp ? { url: wp.url, name: wp.name } : null;
  const overlay = wp?.overlay_opacity ?? 0.3;

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
    <ProfileBuilder
      username={profile.username}
      userId={user.id}
      data={data}
      initialBlocks={blocks}
      initialCols={cols}
      initialThemeName={profile.profile_theme?.name ?? "Sakura"}
      initialWallpaper={wallpaper}
      initialOverlay={overlay}
    />
  );
}
