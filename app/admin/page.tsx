import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPostDate } from "@/lib/posts";
import { AdminReportActions } from "@/components/moderation/AdminReportActions";

export const metadata = { title: "Moderation · 360°" };

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!me?.is_admin) notFound();

  const { data: reports } = await supabase
    .from("reports")
    .select("id, post_id, reason, created_at, reporter_id")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  const postIds = [...new Set((reports ?? []).map((r) => r.post_id))];
  const { data: posts } = postIds.length
    ? await supabase.from("posts").select("id, title, slug, author_id").in("id", postIds)
    : { data: [] };
  const postById = new Map((posts ?? []).map((p) => [p.id, p]));

  const profileIds = [
    ...new Set([
      ...(reports ?? []).map((r) => r.reporter_id),
      ...(posts ?? []).map((p) => p.author_id),
    ]),
  ];
  const { data: profiles } = profileIds.length
    ? await supabase.from("profiles").select("id, username, display_name").in("id", profileIds)
    : { data: [] };
  const nameById = new Map(
    (profiles ?? []).map((p) => [p.id, { username: p.username, name: p.display_name || p.username }])
  );

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="mb-1 text-2xl font-bold">Moderation</h1>
      <p className="mb-6 text-sm text-black/50">Open post reports.</p>

      {!reports || reports.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white p-10 text-center text-sm text-black/60">
          Nothing to review — no open reports. 🎉
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {reports.map((r) => {
            const post = postById.get(r.post_id);
            const author = post ? nameById.get(post.author_id) : null;
            const reporter = nameById.get(r.reporter_id);
            return (
              <li key={r.id} className="rounded-2xl border border-black/10 bg-white p-5">
                <div className="mb-2 flex items-center justify-between text-xs text-black/45">
                  <span>Reported by {reporter?.name ?? "someone"}</span>
                  <span>{formatPostDate(r.created_at)}</span>
                </div>
                {post && author ? (
                  <Link
                    href={`/${author.username}/${post.slug}`}
                    className="font-semibold hover:underline"
                  >
                    {post.title}
                  </Link>
                ) : (
                  <span className="font-semibold text-black/50">(post deleted)</span>
                )}
                <p className="mt-1 mb-3 text-sm text-black/70">
                  “{r.reason}”
                </p>
                <AdminReportActions reportId={r.id} postId={r.post_id} />
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
