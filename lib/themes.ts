// Preset gradient themes (from the prototype). Used to style profile pages.
// Sprint 4 adds custom wallpaper + Unsplash on top of these.

export interface Theme {
  name: string;
  bg: string;
  text: string;
  accent: string;
  card: string;
  cardBorder: string;
  isDark: boolean;
}

export const THEMES: Theme[] = [
  {
    name: "Sakura",
    bg: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #f48fb1 100%)",
    text: "#4a1942",
    accent: "#e91e63",
    card: "rgba(255,255,255,0.65)",
    cardBorder: "rgba(233,30,99,0.2)",
    isDark: false,
  },
  {
    name: "Ocean",
    bg: "linear-gradient(135deg, #e0f7fa 0%, #80deea 50%, #4dd0e1 100%)",
    text: "#1a3a4a",
    accent: "#00897b",
    card: "rgba(255,255,255,0.6)",
    cardBorder: "rgba(0,137,123,0.2)",
    isDark: false,
  },
  {
    name: "Midnight",
    bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    text: "#e0e0e0",
    accent: "#e94560",
    card: "rgba(255,255,255,0.08)",
    cardBorder: "rgba(233,69,96,0.25)",
    isDark: true,
  },
  {
    name: "Lavender",
    bg: "linear-gradient(135deg, #ede7f6 0%, #d1c4e9 50%, #b39ddb 100%)",
    text: "#311b60",
    accent: "#7c4dff",
    card: "rgba(255,255,255,0.6)",
    cardBorder: "rgba(124,77,255,0.2)",
    isDark: false,
  },
  {
    name: "Sunset",
    bg: "linear-gradient(135deg, #fff3e0 0%, #ffcc80 30%, #ff8a65 70%, #ef5350 100%)",
    text: "#3e2723",
    accent: "#ff5722",
    card: "rgba(255,255,255,0.55)",
    cardBorder: "rgba(255,87,34,0.2)",
    isDark: false,
  },
  {
    name: "Forest",
    bg: "linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 50%, #66bb6a 100%)",
    text: "#1b3a1b",
    accent: "#2e7d32",
    card: "rgba(255,255,255,0.6)",
    cardBorder: "rgba(46,125,50,0.2)",
    isDark: false,
  },
];

export const DEFAULT_THEME = THEMES[0];

export function getTheme(name?: string | null): Theme {
  if (!name) return DEFAULT_THEME;
  return THEMES.find((t) => t.name === name) ?? DEFAULT_THEME;
}
