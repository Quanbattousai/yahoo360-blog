"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

interface Props {
  profile: Pick<
    Profile,
    | "id"
    | "username"
    | "display_name"
    | "avatar_url"
    | "bio"
    | "mood"
    | "profile_theme"
  >;
  submitLabel: string;
}

export function EditProfileForm({ profile, submitLabel }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState(
    profile.username.startsWith("user_") ? "" : profile.username
  );
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [mood, setMood] = useState(profile.mood ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!USERNAME_RE.test(username)) {
      setError(
        "Username must be 3–20 characters: lowercase letters, numbers, or underscores."
      );
      return;
    }

    setSaving(true);

    // Uniqueness check when the username changed.
    if (username !== profile.username) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();
      if (existing && existing.id !== profile.id) {
        setSaving(false);
        setError("That username is already taken.");
        return;
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        username,
        display_name: displayName || null,
        avatar_url: avatarUrl || null,
        bio: bio || null,
        mood: mood || null,
      })
      .eq("id", profile.id);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(`/${username}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Username
        <div className="flex items-center rounded-lg border border-black/15 px-3 focus-within:border-[#e91e63]">
          <span className="text-black/40">360.com/</span>
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="thanhtruc"
            className="flex-1 bg-transparent py-2 outline-none"
          />
        </div>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Display name
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Thanh Trúc"
          className="rounded-lg border border-black/15 px-3 py-2 outline-none focus:border-[#e91e63]"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Avatar URL
        <input
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://…"
          className="rounded-lg border border-black/15 px-3 py-2 outline-none focus:border-[#e91e63]"
        />
        <span className="text-xs text-black/40">
          Paste an image URL for now — Storage uploads arrive in a later sprint.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Bio
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Saigon dreamer · Bookworm · Coffee addict ☕"
          className="resize-none rounded-lg border border-black/15 px-3 py-2 outline-none focus:border-[#e91e63]"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Mood
        <input
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="đang vui 😊"
          className="rounded-lg border border-black/15 px-3 py-2 outline-none focus:border-[#e91e63]"
        />
      </label>

      <p className="text-xs text-black/40">
        Themes and wallpaper live in the profile builder — open{" "}
        <span className="font-semibold">Customize</span> on your profile.
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="mt-2 rounded-xl bg-[#e91e63] px-4 py-3 font-semibold text-white hover:bg-[#d81b60] disabled:opacity-60"
      >
        {saving ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
