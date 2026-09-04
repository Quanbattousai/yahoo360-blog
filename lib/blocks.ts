// Block catalog + helpers — the source of truth for the profile block builder.

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

// react-grid-layout item shape (i/x/y/w/h) plus our type + per-type config.
export interface ProfileBlock {
  i: string;
  type: BlockType;
  x: number;
  y: number;
  w: number;
  h: number;
  config: Record<string, unknown>;
}

export const BLOCK_CATALOG: BlockTypeDef[] = [
  { type: "avatar_bio", label: "Profile & Bio", icon: "Sparkles", category: "Core", defaultW: 1, defaultH: 3, minH: 3 },
  { type: "text_block", label: "Text Block", icon: "Type", category: "Content", defaultW: 1, defaultH: 2, minH: 1 },
  { type: "blog_feed", label: "Blog Feed", icon: "MessageSquare", category: "Content", defaultW: 2, defaultH: 4, minH: 2 },
  { type: "link_list", label: "Links", icon: "Link", category: "Content", defaultW: 1, defaultH: 2, minH: 2 },
  { type: "image_gallery", label: "Image Gallery", icon: "Image", category: "Media", defaultW: 1, defaultH: 2, minH: 2 },
  { type: "music_player", label: "Music Player", icon: "Music", category: "Media", defaultW: 2, defaultH: 2, minH: 2 },
  { type: "video_player", label: "Video Player", icon: "Video", category: "Media", defaultW: 1, defaultH: 2, minH: 2 },
  { type: "friends_list", label: "Friends", icon: "Users", category: "Social", defaultW: 1, defaultH: 3, minH: 2 },
  { type: "guestbook", label: "Guestbook", icon: "MessageSquare", category: "Social", defaultW: 2, defaultH: 3, minH: 2 },
  { type: "clock_widget", label: "Clock", icon: "Clock", category: "Decorative", defaultW: 1, defaultH: 1, minH: 1 },
];

export function getBlockDef(type: BlockType): BlockTypeDef {
  return BLOCK_CATALOG.find((b) => b.type === type) ?? BLOCK_CATALOG[0];
}

let counter = 0;
export function makeBlockId(): string {
  return `blk_${Date.now().toString(36)}_${(counter++).toString(36)}`;
}

export function defaultConfig(type: BlockType): Record<string, unknown> {
  switch (type) {
    case "text_block":
      return { text: "Write something about yourself…" };
    case "link_list":
      return { links: [{ label: "My link", url: "https://" }] };
    case "music_player":
    case "video_player":
      return { embedUrl: "" };
    case "image_gallery":
      return { images: [] };
    default:
      return {};
  }
}

// Create a new block placed at the bottom of the current layout.
export function createBlock(
  type: BlockType,
  cols: number,
  existing: ProfileBlock[]
): ProfileBlock {
  const def = getBlockDef(type);
  const y = existing.reduce((max, b) => Math.max(max, b.y + b.h), 0);
  return {
    i: makeBlockId(),
    type,
    x: 0,
    y,
    w: Math.min(def.defaultW, cols),
    h: def.defaultH,
    config: defaultConfig(type),
  };
}

// A sensible starter layout for profiles that haven't customized yet.
export function defaultBlocks(cols: number): ProfileBlock[] {
  const feedW = Math.min(2, cols);
  return [
    { i: "default_avatar", type: "avatar_bio", x: 0, y: 0, w: 1, h: 3, config: {} },
    { i: "default_feed", type: "blog_feed", x: 1, y: 0, w: feedW, h: 4, config: {} },
  ];
}

// Safely coerce a stored profile_layout JSON value into ProfileBlock[].
export function parseBlocks(raw: unknown): ProfileBlock[] {
  if (!Array.isArray(raw)) return [];
  const valid = new Set(BLOCK_CATALOG.map((b) => b.type));
  return raw
    .filter(
      (b): b is ProfileBlock =>
        !!b &&
        typeof b === "object" &&
        typeof (b as ProfileBlock).i === "string" &&
        valid.has((b as ProfileBlock).type)
    )
    .map((b) => ({
      i: b.i,
      type: b.type,
      x: Number(b.x) || 0,
      y: Number(b.y) || 0,
      w: Number(b.w) || 1,
      h: Number(b.h) || 2,
      config: (b.config as Record<string, unknown>) ?? {},
    }));
}
