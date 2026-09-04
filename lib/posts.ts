import type { Json } from "@/types/database";

// Turn a title into a URL-safe slug. Handles Vietnamese diacritics: NFD
// decomposes accented letters into base + combining marks, then the
// non-alphanumeric replace strips the marks. đ/Đ don't decompose, so map them.
export function slugify(title: string): string {
  const slug = title
    .normalize("NFD")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return slug || "post";
}

// Extract a plain-text excerpt from a Tiptap JSON document.
export function excerptFromDoc(doc: Json | null, max = 180): string {
  if (!doc || typeof doc !== "object") return "";
  const parts: string[] = [];
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const n = node as { type?: string; text?: string; content?: unknown[] };
    if (n.type === "text" && typeof n.text === "string") parts.push(n.text);
    if (Array.isArray(n.content)) n.content.forEach(walk);
  };
  walk(doc);
  const text = parts.join(" ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

export function formatPostDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
