"use client";

import Image from "next/image";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteWallpaper, renameWallpaper, setCollections, setDescription, setFeatured } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { COLLECTIONS } from "@/lib/collections";
import { MAX_DESCRIPTION, formatDate, formatResolution } from "@/lib/format";
import { displayUrl } from "@/lib/storage";
import type { Wallpaper } from "@/types/database";

export function LibraryList({ wallpapers }: { wallpapers: Wallpaper[] }) {
  if (wallpapers.length === 0) {
    return <p className="rounded-[10px] bg-grouped px-4 py-10 text-center text-[13px] text-label-2">Nothing published yet.</p>;
  }
  return (
    <div className="overflow-hidden rounded-[10px] bg-grouped ring-[0.5px] ring-separator">
      <ul className="divide-y divide-separator">
        {wallpapers.map((w) => (
          <LibraryRow key={w.id} wallpaper={w} />
        ))}
      </ul>
    </div>
  );
}

function LibraryRow({ wallpaper: w }: { wallpaper: Wallpaper }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [featured, setOptimisticFeatured] = useOptimistic(w.featured);
  const [collections, setOptimisticCollections] = useOptimistic(w.collections);
  const [title, setTitle] = useState(w.title);
  const [description, updateDescription] = useState(w.description ?? "");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      setError(undefined);
      const res = await fn();
      if (!res.ok) setError(res.error);
      router.refresh();
    });

  return (
    <li className={`flex items-center gap-3 p-3 transition-opacity ${pending ? "opacity-60" : ""}`}>
      <Link href={`/w/${w.slug}`} className="relative aspect-[16/10] w-20 shrink-0 overflow-hidden rounded-[5px] bg-fill">
        <Image src={displayUrl(w)} alt="" fill sizes="80px" className="object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        <input
          aria-label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          onBlur={() => title.trim() !== w.title && run(() => renameWallpaper(w.id, title))}
          className="h-7 w-full rounded-[6px] bg-transparent px-1.5 text-[13px] font-medium text-label outline-none hover:bg-fill focus:bg-surface focus:ring-[3px] focus:ring-accent/45"
        />
        <p className="truncate px-1.5 text-[12px] text-label-3 tabular-nums">
          {formatResolution(w.width, w.height)} · {formatDate(w.created_at)}
          {error && <span className="ml-2 text-danger">{error}</span>}
        </p>
        <textarea
          aria-label="Description"
          placeholder="Add a description…"
          value={description}
          maxLength={MAX_DESCRIPTION}
          rows={2}
          onChange={(e) => updateDescription(e.target.value)}
          onBlur={() =>
            description.trim() !== (w.description ?? "") && run(() => setDescription(w.id, description))
          }
          className="mt-1 block w-full resize-none rounded-[6px] bg-transparent px-1.5 py-1 text-[12px] leading-snug text-label-2 outline-none placeholder:text-label-3 hover:bg-fill focus:bg-surface focus:ring-[3px] focus:ring-accent/45"
        />
        <div role="group" aria-label="Collections" className="mt-1.5 flex flex-wrap gap-1 px-1">
          {COLLECTIONS.map((c) => {
            const on = collections.includes(c.slug);
            return (
              <button
                key={c.slug}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  run(async () => {
                    const next = on ? collections.filter((s) => s !== c.slug) : [...collections, c.slug];
                    setOptimisticCollections(next);
                    return setCollections(w.id, next);
                  })
                }
                className={`h-[22px] rounded-full px-2.5 text-[11px] font-medium transition-colors duration-150 ${
                  on ? "bg-accent text-white" : "bg-fill-2 text-label-2 hover:text-label"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>
      <label className="hidden items-center gap-2 text-[12px] text-label-2 sm:flex">
        Featured
        <Switch
          label={`Feature ${w.title}`}
          checked={featured}
          onChange={(v) =>
            run(async () => {
              setOptimisticFeatured(v);
              return setFeatured(w.id, v);
            })
          }
        />
      </label>
      {confirming ? (
        <div className="flex items-center gap-1">
          <Button variant="plain" size="sm" onClick={() => setConfirming(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="font-semibold"
            onClick={() => run(() => deleteWallpaper(w.id))}
          >
            Delete
          </Button>
        </div>
      ) : (
        <Button variant="plain" size="sm" className="text-label-2" onClick={() => setConfirming(true)}>
          Delete…
        </Button>
      )}
    </li>
  );
}
