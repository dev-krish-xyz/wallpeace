import { BUCKET, SUPABASE_URL } from "./env";
import type { Wallpaper } from "@/types/database";

// Every wallpaper lives in its own immutable folder keyed by id:
//   {id}/original.{png|jpg|webp}  untouched master, served for download
//   {id}/display.webp             2560w, aspect preserved, used by the gallery
//   {id}/screen.webp              2560×1600 cover crop, the 3D screen texture
export const storagePaths = (id: string) => ({
  folder: id,
  display: `${id}/display.webp`,
  screen: `${id}/screen.webp`,
  original: (ext: string) => `${id}/original.${ext}`,
});

export const publicUrl = (path: string) => `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;

export const displayUrl = (w: Pick<Wallpaper, "id">) => publicUrl(storagePaths(w.id).display);
export const screenUrl = (w: Pick<Wallpaper, "id">) => publicUrl(storagePaths(w.id).screen);

export const originalExt = (w: Pick<Wallpaper, "file_url">) => w.file_url.split(".").pop() ?? "png";
