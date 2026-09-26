import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { displayUrl } from "@/lib/storage";
import type { Wallpaper } from "@/types/database";

/**
 * The paper the band is printed on: near-white in the middle with the colour pushed out to the
 * corners — lavender top-left, cool blue top-right — and a white bloom rising through the bottom.
 * First in the list paints on top.
 */
const WASH = [
  "radial-gradient(40% 54% at 50% 97%, rgb(255 255 255 / 0.95), transparent 72%)",
  "radial-gradient(64% 88% at 2% 4%, rgb(209 206 245 / 0.9), transparent 68%)",
  "radial-gradient(60% 84% at 99% 2%, rgb(193 213 250 / 0.95), transparent 66%)",
  "radial-gradient(54% 68% at -2% 104%, rgb(212 224 250 / 0.7), transparent 64%)",
  "radial-gradient(60% 76% at 102% 102%, rgb(230 218 245 / 0.7), transparent 66%)",
].join(", ");

/** Closing invitation on the home page: the library, with a few of its pictures around the edges. */
export function BrowseLibrary({ wallpapers }: { wallpapers: Wallpaper[] }) {
  const tiles = pickTiles(wallpapers);
  return (
    <section className="relative overflow-hidden rounded-t-[18px] px-6 py-[50px] text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(180deg,black_0%,black_62%,rgb(0_0_0/0.78)_78%,rgb(0_0_0/0.35)_90%,transparent_100%)] [-webkit-mask-image:linear-gradient(180deg,black_0%,black_62%,rgb(0_0_0/0.78)_78%,rgb(0_0_0/0.35)_90%,transparent_100%)]"
      >
        <div className="absolute inset-0 bg-[#fafbff]" style={{ backgroundImage: WASH }} />
        <Fog />
        <Arcs />
        <Sparkles />
        {tiles[0] && tiles[1] && <Cluster side="left" upper={tiles[0]} lower={tiles[1]} />}
        {tiles[2] && tiles[3] && <Cluster side="right" upper={tiles[3]} lower={tiles[2]} />}
      </div>

      <div className="relative z-10 mx-auto max-w-[36rem]">
        <h2 className="font-display text-[30px] font-semibold tracking-[-0.021em] text-label sm:text-[36px]">
          Browse the Library
        </h2>
        <p className="mx-auto mt-1.5 max-w-[46ch] text-[14px] leading-snug text-label-2 sm:text-[15px]">
          All {wallpapers.length} wallpapers, sorted by newest or most downloaded, or grouped into collections.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <ButtonLink href="/browse" variant="primary" size="sm">
            Browse All
          </ButtonLink>
          <ButtonLink href="/collections" variant="secondary" size="sm">
            Collections
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function pickTiles(wallpapers: Wallpaper[]) {
  if (wallpapers.length <= 4) return wallpapers;
  const step = Math.max(1, Math.floor(wallpapers.length / 4));
  return [0, 1, 2, 3].map((i) => wallpapers[(i * step) % wallpapers.length]);
}

/** One side of the band: two cards, fog, and a wash of the pictures' own colour. */
function Cluster({ side, upper, lower }: { side: "left" | "right"; upper: Wallpaper; lower: Wallpaper }) {
  const flip = side === "right";
  return (
    <div
      className={`pointer-events-none absolute inset-y-0 left-0 hidden w-[34%] sm:block ${flip ? "left-auto right-0 -scale-x-100" : ""}`}
    >
      <div
        aria-hidden
        className="absolute bottom-[-20%] left-[-10%] h-[58%] w-[115%] bg-[radial-gradient(ellipse_at_30%_80%,rgb(255_255_255/0.8),transparent_70%)] blur-[80px]"
      />

      <Tile wallpaper={upper} flip={flip} className="absolute top-[4%] left-[-14%] z-0 w-[52%] rotate-[-18deg]" />
      <Tile wallpaper={lower} flip={flip} className="absolute bottom-[-10%] left-[25%] z-[1] w-[46%] rotate-[-8deg]" />
    </div>
  );
}

function Tile({ wallpaper, flip, className }: { wallpaper: Wallpaper; flip?: boolean; className: string }) {
  return (
    <div className={`absolute ${className}`}>
      <div
        aria-hidden
        className="absolute -inset-[62%] -z-10 [mask-image:radial-gradient(ellipse_at_center,black_6%,transparent_62%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_6%,transparent_62%)]"
      >
        <Image
          src={displayUrl(wallpaper)}
          alt=""
          fill
          sizes="220px"
          className={`object-cover opacity-85 blur-[46px] brightness-125 saturate-[2.4] ${flip ? "-scale-x-100" : ""}`}
        />
        <div className="absolute inset-0 bg-white/25" />
      </div>
      <a
        href={`/w/${wallpaper.slug}`}
        aria-hidden
        tabIndex={-1}
        className="pointer-events-auto relative block overflow-hidden rounded-[14px] shadow-[0_10px_26px_-12px_rgb(30_50_100/0.3)]"
      >
        <span className="relative block aspect-[16/9]">
          <Image
            src={displayUrl(wallpaper)}
            alt=""
            fill
            sizes="(min-width: 1024px) 220px, 30vw"
            placeholder={wallpaper.blur_data_url ? "blur" : "empty"}
            blurDataURL={wallpaper.blur_data_url ?? undefined}
            className={`object-cover ${flip ? "-scale-x-100" : ""}`}
          />
        </span>
      </a>
    </div>
  );
}

function Arcs() {
  return (
    <svg aria-hidden viewBox="0 0 1400 320" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
      {/* A pair of hairlines from one circle, mirrored about the centre, so the middle of the band
       *  reads as the inside of something rather than as empty space. */}
      <g fill="none" stroke="rgb(150 175 225 / 0.3)" strokeWidth="1.2">
        <path d="M 277 -10 C 400 30, 470 140, 500 330" />
        <path d="M 1123 -10 C 1000 30, 930 140, 900 330" />
      </g>
    </svg>
  );
}

/** Cloud with no edge to it. The blur is what keeps the washes from reading as a flat gradient. */
function Fog() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="absolute bottom-[-30%] left-1/2 h-[78%] w-[62%] -translate-x-1/2 rounded-[50%] bg-white/85 blur-[90px]" />
      <span className="absolute -top-[20%] left-[15%] h-[58%] w-[30%] rounded-[50%] bg-[#dbd7f7] opacity-55 blur-[80px]" />
      <span className="absolute -top-[24%] right-[11%] h-[60%] w-[32%] rounded-[50%] bg-[#cee0fb] opacity-65 blur-[80px]" />
    </div>
  );
}

function Sparkles() {
  return (
    <svg aria-hidden viewBox="0 0 1400 320" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 h-full w-full">
      <g fill="rgb(168 196 244 / 0.9)">
        <Star cx={384} cy={62} r={7} />
        <Star cx={1020} cy={60} r={6} />
      </g>
    </svg>
  );
}

function Star({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const d = `M ${cx} ${cy - r} L ${cx + r * 0.28} ${cy - r * 0.28} L ${cx + r} ${cy} L ${cx + r * 0.28} ${cy + r * 0.28} L ${cx} ${cy + r} L ${cx - r * 0.28} ${cy + r * 0.28} L ${cx - r} ${cy} L ${cx - r * 0.28} ${cy - r * 0.28} Z`;
  return <path d={d} />;
}
