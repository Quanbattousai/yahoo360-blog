"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Layout } from "react-grid-layout";
import { Plus, Eye, Pencil, Save, Settings, Check, Palette } from "lucide-react";
import { ProfileGrid } from "./ProfileGrid";
import { BlockPicker } from "./BlockPicker";
import { BlockConfigModal } from "./BlockConfigModal";
import { ThemeWallpaperPicker } from "@/components/editor/ThemeWallpaperPicker";
import { saveLayout } from "@/app/[username]/edit/actions";
import { createBlock, type BlockType, type ProfileBlock } from "@/lib/blocks";
import {
  getTheme,
  resolveTheme,
  backgroundStyle,
  type Wallpaper,
} from "@/lib/themes";
import type { BlockData } from "@/components/blocks/BlockRenderers";

interface Props {
  username: string;
  userId: string;
  data: BlockData;
  initialBlocks: ProfileBlock[];
  initialCols: number;
  initialThemeName: string;
  initialWallpaper: Wallpaper | null;
  initialOverlay: number;
}

export function ProfileBuilder({
  username,
  userId,
  data,
  initialBlocks,
  initialCols,
  initialThemeName,
  initialWallpaper,
  initialOverlay,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [blocks, setBlocks] = useState<ProfileBlock[]>(initialBlocks);
  const [cols, setCols] = useState(initialCols);
  const [themeName, setThemeName] = useState(initialThemeName);
  const [wallpaper, setWallpaper] = useState<Wallpaper | null>(initialWallpaper);
  const [overlay, setOverlay] = useState(initialOverlay);

  const [preview, setPreview] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const gotFirstLayout = useRef(false);

  const baseTheme = getTheme(themeName);
  const effectiveTheme = resolveTheme(baseTheme, wallpaper, overlay);
  const bg = backgroundStyle(baseTheme, wallpaper);

  const touch = () => {
    setDirty(true);
    setSaved(false);
  };

  function handleLayoutChange(layout: Layout[]) {
    setBlocks((prev) =>
      prev.map((b) => {
        const l = layout.find((item) => item.i === b.i);
        return l ? { ...b, x: l.x, y: l.y, w: l.w, h: l.h } : b;
      })
    );
    if (!gotFirstLayout.current) {
      gotFirstLayout.current = true;
      return;
    }
    if (!preview) touch();
  }

  function addBlock(type: BlockType) {
    setBlocks((prev) => [...prev, createBlock(type, cols, prev)]);
    touch();
  }
  function removeBlock(i: string) {
    setBlocks((prev) => prev.filter((b) => b.i !== i));
    touch();
  }
  function saveConfig(i: string, config: Record<string, unknown>) {
    setBlocks((prev) => prev.map((b) => (b.i === i ? { ...b, config } : b)));
    touch();
  }

  function handleWallpaper(wp: Wallpaper | null) {
    setWallpaper(wp);
    // Give a fresh wallpaper a readable default overlay.
    if (wp && overlay < 0.15) setOverlay(0.3);
    touch();
  }

  function save() {
    startTransition(async () => {
      const res = await saveLayout(blocks, cols, { themeName, wallpaper, overlay });
      if (res.error) {
        window.alert(res.error);
        return;
      }
      setDirty(false);
      setSaved(true);
      router.refresh();
    });
  }

  const configuringBlock = blocks.find((b) => b.i === configuring) ?? null;
  const toolbarBtn =
    "flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-1.5 text-sm font-semibold hover:bg-black/5";

  return (
    <div>
      {/* Toolbar */}
      <div className="sticky top-[57px] z-40 flex flex-wrap items-center justify-between gap-2 border-b border-black/10 bg-white/85 px-5 py-2.5 backdrop-blur">
        <Link href={`/${username}`} className="text-sm font-semibold text-black/50 hover:text-black">
          ← Done
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {!preview && (
            <>
              <button
                onClick={() => setShowPicker(true)}
                className="flex items-center gap-1.5 rounded-lg bg-[#e91e63] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#d81b60]"
              >
                <Plus size={15} /> Add
              </button>
              <button onClick={() => setShowTheme(true)} className={toolbarBtn}>
                <Palette size={15} /> Theme
              </button>
              <div className="flex overflow-hidden rounded-lg border border-black/10">
                {[2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      setCols(n);
                      touch();
                    }}
                    className={`px-2.5 py-1.5 text-xs font-semibold ${
                      cols === n ? "bg-[#e91e63] text-white" : "hover:bg-black/5"
                    }`}
                  >
                    {n} col
                  </button>
                ))}
              </div>
              <Link href={`/${username}/settings`} className={toolbarBtn}>
                <Settings size={15} /> Settings
              </Link>
            </>
          )}
          <button onClick={() => setPreview((p) => !p)} className={toolbarBtn}>
            {preview ? <Pencil size={15} /> : <Eye size={15} />}
            {preview ? "Edit" : "Preview"}
          </button>
          <button
            onClick={save}
            disabled={pending || (!dirty && !saved)}
            className={toolbarBtn}
            style={dirty ? { background: baseTheme.accent, color: "#fff", borderColor: "transparent" } : undefined}
          >
            {saved && !dirty ? <Check size={15} /> : <Save size={15} />}
            {pending ? "Saving…" : saved && !dirty ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="relative min-h-[calc(100vh-105px)] px-6 py-6"
        style={{ ...bg, color: effectiveTheme.text }}
      >
        {wallpaper && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: `rgba(0,0,0,${overlay})` }}
          />
        )}
        <div className="relative mx-auto max-w-7xl">
          <ProfileGrid
            blocks={blocks}
            cols={cols}
            theme={effectiveTheme}
            data={data}
            editable={!preview}
            onLayoutChange={handleLayoutChange}
            onRemove={removeBlock}
            onConfigure={setConfiguring}
          />

          {!preview && (
            <button
              onClick={() => setShowPicker(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-5 text-sm opacity-50 transition-opacity hover:opacity-100"
              style={{ borderColor: effectiveTheme.cardBorder }}
            >
              <Plus size={18} /> Add a block
            </button>
          )}
        </div>
      </div>

      {showPicker && (
        <BlockPicker onAdd={addBlock} onClose={() => setShowPicker(false)} />
      )}
      {showTheme && (
        <ThemeWallpaperPicker
          userId={userId}
          themeName={themeName}
          wallpaper={wallpaper}
          overlay={overlay}
          onThemeName={(n) => {
            setThemeName(n);
            touch();
          }}
          onWallpaper={handleWallpaper}
          onOverlay={(v) => {
            setOverlay(v);
            touch();
          }}
          onClose={() => setShowTheme(false)}
        />
      )}
      {configuringBlock && (
        <BlockConfigModal
          block={configuringBlock}
          onSave={(config) => saveConfig(configuringBlock.i, config)}
          onClose={() => setConfiguring(null)}
        />
      )}
    </div>
  );
}
