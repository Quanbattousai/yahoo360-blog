"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, UserPlus, Clock } from "lucide-react";
import {
  sendFriendRequest,
  respondFriendRequest,
  removeFriend,
} from "@/app/actions/social";

export type FriendStatus =
  | "self"
  | "logged_out"
  | "none"
  | "pending_out"
  | "pending_in"
  | "friends";

interface Props {
  targetId: string;
  status: FriendStatus;
  accent: string;
}

export function FriendButton({ targetId, status, accent }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (status === "self") return null;

  const run = (fn: () => Promise<{ error?: string }>) =>
    startTransition(async () => {
      const res = await fn();
      if (res.error) {
        window.alert(res.error);
        return;
      }
      router.refresh();
    });

  const solid =
    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50";
  const outline =
    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold disabled:opacity-50";

  if (status === "logged_out") {
    return (
      <a href="/login" className={solid} style={{ background: accent }}>
        <UserPlus size={15} /> Add friend
      </a>
    );
  }

  if (status === "none") {
    return (
      <button
        disabled={pending}
        onClick={() => run(() => sendFriendRequest(targetId))}
        className={solid}
        style={{ background: accent }}
      >
        <UserPlus size={15} /> Add friend
      </button>
    );
  }

  if (status === "pending_out") {
    return (
      <button
        disabled={pending}
        onClick={() => run(() => removeFriend(targetId))}
        className={outline}
        style={{ borderColor: "currentColor", opacity: 0.7 }}
        title="Cancel request"
      >
        <Clock size={15} /> Requested
      </button>
    );
  }

  if (status === "pending_in") {
    return (
      <div className="flex gap-2">
        <button
          disabled={pending}
          onClick={() => run(() => respondFriendRequest(targetId, true))}
          className={solid}
          style={{ background: accent }}
        >
          <Check size={15} /> Accept
        </button>
        <button
          disabled={pending}
          onClick={() => run(() => respondFriendRequest(targetId, false))}
          className={outline}
          style={{ borderColor: "currentColor" }}
        >
          Decline
        </button>
      </div>
    );
  }

  // friends
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (window.confirm("Remove this friend?")) run(() => removeFriend(targetId));
      }}
      className={outline}
      style={{ borderColor: accent, color: accent }}
      title="Remove friend"
    >
      <Check size={15} /> Friends
    </button>
  );
}
