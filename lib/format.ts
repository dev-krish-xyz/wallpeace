// Fixed time zone so the server (UTC on Vercel) and the visitor's browser render the same date;
// otherwise the text differs near midnight and React reports a hydration mismatch.
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export const formatResolution = (w: number, h: number) => `${w} × ${h}`;

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

export function formatAspect(w: number, h: number) {
  const known: [number, string][] = [
    [16 / 10, "16:10"],
    [16 / 9, "16:9"],
    [21 / 9, "21:9"],
    [32 / 9, "32:9"],
    [4 / 3, "4:3"],
    [3 / 2, "3:2"],
    [1, "1:1"],
  ];
  const r = w / h;
  const match = known.find(([k]) => Math.abs(k - r) < 0.01);
  if (match) return match[1];
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
}

/**
 * Badge from the pixels recorded at upload. These names refer to the long edge, whatever the
 * aspect ratio. A badge only appears once the image meets 4K; a larger master reads 5K or 8K.
 */
export function resolutionLabel(w: number, h: number) {
  const width = Math.max(w, h);
  if (width >= 7680) return "8K";
  if (width >= 5120) return "5K";
  if (width >= 3840) return "4K";
  return null;
}

// Older titles ended in the resolution word. It now lives on the badge and in the search title.
const TRAILING_RESOLUTION = /\s+(?:2K|4K|5K|8K)$/i;

/** Name as shown on the page. */
export function displayTitle(title: string) {
  return title.replace(TRAILING_RESOLUTION, "");
}

/** Page title for search results: "Samurai by a Maple Waterfall 4K Wallpaper". */
export const searchTitle = (t: { title: string; width: number; height: number }) =>
  [displayTitle(t.title), resolutionLabel(t.width, t.height), "Wallpaper"].filter(Boolean).join(" ");

export const MAX_DESCRIPTION = 300;

/** The written description, or a plain factual line when there isn't one yet. */
export const describeWallpaper = (w: { title: string; width: number; height: number; description: string | null }) =>
  w.description ??
  `${displayTitle(w.title)}, an original ${[resolutionLabel(w.width, w.height), "desktop wallpaper"].filter(Boolean).join(" ")} at ${formatResolution(w.width, w.height)}. Free to download from Wallpeace.`;
