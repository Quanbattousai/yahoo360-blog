"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { addComment, deleteComment } from "@/app/actions/social";
import { formatPostDate } from "@/lib/posts";

export interface CommentItem {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  author: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface Props {
  postId: string;
  comments: CommentItem[];
  viewerId: string | null;
  accent: string;
  cardBorder: string;
}

export function CommentSection({
  postId,
  comments,
  viewerId,
  accent,
  cardBorder,
}: Props) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    startTransition(async () => {
      const res = await addComment(postId, text);
      if (res.error) {
        window.alert(res.error);
        return;
      }
      setText("");
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!window.confirm("Delete this comment?")) return;
    startTransition(async () => {
      const res = await deleteComment(id);
      if (res.error) {
        window.alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <h2 className="mb-3 text-lg font-bold">
        {comments.length} {comments.length === 1 ? "comment" : "comments"}
      </h2>

      {viewerId ? (
        <form onSubmit={submit} className="mb-5 flex flex-col gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Add a comment…"
            className="resize-none rounded-lg border bg-white/70 px-3 py-2 text-sm text-[#1a1a2e] outline-none"
            style={{ borderColor: cardBorder }}
          />
          <button
            type="submit"
            disabled={pending || !text.trim()}
            className="self-end rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: accent }}
          >
            {pending ? "Posting…" : "Post"}
          </button>
        </form>
      ) : (
        <p className="mb-5 text-sm opacity-70">
          <Link href="/login" className="font-semibold underline">
            Log in
          </Link>{" "}
          to join the conversation.
        </p>
      )}

      <ul className="flex flex-col gap-4">
        {comments.map((c) => (
          <li key={c.id} className="flex gap-3">
            <div
              className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-cover bg-center text-sm"
              style={{
                background: c.author?.avatar_url
                  ? `center / cover no-repeat url(${c.author.avatar_url})`
                  : `${accent}33`,
              }}
            >
              {!c.author?.avatar_url && "🙂"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm">
                {c.author ? (
                  <Link
                    href={`/${c.author.username}`}
                    className="font-semibold hover:underline"
                  >
                    {c.author.display_name || c.author.username}
                  </Link>
                ) : (
                  <span className="font-semibold">Unknown</span>
                )}
                <span className="text-xs opacity-45">
                  {formatPostDate(c.created_at)}
                </span>
                {viewerId === c.author_id && (
                  <button
                    onClick={() => remove(c.id)}
                    className="ml-auto opacity-40 hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <p className="whitespace-pre-wrap text-sm opacity-90">{c.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
