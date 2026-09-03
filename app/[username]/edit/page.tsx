import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditProfileForm } from "@/components/EditProfileForm";

interface Props {
  params: { username: string };
}

export default async function EditProfilePage({ params }: Props) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, mood, profile_theme")
    .eq("username", params.username)
    .maybeSingle();

  if (!profile) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (user.id !== profile.id) redirect(`/${params.username}`);

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit profile</h1>
        <Link
          href={`/${profile.username}`}
          className="text-sm font-semibold text-black/50 hover:text-black"
        >
          Cancel
        </Link>
      </div>
      <EditProfileForm profile={profile} submitLabel="Save changes" />
    </main>
  );
}
