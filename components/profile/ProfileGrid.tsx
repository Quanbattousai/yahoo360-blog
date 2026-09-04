"use client";

import { useEffect, useMemo, useState } from "react";
import GridLayout, { WidthProvider, type Layout } from "react-grid-layout";
import { Settings2, Trash2 } from "lucide-react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import type { Theme } from "@/lib/themes";
import { getBlockDef, type ProfileBlock } from "@/lib/blocks";
import { BlockRenderer, type BlockData } from "@/components/blocks/BlockRenderers";

const Grid = WidthProvider(GridLayout);

const ROW_HEIGHT = 120;
const CONFIGURABLE = new Set([
  "text_block",
  "link_list",
  "music_player",
  "video_player",
  "image_gallery",
]);

interface Props {
  blocks: ProfileBlock[];
  cols: number;
  theme: Theme;
  data: BlockData;
  editable?: boolean;
  onLayoutChange?: (layout: Layout[]) => void;
  onRemove?: (i: string) => void;
  onConfigure?: (i: string) => void;
}

export function ProfileGrid({
  blocks,
  cols,
  theme,
  data,
  editable = false,
  onLayoutChange,
  onRemove,
  onConfigure,
}: Props) {
  // Render RGL only after mount so the server HTML doesn't disagree with the
  // client's width-based inline positioning (avoids hydration mismatch).
  const [mounted, setMounted] = useState(false);
  const [winW, setWinW] = useState<number | null>(null);
  useEffect(() => {
    setMounted(true);
    const onResize = () => setWinW(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // In view mode, collapse columns on narrow screens so profiles stay usable on
  // phones/tablets. The builder keeps the author's chosen column count.
  const effectiveCols =
    editable || winW === null
      ? cols
      : winW < 640
        ? 1
        : winW < 1024
          ? Math.min(2, cols)
          : cols;

  const layout: Layout[] = useMemo(
    () =>
      blocks.map((b) => {
        const def = getBlockDef(b.type);
        return {
          i: b.i,
          x: b.x,
          y: b.y,
          w: Math.min(b.w, effectiveCols),
          h: b.h,
          minH: def.minH,
          minW: def.minW ?? 1,
        };
      }),
    [blocks, effectiveCols]
  );

  if (!mounted) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-sm opacity-40">
        Loading…
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <div
        className="rounded-2xl border border-dashed p-10 text-center text-sm opacity-60"
        style={{ borderColor: theme.cardBorder }}
      >
        No blocks yet.
      </div>
    );
  }

  return (
    <Grid
      className="layout"
      layout={layout}
      cols={effectiveCols}
      rowHeight={ROW_HEIGHT}
      margin={[14, 14]}
      containerPadding={[0, 0]}
      isDraggable={editable}
      isResizable={editable}
      draggableCancel=".block-control"
      compactType="vertical"
      onLayoutChange={(l) => onLayoutChange?.(l)}
    >
      {blocks.map((b) => (
        <div
          key={b.i}
          className="group relative overflow-hidden rounded-2xl border backdrop-blur"
          style={{
            background: theme.card,
            borderColor: theme.cardBorder,
            color: theme.text,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            cursor: editable ? "grab" : "default",
          }}
        >
          {editable && (
            <div className="block-control absolute right-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {CONFIGURABLE.has(b.type) && (
                <button
                  type="button"
                  onClick={() => onConfigure?.(b.i)}
                  title="Settings"
                  className="flex h-7 w-7 items-center justify-center rounded-md"
                  style={{ background: `${theme.accent}22`, color: theme.text }}
                >
                  <Settings2 size={13} />
                </button>
              )}
              <button
                type="button"
                onClick={() => onRemove?.(b.i)}
                title="Remove"
                className="flex h-7 w-7 items-center justify-center rounded-md bg-red-500/15 text-red-500"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
          <div className="h-full overflow-auto p-5">
            <BlockRenderer block={b} theme={theme} data={data} />
          </div>
        </div>
      ))}
    </Grid>
  );
}
