"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { BUCKET, WALLPAPERS_TAG } from "@/lib/env";
import { slugify } from "@/lib/slug";
import { publicUrl, storagePaths } from "@/lib/storage";
import { createSupabaseServer } from "@/lib/supabase/server";
import { MAX_UPLOAD_BYTES, UPLOAD_TYPES } from "@/lib/uploads";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const fail = (e: unknown): { ok: false; error: string } => ({
  ok: false,
  error: e instanceof Error ? e.message : "Something went wrong.",
});

function refresh(slug?: string) {
  revalidateTag(WALLPAPERS_TAG);
  revalidatePath("/");
  if (slug) revalidatePath(`/w/${slug}`);
}

/** Step 1: reserve an id and hand the browser a signed URL to upload the original directly to Storage. */
export async function createUpload(input: { contentType: string; size: number }): Promise<
  Result<{ id: string; path: string; token: string }>
> {
  try {
    const { supabase } = await requireAdmin();
    const ext = UPLOAD_TYPES[input.contentType];
    if (!ext) return { ok: false, error: "Use PNG, JPEG or WebP." };
    if (input.size > MAX_UPLOAD_BYTES) return { ok: false, error: "File is larger than 100 MB." };

    const id = crypto.randomUUID();
    const path = storagePaths(id).original(ext);
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error) throw error;
    return { ok: true, id, path, token: data.token };
  } catch (e) {
    return fail(e);
  }
}

const finalizeSchema = z.object({
  id: z.uuid(),
  path: z.string(),
  title: z.string().trim().min(1, "Title is required.").max(120),
  slug: z.string().trim().max(80),
  featured: z.boolean(),
});

/** Step 2: derive web images from the uploaded original, then publish the row. */
export async function finalizeUpload(input: z.input<typeof finalizeSchema>): Promise<Result<{ slug: string }>> {
  let supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"] | null = null;
  const parsed = finalizeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { id, path, title, featured } = parsed.data;
  const paths = storagePaths(id);

  try {
    ({ supabase } = await requireAdmin());
    if (!/^original\.(png|jpg|webp)$/.test(path.slice(id.length + 1)) || !path.startsWith(`${id}/`)) {
      return { ok: false, error: "Invalid upload path." };
    }

    const { data: blob, error: dlError } = await supabase.storage.from(BUCKET).download(path);
    if (dlError) throw dlError;
    // Loaded on demand so the admin page itself never depends on the native image library.
    const { IMAGE_CACHE_CONTROL, processWallpaper } = await import("@/lib/images");
    const image = await processWallpaper(Buffer.from(await blob.arrayBuffer()));

    const store = supabase.storage.from(BUCKET);
    const uploads = await Promise.all([
      store.upload(paths.display, image.display, { contentType: "image/webp", cacheControl: IMAGE_CACHE_CONTROL }),
      store.upload(paths.screen, image.screen, { contentType: "image/webp", cacheControl: IMAGE_CACHE_CONTROL }),
    ]);
    const uploadError = uploads.find((u) => u.error)?.error;
    if (uploadError) throw uploadError;

    const slug = await uniqueSlug(supabase, slugify(parsed.data.slug || title) || "wallpaper");
    const { error: insertError } = await supabase.from("wallpapers").insert({
      id,
      title,
      slug,
      file_url: publicUrl(path),
      width: image.width,
      height: image.height,
      featured,
      blur_data_url: image.blurDataUrl,
    });
    if (insertError) throw insertError;

    refresh(slug);
    return { ok: true, slug };
  } catch (e) {
    if (supabase) {
      await supabase.storage.from(BUCKET).remove([path, paths.display, paths.screen]);
    }
    return fail(e);
  }
}

async function uniqueSlug(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], base: string) {
  const { data } = await supabase.from("wallpapers").select("slug").like("slug", `${base}%`);
  const taken = new Set((data ?? []).map((r) => r.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export async function setFeatured(id: string, featured: boolean): Promise<Result> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("wallpapers").update({ featured }).eq("id", id);
    if (error) throw error;
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function renameWallpaper(id: string, title: string): Promise<Result> {
  try {
    const clean = title.trim();
    if (!clean || clean.length > 120) return { ok: false, error: "Title must be 1–120 characters." };
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase.from("wallpapers").update({ title: clean }).eq("id", id).select("slug").single();
    if (error) throw error;
    refresh(data.slug);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteWallpaper(id: string): Promise<Result> {
  try {
    const { supabase } = await requireAdmin();
    const { data: row, error } = await supabase.from("wallpapers").delete().eq("id", id).select("slug").single();
    if (error) throw error;
    const { data: files } = await supabase.storage.from(BUCKET).list(id);
    if (files?.length) await supabase.storage.from(BUCKET).remove(files.map((f) => `${id}/${f.name}`));
    refresh(row.slug);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function signOut() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
