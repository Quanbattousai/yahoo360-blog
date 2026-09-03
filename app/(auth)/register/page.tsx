"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!USERNAME_RE.test(username)) {
      setError(
        "Username must be 3–20 characters: lowercase letters, numbers, or underscores."
      );
      return;
    }

    setLoading(true);

    // Guard against an obviously-taken username before creating the auth user.
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    if (existing) {
      setLoading(false);
      setError("That username is already taken.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: displayName || username,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // If email confirmation is disabled, a session is returned immediately.
    if (data.session) {
      router.push(`/${username}`);
      router.refresh();
    } else {
      setNotice(
        "Check your email to confirm your account, then log in."
      );
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-57px)] max-w-md flex-col justify-center px-6 py-10">
      <h1 className="text-2xl font-bold">Create your page</h1>
      <p className="mt-1 text-sm text-black/60">
        Claim your username and start decorating.
      </p>

      <form onSubmit={handleRegister} className="mt-6 flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Username
          <div className="flex items-center rounded-lg border border-black/15 px-3 focus-within:border-[#e91e63]">
            <span className="text-black/40">360.com/</span>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="thanhtruc"
              className="flex-1 bg-transparent py-2 outline-none"
            />
          </div>
          <span className="text-xs text-black/40">
            3–20 chars · a–z, 0–9, underscore
          </span>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Display name
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Thanh Trúc"
            className="rounded-lg border border-black/15 px-3 py-2 outline-none focus:border-[#e91e63]"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-black/15 px-3 py-2 outline-none focus:border-[#e91e63]"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-black/15 px-3 py-2 outline-none focus:border-[#e91e63]"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {notice && <p className="text-sm text-green-700">{notice}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-xl bg-[#e91e63] px-4 py-3 font-semibold text-white hover:bg-[#d81b60] disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-black/60">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#e91e63]">
          Log in
        </Link>
      </p>
    </main>
  );
}
