# 360° Blog Platform — Project Spec & Build Guide

## What We're Building

A community blogging platform inspired by Yahoo! 360° (2005–2009), built as a real product. Users can write and publish blog posts, decorate their profile page with a block-based layout builder, and interact through comments and guestbooks.

## Tech Stack

- **Framework:** Next.js 14+ (App Router, Server Components)
- **Database + Auth + Storage:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Rich Text Editor:** Tiptap
- **Grid Layout:** react-grid-layout (for the profile page builder)
- **Styling:** Tailwind CSS + CSS custom properties for user themes
- **Deployment:** Vercel

---

## Core Features (Priority Order)

### 1. Blog Editor & Publishing
- Rich text editor (Tiptap) with image uploads, formatting, embeds
- Post statuses: draft / published / archived
- Visibility: public / friends-only / private
- Mood selector ("I'm feeling: happy 😊")
- SEO-friendly URLs: `/{username}/{post-slug}`
- Excerpt auto-generation

### 2. Profile Page — Block-Based Builder
- Each profile page is a **grid canvas** with draggable, resizable blocks
- Users can add/remove/reorder blocks from a picker (like Notion's "/" menu)
- Block types:
  - **avatar_bio** — profile photo, name, bio, mood
  - **blog_feed** — list of recent posts
  - **single_post** — pin a specific post
  - **music_player** — embedded Spotify/YouTube/SoundCloud
  - **video_player** — embedded video
  - **image_gallery** — grid/carousel of photos
  - **image_single** — hero image/banner
  - **text_block** — freeform rich text, quotes
  - **friends_list** — avatar grid of friends
  - **link_list** — custom links
  - **guestbook** — visitors leave short messages
  - **clock** — decorative clock with timezone
  - **embed** — generic iframe/oEmbed
- Each block has: `type`, `position` (x, y, w, h), `config` (per-type settings)
- Stored as JSON in `profile_layouts` table
- **View mode** (visitors) vs **Edit mode** (owner)
- Grid: 2/3/4 column toggle, `react-grid-layout` for drag/resize
- Per-block controls: column span (1col/Wide/Full), row span (with minH per type)

### 3. Theming & Wallpaper
- Preset gradient themes (Sakura, Ocean, Midnight, Lavender, Sunset, Forest)
- Custom wallpaper: upload image OR browse Unsplash (via API)
- Overlay darkness slider (0–80%) with auto-adaptive card/text colors
- Theme stored as JSON: `{ background, font_family, text_color, accent_color, ... }`
- Wallpaper + theme colors work together (accent carries through)

### 4. Comments & Social
- Flat comments on blog posts (login required)
- Reactions on posts (❤️ 😢 😂 🔥)
- Friend requests (bidirectional, requester → receiver → accept/decline)
- Friends-only post visibility enforcement
- Guestbook messages on profile pages

---

## Database Schema

```sql
-- Users (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  mood text,
  profile_theme jsonb default '{}',
  profile_wallpaper jsonb,         -- { url, name, overlay_opacity }
  profile_layout jsonb default '[]', -- array of block objects
  grid_columns int default 3,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Blog posts
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  slug text not null,
  body jsonb,                      -- Tiptap JSON
  excerpt text,
  mood text,
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  visibility text default 'public' check (visibility in ('public', 'friends', 'private')),
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(author_id, slug)
);

-- Comments
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

-- Reactions
create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  type text not null check (type in ('heart', 'sad', 'laugh', 'fire')),
  created_at timestamptz default now(),
  unique(post_id, user_id, type)
);

-- Friendships
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz default now(),
  unique(requester_id, receiver_id)
);

-- Guestbook entries
create table public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz default now()
);

-- Indexes
create index idx_posts_author on public.posts(author_id, published_at desc);
create index idx_posts_slug on public.posts(author_id, slug);
create index idx_comments_post on public.comments(post_id, created_at);
create index idx_friendships_users on public.friendships(requester_id, receiver_id);
create index idx_guestbook_profile on public.guestbook_entries(profile_id, created_at desc);
```

---

## Project Structure

```
/app
  /layout.tsx                  — root layout, fonts, providers
  /page.tsx                    — landing / public feed
  /(auth)
    /login/page.tsx
    /register/page.tsx
  /[username]
    /page.tsx                  — profile page (block grid, view mode)
    /edit/page.tsx              — profile editor (edit mode, block builder)
    /[slug]/page.tsx            — single post page
  /write/page.tsx              — blog editor (new post)
  /write/[id]/page.tsx         — blog editor (edit existing)
  /feed/page.tsx               — friends activity feed
  /api
    /unsplash/route.ts          — proxy for Unsplash search API
/components
  /blocks                      — one component per block type
    /AvatarBio.tsx
    /BlogFeed.tsx
    /MusicPlayer.tsx
    /ImageGallery.tsx
    /FriendsList.tsx
    /Guestbook.tsx
    /TextBlock.tsx
    /VideoPlayer.tsx
    /LinkList.tsx
    /ClockWidget.tsx
  /editor
    /TiptapEditor.tsx           — blog post editor
    /BlockPicker.tsx            — "+" menu for adding blocks
    /ThemeWallpaperPicker.tsx   — theme + wallpaper modal
    /ProfileGrid.tsx            — react-grid-layout wrapper
  /ui                           — shared UI (buttons, modals, inputs)
/lib
  /supabase.ts                  — client + server Supabase instances
  /blocks.ts                    — block catalog, types, defaults
  /themes.ts                    — theme presets + color logic
/types
  /index.ts                     — TypeScript types for blocks, themes, posts
```

---

## Block Data Model

Each block in `profile_layout` JSON:

```typescript
interface ProfileBlock {
  id: string;
  type: BlockType;
  // react-grid-layout position
  x: number;  // column position (0-based)
  y: number;  // row position
  w: number;  // column span (1, 2, 3, or max)
  h: number;  // row span (minimum enforced per type)
  // per-type settings
  config: Record<string, any>;
}

interface BlockTypeDef {
  type: string;
  label: string;
  icon: string;
  category: 'Core' | 'Content' | 'Media' | 'Social' | 'Decorative';
  defaultW: number;
  defaultH: number;
  minH: number;     // minimum row span for meaningful content
  minW?: number;
}
```

---

## Build Sprints

### Sprint 1 — Foundation (Week 1–2)
- `npx create-next-app` with App Router + Tailwind
- Supabase project setup, schema migration
- Auth (email/password + Google OAuth)
- Profile creation on signup (username, display name, avatar)
- Basic profile page rendering (static, no blocks yet)

### Sprint 2 — Blog Engine (Week 2–4)
- Tiptap editor integration with toolbar
- Post CRUD (create, edit, delete, draft/publish toggle)
- Image upload to Supabase Storage inside posts
- Post detail page with SEO (`/{username}/{slug}`)
- Post listing on profile page

### Sprint 3 — Block Builder (Week 4–6)
- Integrate react-grid-layout on profile page
- Block component registry (render + config per type)
- Block picker modal
- Drag/drop, resize, column/row controls
- Save/load layout JSON to Supabase
- View mode vs Edit mode toggle

### Sprint 4 — Theming & Decoration (Week 6–7)
- Theme presets with CSS variable injection
- Wallpaper upload to Supabase Storage
- Unsplash API integration (server-side proxy)
- Overlay darkness control
- Adaptive card/text colors for dark wallpapers

### Sprint 5 — Social Layer (Week 7–9)
- Comments on posts
- Reactions (heart, laugh, sad, fire)
- Friend request flow (send, accept, decline)
- Friends-only post visibility
- Guestbook block (real data, not mock)

### Sprint 6 — Polish & Launch (Week 9–10)
- Friends activity feed page
- Mobile responsive pass
- Basic moderation (report button + admin view)
- Performance audit (lazy loading, image optimization)
- Deploy to Vercel

---

## Reference

The working prototype is in `yahoo360-profile-builder.jsx` — it demonstrates the block grid, drag-and-drop, theme picker, wallpaper system, and all 10 block types. Use it as the visual reference for the production build.
