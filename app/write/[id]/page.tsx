import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostEditor } from "@/components/editor/PostEditor";

export const metadata = { title: "Edit post · 360°" };

interface Props {
  params: { id: string };
}

export default async function EditPostPage({ params }: Props) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/onboarding");

  const { data: post } = await supabase
    .from("posts")
    .select("id, title, body, mood, status, visibility, slug, author_id")
    .eq("id", params.id)
    .maybeSingle();

  if (!post) notFound();
  if (post.author_id !== user.id) redirect(`/${profile.username}`);

  return <PostEditor userId={user.id} username={profile.username} post={post} />;
}
