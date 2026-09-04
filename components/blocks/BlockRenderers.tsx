"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Music,
  Video,
  Users,
  Link as LinkIcon,
  Clock,
  Play,
  Image as ImageIcon,
} from "lucide-react";
import type { Theme } from "@/lib/themes";
import type { BlockType, ProfileBlock } from "@/lib/blocks";
import { formatPostDate } from "@/lib/posts";

export interface BlockData {
  profile: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    mood: string | null;
  };
  posts: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    published_at: string | null;
  }[];
}

interface RProps {
  block: ProfileBlock;
  theme: Theme;
  data: BlockData;
}

function SectionTitle({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center gap-1.5 text-[15px] font-semibold">
      {icon}
      {children}
    </div>
  );
}

function AvatarBio({ theme, data }: RProps) {
  const p = data.profile;
  return (
    <div className="py-1 text-center">
      <div
        className="mx-auto mb-3 flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full bg-cover bg-center text-4xl"
        style={{
          border: `3px solid ${theme.accent}66`,
          boxShadow: `0 0 24px ${theme.accent}33`,
          background: p.avatar_url
            ? `center / cover no-repeat url(${p.avatar_url})`
            : `linear-gradient(135deg, ${theme.accent}44, ${theme.accent})`,
        }}
      >
        {!p.avatar_url && "🌸"}
      </div>
      <div className="text-xl font-bold">{p.display_name || p.username}</div>
      <div className="mb-2 text-xs opacity-55">@{p.username}</div>
      {p.bio && (
        <div className="whitespace-pre-wrap px-3 text-[13px] leading-relaxed opacity-85">
          {p.bio}
        </div>
      )}
      {p.mood && (
        <div
          className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs"
          style={{ background: `${theme.accent}18` }}
        >
          <span className="opacity-70">Mood:</span> <span>{p.mood}</span>
        </div>
      )}
    </div>
  );
}

function BlogFeed({ theme, data }: RProps) {
  const posts = data.posts;
  return (
    <div>
      <SectionTitle icon={<MessageSquare size={15} />}>Recent Posts</SectionTitle>
      {posts.length === 0 ? (
        <p className="text-[13px] opacity-55">No posts published yet.</p>
      ) : (
        posts.slice(0, 6).map((p, i) => (
          <Link
            key={p.id}
            href={`/${data.profile.username}/${p.slug}`}
            className="block py-2.5"
            style={{
              borderBottom:
                i < Math.min(posts.length, 6) - 1
                  ? `1px solid ${theme.cardBorder}`
                  : "none",
            }}
          >
            <div className="text-sm font-semibold hover:underline">{p.title}</div>
            <div className="mb-1 mt-0.5 text-xs opacity-55">
              {formatPostDate(p.published_at)}
            </div>
            {p.excerpt && (
              <div className="text-[13px] leading-snug opacity-80">{p.excerpt}</div>
            )}
          </Link>
        ))
      )}
    </div>
  );
}

function TextBlock({ block }: RProps) {
  const text = (block.config.text as string) || "Click edit to add text…";
  return (
    <div className="whitespace-pre-wrap text-sm italic leading-relaxed opacity-85">
      {text}
    </div>
  );
}

function LinkList({ block, theme }: RProps) {
  const links = (block.config.links as { label: string; url: string }[]) ?? [];
  return (
    <div>
      <SectionTitle icon={<LinkIcon size={15} />}>Links</SectionTitle>
      {links.length === 0 ? (
        <p className="text-[13px] opacity-55">No links yet.</p>
      ) : (
        links.map((l, i) => (
          <a
            key={i}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mb-1.5 flex items-center gap-2 rounded-lg px-3 py-2 text-[13px]"
            style={{ background: `${theme.accent}11` }}
          >
            🔗 {l.label || l.url}
          </a>
        ))
      )}
    </div>
  );
}

