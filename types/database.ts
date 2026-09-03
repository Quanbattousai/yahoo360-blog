// Hand-written Supabase types for Sprint 1.
// Once the schema stabilizes you can replace this with generated types:
//   npx supabase gen types typescript --project-id <ref> > types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface ProfileTheme {
  name?: string;
  background?: string;
  text_color?: string;
  accent_color?: string;
  font_family?: string;
  [key: string]: Json | undefined;
}

export interface ProfileWallpaper {
  url: string;
  name: string | null;
  overlay_opacity?: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          mood: string | null;
          profile_theme: ProfileTheme;
          profile_wallpaper: ProfileWallpaper | null;
          profile_layout: Json;
          grid_columns: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          mood?: string | null;
          profile_theme?: ProfileTheme;
          profile_wallpaper?: ProfileWallpaper | null;
          profile_layout?: Json;
          grid_columns?: number;
        };
        Update: {
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          mood?: string | null;
          profile_theme?: ProfileTheme;
          profile_wallpaper?: ProfileWallpaper | null;
          profile_layout?: Json;
          grid_columns?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
