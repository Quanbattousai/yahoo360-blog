"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { respondFriendRequest } from "@/app/actions/social";

export interface IncomingRequest {
  requesterId: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface Props {
  requests: IncomingRequest[];
  accent: string;
  card: string;
  cardBorder: string;
}

export function FriendRequests({ requests, accent, card, cardBorder }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (requests.length === 0) return null;

  const respond = (requesterId: string, accept: boolean) =>
    startTransition(async () => {
      const res = await respondFriendRequest(requesterId, accept);
      if (res.error) {
        window.alert(res.error);
        return;
      }
      router.refresh();
    });

  return (
    <div
      className="mb-4 rounded-2xl border p-5 backdrop-blur"
      style={{ background: card, borderColor: cardBorder }}
    >
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide opacity-50">
        Friend requests ({requests.length})
      </h3>
      <ul className="flex flex-col gap-3">
        {requests.map((r) => (
          <li key={r.requesterId} className="flex items-center gap-3">
            <div
              className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-cover bg-center text-center text-sm leading-9"
              style={{
                background: r.avatar_url
                  ? `center / cover no-repeat url(${r.avatar_url})`
                  : `${accent}33`,
              }}
            >
              {!r.avatar_url && "🙂"}
            </div>
            <Link
              href={`/${r.username}`}
              className="min-w-0 flex-1 truncate text-sm font-semibold hover:underline"
            >
              {r.display_name || r.username}
            </Link>
            <button
              disabled={pending}
              onClick={() => respond(r.requesterId, true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white disabled:opacity-50"
              style={{ background: accent }}
              title="Accept"
            >
              <Check size={15} />
            </button>
            <button
              disabled={pending}
              onClick={() => respond(r.requesterId, false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border disabled:opacity-50"
              style={{ borderColor: cardBorder }}
              title="Decline"
            >
              <X size={15} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
