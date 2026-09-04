"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Layout } from "react-grid-layout";
import { Plus, Eye, Pencil, Save, Settings, Check } from "lucide-react";
import { ProfileGrid } from "./ProfileGrid";
import { BlockPicker } from "./BlockPicker";
import { BlockConfigModal } from "./BlockConfigModal";
import { saveLayout } from "@/app/[username]/edit/actions";
import {
  createBlock,
  type BlockType,
  type ProfileBlock,
} from "@/lib/blocks";
import type { Theme } from "@/lib/themes";
import type { BlockData } from "@/components/blocks/BlockRenderers";

interface Props {
  username: string;
  theme: Theme;
  data: BlockData;
  initialBlocks: ProfileBlock[];
  initialCols: number;
}

export function ProfileBuilder({
  username,
  theme,
  data,
  initialBlocks,
  initialCols,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [blocks, setBlocks] = useState<ProfileBlock[]>(initialBlocks);
  const [cols, setCols] = useState(initialCols);
  const [preview, setPreview] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const gotFirstLayout = useRef(false);

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
    // RGL fires onLayoutChange once on mount; ignore that first call so the
    // builder doesn't start out "dirty".
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

  function save() {
    startTransition(async () => {
      const res = await saveLayout(blocks, cols);
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

  return (
    <div>
      {/* Toolbar */}
      <div className="sticky top-[57px] z-40 flex flex-wrap items-center justify-between gap-2 border-b border-black/10 bg-white/85 px-5 py-2.5 backdrop-blur">
        <div className="flex items-center gap-2">
          <Link href={`/${username}`} className="text-sm font-semibold text-black/50 hover:text-black">
            ← Done
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!preview && (
            <>
              <button
                onClick={() => setShowPicker(true)}
                className="flex items-center gap-1.5 rounded-lg bg-[#e91e63] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#d81b60]"
              >
                <Plus size={15} /> Add
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
              <Link
                href={`/${username}/settings`}
                className="flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-1.5 text-sm font-semibold hover:bg-black/5"
              >
                <Settings size={15} /> Settings
              </Link>
            </>
          )}
          <button
            onClick={() => setPreview((p) => !p)}
            className="flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-1.5 text-sm font-semibold hover:bg-black/5"
          >
            {preview ? <Pencil size={15} /> : <Eye size={15} />}
            {preview ? "Edit" : "Preview"}
          </button>
          <button
            onClick={save}
            disabled={pending || (!dirty && !saved)}
            className="flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-1.5 text-sm font-semibold disabled:opacity-40"
            style={dirty ? { background: theme.accent, color: "#fff", borderColor: "transparent" } : undefined}
          >
            {saved && !dirty ? <Check size={15} /> : <Save size={15} />}
            {pending ? "Saving…" : saved && !dirty ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="min-h-[calc(100vh-105px)] px-6 py-6"
        style={{ background: theme.bg, color: theme.text }}
      >
        <div className="mx-auto max-w-5xl">
          <ProfileGrid
            blocks={blocks}
            cols={cols}
            theme={theme}
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
              style={{ borderColor: theme.cardBorder }}
            >
              <Plus size={18} /> Add a block
            </button>
          )}
        </div>
      </div>

      {showPicker && (
        <BlockPicker onAdd={addBlock} onClose={() => setShowPicker(false)} />
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
