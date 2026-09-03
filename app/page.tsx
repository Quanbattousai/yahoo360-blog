import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    username = data?.username ?? null;
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-57px)] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl text-4xl text-white shadow-lg"
        style={{
          background: "linear-gradient(135deg, #f48fb1, #e91e63)",
        }}
      >
        ✦
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Your corner of the web,{" "}
        <span className="text-[#e91e63]">your way.</span>
      </h1>
      <p className="mt-4 max-w-xl text-lg text-black/60">
        A community blogging platform inspired by Yahoo! 360°. Write blog posts,
        decorate your profile with drag-and-drop blocks, and connect with
        friends.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {user ? (
          <Link
            href={username ? `/${username}` : "/onboarding"}
            className="rounded-xl bg-[#e91e63] px-6 py-3 font-semibold text-white shadow hover:bg-[#d81b60]"
          >
            Go to my profile
          </Link>
        ) : (
          <>
            <Link
              href="/register"
              className="rounded-xl bg-[#e91e63] px-6 py-3 font-semibold text-white shadow hover:bg-[#d81b60]"
            >
              Create your page
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-black/10 bg-white px-6 py-3 font-semibold hover:bg-black/5"
            >
              Log in
            </Link>
          </>
        )}
      </div>

      <p className="mt-10 text-sm text-black/40">
        Sprint 1 · Foundation — auth, profiles, and profile pages. The block
        builder arrives in Sprint 3.
      </p>
    </main>
  );
}
