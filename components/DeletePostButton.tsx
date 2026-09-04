"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deletePost } from "@/app/write/actions";

export function DeletePostButton({
  id,
  username,
}: {
  id: string;
  username: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (!window.confirm("Delete this post? This can't be undone.")) return;
        startTransition(async () => {
          const res = await deletePost(id);
          if (res.error) {
            window.alert(res.error);
            return;
          }
          router.push(`/${username}`);
          router.refresh();
        });
      }}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg border border-current px-3 py-1.5 text-sm font-semibold opacity-80 hover:opacity-100 disabled:opacity-40"
    >
      <Trash2 size={14} /> {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
