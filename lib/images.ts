import "server-only";
import sharp from "sharp";

const ACCEPTED = new Set(["png", "jpeg", "webp"]);
import { IMMUTABLE_CACHE_SECONDS as IMMUTABLE } from "@/components/admin/constants";

export const IMAGE_CACHE_CONTROL = IMMUTABLE;

/** Validates an uploaded original and renders the web derivatives. */
export async function processWallpaper(input: Buffer) {
  const meta = await sharp(input).metadata();
  if (!meta.format || !ACCEPTED.has(meta.format)) {
    throw new Error("Unsupported image. Use PNG, JPEG or WebP.");
  }
  if (!meta.width || !meta.height) throw new Error("Could not read image dimensions.");

  // EXIF orientations 5–8 are rotated 90°, so the stored pixels are transposed.
  const rotated = (meta.orientation ?? 1) >= 5;
  const width = rotated ? meta.height : meta.width;
  const height = rotated ? meta.width : meta.height;

  const base = () => sharp(input).rotate();

  const [display, screen, blur] = await Promise.all([
    base().resize({ width: 2560, withoutEnlargement: true }).webp({ quality: 86 }).toBuffer(),
    base().resize(2560, 1600, { fit: "cover", position: "centre" }).webp({ quality: 90 }).toBuffer(),
    base().resize(24).webp({ quality: 40 }).toBuffer(),
  ]);

  return {
    width,
    height,
    display,
    screen,
    blurDataUrl: `data:image/webp;base64,${blur.toString("base64")}`,
  };
}
