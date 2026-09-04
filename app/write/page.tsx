import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostEditor } from "@/components/editor/PostEditor";

export const metadata = { title: "New post · 360°" };

export default async function NewPostPage() {
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

  return <PostEditor userId={user.id} username={profile.username} />;
}