function ImageGallery({ block }: RProps) {
  const images = ((block.config.images as string[]) ?? []).filter(Boolean);

  if (images.length === 0) {
    return (
      <div>
        <SectionTitle icon={<ImageIcon size={15} />}>Photos</SectionTitle>
        <p className="text-[13px] opacity-55">No photos yet.</p>
      </div>
    );
  }

  const shown = images.slice(0, 4);
  const cols = shown.length === 1 ? 1 : 2;

  // Fill the block: a single photo spans the whole area; multiple photos tile
  // and stretch to fill the available height (no fixed square tiles).
  return (
    <div className="flex h-full flex-col">
      <SectionTitle icon={<ImageIcon size={15} />}>Photos</SectionTitle>
      <div
        className="grid min-h-0 flex-1 gap-1.5"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridAutoRows: "1fr",
        }}
      >
        {shown.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt=""
            className="h-full min-h-0 w-full rounded-lg object-cover"
          />
        ))}
      </div>
    </div>
  );
}

function embedSrc(url: string): string | null {
  if (!url) return null;
  // YouTube watch/short links -> embed
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  // Spotify open links -> embed
  const sp = url.match(/open\.spotify\.com\/(track|playlist|album)\/([\w]+)/);
  if (sp) return `https://open.spotify.com/embed/${sp[1]}/${sp[2]}`;
  // Otherwise assume it's already an embeddable URL.
  return url;
}

function MusicPlayer({ block, theme }: RProps) {
  const src = embedSrc((block.config.embedUrl as string) || "");
  return (
    <div>
      <SectionTitle icon={<Music size={15} />}>Now Playing</SectionTitle>
      {src ? (
        <iframe
          src={src}
          className="h-[152px] w-full rounded-lg border-0"
          allow="encrypted-media; clipboard-write"
          loading="lazy"
          title="Music"
        />
      ) : (
        <p className="text-[13px] opacity-55" style={{ color: theme.text }}>
          Add a Spotify or YouTube link in settings.
        </p>
      )}
    </div>
  );
}

function VideoPlayer({ block, theme }: RProps) {
  const src = embedSrc((block.config.embedUrl as string) || "");
  return (
    <div>
      <SectionTitle icon={<Video size={15} />}>Video</SectionTitle>
      {src ? (
        <iframe
          src={src}
          className="aspect-video w-full rounded-lg border-0"
          allow="accelerometer; encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
          title="Video"
        />
      ) : (
        <div
          className="flex aspect-video items-center justify-center rounded-lg"
          style={{ background: `linear-gradient(135deg, ${theme.accent}33, ${theme.accent}11)` }}
        >
          <Play size={28} style={{ color: theme.accent }} />
        </div>
      )}
    </div>
  );
}

function FriendsList({ theme }: RProps) {
  return (
    <div>
      <SectionTitle icon={<Users size={15} />}>Friends</SectionTitle>
      <p className="text-[13px] opacity-55" style={{ color: theme.text }}>
        Friends arrive with the social update.
      </p>
    </div>
  );
}

function Guestbook({ theme }: RProps) {
  return (
    <div>
      <SectionTitle icon={<MessageSquare size={15} />}>Guestbook</SectionTitle>
      <p className="text-[13px] opacity-55" style={{ color: theme.text }}>
        Visitors will be able to sign your guestbook soon.
      </p>
    </div>
  );
}

function ClockWidget() {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="py-2 text-center">
      <Clock size={20} className="mx-auto mb-2 opacity-45" />
      <div className="text-3xl font-bold tabular-nums tracking-wider">
        {time || "--:--"}
      </div>
    </div>
  );
}

const RENDERERS: Record<BlockType, (p: RProps) => React.ReactNode> = {
  avatar_bio: (p) => <AvatarBio {...p} />,
  blog_feed: (p) => <BlogFeed {...p} />,
  text_block: (p) => <TextBlock {...p} />,
  link_list: (p) => <LinkList {...p} />,
  image_gallery: (p) => <ImageGallery {...p} />,
  music_player: (p) => <MusicPlayer {...p} />,
  video_player: (p) => <VideoPlayer {...p} />,
  friends_list: (p) => <FriendsList {...p} />,
  guestbook: (p) => <Guestbook {...p} />,
  clock_widget: () => <ClockWidget />,
};

export function BlockRenderer(props: RProps) {
  const render = RENDERERS[props.block.type];
  return <>{render ? render(props) : <div className="opacity-50">Unknown block</div>}</>;
}
