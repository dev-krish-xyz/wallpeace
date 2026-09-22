// The fixed set of collections. Slugs must match the check constraint in
// supabase/migrations/0003_collections_downloads.sql.
export const COLLECTIONS = [
  { slug: "minimal", name: "Minimal", blurb: "Quiet compositions with room to breathe around your icons." },
  { slug: "dark", name: "Dark", blurb: "Low-light scenes that stay easy on the eyes after sunset." },
  { slug: "nature", name: "Nature", blurb: "Coastlines, forests, fields and skies." },
  { slug: "anime-illustration", name: "Anime & Illustration", blurb: "Illustrated worlds, full of small details." },
  { slug: "abstract", name: "Abstract", blurb: "Color, shape and texture on their own." },
  { slug: "architecture", name: "Architecture", blurb: "Temples, streets and towns worth wandering." },
  { slug: "space", name: "Space", blurb: "Planets, stars and the dark between them." },
] as const;

export type CollectionSlug = (typeof COLLECTIONS)[number]["slug"];
export type Collection = (typeof COLLECTIONS)[number];

export const COLLECTION_SLUGS = COLLECTIONS.map((c) => c.slug) as CollectionSlug[];

export const getCollection = (slug: string) => COLLECTIONS.find((c) => c.slug === slug) ?? null;
