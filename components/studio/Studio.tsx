"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { ArrowDown } from "@/components/ui/icons";
import { FINISHES, type Finish } from "@/components/preview/finishes";
import { ResolutionBadge } from "@/components/ui/ResolutionBadge";
import { displayTitle, formatAspect, formatDate, formatResolution, searchTitle } from "@/lib/format";
import { displayUrl, screenUrl } from "@/lib/storage";
import type { Wallpaper } from "@/types/database";
import { MacBookStage } from "./MacBookStage";
import { ViewControl } from "./ViewControl";
import { WallpaperRail } from "./WallpaperRail";

const FINISH_KEY = "wallpeace:finish";
// Quiet time after the last step before the expensive work (3D texture swap, URL) happens.
const COMMIT_MS = 160;

/** `value`, but only once it has stopped changing for `delay` ms. */
function useSettled<T>(value: T, delay: number) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return settled;
}

/**
 * `heading`: the page's H1 (visually hidden). Without it, the selected wallpaper's title is the H1,
 * which is what a /w/[slug] page is about.
 */
export function Studio({
  wallpapers,
  initialId,
  heading,
  syncUrl = true,
}: {
  wallpapers: Wallpaper[];
  initialId: string;
  heading?: string;
  /** Rewrite the address bar as the selection changes. Off on the home page, so Back and Reload
   *  behave: home stays home. */
  syncUrl?: boolean;
}) {
  const [selectedId, setSelectedId] = useState(initialId);
  const [finish, setFinish] = useState<Finish>("silver");
  const [view, setView] = useState(0);
  const preloaded = useRef(new Set<string>());
  const index = Math.max(0, wallpapers.findIndex((w) => w.id === selectedId));
  const selected = wallpapers[index];
  // Fast scrolling steps through several wallpapers; only the one you land on reaches the MacBook.
  const committed = useSettled(selected, COMMIT_MS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FINISH_KEY);
      if (saved === "silver" || saved === "space-black") setFinish(saved);
    } catch {}
  }, []);

  const changeFinish = (f: Finish) => {
    setFinish(f);
    try {
      localStorage.setItem(FINISH_KEY, f);
    } catch {}
  };

  // Warm the HTTP cache so the 3D screen can swap almost instantly on click.
  const preload = useCallback((w: Wallpaper) => {
    const url = screenUrl(w);
    if (preloaded.current.has(url)) return;
    preloaded.current.add(url);
    const img = new Image();
    // Same CORS mode as the 3D texture loader, so its request reuses this cached response.
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.src = url;
  }, []);

  const select = useCallback(
    (w: Wallpaper) => {
      setSelectedId(w.id);
      preload(w);
    },
    [preload],
  );

  // Shareable URL without a navigation (the 3D scene stays mounted), once the selection settles.
  useEffect(() => {
    if (!syncUrl) return;
    if (window.location.pathname !== `/w/${committed.slug}`) {
      window.history.replaceState(null, "", `/w/${committed.slug}`);
    }
    document.title = `${searchTitle(committed)} — Wallpeace`;
  }, [committed, syncUrl]);

  // Neighbors are the most likely next picks.
  useEffect(() => {
    [wallpapers[index + 1], wallpapers[index - 1]].forEach((w) => w && preload(w));
  }, [index, wallpapers, preload]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      const step = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
      if (!step) return;
      const next = wallpapers[index + step];
      if (!next) return;
      e.preventDefault();
      select(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, wallpapers, select]);

  const Title = heading ? "h2" : "h1";

  return (
    <div className="flex flex-col lg:grid lg:h-[calc(100dvh-52px)] lg:grid-cols-[40%_1fr]">
      {/* Sidebar carousel */}
      <aside className="relative order-2 border-separator bg-grouped pt-1.5 pb-2 lg:order-1 lg:min-h-0 lg:border-r lg:p-0">
        <div className="mb-0.5 flex items-baseline justify-end px-5 lg:absolute lg:inset-x-0 lg:top-0 lg:z-10 lg:mb-0 lg:px-6 lg:pt-5">
          {heading && <h1 className="sr-only">{heading}</h1>}
          <span className="text-[12px] text-label-3 tabular-nums">
            {index + 1} of {wallpapers.length}
          </span>
        </div>
        <div className="h-[46vw] sm:h-[30vw] lg:h-full">
          <WallpaperRail wallpapers={wallpapers} selectedId={selected.id} onSelect={select} onPreload={preload} />
        </div>
        {/* Plain links to every wallpaper page, for crawlers and screen readers; the rail is the visual equivalent. */}
        <nav aria-label="All wallpapers" className="sr-only">
          <ul>
            {wallpapers.map((w) => (
              <li key={w.id}>
                <a href={`/w/${w.slug}`}>{displayTitle(w.title)}</a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Stage */}
      <section className="order-1 flex min-h-0 flex-col lg:order-2">
        <div className="relative h-[clamp(232px,58vw,520px)] sm:h-[clamp(280px,62vw,520px)] lg:h-auto lg:min-h-0 lg:flex-1">
          <MacBookStage
            screenUrl={screenUrl(committed)}
            fallbackUrl={displayUrl(committed)}
            title={displayTitle(committed.title)}
            finish={finish}
            view={view}
          />
        </div>
        <div className="flex justify-center pb-1.5 lg:pb-3">
          <ViewControl value={view} onChange={setView} />
        </div>

        <div className="flex flex-col gap-3 px-5 pt-2 pb-4 sm:flex-row sm:gap-4 sm:pb-6 sm:items-end sm:justify-between lg:px-10 lg:pb-8">
          <div className="min-w-0">
            {/* Always in the layout, only sometimes visible: appearing would otherwise resize the
             *  stage above it (desktop) and push the rail down (mobile) as you scroll the rail. */}
            <p
              aria-hidden={!selected.featured}
              className={`mb-0.5 text-[12px] font-semibold text-accent ${selected.featured ? "" : "invisible"}`}
            >
              Featured
            </p>
            <Title className="truncate font-display text-[17px] font-semibold sm:text-[22px] tracking-[-0.015em] text-label">
              {displayTitle(selected.title)}
            </Title>
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] text-label-2 tabular-nums sm:text-[13px]">
              {formatResolution(selected.width, selected.height)}
              <ResolutionBadge width={selected.width} height={selected.height} />
              <span>· {formatAspect(selected.width, selected.height)} ·</span>
              <span>{formatDate(selected.created_at)}</span>
            </p>
            {selected.description && (
              <p className="mt-1.5 line-clamp-2 max-w-[60ch] text-[13px] leading-snug text-label-2">{selected.description}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3 self-start sm:self-auto">
            <Segmented
              label="MacBook finish"
              value={finish}
              onChange={changeFinish}
              options={(Object.keys(FINISHES) as Finish[]).map((k) => ({ value: k, label: FINISHES[k].label }))}
            />
            <ButtonLink href={`/w/${selected.slug}/download`} prefetch={false} variant="primary" size="xs" className="!px-2.5">
              <ArrowDown width={13} height={13} />
              Download
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
