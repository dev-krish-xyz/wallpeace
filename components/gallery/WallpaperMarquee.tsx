import Image from "next/image";
import Link from "next/link";
import { HOVER_ZOOM } from "@/components/gallery/WallpaperCard";
import { Scene } from "@/components/site/Scene";
import { displayTitle } from "@/lib/format";
import { displayUrl } from "@/lib/storage";
import type { Wallpaper } from "@/types/database";

// Enough cards that a row is wider than any screen, so the loop never shows its end.
const MIN_PER_ROW = 6;

// Seconds a single card takes to cross, give or take: the row's duration follows its length, so a
// short library and a long one drift past at the same speed.
const SECONDS_PER_CARD = 6;

const CARD = "w-[228px] sm:w-[300px] lg:w-[360px]";
const SIZES = "(min-width: 1024px) 360px, (min-width: 640px) 300px, 228px";

/** Repeats the list until it is long enough to fill a row. */
function fill(items: Wallpaper[], min: number) {
  if (!items.length) return items;
  const out = [...items];
  while (out.length < min) out.push(...items);
  return out;
}

/**
 * One card. The second copy of a row is scenery rather than content, so it is hidden from
 * assistive tech and holds no link: the same wallpaper must not be reachable twice.
 */
function Card({ w, clone }: { w: Wallpaper; clone?: boolean }) {
  // The gap is a margin on the card rather than a flex gap: the row translates by exactly half its
  // width, and only a margin puts the same space after the last card as between the others.
  const frame = (
    <div
      className={`relative aspect-[16/10] ${CARD} overflow-hidden rounded-[12px] bg-fill shadow-card transition-shadow duration-300 ease-(--ease-mac) group-hover:shadow-card-hover`}
    >
      <Image
        src={displayUrl(w)}
        alt={clone ? "" : `${displayTitle(w.title)} desktop wallpaper`}
        fill
        sizes={SIZES}
        placeholder={w.blur_data_url ? "blur" : "empty"}
        blurDataURL={w.blur_data_url ?? undefined}
        className={`object-cover${HOVER_ZOOM}`}
      />
    </div>
  );
  return (
    <li aria-hidden={clone} className="mr-3 shrink-0 sm:mr-5">
      {clone ? (
        frame
      ) : (
        <Link href={`/w/${w.slug}`} className="group block rounded-[12px] outline-offset-4">
          {frame}
        </Link>
      )}
    </li>
  );
}

/** One drifting row: the same cards twice, moved by half the track's width. */
function Row({ items, back }: { items: Wallpaper[]; back?: boolean }) {
  return (
    // Fades at both ends, so cards arrive and leave rather than being cut off by the edge.
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] motion-reduce:overflow-x-auto">
      <ul
        style={{ animationDuration: `${items.length * SECONDS_PER_CARD}s` }}
        className={`flex w-max ${
          back
            ? "motion-safe:[animation:marquee-back_60s_linear_infinite]"
            : "motion-safe:[animation:marquee_60s_linear_infinite]"
        }`}
      >
        {items.map((w, i) => (
          <Card key={`${w.id}-${i}`} w={w} />
        ))}
        {/* The copy that makes the loop seamless: at -50% it sits exactly where the first began. */}
        {items.map((w, i) => (
          <Card key={`clone-${w.id}-${i}`} w={w} clone />
        ))}
      </ul>
    </div>
  );
}

/**
 * The library, drifting past in two rows that pass each other. It starts itself when the section
 * arrives — `Scene` marks itself `data-shown` while it is on screen and the `[data-scene]` rule in
 * globals.css cancels the animation while it is not. It never pauses: a card is a link, and a link
 * can be clicked while it moves. Without motion it becomes two rows you scroll by hand.
 */
export function WallpaperMarquee({ wallpapers }: { wallpapers: Wallpaper[] }) {
  if (!wallpapers.length) return null;
  // Dealt out alternately, so the newest wallpapers are spread across both rows rather than stacked.
  const top = fill(wallpapers.filter((_, i) => i % 2 === 0), MIN_PER_ROW);
  const bottom = fill(wallpapers.filter((_, i) => i % 2 === 1), MIN_PER_ROW);

  return (
    <Scene className="flex flex-col gap-3 sm:gap-5">
      <Row items={top} />
      {bottom.length > 0 && <Row items={bottom} back />}
    </Scene>
  );
}
