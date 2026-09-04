"use client";

import { useState, useTransition } from "react";
import { Flag } from "lucide-react";
import { reportPost } from "@/app/actions/moderation";

export function ReportButton({
  postId,
  loggedIn,
}: {
  postId: string;
  loggedIn: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function report() {
    if (!loggedIn) {
      window.location.href = "/login";
      return;
    }
    const reason = window.prompt("Why are you reporting this post?");
    if (reason === null) return;
    startTransition(async () => {
      const res = await reportPost(postId, reason);
      if (res.error) {
        window.alert(res.error);
        return;
      }
      setDone(true);
    });
  }

  return (
    <button
      onClick={report}
      disabled={pending || done}
      className="inline-flex items-center gap-1.5 text-xs font-semibold opacity-50 hover:opacity-100 disabled:opacity-40"
      title="Report this post"
    >
      <Flag size={12} /> {done ? "Reported" : "Report"}
    </button>
  );
}
