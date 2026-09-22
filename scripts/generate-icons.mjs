#!/usr/bin/env node
// Builds every site icon from the artwork in assets/icon-source.png.
// Usage: node scripts/generate-icons.mjs
//
// The source is a squircle on a white canvas with a soft glow, so the squircle is cut out with a
// superellipse mask (n = 5, the macOS icon shape) to get clean transparent corners.
//
// Outputs (Next.js picks up the app/ files and writes the <head> tags itself):
//   app/favicon.ico         16, 32, 48   browser tabs, bookmarks, legacy
//   app/icon.png            192          modern browsers (PNG favicon, Retina)
//   app/apple-icon.png      180          iOS/macOS home screen; opaque, the system rounds it
//   public/icon-192.png     192          web app manifest
//   public/icon-512.png     512          web app manifest
//   public/logo.webp        512          in-page logo (toolbar, admin login); full color, served as-is so it stays
//                                        sharp under browser zoom on Retina screens
import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const SOURCE = "assets/icon-source.png";
// Squircle bounds in the source image, measured from its edges.
const BOX = { left: 88, top: 81, right: 1163, bottom: 1144 };
const EXPONENT = 5;
const INSET = 2; // px trimmed off the rim so none of the white glow survives the mask

const width = BOX.right - BOX.left + 1;
const height = BOX.bottom - BOX.top + 1;

function squirclePath(w, h, inset, n, steps = 720) {
  const a = w / 2 - inset;
  const b = h / 2 - inset;
  const points = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = w / 2 + a * Math.sign(c) * Math.abs(c) ** (2 / n);
    const y = h / 2 + b * Math.sign(s) * Math.abs(s) ** (2 / n);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return `M${points.join("L")}Z`;
}

// The artwork's top-left corner is a pale, washed-out highlight while the top right is deep blue.
// A multiply pass, strongest in that corner and fading out well before the penguin, evens them out.
const toning = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs><radialGradient id="t" cx="0" cy="0" r="${width * 0.7}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="rgb(56,122,255)"/>
      <stop offset="0.45" stop-color="rgb(150,190,255)"/>
      <stop offset="1" stop-color="#fff"/>
    </radialGradient></defs>
    <rect width="100%" height="100%" fill="url(#t)"/>
  </svg>`,
);
const crop = sharp(
  await sharp(SOURCE)
    .extract({ left: BOX.left, top: BOX.top, width, height })
    .composite([{ input: toning, blend: "multiply" }])
    .png()
    .toBuffer(),
);
const mask = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><path d="${squirclePath(width, height, INSET, EXPONENT)}" fill="#fff"/></svg>`,
);

// Transparent-cornered master at 1024².
const master = await sharp(await crop.clone().ensureAlpha().composite([{ input: mask, blend: "dest-in" }]).png().toBuffer())
  .resize(1024, 1024, { fit: "fill", kernel: "lanczos3" })
  .png()
  .toBuffer();

// Quantized PNG: ~6x smaller, no visible banding on this artwork.
const PNG = { palette: true, quality: 95, effort: 10, dither: 0.6 };
const png = (size) => sharp(master).resize(size, size, { kernel: "lanczos3" }).png(PNG).toBuffer();

// ICO with embedded PNGs (supported by every current browser and Windows Vista+).
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + images.length * 16;
  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const icoSizes = [16, 32, 48];
const outputs = {
  "app/favicon.ico": ico(await Promise.all(icoSizes.map(async (size) => ({ size, data: await png(size) })))),
  "app/icon.png": await png(192),
  // Full-bleed square, no transparency: iOS fills transparent pixels with black and applies its own mask.
  "app/apple-icon.png": await crop
    .clone()
    .resize(180, 180, { fit: "fill", kernel: "lanczos3" })
    .flatten({ background: "#ffffff" })
    .png(PNG)
    .toBuffer(),
  "public/icon-192.png": await png(192),
  "public/icon-512.png": await png(512),
  "public/logo.webp": await sharp(master).resize(512, 512, { kernel: "lanczos3" }).webp({ quality: 92, alphaQuality: 100, smartSubsample: true, effort: 6 }).toBuffer(),
};

for (const [path, data] of Object.entries(outputs)) {
  await writeFile(path, data);
  console.log(`${path}  ${(data.length / 1024).toFixed(1)} KB`);
}
