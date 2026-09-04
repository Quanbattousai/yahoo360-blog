import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditProfileForm } from "@/components/EditProfileForm";

export const metadata = { title: "Profile settings · 360°" };

interface Props {
  params: { username: string };
}

export default async function ProfileSettingsPage({ params }: Props) {
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
        <h1 className="text-2xl font-bold">Profile settings</h1>
        <Link
          href={`/${profile.username}/edit`}
          className="text-sm font-semibold text-black/50 hover:text-black"
        >
          ← Customize blocks
        </Link>
      </div>
      <EditProfileForm profile={profile} submitLabel="Save changes" />
    </main>
  );
}
