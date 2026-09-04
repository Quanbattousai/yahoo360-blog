# 360° Blog Platform

A community blogging platform inspired by Yahoo! 360° (2005–2009). See
[`360-blog-project-spec.md`](./360-blog-project-spec.md) for the full spec and
[`yahoo360-profile-builder.jsx`](./yahoo360-profile-builder.jsx) for the visual
prototype.

## Status

**Sprint 1 — Foundation ✅**
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase Postgres schema + Row Level Security + auto profile-creation trigger
- Auth: email/password **and** Google OAuth
- Profile creation on signup + onboarding for OAuth users
- Static, themed profile page at `/{username}` + a basic profile editor

**Sprint 2 — Blog Engine ✅**
- Tiptap rich-text editor with formatting toolbar (headings, lists, quote,
  code, links) and image upload to Supabase Storage
- Post CRUD with draft / published states and per-post visibility
- SEO-friendly post pages at `/{username}/{slug}` (server-rendered from
  Tiptap JSON, with OpenGraph metadata)

**Sprint 3 — Block Builder ✅**
- Drag-and-drop, resizable profile grid with `react-grid-layout`
- 10 block types (avatar/bio, blog feed, text, links, image gallery, music,
  video, friends, guestbook, clock) via a block-component registry
- Block picker modal, per-block settings, 2/3/4-column toggle,
  edit vs. preview mode
- Layout saved to `profiles.profile_layout` (JSON); `/{username}` renders it,
  `/{username}/edit` is the builder, `/{username}/settings` edits profile fields

**Sprint 4 — Theming & Wallpaper ✅**
- Preset gradient themes + custom wallpaper (upload to Supabase Storage or
  browse Unsplash) in the builder's Appearance panel
- Unsplash browsing via a server-side proxy (`/api/unsplash`) that keeps the
  API key server-only, with a curated fallback when no key is set
- Overlay darkness control (0–80%) with auto-adaptive card/text colors over
  dark wallpapers; the theme accent carries through
- Appearance saved to `profiles.profile_theme` + `profiles.profile_wallpaper`

**Sprint 5 — Social Layer ✅**
- Reactions on posts (❤️ 😂 😢 🔥) with live counts, and flat comments
- Friend requests: send / accept / decline / remove, with an incoming-requests
  list on your own profile
- Friends-only post visibility enforced in RLS (via an `are_friends` helper)
- `friends_list` and `guestbook` profile blocks now use real data; visitors can
  sign the guestbook

**Sprint 6 — Polish & Launch ✅**
- Friends activity feed at `/feed` (recent posts from people you're friends with)
- Mobile-responsive profile grid (columns collapse to 1–2 on small screens)
- Basic moderation: a Report button on posts, a `reports` table, and an admin
  view at `/admin` (resolve reports / delete posts) gated by an `is_admin` flag
- Lazy image loading for post + gallery images

All six sprints are complete. 🎉

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project & run the migration

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run each migration in order:
   - [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql)
     — schema, RLS, triggers.
   - [`supabase/migrations/0002_post_images_storage.sql`](./supabase/migrations/0002_post_images_storage.sql)
     — the `post-images` Storage bucket + policies (needed for image uploads in
     the blog editor).
   - [`supabase/migrations/0003_wallpapers_storage.sql`](./supabase/migrations/0003_wallpapers_storage.sql)
     — the `wallpapers` Storage bucket + policies (needed for custom wallpaper
     uploads in the profile builder).
   - [`supabase/migrations/0004_social.sql`](./supabase/migrations/0004_social.sql)
     — the `are_friends` helper + friends-only post visibility, and public
     read for accepted friendships (needed for the social layer).
   - [`supabase/migrations/0005_moderation.sql`](./supabase/migrations/0005_moderation.sql)
     — the `reports` table + `is_admin` flag/helper (needed for reporting and
     the `/admin` view). To become an admin, run once:
     `update public.profiles set is_admin = true where username = 'you';`

   (Or, with the Supabase CLI linked to your project: `supabase db push`.)

### 3. Configure environment variables

Copy the example and fill in your project's API values
(**Project Settings → API**):

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Enable Google OAuth (optional)

In **Authentication → Providers → Google**, add your Google OAuth client ID and
secret. Set the redirect URL to `https://<your-project-ref>.supabase.co/auth/v1/callback`.
Locally, add `http://localhost:3000/auth/callback` to your app's allowed redirect
URLs under **Authentication → URL Configuration**.

> Tip: for the fastest local start, disable "Confirm email" under
> **Authentication → Sign In / Providers → Email** so email/password signups get
> a session immediately.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  layout.tsx                 Root layout + site header
  page.tsx                   Landing page
  (auth)/login               Email/password + Google login
  (auth)/register            Signup (claims username)
  onboarding/                Complete profile after OAuth
  auth/callback/route.ts     OAuth / email-confirm code exchange
  auth/signout/route.ts      Sign out
  [username]/page.tsx        Static themed profile page
  [username]/edit/page.tsx   Basic profile editor
components/
  SiteHeader.tsx
  EditProfileForm.tsx        Shared by onboarding + edit
lib/
  supabase/{client,server,middleware}.ts
  env.ts, themes.ts, blocks.ts
types/
  database.ts                Hand-written Supabase types
supabase/
  migrations/0001_init.sql   Schema + RLS + triggers
middleware.ts                Refreshes the Supabase session
```

## Deployment

Deploy to Vercel and set the same environment variables in the project settings.
Update `NEXT_PUBLIC_SITE_URL` and the Supabase redirect URLs to your production
domain.
