/**
 * Everything the "What Premium adds" story puts on screen, kept apart from the code that animates it.
 *
 * Two kinds of entry:
 *  - a `slug` picks a wallpaper from the library, so a demo always has a real picture to show;
 *  - a `src` is a file the site owner uploads to `public/premium-demo/`. Fill one in and the demo
 *    switches to it on the next deploy — the animation reads the same slots either way.
 *
 * A slot left `null` falls back to its library slug. Nothing here is generated or filtered.
 */

export type DemoImage = {
  /** A file under `public/`, e.g. "/premium-demo/day.webp". Wins over `slug` when set. */
  src: string | null;
  /** Library wallpaper used until `src` exists. */
  slug: string;
};

export type DemoVideo = {
  /** WebM first (smaller), MP4 as the fallback Safari and older devices play. */
  webm: string | null;
  mp4: string | null;
  /** Shown while the video loads. `null` uses the first frame of the library wallpaper below. */
  poster: string | null;
  /** Library wallpaper the demo shows (still, with a gentle drift) until a video is uploaded. */
  slug: string;
};

export const premiumDemoAssets = {
  resolution: "giant-tree-island-4k",
  screens: "cherry-blossom-tokyo-skyline-4k",
  multiMonitor: "mediterranean-coastal-village-4k",

  /** Upload a short seamless loop (8–15s, 1920px wide is plenty) and point these at it. */
  liveWallpaper: {
    webm: null,
    mp4: null,
    poster: null,
    slug: "japanese-street-at-dusk-4k",
  } satisfies DemoVideo,

  /**
   * The three states of one dynamic wallpaper — the same scene painted three times. Until they are
   * uploaded, three library wallpapers with the right light stand in.
   */
  dynamic: {
    day: { src: null, slug: "sunrise-over-rice-fields-4k" },
    sunset: { src: null, slug: "japanese-street-at-dusk-4k" },
    night: { src: null, slug: "japanese-village-at-night-4k" },
  } satisfies Record<"day" | "sunset" | "night", DemoImage>,

  exclusiveSeries: [
    { label: "Games", slug: "pirate-ship-tropical-beach-4k" },
    { label: "Cars", slug: "sports-car-country-road-4k" },
    { label: "Anime", slug: "sakura-shopping-street-4k" },
    { label: "Movies", slug: "samurai-maple-waterfall-4k" },
  ],

  /** The wallpaper the custom-request demo "delivers". */
  customRequest: "japanese-village-at-night-4k",
} as const;
