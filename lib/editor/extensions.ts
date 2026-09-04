import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import type { Extensions } from "@tiptap/core";

// Shared Tiptap extension set — used by the editor (client) and by
// generateHTML when rendering stored post JSON (server). Keep them identical so
// the schema matches in both directions.
export function getEditorExtensions(opts?: { placeholder?: string }): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Image.configure({
      HTMLAttributes: { class: "post-image", loading: "lazy" },
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: {
        rel: "noopener noreferrer nofollow",
        target: "_blank",
      },
    }),
    Placeholder.configure({
      placeholder: opts?.placeholder ?? "Write your story…",
    }),
  ];
}

// An empty Tiptap document, used as the default body for a new post.
export const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };
