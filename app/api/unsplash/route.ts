import { NextResponse } from "next/server";
import { curatedFor, type UnsplashPhoto } from "@/lib/unsplash";

// Server-side Unsplash proxy. With UNSPLASH_ACCESS_KEY set it performs a live
// search; otherwise it returns a curated fallback so the wallpaper browser
// still works. The access key never reaches the client.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") || "aesthetic").slice(0, 60);
  const key = process.env.UNSPLASH_ACCESS_KEY;

  if (key) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          query
        )}&per_page=15&orientation=landscape&content_filter=high`,
        {
          headers: { Authorization: `Client-ID ${key}` },
          next: { revalidate: 3600 },
        }
      );
      if (res.ok) {
        const data = (await res.json()) as {
          results: {
            id: string;
            urls: { small: string; regular: string };
            user: { name: string };
          }[];
        };
        const results: UnsplashPhoto[] = data.results.map((p) => ({
          id: p.id,
          thumb: p.urls.small,
          url: p.urls.regular,
          author: p.user.name,
        }));
        return NextResponse.json({ results, source: "unsplash" });
      }
    } catch {
      // fall through to curated
    }
  }

  return NextResponse.json({ results: curatedFor(query), source: "curated" });
}
