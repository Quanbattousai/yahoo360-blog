// Block catalog — the source of truth for the profile page builder (Sprint 3).
// Sprint 1 only stores profile_layout as an empty array; this catalog is here so
// the types line up when the grid builder is wired in later.

export type BlockType =
  | "avatar_bio"
  | "text_block"
  | "blog_feed"
  | "image_gallery"
  | "music_player"
  | "video_player"
  | "friends_list"
  | "guestbook"
  | "link_list"
  | "clock_widget";

export type BlockCategory =
  | "Core"
  | "Content"
  | "Media"
  | "Social"
  | "Decorative";

export interface BlockTypeDef {
  type: BlockType;
  label: string;
  icon: string; // lucide icon name
  category: BlockCategory;
  defaultW: number;
  defaultH: number;
  minH: number;
  minW?: number;
}

export interface ProfileBlock {
  id: string;
  type: BlockType;
  x?: number;
  y?: number;
  w: number;
  h: number;
  config: Record<string, unknown>;
}

export const BLOCK_CATALOG: BlockTypeDef[] = [
  { type: "avatar_bio", label: "Profile & Bio", icon: "Sparkles", category: "Core", defaultW: 1, defaultH: 3, minH: 3 },
  { type: "text_block", label: "Text Block", icon: "Type", category: "Content", defaultW: 1, defaultH: 2, minH: 1 },
  { type: "blog_feed", label: "Blog Feed", icon: "MessageSquare", category: "Content", defaultW: 2, defaultH: 4, minH: 2 },
  { type: "image_gallery", label: "Image Gallery", icon: "Image", category: "Media", defaultW: 1, defaultH: 2, minH: 2 },
  { type: "music_player", label: "Music Player", icon: "Music", category: "Media", defaultW: 2, defaultH: 2, minH: 2 },
  { type: "video_player", label: "Video Player", icon: "Video", category: "Media", defaultW: 1, defaultH: 2, minH: 2 },
  { type: "friends_list", label: "Friends", icon: "Users", category: "Social", defaultW: 1, defaultH: 3, minH: 2 },
  { type: "guestbook", label: "Guestbook", icon: "MessageSquare", category: "Social", defaultW: 2, defaultH: 3, minH: 2 },
  { type: "link_list", label: "Links", icon: "Link", category: "Content", defaultW: 1, defaultH: 2, minH: 2 },
  { type: "clock_widget", label: "Clock", icon: "Clock", category: "Decorative", defaultW: 1, defaultH: 1, minH: 1 },
];
