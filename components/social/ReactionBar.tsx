"use client";

import { useState, useTransition } from "react";
import { toggleReaction } from "@/app/actions/social";

type ReactionType = "heart" | "laugh" | "sad" | "fire";

const REACTIONS: { type: ReactionType; emoji: string }[] = [
  { type: "heart", emoji: "❤️" },
  { type: "laugh", emoji: "😂" },
  { type: "sad", emoji: "😢" },
  { type: "fire", emoji: "🔥" },
];

interface Props {
  postId: string;
  counts: Record<ReactionType, number>;
  mine: ReactionType[];
  loggedIn: boolean;
  accent: string;
}

export function ReactionBar({ postId, counts, mine, loggedIn, accent }: Props) {
  const [state, setState] = useState({ counts, mine });
  const [, startTransition] = useTransition();

  function toggle(type: ReactionType) {
    if (!loggedIn) {
      window.alert("Log in to react to posts.");
      return;
    }
    const has = state.mine.includes(type);
    // optimistic
    setState((s) => ({
      counts: { ...s.counts, [type]: s.counts[type] + (has ? -1 : 1) },
      mine: has ? s.mine.filter((t) => t !== type) : [...s.mine, type],
    }));
    startTransition(async () => {
      const res = await toggleReaction(postId, type);
      if (res.error) {
        // revert
        setState((s) => ({
          counts: { ...s.counts, [type]: s.counts[type] + (has ? 1 : -1) },
          mine: has ? [...s.mine, type] : s.mine.filter((t) => t !== type),
        }));
        window.alert(res.error);
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {REACTIONS.map(({ type, emoji }) => {
        const active = state.mine.includes(type);
        return (
          <button
            key={type}
            onClick={() => toggle(type)}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors"
            style={{
              borderColor: active ? accent : "currentColor",
              background: active ? `${accent}22` : "transparent",
              opacity: active ? 1 : 0.7,
            }}
          >
            <span>{emoji}</span>
            <span>{state.counts[type]}</span>
          </button>
        );
      })}
    </div>
  );
}
