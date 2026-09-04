import { generateHTML } from "@tiptap/html";
import { getEditorExtensions } from "@/lib/editor/extensions";
import type { Json } from "@/types/database";

// Renders stored Tiptap JSON to HTML on the server. The content comes only from
// the post's own author writing through our editor, whose schema is limited to
// the extensions below (no raw HTML/script nodes), so the output is constrained
// to that vocabulary.
export function PostContent({ body }: { body: Json | null }) {
  if (!body || typeof body !== "object") {
    return <p className="opacity-50">This post has no content.</p>;
  }

  let html = "";
  try {
    html = generateHTML(body as object, getEditorExtensions());
  } catch {
    return <p className="opacity-50">Unable to render this post.</p>;
  }

  return (
    <div
      className="post-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
