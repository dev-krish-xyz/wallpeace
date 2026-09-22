"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createUpload, finalizeUpload } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Check, Plus, XMark } from "@/components/ui/icons";
import { slugify, titleFromFilename } from "@/lib/slug";
import { ACCEPTED_TYPES, MAX_UPLOAD_BYTES } from "@/lib/uploads";
import { uploadOriginal } from "./uploadOriginal";

type Status = "ready" | "uploading" | "processing" | "done" | "error";

type Item = {
  key: string;
  file: File;
  preview: string;
  title: string;
  slug: string;
  slugTouched: boolean;
  featured: boolean;
  status: Status;
  progress: number;
  error?: string;
  resultSlug?: string;
};

const STATUS_TEXT: Record<Status, string> = {
  ready: "Ready",
  uploading: "Uploading…",
  processing: "Processing…",
  done: "Published",
  error: "Failed",
};

export function UploadPanel() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);
  const [running, setRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.preview)), []);

  const update = useCallback((key: string, patch: Partial<Item>) => {
    setItems((list) => list.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }, []);

  function addFiles(files: FileList | File[]) {
    const next = Array.from(files)
      .filter((f) => ACCEPTED_TYPES.includes(f.type))
      .map<Item>((file) => {
        const title = titleFromFilename(file.name);
        const tooBig = file.size > MAX_UPLOAD_BYTES;
        return {
          key: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          title,
          slug: slugify(title),
          slugTouched: false,
          featured: false,
          status: tooBig ? "error" : "ready",
          progress: 0,
          error: tooBig ? "Larger than 100 MB." : undefined,
        };
      });
    setItems((list) => [...list, ...next]);
  }

  function remove(key: string) {
    setItems((list) => {
      const item = list.find((i) => i.key === key);
      if (item) URL.revokeObjectURL(item.preview);
      return list.filter((i) => i.key !== key);
    });
  }

  async function publish(item: Item) {
    update(item.key, { status: "uploading", progress: 0, error: undefined });
    try {
      const reserved = await createUpload({ contentType: item.file.type, size: item.file.size });
      if (!reserved.ok) throw new Error(reserved.error);
      await uploadOriginal(reserved.path, reserved.token, item.file, (p) => update(item.key, { progress: p }));
      update(item.key, { status: "processing", progress: 1 });
      const result = await finalizeUpload({
        id: reserved.id,
        path: reserved.path,
        title: item.title,
        slug: item.slug,
        featured: item.featured,
      });
      if (!result.ok) throw new Error(result.error);
      update(item.key, { status: "done", resultSlug: result.slug });
    } catch (e) {
      update(item.key, { status: "error", error: e instanceof Error ? e.message : "Upload failed." });
    }
  }

  async function publishAll() {
    setRunning(true);
    // Sequential: keeps memory and function concurrency low for large originals.
    for (const item of itemsRef.current.filter((i) => i.status === "ready" || (i.status === "error" && i.file.size <= MAX_UPLOAD_BYTES))) {
      await publish(itemsRef.current.find((i) => i.key === item.key) ?? item);
    }
    setRunning(false);
    router.refresh();
  }

  const pending = items.filter((i) => i.status === "ready" || i.status === "error").length;
  const clearDone = () => setItems((list) => list.filter((i) => i.status !== "done"));

  return (
    <section>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center rounded-[12px] border-[1.5px] border-dashed px-6 py-12 text-center transition-colors ${
          dragging ? "border-accent bg-accent/[0.06]" : "border-label-3/60 bg-grouped"
        }`}
      >
        <p className="text-[15px] font-medium text-label">Drop wallpapers here</p>
        <p className="mt-1 text-[12px] text-label-2">PNG, JPEG or WebP, up to 100 MB each</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => inputRef.current?.click()}>
          <Plus width={14} height={14} />
          Choose Files…
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {items.length > 0 && (
        <div className="mt-6">
          <div className="overflow-hidden rounded-[10px] bg-grouped ring-[0.5px] ring-separator">
            <ul className="divide-y divide-separator">
              {items.map((item) => {
                const locked = item.status === "uploading" || item.status === "processing" || item.status === "done";
                return (
                  <li key={item.key} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                    <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-[6px] bg-fill sm:w-28">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.preview} alt="" className="absolute inset-0 size-full object-cover" />
                    </div>
                    <div className="grid min-w-0 flex-1 gap-1.5">
                      <input
                        aria-label="Title"
                        value={item.title}
                        disabled={locked}
                        onChange={(e) =>
                          update(item.key, {
                            title: e.target.value,
                            ...(item.slugTouched ? {} : { slug: slugify(e.target.value) }),
                          })
                        }
                        className="h-7 w-full rounded-[6px] bg-transparent px-1.5 text-[13px] font-medium text-label outline-none hover:bg-fill focus:bg-surface focus:ring-[3px] focus:ring-accent/45 disabled:hover:bg-transparent"
                      />
                      <div className="flex items-center px-1.5 text-[12px] text-label-3">
                        <span>/w/</span>
                        <input
                          aria-label="Slug"
                          value={item.slug}
                          disabled={locked}
                          onChange={(e) => update(item.key, { slug: e.target.value, slugTouched: true })}
                          className="min-w-0 flex-1 rounded-[4px] bg-transparent text-label-2 outline-none focus:bg-surface focus:ring-[3px] focus:ring-accent/45"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <label className="flex items-center gap-2 text-[12px] text-label-2">
                        Featured
                        <Switch
                          label="Featured"
                          checked={item.featured}
                          disabled={locked}
                          onChange={(v) => update(item.key, { featured: v })}
                        />
                      </label>
                      <StatusCell item={item} />
                      <button
                        type="button"
                        aria-label="Remove"
                        disabled={item.status === "uploading" || item.status === "processing"}
                        onClick={() => remove(item.key)}
                        className="rounded-full p-1 text-label-3 hover:bg-fill hover:text-label disabled:opacity-30"
                      >
                        <XMark width={14} height={14} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2">
            {items.some((i) => i.status === "done") && (
              <Button variant="plain" size="sm" onClick={clearDone} disabled={running}>
                Clear Published
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={publishAll} disabled={running || pending === 0}>
              {running ? "Publishing…" : `Publish ${pending || ""}`.trim()}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

function StatusCell({ item }: { item: Item }) {
  if (item.status === "done") {
    return (
      <a href={`/w/${item.resultSlug}`} className="flex w-28 items-center justify-end gap-1 text-[12px] font-medium text-accent">
        <Check width={13} height={13} /> View
      </a>
    );
  }
  if (item.status === "uploading" || item.status === "processing") {
    return (
      <div className="w-28">
        <div className="h-1 overflow-hidden rounded-full bg-fill-2">
          <div
            className={`h-full rounded-full bg-accent transition-[width] duration-200 ${item.status === "processing" ? "animate-pulse" : ""}`}
            style={{ width: `${Math.max(4, item.progress * 100)}%` }}
          />
        </div>
        <p className="mt-1 text-right text-[11px] text-label-3">{STATUS_TEXT[item.status]}</p>
      </div>
    );
  }
  return (
    <p className={`w-28 text-right text-[12px] ${item.status === "error" ? "text-danger" : "text-label-3"}`} title={item.error}>
      {item.status === "error" ? item.error ?? STATUS_TEXT.error : STATUS_TEXT.ready}
    </p>
  );
}
