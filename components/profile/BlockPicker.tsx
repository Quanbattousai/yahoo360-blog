"use client";

import { X } from "lucide-react";
import { BLOCK_CATALOG, type BlockType, type BlockCategory } from "@/lib/blocks";

const CATEGORIES: BlockCategory[] = [
  "Core",
  "Content",
  "Media",
  "Social",
  "Decorative",
];

export function BlockPicker({
  onAdd,
  onClose,
}: {
  onAdd: (type: BlockType) => void;
  onClose: () => void;
}) {
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
          <h2 className="text-lg font-bold">Add a block</h2>
          <button onClick={onClose} className="text-black/40 hover:text-black">
            <X size={18} />
          </button>
        </div>

        {CATEGORIES.map((cat) => {
          const items = BLOCK_CATALOG.filter((b) => b.category === cat);
          if (items.length === 0) return null;
          return (
            <div key={cat} className="mb-4">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-black/40">
                {cat}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {items.map((b) => (
                  <button
                    key={b.type}
                    onClick={() => {
                      onAdd(b.type);
                      onClose();
                    }}
                    className="rounded-lg border border-black/10 bg-black/[0.02] px-3 py-2.5 text-left text-[13px] font-medium hover:border-[#e91e63] hover:bg-[#e91e63]/5"
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
