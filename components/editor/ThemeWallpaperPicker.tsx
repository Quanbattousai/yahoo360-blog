"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Palette, Image as ImageIcon, Upload, Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  THEMES,
  OVERLAY_PRESETS,
  getTheme,
  type Wallpaper,
} from "@/lib/themes";
import { UNSPLASH_CATEGORIES, type UnsplashPhoto } from "@/lib/unsplash";

interface Props {
  userId: string;
  themeName: string;
  wallpaper: Wallpaper | null;
  overlay: number;
  onThemeName: (name: string) => void;
  onWallpaper: (wp: Wallpaper | null) => void;
  onOverlay: (v: number) => void;
  onClose: () => void;
}

export function ThemeWallpaperPicker({
  userId,
  themeName,
  wallpaper,
  overlay,
  onThemeName,
  onWallpaper,
  onOverlay,
  onClose,
}: Props) {
  const supabase = createClient();
  const accent = getTheme(themeName).accent;
  const [tab, setTab] = useState<"themes" | "wallpaper">("themes");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState<string>(UNSPLASH_CATEGORIES[0]);
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  const loadPhotos = useCallback(async (q: string) => {
    setLoadingPhotos(true);
    try {
      const res = await fetch(`/api/unsplash?query=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { results: UnsplashPhoto[] };
      setPhotos(data.results ?? []);
    } catch {
      setPhotos([]);
    } finally {
      setLoadingPhotos(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "wallpaper" && photos.length === 0) loadPhotos(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from("wallpapers")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) {
      setUploading(false);
      window.alert(`Upload failed: ${error.message}`);
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("wallpapers").getPublicUrl(path);
    onWallpaper({ url: publicUrl, name: file.name });
    setUploading(false);
  }

  const tabBtn = (t: "themes" | "wallpaper", label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setTab(t)}
      className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-semibold"
      style={{
        borderBottom: tab === t ? `2px solid ${accent}` : "2px solid transparent",
        color: tab === t ? "#1a1a2e" : "#999",
      }}
    >
      {icon} {label}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[82vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 text-[#1a1a2e] shadow-2xl"
      >
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold">Appearance</h2>
          <button onClick={onClose} className="text-black/40 hover:text-black">
            <X size={18} />
          </button>
        </div>

        <div className="mb-5 flex border-b border-black/10">
          {tabBtn("themes", "Themes", <Palette size={14} />)}
          {tabBtn("wallpaper", "Wallpaper", <ImageIcon size={14} />)}
        </div>

        {tab === "themes" && (
          <div className="grid grid-cols-2 gap-2.5">
            {THEMES.map((t) => (
              <button
                key={t.name}
                onClick={() => onThemeName(t.name)}
                className="overflow-hidden rounded-xl border-2 text-left"
                style={{ borderColor: themeName === t.name ? t.accent : "#e0e0e0" }}
              >
                <div className="relative h-13" style={{ height: 52, background: t.bg }}>
                  {themeName === t.name && (
                    <span
                      className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full"
                      style={{ background: t.accent }}
                    >
                      <Check size={12} color="#fff" />
                    </span>
                  )}
                </div>
                <div className="px-2.5 py-2 text-[13px] font-semibold">{t.name}</div>
              </button>
            ))}
          </div>
        )}

        {tab === "wallpaper" && (
          <div>
            {wallpaper && (
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-black/10 p-3">
                <div
                  className="h-10 w-16 flex-shrink-0 rounded-md bg-cover bg-center"
                  style={{ backgroundImage: `url(${wallpaper.url})` }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold">
                    {wallpaper.name || "Wallpaper"}
                  </div>
                  <div className="text-[11px] text-black/50">Active</div>
                </div>
                <button
                  onClick={() => onWallpaper(null)}
                  className="rounded-md border border-black/10 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            )}

            {wallpaper && (
              <div className="mb-5 rounded-xl bg-black/[0.03] p-3.5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[13px] font-semibold">Overlay</span>
                  <span className="rounded bg-black/10 px-2 py-0.5 text-xs">
                    {Math.round(overlay * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={0.8}
                  step={0.05}
                  value={overlay}
                  onChange={(e) => onOverlay(parseFloat(e.target.value))}
                  className="w-full"
                  style={{ accentColor: accent }}
                />
                <div className="mt-2.5 flex gap-1.5">
                  {OVERLAY_PRESETS.map(({ v, label }) => {
                    const active = Math.abs(overlay - v) < 0.03;
                    return (
                      <button
                        key={v}
                        onClick={() => onOverlay(v)}
                        className="flex-1 rounded-md py-1.5 text-[11px] font-medium"
                        style={{
                          border: active ? `2px solid ${accent}` : "1px solid #ddd",
                          background: active ? `${accent}12` : "#fff",
                          color: active ? accent : "#666",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-5">
              <div className="mb-2 text-[13px] font-semibold text-black/70">
                Upload your own
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/20 bg-black/[0.02] py-4 text-[13px] text-black/60 hover:border-black/40"
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Uploading…
                  </>
                ) : (
                  <>
                    <Upload size={16} /> Choose image
                  </>
                )}
              </button>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-black/70">
                  Browse wallpapers
                </span>
                <span className="text-[10px] text-black/40">Unsplash</span>
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {UNSPLASH_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setQuery(c);
                      loadPhotos(c);
                    }}
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{
                      background: query === c ? accent : "#f0f0f0",
                      color: query === c ? "#fff" : "#555",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
              {loadingPhotos ? (
                <div className="flex justify-center py-8 text-black/40">
                  <Loader2 size={20} className="animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1.5">
                  {photos.map((img) => {
                    const active = wallpaper?.url === img.url;
                    return (
                      <button
                        key={img.id}
                        onClick={() =>
                          onWallpaper({ url: img.url, name: `Unsplash — ${img.author}` })
                        }
                        className="relative aspect-[4/3] overflow-hidden rounded-lg"
                        style={{ outline: active ? `2px solid ${accent}` : "none" }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.thumb}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                        {active && (
                          <span
                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full"
                            style={{ background: accent }}
                          >
                            <Check size={11} color="#fff" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
