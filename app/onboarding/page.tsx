import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditProfileForm } from "@/components/EditProfileForm";

export default async function OnboardingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, mood, profile_theme")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-2xl font-bold">Finish setting up your page</h1>
      <p className="mt-1 mb-6 text-sm text-black/60">
        Pick a username and add a few details. You can change these anytime.
      </p>
      <EditProfileForm profile={profile} submitLabel="Save & view my page" />
    </main>
  );
}
