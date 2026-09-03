import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-57px)] max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl">🔍</div>
      <h1 className="mt-4 text-2xl font-bold">No page here</h1>
      <p className="mt-2 text-black/60">
        That username doesn&apos;t exist (yet). Want to claim it?
      </p>
      <Link
        href="/register"
        className="mt-6 rounded-xl bg-[#e91e63] px-6 py-3 font-semibold text-white hover:bg-[#d81b60]"
      >
        Create your page
      </Link>
    </main>
  );
}
