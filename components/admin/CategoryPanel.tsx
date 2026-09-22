"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCategory, deleteCategory, updateCategory } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Plus } from "@/components/ui/icons";
import { MAX_CATEGORY_BLURB, MAX_CATEGORY_NAME, type Collection } from "@/lib/category";

/** Add, rename and remove the categories wallpapers can be filed under. */
export function CategoryPanel({ categories, counts }: { categories: Collection[]; counts: Record<string, number> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) =>
    startTransition(async () => {
      setError(undefined);
      const res = await fn();
      if (!res.ok) return setError(res.error);
      after?.();
      router.refresh();
    });

  const add = () => {
    if (!name.trim()) return;
    run(() => createCategory({ name }), () => setName(""));
  };

  return (
    <section className={pending ? "opacity-60 transition-opacity" : "transition-opacity"}>
      <div className="overflow-hidden rounded-[10px] bg-grouped ring-[0.5px] ring-separator">
        <ul className="divide-y divide-separator">
          {categories.map((c) => (
            <CategoryRow key={c.slug} category={c} count={counts[c.slug] ?? 0} run={run} />
          ))}
          {categories.length === 0 && (
            <li className="px-3 py-6 text-center text-[13px] text-label-2">No categories yet.</li>
          )}
        </ul>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input
          aria-label="New category name"
          placeholder="New category, e.g. Cyberpunk"
          value={name}
          maxLength={MAX_CATEGORY_NAME}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className="h-8 flex-1 rounded-[7px] bg-surface px-2.5 text-[13px] text-label shadow-card outline-none focus:ring-[3px] focus:ring-accent/45"
        />
        <Button variant="secondary" size="sm" onClick={add} disabled={pending || !name.trim()}>
          <Plus width={14} height={14} />
          Add
        </Button>
      </div>
      {error && <p className="mt-2 text-[12px] text-danger">{error}</p>}
    </section>
  );
}

function CategoryRow({
  category: c,
  count,
  run,
}: {
  category: Collection;
  count: number;
  run: (fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) => void;
}) {
  const [name, setName] = useState(c.name);
  const [blurb, setBlurb] = useState(c.blurb ?? "");
  const [confirming, setConfirming] = useState(false);

  const save = (next: { name?: string; blurb?: string }) =>
    run(() => updateCategory(c.slug, { name: next.name ?? name, blurb: next.blurb ?? blurb }));

  return (
    <li className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <input
          aria-label={`Name of ${c.name}`}
          value={name}
          maxLength={MAX_CATEGORY_NAME}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          onBlur={() => name.trim() && name.trim() !== c.name && save({ name })}
          className="h-7 w-full rounded-[6px] bg-transparent px-1.5 text-[13px] font-medium text-label outline-none hover:bg-fill focus:bg-surface focus:ring-[3px] focus:ring-accent/45"
        />
        <input
          aria-label={`Description of ${c.name}`}
          placeholder="Description, shown on the collection page"
          value={blurb}
          maxLength={MAX_CATEGORY_BLURB}
          onChange={(e) => setBlurb(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          onBlur={() => blurb.trim() !== (c.blurb ?? "") && save({ blurb })}
          className="mt-0.5 h-6 w-full rounded-[6px] bg-transparent px-1.5 text-[12px] text-label-2 outline-none placeholder:text-label-3 hover:bg-fill focus:bg-surface focus:ring-[3px] focus:ring-accent/45"
        />
        <p className="px-1.5 pt-0.5 text-[11px] text-label-3 tabular-nums">
          /collections/{c.slug} · {count} {count === 1 ? "wallpaper" : "wallpapers"}
        </p>
      </div>
      {confirming ? (
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="plain" size="sm" onClick={() => setConfirming(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="font-semibold"
            onClick={() => run(() => deleteCategory(c.slug), () => setConfirming(false))}
          >
            Delete
          </Button>
        </div>
      ) : (
        <Button variant="plain" size="sm" className="shrink-0 text-label-2" onClick={() => setConfirming(true)}>
          Delete…
        </Button>
      )}
    </li>
  );
}
