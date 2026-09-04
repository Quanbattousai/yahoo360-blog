"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseBlocks, type ProfileBlock } from "@/lib/blocks";
import type { Wallpaper } from "@/lib/themes";
import type { Json } from "@/types/database";

export interface AppearanceInput {
  themeName: string;
  wallpaper: Wallpaper | null;
  overlay: number;
}

export async function saveLayout(
  blocks: ProfileBlock[],
  gridColumns: number,
  appearance: AppearanceInput
): Promise<{ ok?: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const clean = parseBlocks(blocks);
  const cols = [2, 3, 4].includes(gridColumns) ? gridColumns : 3;
  const overlay = Math.min(0.8, Math.max(0, appearance.overlay));

  const wallpaper = appearance.wallpaper
    ? {
        url: appearance.wallpaper.url,
        name: appearance.wallpaper.name,
        overlay_opacity: overlay,
      }
    : null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const { error } = await supabase
    .from("profiles")
    .update({
      profile_layout: clean as unknown as Json,
      grid_columns: cols,
      profile_theme: { name: appearance.themeName },
      profile_wallpaper: wallpaper,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  if (profile) {
    revalidatePath(`/${profile.username}`);
    revalidatePath(`/${profile.username}/edit`);
  }
  return { ok: true };
}
