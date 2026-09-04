"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { ProfileBlock } from "@/lib/blocks";

interface Props {
  block: ProfileBlock;
  onSave: (config: Record<string, unknown>) => void;
  onClose: () => void;
}

export function BlockConfigModal({ block, onSave, onClose }: Props) {
  const [config, setConfig] = useState<Record<string, unknown>>({
    ...block.config,
  });

  const set = (key: string, value: unknown) =>
    setConfig((c) => ({ ...c, [key]: value }));

  function body() {
    switch (block.type) {
      case "text_block":
        return (
          <label className="flex flex-col gap-1 text-sm font-medium">
            Text
            <textarea
              rows={5}
              value={(config.text as string) ?? ""}
              onChange={(e) => set("text", e.target.value)}
              className="resize-none rounded-lg border border-black/15 px-3 py-2 outline-none focus:border-[#e91e63]"
            />
          </label>
        );
      case "music_player":
      case "video_player":
        return (
          <label className="flex flex-col gap-1 text-sm font-medium">
            Embed URL
            <input
              value={(config.embedUrl as string) ?? ""}
              onChange={(e) => set("embedUrl", e.target.value)}
              placeholder={
                block.type === "music_player"
                  ? "Spotify or YouTube link"
                  : "YouTube link"
              }
              className="rounded-lg border border-black/15 px-3 py-2 outline-none focus:border-[#e91e63]"
            />
            <span className="text-xs text-black/40">
              Paste a normal Spotify/YouTube link — it&apos;s converted to an embed.
            </span>
          </label>
        );
      case "image_gallery":
        return (
          <label className="flex flex-col gap-1 text-sm font-medium">
            Image URLs (one per line)
            <textarea
              rows={5}
              value={((config.images as string[]) ?? []).join("\n")}
              onChange={(e) =>
                set(
                  "images",
                  e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean)
                )
              }
              className="resize-none rounded-lg border border-black/15 px-3 py-2 font-mono text-xs outline-none focus:border-[#e91e63]"
            />
          </label>
        );
      case "link_list": {
        const links =
          (config.links as { label: string; url: string }[]) ?? [];
        const update = (i: number, field: "label" | "url", v: string) => {
          const next = links.map((l, idx) =>
            idx === i ? { ...l, [field]: v } : l
          );
          set("links", next);
        };
        return (
          <div className="flex flex-col gap-2 text-sm font-medium">
            Links
            {links.map((l, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={l.label}
                  onChange={(e) => update(i, "label", e.target.value)}
                  placeholder="Label"
                  className="w-1/3 rounded-lg border border-black/15 px-2 py-1.5 text-sm outline-none focus:border-[#e91e63]"
                />
                <input
                  value={l.url}
                  onChange={(e) => update(i, "url", e.target.value)}
                  placeholder="https://"
                  className="flex-1 rounded-lg border border-black/15 px-2 py-1.5 text-sm outline-none focus:border-[#e91e63]"
                />
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "links",
                      links.filter((_, idx) => idx !== i)
                    )
                  }
                  className="px-2 text-black/40 hover:text-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => set("links", [...links, { label: "", url: "" }])}
              className="self-start rounded-lg border border-black/15 px-3 py-1.5 text-xs font-semibold hover:bg-black/5"
            >
              + Add link
            </button>
          </div>
        );
      }
      default:
        return <p className="text-sm text-black/50">This block has no settings.</p>;
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 text-[#1a1a2e] shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Block settings</h2>
          <button onClick={onClose} className="text-black/40 hover:text-black">
            <X size={18} />
          </button>
        </div>

        {body()}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold hover:bg-black/5"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(config);
              onClose();
            }}
            className="rounded-lg bg-[#e91e63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d81b60]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
