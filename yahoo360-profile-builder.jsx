import { useState, useRef, useEffect, useCallback } from "react";
import {
  Plus, GripVertical, Trash2, Eye, Pencil, Music, Image, Type, Users,
  MessageSquare, Video, Link, Clock, Sparkles, X, Heart,
  Play, Pause, SkipForward, SkipBack, Palette, Check, Upload,
  ImageIcon, Loader, ChevronLeft, ChevronUp, ChevronDown, Columns3, Rows3
} from "lucide-react";

const BLOCK_CATALOG = [
  { type: "avatar_bio", label: "Profile & Bio", icon: Sparkles, category: "Core", defaultW: 1, defaultH: 3, minH: 3 },
  { type: "text_block", label: "Text Block", icon: Type, category: "Content", defaultW: 1, defaultH: 2, minH: 1 },
  { type: "blog_feed", label: "Blog Feed", icon: MessageSquare, category: "Content", defaultW: 2, defaultH: 4, minH: 2 },
  { type: "image_gallery", label: "Image Gallery", icon: Image, category: "Media", defaultW: 1, defaultH: 2, minH: 2 },
  { type: "music_player", label: "Music Player", icon: Music, category: "Media", defaultW: 2, defaultH: 2, minH: 2 },
  { type: "video_player", label: "Video Player", icon: Video, category: "Media", defaultW: 1, defaultH: 2, minH: 2 },
  { type: "friends_list", label: "Friends", icon: Users, category: "Social", defaultW: 1, defaultH: 3, minH: 2 },
  { type: "guestbook", label: "Guestbook", icon: MessageSquare, category: "Social", defaultW: 2, defaultH: 3, minH: 2 },
  { type: "link_list", label: "Links", icon: Link, category: "Content", defaultW: 1, defaultH: 2, minH: 2 },
  { type: "clock_widget", label: "Clock", icon: Clock, category: "Decorative", defaultW: 1, defaultH: 1, minH: 1 },
];

const SAMPLE_POSTS = [
  { title: "Sài Gòn mùa mưa 🌧️", date: "Sep 1, 2026", excerpt: "Chiều nay lại mưa, ngồi café nhìn mưa rơi nhớ những ngày xưa...", likes: 24 },
  { title: "Playlist tháng 9", date: "Aug 28, 2026", excerpt: "Những bài hát acoustic chill cho tháng mới 🎵", likes: 18 },
  { title: "Review: Quán mới ở Q1", date: "Aug 25, 2026", excerpt: "Vừa khám phá được quán café siêu xinh ở đường Nguyễn Huệ...", likes: 31 },
  { title: "Nghĩ về tương lai 🌱", date: "Aug 20, 2026", excerpt: "Đôi khi mình tự hỏi, 5 năm nữa mình sẽ ở đâu và làm gì...", likes: 42 },
];
const SAMPLE_FRIENDS = [
  { name: "Linh", avatar: "🦋" }, { name: "Minh", avatar: "🎸" },
  { name: "Hoa", avatar: "🌸" }, { name: "Tú", avatar: "🎨" },
  { name: "Nam", avatar: "⚡" }, { name: "Mai", avatar: "🌙" },
  { name: "Đức", avatar: "🎯" }, { name: "Lan", avatar: "🌺" },
  { name: "Khoa", avatar: "🚀" },
];
const SAMPLE_GUESTBOOK = [
  { from: "Linh 🦋", msg: "Trang đẹp quá bạn ơi! Miss you 💕", date: "2 hours ago" },
  { from: "Minh 🎸", msg: "Bài blog mới hay lắm, viết thêm nha!", date: "yesterday" },
  { from: "Tú 🎨", msg: "Background mới xinh ghê 😍", date: "3 days ago" },
  { from: "Nam ⚡", msg: "Ghé thăm nè! Blog hay quá trời 🔥", date: "5 days ago" },
];

