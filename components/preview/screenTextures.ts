import * as THREE from "three";

// Each 2560×1600 texture costs ~22 MB of GPU memory with mipmaps, so keep only a few.
const MAX_CACHED = 6;
const cache = new Map<string, Promise<THREE.Texture>>();
const loaded = new Map<string, THREE.Texture>();
const loader = new THREE.TextureLoader();
// Decodes off the main thread, so a texture arriving never stalls an animation frame. Safari and
// Firefox < 98 mishandle createImageBitmap options (the flip), so they use the regular loader,
// the same rule three.js's GLTFLoader applies.
function supportsBitmapFlip() {
  if (typeof createImageBitmap !== "function" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const safari = /^((?!chrome|android).)*safari/i.test(ua);
  const firefox = Number(ua.match(/Firefox\/(\d+)\./)?.[1] ?? Infinity);
  return !safari && firefox >= 98;
}
const bitmapLoader = supportsBitmapFlip()
  ? new THREE.ImageBitmapLoader().setOptions({ imageOrientation: "flipY", premultiplyAlpha: "none" })
  : null;

function fetchTexture(url: string): Promise<THREE.Texture> {
  if (!bitmapLoader) return loader.loadAsync(url);
  return bitmapLoader.loadAsync(url).then((bitmap) => {
    const tex = new THREE.Texture(bitmap);
    tex.flipY = false; // already flipped during decode (ImageBitmaps ignore flipY)
    tex.needsUpdate = true;
    return tex;
  });
}

function configure(tex: THREE.Texture) {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  tex.generateMipmaps = true; // the dock samples blurred mip levels for its frosted glass
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  return tex;
}

export function loadScreenTexture(url: string, inUse: Set<THREE.Texture>) {
  const hit = cache.get(url);
  if (hit) {
    // Refresh LRU position.
    cache.delete(url);
    cache.set(url, hit);
    return hit;
  }
  const promise = fetchTexture(url).then((tex) => {
    loaded.set(url, configure(tex));
    evict(inUse);
    return tex;
  });
  promise.catch(() => cache.delete(url));
  cache.set(url, promise);
  return promise;
}

function evict(inUse: Set<THREE.Texture>) {
  for (const url of cache.keys()) {
    if (cache.size <= MAX_CACHED) return;
    const tex = loaded.get(url);
    if (!tex || inUse.has(tex)) continue;
    tex.dispose();
    (tex.image as ImageBitmap | undefined)?.close?.();
    loaded.delete(url);
    cache.delete(url);
  }
}
