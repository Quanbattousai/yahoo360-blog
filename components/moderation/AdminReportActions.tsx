"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { resolveReport, adminDeletePost } from "@/app/actions/moderation";

export function AdminReportActions({
  reportId,
  postId,
}: {
  reportId: string;
  postId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ error?: string }>) =>
    startTransition(async () => {
      const res = await fn();
      if (res.error) {
        window.alert(res.error);
        return;
      }
      router.refresh();
    });

  return (
    <div className="flex gap-2">
      <button
        disabled={pending}
        onClick={() => run(() => resolveReport(reportId))}
        className="rounded-lg border border-black/15 px-3 py-1.5 text-sm font-semibold hover:bg-black/5 disabled:opacity-50"
      >
        Resolve
      </button>
      <button
        disabled={pending}
        onClick={() => {
          if (window.confirm("Delete this post? This can't be undone.")) {
            run(() => adminDeletePost(postId));
          }
        }}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        Delete post
      </button>
    </div>
  );
}
