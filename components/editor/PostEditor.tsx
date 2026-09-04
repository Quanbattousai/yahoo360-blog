"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, ExternalLink } from "lucide-react";
import { TiptapEditor } from "./TiptapEditor";
import { EMPTY_DOC } from "@/lib/editor/extensions";
import { savePost, deletePost } from "@/app/write/actions";
import type { Json, Post, PostVisibility } from "@/types/database";

interface Props {
  userId: string;
  username: string;
  post?: Pick<
    Post,
    "id" | "title" | "body" | "mood" | "status" | "visibility" | "slug"
  >;
}

export function PostEditor({ userId, username, post }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [id, setId] = useState<string | undefined>(post?.id);
  const [title, setTitle] = useState(post?.title ?? "");
  const [mood, setMood] = useState(post?.mood ?? "");
  const [visibility, setVisibility] = useState<PostVisibility>(
    post?.visibility ?? "public"
  );
  const [body, setBody] = useState<Json>(post?.body ?? EMPTY_DOC);
  const [published, setPublished] = useState(post?.status === "published");
  const [slug, setSlug] = useState(post?.slug);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function run(status: "draft" | "published", thenView = false) {
    setError(null);
    startTransition(async () => {
      const res = await savePost({ id, title, body, mood: mood || null, status, visibility });
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.id && !id) {
        setId(res.id);
        // Reflect the real edit URL without a full navigation.
        window.history.replaceState(null, "", `/write/${res.id}`);
      }
      if (res.slug) setSlug(res.slug);
      setPublished(status === "published");
      setSavedAt(new Date().toLocaleTimeString());

      if (thenView && res.username && res.slug) {
        router.push(`/${res.username}/${res.slug}`);
      } else {
        router.refresh();
      }
    });
  }

  function handleDelete() {
    if (!id) {
      router.push(`/${username}`);
      return;
    }
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    setError(null);
    startTransition(async () => {
      const res = await deletePost(id);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.push(`/${username}`);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <Link href={`/${username}`} className="text-sm font-semibold text-black/50 hover:text-black">
          ← Back to profile
        </Link>
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`rounded-full px-2.5 py-1 font-semibold ${
              published ? "bg-green-100 text-green-700" : "bg-black/10 text-black/60"
            }`}
          >
            {published ? "Published" : "Draft"}
          </span>
          {published && slug && (
            <Link
              href={`/${username}/${slug}`}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold text-[#e91e63] hover:bg-[#e91e63]/10"
            >
              View <ExternalLink size={12} />
            </Link>
          )}
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
        className="mb-3 w-full bg-transparent text-3xl font-bold outline-none placeholder:text-black/25"
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-black/50">Mood</span>
          <input
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="đang vui 😊"
            className="w-40 rounded-lg border border-black/15 px-2.5 py-1.5 outline-none focus:border-[#e91e63]"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-black/50">Visibility</span>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as PostVisibility)}
            className="rounded-lg border border-black/15 px-2.5 py-1.5 outline-none focus:border-[#e91e63]"
          >
            <option value="public">Public</option>
            <option value="friends">Friends only</option>
            <option value="private">Private</option>
          </select>
        </label>
      </div>

      <TiptapEditor content={body} onChange={setBody} userId={userId} />

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          onClick={() => run("draft")}
          disabled={pending}
          className="rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-black/5 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save draft"}
        </button>
        <button
          onClick={() => run("published", !published)}
          disabled={pending}
          className="rounded-xl bg-[#e91e63] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d81b60] disabled:opacity-50"
        >
          {published ? "Update" : "Publish"}
        </button>
        {published && (
          <button
            onClick={() => run("draft")}
            disabled={pending}
            className="rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-black/5 disabled:opacity-50"
          >
            Unpublish
          </button>
        )}
        <div className="flex-1" />
        {savedAt && <span className="text-xs text-black/40">Saved at {savedAt}</span>}
        <button
          onClick={handleDelete}
          disabled={pending}
          className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 size={15} /> Delete
        </button>
      </div>
    </div>
  );
}
