"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { drawDock } from "./dockIcons";
import { loadScreenTexture } from "./screenTextures";

const CROSSFADE_SECONDS = 0.22;
const WALLPAPER_ASPECT = 16 / 10; // screen.webp is rendered at 2560×1600

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const screenFragment = /* glsl */ `
  uniform sampler2D mapA;
  uniform sampler2D mapB;
  uniform float mixT;
  uniform vec2 repeat;
  uniform vec2 offset;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv * repeat + offset;
    vec3 c = mix(texture2D(mapA, uv).rgb, texture2D(mapB, uv).rgb, mixT);
    // Faint diagonal sheen from the cover glass.
    c += smoothstep(0.62, 1.1, vUv.x * 0.55 + vUv.y * 0.75) * 0.03;
    gl_FragColor = vec4(c, 1.0);
    #include <colorspace_fragment>
  }
`;

// Frosted glass: samples a blurred mip of the wallpaper behind the dock, then composites the icons.
const dockFragment = /* glsl */ `
  uniform sampler2D mapA;
  uniform sampler2D mapB;
  uniform sampler2D icons;
  uniform float mixT;
  uniform vec2 repeat;
  uniform vec2 offset;
  uniform vec4 rect;
  uniform vec2 size;
  uniform float radius;
  varying vec2 vUv;

  float sdRoundRect(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 uv = (rect.xy + vUv * rect.zw) * repeat + offset;
    vec3 behind = mix(texture2D(mapA, uv, 5.0).rgb, texture2D(mapB, uv, 5.0).rgb, mixT);
    vec3 glass = mix(behind, vec3(1.0), 0.32);

    vec2 p = (vUv - 0.5) * size;
    float d = sdRoundRect(p, size * 0.5, radius);
    float aa = fwidth(d);
    float mask = 1.0 - smoothstep(-aa, aa, d);
    float rim = 1.0 - smoothstep(0.0, aa * 2.0, abs(d + aa * 1.2));
    glass += rim * mix(0.18, 0.55, vUv.y);

    vec4 ic = texture2D(icons, vUv);
    vec3 color = mix(glass, ic.rgb, ic.a);
    gl_FragColor = vec4(color, mask * 0.97);
    #include <colorspace_fragment>
  }
`;

type ScreenUniforms = {
  mapA: { value: THREE.Texture };
  mapB: { value: THREE.Texture };
  mixT: { value: number };
  repeat: { value: THREE.Vector2 };
  offset: { value: THREE.Vector2 };
};

/**
 * Shader material for a screen whose UVs span 0–1, crossfading between wallpapers.
 * `aspect` is the panel's width / height; the 16:10 wallpaper is cover-cropped to fit.
 */
export function useScreenMaterial(url: string, aspect: number, onReady: () => void) {
  const invalidate = useThree((s) => s.invalidate);
  const fading = useRef(false);
  const readySent = useRef(false);

  const uniforms = useMemo<ScreenUniforms>(() => {
    const black = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
    black.needsUpdate = true;
    const wide = aspect > WALLPAPER_ASPECT;
    const repeat = wide ? new THREE.Vector2(1, WALLPAPER_ASPECT / aspect) : new THREE.Vector2(aspect / WALLPAPER_ASPECT, 1);
    return {
      mapA: { value: black },
      mapB: { value: black },
      mixT: { value: 1 },
      repeat: { value: repeat },
      offset: { value: new THREE.Vector2((1 - repeat.x) / 2, (1 - repeat.y) / 2) },
    };
  }, [aspect]);

  const material = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader, fragmentShader: screenFragment, uniforms }),
    [uniforms],
  );

  useEffect(() => {
    let cancelled = false;
    const inUse = () => new Set([uniforms.mapA.value, uniforms.mapB.value]);
    loadScreenTexture(url, inUse).then((tex) => {
      if (cancelled || tex === uniforms.mapB.value) return;
      if (!readySent.current) {
        uniforms.mapA.value = tex;
        uniforms.mapB.value = tex;
        uniforms.mixT.value = 1;
        readySent.current = true;
        onReady();
      } else {
        // Whatever is visible now becomes the fade-out layer.
        uniforms.mapA.value = uniforms.mixT.value < 0.5 ? uniforms.mapA.value : uniforms.mapB.value;
        uniforms.mapB.value = tex;
        uniforms.mixT.value = 0;
        fading.current = true;
      }
      invalidate();
    });
    return () => {
      cancelled = true;
    };
  }, [url, uniforms, invalidate, onReady]);

  useFrame((state, delta) => {
    if (!fading.current) return;
    uniforms.mixT.value = Math.min(1, uniforms.mixT.value + delta / CROSSFADE_SECONDS);
    if (uniforms.mixT.value < 1) state.invalidate();
    else fading.current = false;
  });

  return { material, uniforms };
}

/** macOS dock, sized relative to the screen, in the screen's own plane (x right, y up, +z out). */
export function Dock({
  uniforms,
  screenWidth,
  screenHeight,
}: {
  uniforms: ScreenUniforms;
  screenWidth: number;
  screenHeight: number;
}) {
  const { material, width, height, y } = useMemo(() => {
    const { canvas, aspect } = drawDock();
    const icons = new THREE.CanvasTexture(canvas);
    icons.colorSpace = THREE.SRGBColorSpace;
    icons.anisotropy = 8;
    const height = screenHeight * 0.058;
    const width = height * aspect;
    const y = -screenHeight / 2 + screenHeight * 0.0125 + height / 2;
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: dockFragment,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      uniforms: {
        ...uniforms,
        icons: { value: icons },
        rect: {
          value: new THREE.Vector4(
            (screenWidth / 2 - width / 2) / screenWidth,
            (y - height / 2 + screenHeight / 2) / screenHeight,
            width / screenWidth,
            height / screenHeight,
          ),
        },
        size: { value: new THREE.Vector2(width, height) },
        radius: { value: height * 0.34 },
      },
    });
    return { material, width, height, y };
  }, [uniforms, screenWidth, screenHeight]);

  return (
    <mesh position={[0, y, screenHeight * 0.001]} material={material} renderOrder={1}>
      <planeGeometry args={[width, height]} />
    </mesh>
  );
}
