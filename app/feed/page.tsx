import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPostDate } from "@/lib/posts";

export const metadata = { title: "Feed · 360°" };

export default async function FeedPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: fr } = await supabase
    .from("friendships")
    .select("requester_id, receiver_id")
    .eq("status", "accepted")
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);
  const friendIds = (fr ?? []).map((f) =>
    f.requester_id === user.id ? f.receiver_id : f.requester_id
  );

  const { data: posts } = friendIds.length
    ? await supabase
        .from("posts")
        .select("id, title, slug, excerpt, mood, published_at, author_id")
        .in("author_id", friendIds)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(30)
    : { data: [] };

  const authorIds = [...new Set((posts ?? []).map((p) => p.author_id))];
  const { data: authors } = authorIds.length
    ? await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", authorIds)
    : { data: [] };
  const byId = new Map((authors ?? []).map((a) => [a.id, a]));

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-1 text-2xl font-bold">Friends&apos; activity</h1>
      <p className="mb-6 text-sm text-black/50">
        Recent posts from people you&apos;re friends with.
      </p>

      {friendIds.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white p-10 text-center text-sm text-black/60">
          Add some friends to see their posts here. Visit a profile and hit{" "}
          <span className="font-semibold">Add friend</span>.
        </div>
      ) : !posts || posts.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white p-10 text-center text-sm text-black/60">
          Your friends haven&apos;t published anything yet.
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {posts.map((p) => {
            const a = byId.get(p.author_id);
            return (
              <li
                key={p.id}
                className="rounded-2xl border border-black/10 bg-white p-5"
              >
                <div className="mb-2 flex items-center gap-2.5">
                  <div
                    className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-cover bg-center text-center text-sm leading-8"
                    style={{
                      background: a?.avatar_url
                        ? `center / cover no-repeat url(${a.avatar_url})`
                        : "#f3d6e4",
                    }}
                  >
                    {!a?.avatar_url && "🌸"}
                  </div>
                  <Link
                    href={`/${a?.username ?? ""}`}
                    className="text-sm font-semibold hover:underline"
                  >
                    {a?.display_name || a?.username || "Someone"}
                  </Link>
                  <span className="text-xs text-black/40">
                    · {formatPostDate(p.published_at)}
                  </span>
                </div>
                <Link href={`/${a?.username}/${p.slug}`} className="group block">
                  <h2 className="text-lg font-bold group-hover:underline">
                    {p.title}
                  </h2>
                  {p.excerpt && (
                    <p className="mt-1 text-sm text-black/70">{p.excerpt}</p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
