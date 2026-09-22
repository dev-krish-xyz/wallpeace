#!/usr/bin/env node
// Optimizes the MacBook GLB for the web without touching geometric detail.
// Usage: node scripts/optimize-model.mjs <input.glb> [output.glb]
//
// Model: "Macbook pro 16 silver" by sugcx, CC BY 4.0
// https://sketchfab.com/3d-models/macbook-pro-16-silver-3a53a9dba68f45a48f4fd216fb43ca02
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, meshopt, prune, textureCompress, weld } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";
import sharp from "sharp";

const [input, output = "public/models/macbook-pro-16.glb"] = process.argv.slice(2);
if (!input) throw new Error("Usage: node scripts/optimize-model.mjs <input.glb> [output.glb]");

await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder });
const doc = await io.read(input);
const root = doc.getRoot();

// The screen shows our wallpaper through a custom shader, so its baked screenshot textures are dead weight.
const screen = root.listNodes().find((n) => n.getName() === "ScreenImage");
if (!screen) throw new Error("ScreenImage node not found");
for (const prim of screen.getMesh().listPrimitives()) {
  const mat = prim.getMaterial().clone().setName("Screen").setBaseColorTexture(null).setEmissiveTexture(null);
  prim.setMaterial(mat);
}

// Stable names the runtime relies on.
root.listNodes().find((n) => n.getName() === "ARpwzuPTqKUtTvA")?.setName("Lid");
root.listNodes().find((n) => n.getName() === "EpuXMUANKiZsiTr")?.setName("Base");

await doc.transform(
  dedup(),
  prune(),
  weld(),
  textureCompress({ encoder: sharp, targetFormat: "webp", resize: [1024, 1024], quality: 90 }),
  meshopt({ encoder: MeshoptEncoder, level: "medium" }),
);

await io.write(output, doc);
console.log(`Wrote ${output}`);
