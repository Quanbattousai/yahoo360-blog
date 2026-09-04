"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Trash2 } from "lucide-react";
import { signGuestbook, deleteGuestbookEntry } from "@/app/actions/social";
import { formatPostDate } from "@/lib/posts";

export interface GuestbookEntry {
  id: string;
  message: string;
  created_at: string;
  author_id: string;
  author: { username: string; display_name: string | null } | null;
}

interface Props {
  ownerId: string;
  viewerId: string | null;
  entries: GuestbookEntry[];
  accent: string;
  cardBorder: string;
}

export function GuestbookBlock({
  ownerId,
  viewerId,
  entries,
  accent,
  cardBorder,
}: Props) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  function sign(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    startTransition(async () => {
      const res = await signGuestbook(ownerId, text);
      if (res.error) {
        window.alert(res.error);
        return;
      }
      setText("");
      router.refresh();
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const res = await deleteGuestbookEntry(id);
      if (res.error) {
        window.alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center gap-1.5 text-[15px] font-semibold">
        <MessageSquare size={15} /> Guestbook
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {entries.length === 0 ? (
          <p className="text-[13px] opacity-55">No messages yet — be the first!</p>
        ) : (
          entries.map((g, i) => (
            <div
              key={g.id}
              className="py-2"
              style={{
                borderBottom:
                  i < entries.length - 1 ? `1px solid ${cardBorder}` : "none",
              }}
            >
              <div className="flex items-center justify-between">
                {g.author ? (
                  <Link
                    href={`/${g.author.username}`}
                    className="text-[13px] font-semibold hover:underline"
                  >
                    {g.author.display_name || g.author.username}
                  </Link>
                ) : (
                  <span className="text-[13px] font-semibold">Someone</span>
                )}
                <span className="flex items-center gap-2 text-[11px] opacity-45">
                  {formatPostDate(g.created_at)}
                  {(viewerId === g.author_id || viewerId === ownerId) && (
                    <button
                      onClick={() => remove(g.id)}
                      className="opacity-60 hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-[13px] opacity-85">
                {g.message}
              </p>
            </div>
          ))
        )}
      </div>

      {viewerId ? (
        <form onSubmit={sign} className="mt-3 flex gap-1.5">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Leave a message…"
            className="min-w-0 flex-1 rounded-lg border bg-white/60 px-3 py-1.5 text-[13px] text-[#1a1a2e] outline-none"
            style={{ borderColor: cardBorder }}
          />
          <button
            type="submit"
            disabled={pending || !text.trim()}
            className="rounded-lg px-3 py-1.5 text-[13px] font-semibold text-white disabled:opacity-50"
            style={{ background: accent }}
          >
            Send
          </button>
        </form>
      ) : (
        <p className="mt-3 text-[12px] opacity-55">
          <Link href="/login" className="underline">
            Log in
          </Link>{" "}
          to sign.
        </p>
      )}
    </div>
  );
}
