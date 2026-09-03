import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
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
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-black/10 bg-white/80 px-6 py-3 backdrop-blur">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-xl">✦</span>
        <span className="text-[17px] font-bold tracking-tight">360°</span>
      </Link>

      <nav className="flex items-center gap-2 text-sm">
        {user ? (
          <>
            {username && (
              <Link
                href={`/${username}`}
                className="rounded-lg px-3 py-1.5 font-semibold hover:bg-black/5"
              >
                My profile
              </Link>
            )}
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-lg border border-black/10 px-3 py-1.5 font-semibold hover:bg-black/5"
              >
                Sign out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-lg px-3 py-1.5 font-semibold hover:bg-black/5"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[#e91e63] px-3 py-1.5 font-semibold text-white hover:bg-[#d81b60]"
            >
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
