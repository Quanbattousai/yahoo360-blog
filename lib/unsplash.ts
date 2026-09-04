// Unsplash types + a curated fallback used when no UNSPLASH_ACCESS_KEY is set,
// so the wallpaper browser works out of the box. Set the env var to enable live
// search via the /api/unsplash proxy.

export interface UnsplashPhoto {
  id: string;
  thumb: string;
  url: string;
  author: string;
}

export const UNSPLASH_CATEGORIES = [
  "Nature",
  "City",
  "Abstract",
  "Aesthetic",
  "Cozy",
] as const;

const u = (id: string, author: string): UnsplashPhoto => ({
  id,
  author,
  thumb: `https://images.unsplash.com/photo-${id}?w=300&q=60`,
  url: `https://images.unsplash.com/photo-${id}?w=1600&q=80`,
});

export const CURATED: Record<string, UnsplashPhoto[]> = {
  nature: [
    u("1506744038136-46273834b3fb", "Bailey Zindel"),
    u("1470071459604-3b5ec3a7fe05", "v2osk"),
    u("1441974231531-c6227db76b6e", "Luca Bravo"),
    u("1518173946687-a24f89f0cd4f", "Kalen Emsley"),
    u("1472214103451-9374bd1c798e", "Robert Lukeman"),
    u("1465146344425-f00d5f5c8f07", "Sergey Shmidt"),
  ],
  city: [
    u("1514565131-fce0801e5785", "Pedro Lastra"),
    u("1480714378408-67cf0d13bc1b", "Luca Bravo"),
    u("1519501025264-65ba15a82390", "Jezael Melgoza"),
    u("1477959858617-67f85cf4f1df", "Pedro Lastra"),
    u("1444723121867-7a241cacace9", "Denys Nevozhai"),
    u("1493246507139-91e8fad9978e", "Andreas Gücklhorn"),
  ],
  abstract: [
    u("1557672172-298e090bd0f1", "Pawel Czerwinski"),
    u("1558591710-4b4a1ae0f04d", "Pawel Czerwinski"),
    u("1567095761054-7a02e69e5c43", "Gradienta"),
    u("1579546929518-9e396f3cc809", "Gradienta"),
    u("1550684376-efcbd6e3f031", "Pawel Czerwinski"),
    u("1541701494587-cb58502866ab", "Pawel Czerwinski"),
  ],
  aesthetic: [
    u("1516912481808-3406841bd33c", "Ian Schneider"),
    u("1507400492013-162706c8c05e", "Bench Accounting"),
    u("1495616811223-4d98c6e9c869", "Aperture Vintage"),
    u("1528722828814-77b9b83aafb2", "Nathan Anderson"),
    u("1483728642387-6c3bdd6c93e5", "Benjamin Voros"),
    u("1531685250784-7569952593d2", "Joel Filipe"),
  ],
  cozy: [
    u("1534796636912-3b95b3ab5986", "Billy Huynh"),
    u("1524413840807-0c3cb6fa808d", "AJ"),
    u("1490750967868-88aa4f44baee", "Yoann Boyer"),
    u("1464457312035-3d7d0e0c058e", "Luke Stackpoole"),
    u("1519681393784-d120267933ba", "Benjamin Voros"),
    u("1500534314209-a25ddb2bd429", "Lucas Gallone"),
  ],
};

export function curatedFor(query: string): UnsplashPhoto[] {
  const key = query.trim().toLowerCase();
  return CURATED[key] ?? CURATED.aesthetic;
}
