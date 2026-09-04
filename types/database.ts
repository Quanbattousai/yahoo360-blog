// Hand-written Supabase types.
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

export type PostStatus = "draft" | "published" | "archived";
export type PostVisibility = "public" | "friends" | "private";

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
      posts: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          slug: string;
          body: Json | null;
          excerpt: string | null;
          mood: string | null;
          status: PostStatus;
          visibility: PostVisibility;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          slug: string;
          body?: Json | null;
          excerpt?: string | null;
          mood?: string | null;
          status?: PostStatus;
          visibility?: PostVisibility;
          published_at?: string | null;
        };
        Update: {
          title?: string;
          slug?: string;
          body?: Json | null;
          excerpt?: string | null;
          mood?: string | null;
          status?: PostStatus;
          visibility?: PostVisibility;
          published_at?: string | null;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          body: string;
        };
        Update: { body?: string };
        Relationships: [];
      };
      reactions: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          type: "heart" | "sad" | "laugh" | "fire";
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          type: "heart" | "sad" | "laugh" | "fire";
        };
        Update: { type?: "heart" | "sad" | "laugh" | "fire" };
        Relationships: [];
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          receiver_id: string;
          status: "pending" | "accepted" | "declined";
          created_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          receiver_id: string;
          status?: "pending" | "accepted" | "declined";
        };
        Update: { status?: "pending" | "accepted" | "declined" };
        Relationships: [];
      };
      guestbook_entries: {
        Row: {
          id: string;
          profile_id: string;
          author_id: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          author_id: string;
          message: string;
        };
        Update: { message?: string };
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
export type Post = Database["public"]["Tables"]["posts"]["Row"];
