import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getTheme } from "@/lib/themes";

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

        {/* Placeholder for the block grid — arrives in Sprint 3. */}
        <section
          className="mt-6 rounded-2xl border border-dashed p-10 text-center"
          style={{ borderColor: theme.cardBorder }}
        >
          <p className="text-sm opacity-60">
            {isOwner
              ? "Your page is looking a little empty. The drag-and-drop block builder lands in Sprint 3 — for now, make it yours from the editor."
              : `${displayName} hasn't added any blocks yet.`}
          </p>
        </section>
      </div>
    </main>
  );
}