const THEMES = [
  { name: "Sakura", bg: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #f48fb1 100%)", text: "#4a1942", accent: "#e91e63", card: "rgba(255,255,255,0.65)", cardBorder: "rgba(233,30,99,0.2)", isDark: false },
  { name: "Ocean", bg: "linear-gradient(135deg, #e0f7fa 0%, #80deea 50%, #4dd0e1 100%)", text: "#1a3a4a", accent: "#00897b", card: "rgba(255,255,255,0.6)", cardBorder: "rgba(0,137,123,0.2)", isDark: false },
  { name: "Midnight", bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", text: "#e0e0e0", accent: "#e94560", card: "rgba(255,255,255,0.08)", cardBorder: "rgba(233,69,96,0.25)", isDark: true },
  { name: "Lavender", bg: "linear-gradient(135deg, #ede7f6 0%, #d1c4e9 50%, #b39ddb 100%)", text: "#311b60", accent: "#7c4dff", card: "rgba(255,255,255,0.6)", cardBorder: "rgba(124,77,255,0.2)", isDark: false },
  { name: "Sunset", bg: "linear-gradient(135deg, #fff3e0 0%, #ffcc80 30%, #ff8a65 70%, #ef5350 100%)", text: "#3e2723", accent: "#ff5722", card: "rgba(255,255,255,0.55)", cardBorder: "rgba(255,87,34,0.2)", isDark: false },
  { name: "Forest", bg: "linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 50%, #66bb6a 100%)", text: "#1b3a1b", accent: "#2e7d32", card: "rgba(255,255,255,0.6)", cardBorder: "rgba(46,125,50,0.2)", isDark: false },
];

const UNSPLASH_CATEGORIES = [
  { name: "Nature", icon: "🌿", images: [
    { id: "n1", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&q=60", author: "Bailey Zindel" },
    { id: "n2", url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&q=60", author: "v2osk" },
    { id: "n3", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&q=60", author: "Luca Bravo" },
    { id: "n4", url: "https://images.unsplash.com/photo-1518173946687-a24f89f0cd4f?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1518173946687-a24f89f0cd4f?w=300&q=60", author: "Kalen Emsley" },
    { id: "n5", url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=300&q=60", author: "Robert Lukeman" },
    { id: "n6", url: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=300&q=60", author: "Sergey Shmidt" },
  ]},
  { name: "City", icon: "🏙️", images: [
    { id: "c1", url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=300&q=60", author: "Pedro Lastra" },
    { id: "c2", url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=300&q=60", author: "Luca Bravo" },
    { id: "c3", url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=300&q=60", author: "Jezael Melgoza" },
    { id: "c4", url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300&q=60", author: "Pedro Lastra" },
    { id: "c5", url: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=300&q=60", author: "Denys Nevozhai" },
    { id: "c6", url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=300&q=60", author: "Andreas Gücklhorn" },
  ]},
  { name: "Abstract", icon: "🎨", images: [
    { id: "a1", url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=300&q=60", author: "Pawel Czerwinski" },
    { id: "a2", url: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=300&q=60", author: "Pawel Czerwinski" },
    { id: "a3", url: "https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=300&q=60", author: "Gradienta" },
    { id: "a4", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300&q=60", author: "Gradienta" },
    { id: "a5", url: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=300&q=60", author: "Pawel Czerwinski" },
    { id: "a6", url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&q=60", author: "Pawel Czerwinski" },
  ]},
  { name: "Aesthetic", icon: "✨", images: [
    { id: "e1", url: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=300&q=60", author: "Ian Schneider" },
    { id: "e2", url: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=300&q=60", author: "Bench Accounting" },
    { id: "e3", url: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=300&q=60", author: "Aperture Vintage" },
    { id: "e4", url: "https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=300&q=60", author: "Nathan Anderson" },
    { id: "e5", url: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=300&q=60", author: "Benjamin Voros" },
    { id: "e6", url: "https://images.unsplash.com/photo-1531685250784-7569952593d2?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1531685250784-7569952593d2?w=300&q=60", author: "Joel Filipe" },
  ]},
  { name: "Cozy / Lofi", icon: "🌸", images: [
    { id: "l1", url: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=300&q=60", author: "Billy Huynh" },
    { id: "l2", url: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=300&q=60", author: "AJ" },
    { id: "l3", url: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=300&q=60", author: "Yoann Boyer" },
    { id: "l4", url: "https://images.unsplash.com/photo-1464457312035-3d7d0e0c058e?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1464457312035-3d7d0e0c058e?w=300&q=60", author: "Luke Stackpoole" },
    { id: "l5", url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&q=60", author: "Benjamin Voros" },
    { id: "l6", url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1400&q=80", thumb: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=300&q=60", author: "Lucas Gallone" },
  ]},
];

let blockIdCounter = 100;
const genId = () => `blk_${blockIdCounter++}`;

const INITIAL_BLOCKS = [
  { id: "blk_1", type: "avatar_bio", w: 1, h: 3, config: {} },
  { id: "blk_2", type: "music_player", w: 2, h: 2, config: {} },
  { id: "blk_3", type: "friends_list", w: 1, h: 3, config: {} },
  { id: "blk_4", type: "blog_feed", w: 2, h: 4, config: {} },
  { id: "blk_5", type: "image_gallery", w: 1, h: 2, config: {} },
  { id: "blk_6", type: "text_block", w: 1, h: 1, config: { text: "\"Hãy sống như ngày mai sẽ chết,\nhọc như sẽ sống mãi mãi\" ✨" } },
  { id: "blk_7", type: "link_list", w: 1, h: 2, config: {} },
  { id: "blk_8", type: "guestbook", w: 2, h: 3, config: {} },
  { id: "blk_9", type: "clock_widget", w: 1, h: 1, config: {} },
  { id: "blk_10", type: "video_player", w: 1, h: 2, config: {} },
];

// ── Block Renderers ─────────────────────────────────────────────
function AvatarBioBlock({ theme }) {
  return (
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <div style={{ width: 88, height: 88, borderRadius: "50%", background: `linear-gradient(135deg, ${theme.accent}44, ${theme.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, margin: "0 auto 12px", border: `3px solid ${theme.accent}66`, boxShadow: `0 0 24px ${theme.accent}33` }}>🌸</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Thanh Trúc</div>
      <div style={{ fontSize: 12, opacity: 0.55, marginBottom: 10 }}>@thanhtruc.360</div>
      <div style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.85, padding: "0 12px" }}>Saigon dreamer · Bookworm · Coffee addict ☕<br/>UX Designer & Blogger</div>
      <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, background: `${theme.accent}18`, padding: "5px 14px", borderRadius: 20, fontSize: 12 }}>
        <span>Mood:</span> <span>đang vui 😊</span>
      </div>
    </div>
  );
}
function BlogFeedBlock({ theme }) {
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><MessageSquare size={15} /> Recent Posts</div>
      {SAMPLE_POSTS.map((p, i) => (
        <div key={i} style={{ padding: "11px 0", borderBottom: i < SAMPLE_POSTS.length - 1 ? `1px solid ${theme.cardBorder}` : "none" }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3, cursor: "pointer" }}>{p.title}</div>
          <div style={{ fontSize: 12, opacity: 0.55, marginBottom: 5 }}>{p.date}</div>
          <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.5 }}>{p.excerpt}</div>
          <div style={{ fontSize: 12, opacity: 0.45, marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}><Heart size={11} fill={theme.accent} stroke={theme.accent} /> {p.likes}</div>
        </div>
      ))}
    </div>
  );
}
function MusicPlayerBlock({ theme }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><Music size={15} /> Now Playing</div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: 10, background: `linear-gradient(135deg, ${theme.accent}55, ${theme.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>🎵</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Có Chắc Yêu Là Đây</div>
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>Sơn Tùng M-TP</div>
          <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: `${theme.accent}25` }}><div style={{ width: "38%", height: "100%", borderRadius: 2, background: theme.accent }} /></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, opacity: 0.45, marginTop: 3 }}><span>1:24</span><span>3:42</span></div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 14 }}>
        {[SkipBack, playing ? Pause : Play, SkipForward].map((Icon, i) => (
          <button key={i} onClick={i === 1 ? () => setPlaying(!playing) : undefined}
            style={{ background: i === 1 ? theme.accent : "transparent", color: i === 1 ? "#fff" : "inherit", border: "none", borderRadius: "50%", width: i === 1 ? 40 : 32, height: i === 1 ? 40 : 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: i === 1 ? 1 : 0.6 }}>
            <Icon size={i === 1 ? 18 : 15} />
          </button>
        ))}
      </div>
    </div>
  );
}
function ImageGalleryBlock({ theme }) {
  const c = [`${theme.accent}55`, `${theme.accent}33`, `${theme.accent}77`, `${theme.accent}44`];
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Image size={15} /> Photos</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {["🌅 Sunset", "☕ Café", "📚 Books", "🌸 Flowers"].map((item, i) => (
          <div key={i} style={{ aspectRatio: "1", borderRadius: 8, background: `linear-gradient(135deg, ${c[i]}, ${c[(i + 1) % 4]})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, cursor: "pointer" }}>{item}</div>
        ))}
      </div>
    </div>
  );
}
function FriendsListBlock({ theme }) {
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Users size={15} /> Friends ({SAMPLE_FRIENDS.length})</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {SAMPLE_FRIENDS.map((f, i) => (
          <div key={i} style={{ textAlign: "center", cursor: "pointer" }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: `${theme.accent}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, margin: "0 auto 4px", border: `2px solid ${theme.accent}33` }}>{f.avatar}</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>{f.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function GuestbookBlock({ theme }) {
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><MessageSquare size={15} /> Guestbook</div>
      {SAMPLE_GUESTBOOK.map((g, i) => (
        <div key={i} style={{ padding: "9px 0", borderBottom: i < SAMPLE_GUESTBOOK.length - 1 ? `1px solid ${theme.cardBorder}` : "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{g.from}</span>
            <span style={{ fontSize: 11, opacity: 0.45 }}>{g.date}</span>
          </div>
          <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.45 }}>{g.msg}</div>
        </div>
      ))}
      <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
        <input placeholder="Leave a message..." style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1px solid ${theme.cardBorder}`, background: theme.card, color: theme.text, fontSize: 13, outline: "none" }} />
        <button style={{ padding: "8px 16px", borderRadius: 8, background: theme.accent, color: "#fff", border: "none", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Send</button>
      </div>
    </div>
  );
}
function TextBlockComp({ config }) {
  return (<div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap", fontStyle: "italic", opacity: 0.85 }}>{config.text || "Click to add text..."}</div>);
}
function VideoPlayerBlock({ theme }) {
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Video size={15} /> Video</div>
      <div style={{ aspectRatio: "16/9", borderRadius: 10, background: `linear-gradient(135deg, ${theme.accent}33, ${theme.accent}11)`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${theme.accent}cc`, display: "flex", alignItems: "center", justifyContent: "center" }}><Play size={22} fill="#fff" color="#fff" /></div>
      </div>
      <div style={{ fontSize: 13, marginTop: 8, fontWeight: 500 }}>Sài Gòn vlog 🎬</div>
    </div>
  );
}
function LinkListBlock({ theme }) {
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Link size={15} /> Links</div>
      {[{ icon: "📸", label: "Instagram" }, { icon: "🐦", label: "Twitter" }, { icon: "🎵", label: "Spotify" }, { icon: "💼", label: "Portfolio" }].map((l, i) => (
        <div key={i} style={{ padding: "9px 12px", marginBottom: 5, borderRadius: 8, background: `${theme.accent}11`, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}><span>{l.icon}</span> {l.label}</div>
      ))}
    </div>
  );
}
function ClockWidgetBlock({ theme }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <div style={{ textAlign: "center", padding: "16px 0" }}>
      <Clock size={20} style={{ margin: "0 auto 10px", opacity: 0.45 }} />
      <div style={{ fontSize: 32, fontWeight: 700, fontVariantNumeric: "tabular-nums", letterSpacing: 2 }}>{time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</div>
      <div style={{ fontSize: 12, opacity: 0.45, marginTop: 6 }}>Hồ Chí Minh City</div>
    </div>
  );
}

const RENDERERS = {
  avatar_bio: (b, t) => <AvatarBioBlock theme={t} />,
  blog_feed: (b, t) => <BlogFeedBlock theme={t} />,
  music_player: (b, t) => <MusicPlayerBlock theme={t} />,
  image_gallery: (b, t) => <ImageGalleryBlock theme={t} />,
  friends_list: (b, t) => <FriendsListBlock theme={t} />,
  guestbook: (b, t) => <GuestbookBlock theme={t} />,
  text_block: (b, t) => <TextBlockComp config={b.config} theme={t} />,
  video_player: (b, t) => <VideoPlayerBlock theme={t} />,
  link_list: (b, t) => <LinkListBlock theme={t} />,
  clock_widget: (b, t) => <ClockWidgetBlock theme={t} />,
};

// ── Modals ──────────────────────────────────────────────────────
function Modal({ onClose, title, width = 420, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }} />
      <div onClick={e => e.stopPropagation()} style={{ position: "relative", background: "#fff", borderRadius: 16, padding: 24, width, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#1a1a2e" }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={18} color="#999" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
function BlockPicker({ onAdd, onClose, theme }) {
  const categories = [...new Set(BLOCK_CATALOG.map(b => b.category))];
  return (
    <Modal onClose={onClose} title="Add Block" width={400}>
      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.2, color: "#999", marginBottom: 8 }}>{cat}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {BLOCK_CATALOG.filter(b => b.category === cat).map(b => {
              const Icon = b.icon;
              return (<button key={b.type} onClick={() => { onAdd(b); onClose(); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, border: "1px solid #eee", background: "#fafafa", cursor: "pointer", fontSize: 13, color: "#333", textAlign: "left", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = `${theme.accent}12`; e.currentTarget.style.borderColor = theme.accent; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fafafa"; e.currentTarget.style.borderColor = "#eee"; }}>
                <Icon size={16} color={theme.accent} /> {b.label}</button>);
            })}
          </div>
        </div>
      ))}
    </Modal>
  );
}
function ThemeWallpaperPicker({ current, wallpaper, overlay, onChange, onWallpaper, onOverlay, onClose }) {
  const [tab, setTab] = useState("themes");
  const [unsplashCat, setUnsplashCat] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const handleUpload = (e) => { const file = e.target.files?.[0]; if (!file) return; setUploading(true); const r = new FileReader(); r.onload = (ev) => { onWallpaper(ev.target.result, file.name); setUploading(false); }; r.onerror = () => setUploading(false); r.readAsDataURL(file); };
  const tabStyle = (t) => ({ flex: 1, padding: "9px 0", fontSize: 13, fontWeight: 600, border: "none", borderBottom: tab === t ? `2px solid ${current.accent}` : "2px solid transparent", background: "none", cursor: "pointer", color: tab === t ? "#1a1a2e" : "#999" });
  return (
    <Modal onClose={onClose} title="Appearance" width={440}>
      <div style={{ display: "flex", borderBottom: "1px solid #eee", marginBottom: 18, marginTop: -4 }}>
        <button style={tabStyle("themes")} onClick={() => setTab("themes")}><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Palette size={14} /> Themes</span></button>
        <button style={tabStyle("wallpaper")} onClick={() => { setTab("wallpaper"); setUnsplashCat(null); }}><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><ImageIcon size={14} /> Wallpaper</span></button>
      </div>
      {tab === "themes" && (<div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {THEMES.map(t => (<button key={t.name} onClick={() => onChange(t)} style={{ padding: 0, border: current.name === t.name ? `2px solid ${t.accent}` : "2px solid #e0e0e0", borderRadius: 12, overflow: "hidden", cursor: "pointer", background: "none", textAlign: "left" }}>
          <div style={{ height: 52, background: t.bg, position: "relative" }}>{current.name === t.name && <div style={{ position: "absolute", top: 6, right: 6, width: 20, height: 20, borderRadius: "50%", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={12} color="#fff" /></div>}</div>
          <div style={{ padding: "8px 10px", fontSize: 13, fontWeight: 600, color: "#333" }}>{t.name}</div></button>))}
      </div></div>)}
      {tab === "wallpaper" && (<div>
        {wallpaper && (<div style={{ marginBottom: 16, padding: 12, borderRadius: 10, border: "1px solid #e0e0e0", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 64, height: 40, borderRadius: 6, backgroundImage: `url(${wallpaper.url})`, backgroundSize: "cover", backgroundPosition: "center", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, color: "#333", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{wallpaper.name}</div><div style={{ fontSize: 11, color: "#999" }}>Active</div></div>
          <button onClick={() => onWallpaper(null, null)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #e0e0e0", background: "#fff", fontSize: 12, cursor: "pointer", color: "#e53935", fontWeight: 600 }}>Remove</button></div>)}
        {wallpaper && (<div style={{ marginBottom: 18, padding: 14, borderRadius: 10, background: "#f7f7f7" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>Overlay</span><span style={{ fontSize: 12, color: "#777", background: "#eee", padding: "2px 8px", borderRadius: 4 }}>{Math.round(overlay * 100)}%</span></div>
          <input type="range" min="0" max="0.8" step="0.05" value={overlay} onChange={(e) => onOverlay(parseFloat(e.target.value))} style={{ width: "100%", accentColor: current.accent }} />
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>{[{ v: 0, l: "None" }, { v: 0.15, l: "Light" }, { v: 0.35, l: "Medium" }, { v: 0.55, l: "Dark" }, { v: 0.75, l: "Heavy" }].map(({ v, l }) => (
            <button key={v} onClick={() => onOverlay(v)} style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: Math.abs(overlay - v) < 0.03 ? `2px solid ${current.accent}` : "1px solid #ddd", cursor: "pointer", fontSize: 11, fontWeight: 500, background: Math.abs(overlay - v) < 0.03 ? `${current.accent}12` : "#fff", color: Math.abs(overlay - v) < 0.03 ? current.accent : "#666" }}>{l}</button>))}</div></div>)}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 8 }}>Upload your own</div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} />
          <button onClick={() => fileRef.current?.click()} style={{ width: "100%", padding: "16px", borderRadius: 10, border: "2px dashed #ccc", background: "#fafafa", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13, color: "#666" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = current.accent; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#ccc"; }}>
            {uploading ? <><Loader size={16} className="y360spin" /> Processing...</> : <><Upload size={16} /> Choose image</>}</button></div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}><div style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>Browse wallpapers</div><div style={{ fontSize: 10, color: "#aaa" }}>Unsplash</div></div>
          {!unsplashCat ? (<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {UNSPLASH_CATEGORIES.map(cat => (<button key={cat.name} onClick={() => setUnsplashCat(cat)} style={{ padding: 0, border: "1px solid #e8e8e8", borderRadius: 10, overflow: "hidden", cursor: "pointer", background: "none", textAlign: "left" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = current.accent} onMouseLeave={e => e.currentTarget.style.borderColor = "#e8e8e8"}>
              <div style={{ height: 64, backgroundImage: `url(${cat.images[0].thumb})`, backgroundSize: "cover", backgroundPosition: "center", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "6px 10px", fontSize: 13, fontWeight: 600, color: "#fff" }}>{cat.icon} {cat.name}</div></div></button>))}</div>
          ) : (<div>
            <button onClick={() => setUnsplashCat(null)} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: current.accent, marginBottom: 12, padding: 0, fontWeight: 600 }}><ChevronLeft size={16} /> {unsplashCat.icon} {unsplashCat.name}</button>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {unsplashCat.images.map(img => { const a = wallpaper?.url === img.url; return (
                <button key={img.id} onClick={() => onWallpaper(img.url, `${unsplashCat.name} — ${img.author}`)} style={{ padding: 0, border: a ? `2px solid ${current.accent}` : "2px solid transparent", borderRadius: 8, overflow: "hidden", cursor: "pointer", background: "none", position: "relative", aspectRatio: "4/3" }}>
                  <img src={img.thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
                  {a && <div style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: current.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={12} color="#fff" /></div>}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 4px 3px", background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)", fontSize: 9, color: "#fff" }}>{img.author}</div></button>); })}</div></div>)}</div>
      </div>)}
    </Modal>
  );
}

// ── Main App ────────────────────────────────────────────────────
export default function Yahoo360ProfileBuilder() {
  const [blocks, setBlocks] = useState(INITIAL_BLOCKS);
  const [editMode, setEditMode] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [theme, setTheme] = useState(THEMES[0]);
  const [wallpaper, setWallpaper] = useState(null);
  const [overlayOpacity, setOverlayOpacity] = useState(0.3);
  const [gridCols, setGridCols] = useState(3);

  // DnD state — simple index-based reorder
  const dragSrc = useRef(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [dropEdge, setDropEdge] = useState(null); // "top" or "bottom"
  const [draggingId, setDraggingId] = useState(null);

  const handleWallpaper = (url, name) => { if (!url) { setWallpaper(null); return; } setWallpaper({ url, name }); if (overlayOpacity < 0.15) setOverlayOpacity(0.3); };
  const addBlock = (entry) => { setBlocks(prev => [...prev, { id: genId(), type: entry.type, w: Math.min(entry.defaultW, gridCols), h: entry.defaultH || 3, config: entry.type === "text_block" ? { text: "Your text here..." } : {} }]); };
  const removeBlock = (id) => setBlocks(prev => prev.filter(b => b.id !== id));
  const cycleWidth = (id) => { setBlocks(prev => prev.map(b => b.id !== id ? b : { ...b, w: b.w >= gridCols ? 1 : b.w + 1 })); };
  const changeRows = (id, delta) => { setBlocks(prev => prev.map(b => {
    if (b.id !== id) return b;
    const cat = BLOCK_CATALOG.find(c => c.type === b.type);
    const minH = cat?.minH || 1;
    return { ...b, h: Math.max(minH, Math.min(8, (b.h || 3) + delta)) };
  })); };

  // ── DnD handlers ──
  const onDragStart = useCallback((e, blockId) => {
    dragSrc.current = blockId;
    setDraggingId(blockId);
    e.dataTransfer.effectAllowed = "move";
    // Use timeout so the element renders before we ghost it
    setTimeout(() => {
      e.target.style.opacity = "0.4";
    }, 0);
  }, []);

  const onDragEnd = useCallback((e) => {
    e.target.style.opacity = "1";
    dragSrc.current = null;
    setDraggingId(null);
    setDragOverId(null);
    setDropEdge(null);
  }, []);

  const onDragOver = useCallback((e, blockId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!dragSrc.current || dragSrc.current === blockId) {
      setDragOverId(null);
      setDropEdge(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const edge = y < rect.height / 2 ? "top" : "bottom";
    setDragOverId(blockId);
    setDropEdge(edge);
  }, []);

  const onDragLeave = useCallback((e) => {
    // Only clear if we actually left the element
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverId(null);
      setDropEdge(null);
    }
  }, []);

  const onDrop = useCallback((e, targetId) => {
    e.preventDefault();
    const srcId = dragSrc.current;
    if (!srcId || srcId === targetId) return;

    setBlocks(prev => {
      const srcIdx = prev.findIndex(b => b.id === srcId);
      const tgtIdx = prev.findIndex(b => b.id === targetId);
      if (srcIdx === -1 || tgtIdx === -1) return prev;

      const next = [...prev];
      const [moved] = next.splice(srcIdx, 1);
      // Recalculate target index after removal
      const newTgtIdx = next.findIndex(b => b.id === targetId);
      const insertIdx = dropEdge === "bottom" ? newTgtIdx + 1 : newTgtIdx;
      next.splice(insertIdx, 0, moved);
      return next;
    });

    dragSrc.current = null;
    setDraggingId(null);
    setDragOverId(null);
    setDropEdge(null);
  }, [dropEdge]);

  // Also handle drop on the grid container (for dropping at the very end)
  const onGridDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onGridDrop = useCallback((e) => {
    e.preventDefault();
    const srcId = dragSrc.current;
    if (!srcId) return;
    // If dropped on grid background (not on a block), move to end
    if (!dragOverId) {
      setBlocks(prev => {
        const srcIdx = prev.findIndex(b => b.id === srcId);
        if (srcIdx === -1) return prev;
        const next = [...prev];
        const [moved] = next.splice(srcIdx, 1);
        next.push(moved);
        return next;
      });
    }
    dragSrc.current = null;
    setDraggingId(null);
    setDragOverId(null);
    setDropEdge(null);
  }, [dragOverId]);

  // ── Adaptive theme ──
  const hasDarkOverlay = wallpaper && overlayOpacity > 0.35;
  const effectiveTheme = wallpaper ? {
    ...theme,
    text: hasDarkOverlay ? "#f0f0f0" : theme.isDark ? "#f0f0f0" : theme.text,
    card: hasDarkOverlay ? "rgba(0,0,0,0.4)" : theme.isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.78)",
    cardBorder: hasDarkOverlay ? "rgba(255,255,255,0.1)" : theme.isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
  } : theme;

  const bgStyle = wallpaper
    ? { backgroundImage: `url(${wallpaper.url})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }
    : { background: theme.bg };
  const toolbarDark = hasDarkOverlay || (!wallpaper && theme.isDark);

  return (
    <div style={{ minHeight: "100vh", ...bgStyle, fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", color: effectiveTheme.text, transition: "all 0.4s", position: "relative" }}>
      {wallpaper && <div style={{ position: "fixed", inset: 0, background: `rgba(0,0,0,${overlayOpacity})`, pointerEvents: "none", zIndex: 0, transition: "background 0.3s" }} />}

      {/* Toolbar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: toolbarDark ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.8)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        borderBottom: `1px solid ${toolbarDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
        padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
        color: toolbarDark ? "#f0f0f0" : "#1a1a2e",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>✦</span>
          <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: -0.3 }}>360° Profile</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {editMode && (<>
            <button onClick={() => setShowPicker(true)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, border: "none", background: theme.accent, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}><Plus size={15} /> Add</button>
            <button onClick={() => setShowThemes(true)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, border: `1px solid ${toolbarDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}`, background: toolbarDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.6)", color: "inherit", cursor: "pointer", fontSize: 13, fontWeight: 600 }}><Palette size={15} /> Theme</button>
            <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: `1px solid ${toolbarDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}` }}>
              {[2, 3, 4].map(n => (<button key={n} onClick={() => setGridCols(n)} style={{ padding: "7px 10px", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: gridCols === n ? theme.accent : toolbarDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.6)", color: gridCols === n ? "#fff" : "inherit" }}>{n}col</button>))}
            </div>
          </>)}
          <button onClick={() => setEditMode(!editMode)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, border: `1px solid ${toolbarDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}`, background: editMode ? `${theme.accent}22` : toolbarDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.6)", color: "inherit", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            {editMode ? <><Eye size={15} /> Preview</> : <><Pencil size={15} /> Edit</>}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: "24px 28px 60px", position: "relative", zIndex: 1 }}>
        <div
          onDragOver={editMode ? onGridDragOver : undefined}
          onDrop={editMode ? onGridDrop : undefined}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gridAutoRows: 120,
            gap: 14,
            gridAutoFlow: "dense",
          }}>
          {blocks.map((block) => {
            const cat = BLOCK_CATALOG.find(c => c.type === block.type);
            const colSpan = Math.min(block.w, gridCols);
            const rowSpan = block.h || 3;
            const minH = cat?.minH || 1;
            const isDragging = draggingId === block.id;
            const isOver = dragOverId === block.id;
            const widthLabel = colSpan >= gridCols ? "Full" : colSpan === 2 ? "Wide" : "1col";

            return (
              <div key={block.id}
                draggable={editMode}
                onDragStart={editMode ? (e) => onDragStart(e, block.id) : undefined}
                onDragEnd={editMode ? onDragEnd : undefined}
                onDragOver={editMode ? (e) => onDragOver(e, block.id) : undefined}
                onDragLeave={editMode ? onDragLeave : undefined}
                onDrop={editMode ? (e) => onDrop(e, block.id) : undefined}
                style={{
                  gridColumn: colSpan >= gridCols ? "1 / -1" : colSpan === 2 ? "span 2" : "auto",
                  gridRow: `span ${rowSpan}`,
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}>

                {/* Top drop indicator */}
                <div style={{
                  position: "absolute", top: -8, left: 0, right: 0, height: 4, borderRadius: 2, zIndex: 20,
                  background: isOver && dropEdge === "top" ? theme.accent : "transparent",
                  boxShadow: isOver && dropEdge === "top" ? `0 0 12px ${theme.accent}88` : "none",
                  transition: "all 0.15s ease",
                }} />

                {/* The card */}
                <div style={{
                  flex: 1,
                  background: effectiveTheme.card,
                  border: `1px solid ${isOver ? theme.accent : effectiveTheme.cardBorder}`,
                  borderRadius: 14, padding: 20, color: effectiveTheme.text,
                  overflow: "hidden",
                  transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
                  opacity: isDragging ? 0.35 : 1,
                  transform: isDragging ? "scale(0.96) rotate(-0.5deg)" : isOver ? "scale(1.01)" : "scale(1)",
                  boxShadow: isDragging ? `0 12px 40px rgba(0,0,0,0.25)` : isOver ? `0 0 0 2px ${theme.accent}66, 0 8px 24px rgba(0,0,0,0.12)` : wallpaper ? "0 4px 20px rgba(0,0,0,0.12)" : "0 2px 12px rgba(0,0,0,0.06)",
                  backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                  cursor: editMode ? "grab" : "default",
                }}>
                  {editMode && (
                    <div style={{ position: "absolute", top: 7, right: 7, display: "flex", gap: 3, zIndex: 2 }}>
                      <button onClick={() => cycleWidth(block.id)} style={{ height: 26, padding: "0 8px", borderRadius: 6, border: "none", background: `${theme.accent}22`, color: effectiveTheme.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, gap: 3 }}><Columns3 size={11} /> {widthLabel}</button>
                      <div style={{ display: "flex", alignItems: "center", gap: 0, background: `${theme.accent}22`, borderRadius: 6, overflow: "hidden" }}>
                        <button onClick={() => changeRows(block.id, -1)} style={{ width: 22, height: 26, border: "none", background: "transparent", color: effectiveTheme.text, cursor: rowSpan <= minH ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: rowSpan <= minH ? 0.25 : 0.8 }}><ChevronUp size={12} /></button>
                        <span style={{ fontSize: 10, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{rowSpan}r</span>
                        <button onClick={() => changeRows(block.id, 1)} style={{ width: 22, height: 26, border: "none", background: "transparent", color: effectiveTheme.text, cursor: rowSpan >= 8 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: rowSpan >= 8 ? 0.25 : 0.8 }}><ChevronDown size={12} /></button>
                      </div>
                      <button onClick={() => removeBlock(block.id)} style={{ width: 26, height: 26, borderRadius: 6, border: "none", background: "rgba(239,83,80,0.15)", color: "#ef5350", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={12} /></button>
                    </div>
                  )}
                  {editMode && (
                    <div style={{ position: "absolute", top: 8, left: 9, cursor: "grab", opacity: 0.3, display: "flex", alignItems: "center", gap: 4 }}>
                      <GripVertical size={14} /><span style={{ fontSize: 10, fontWeight: 600 }}>{cat?.label}</span>
                    </div>
                  )}
                  <div style={{ marginTop: editMode ? 22 : 0, flex: 1, overflow: "auto" }}>
                    {RENDERERS[block.type]?.(block, effectiveTheme) ?? <div style={{ opacity: 0.5 }}>Unknown</div>}
                  </div>
                </div>

                {/* Bottom drop indicator */}
                <div style={{
                  position: "absolute", bottom: -8, left: 0, right: 0, height: 4, borderRadius: 2, zIndex: 20,
                  background: isOver && dropEdge === "bottom" ? theme.accent : "transparent",
                  boxShadow: isOver && dropEdge === "bottom" ? `0 0 12px ${theme.accent}88` : "none",
                  transition: "all 0.15s ease",
                }} />
              </div>
            );
          })}
        </div>

        {editMode && (
          <button onClick={() => setShowPicker(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "18px", marginTop: 14, borderRadius: 14, border: `2px dashed ${effectiveTheme.cardBorder}`, background: "transparent", color: effectiveTheme.text, cursor: "pointer", fontSize: 14, opacity: 0.4, transition: "opacity 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.4"}>
            <Plus size={18} /> Add a block
          </button>
        )}
      </div>

      {showPicker && <BlockPicker onAdd={addBlock} onClose={() => setShowPicker(false)} theme={theme} />}
      {showThemes && <ThemeWallpaperPicker current={theme} wallpaper={wallpaper} overlay={overlayOpacity} onChange={setTheme} onWallpaper={handleWallpaper} onOverlay={setOverlayOpacity} onClose={() => setShowThemes(false)} />}

      <style>{`
        @keyframes y360spin { to { transform: rotate(360deg); } }
        .y360spin { animation: y360spin 1s linear infinite; }
        input[type="range"] { -webkit-appearance: none; appearance: none; background: #ddd; border-radius: 4px; outline: none; height: 6px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: ${theme.accent}; cursor: pointer; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
      `}</style>
    </div>
  );
}
