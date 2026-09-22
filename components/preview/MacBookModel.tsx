"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { FINISHES, type Finish } from "./finishes";
import { Dock, useScreenMaterial } from "./screen";

// "Macbook pro 16 silver" by sugcx, CC BY 4.0, optimized with scripts/optimize-model.mjs.
const MODEL_URL = "/models/macbook-pro-16.glb";

const TARGET_WIDTH = 3.56; // 35.6 cm; the scene uses 1 unit = 10 cm
// Hinge line in the Lid's parent space, read off the lid and base bounds of the model.
const HINGE = new THREE.Vector3(0, -0.43, -11.43);
const OPEN_ANGLE = 0; // as authored, ~110° open
const CLOSED_ANGLE = 1.9;

type Prepared = {
  scene: THREE.Group;
  lidPivot: THREE.Group;
  aluminum: { material: THREE.MeshStandardMaterial; original: THREE.Color }[];
  screen: { mesh: THREE.Mesh; width: number; height: number; anchor: THREE.Group };
  scale: number;
  offset: THREE.Vector3;
};

/**
 * Measures the tilted screen panel and gives it fresh 0–1 UVs by projecting onto its own axes
 * (the optimizer drops the authored UVs along with the baked screenshot texture).
 */
function measureScreen(mesh: THREE.Mesh) {
  const geometry = mesh.geometry.clone();
  mesh.geometry = geometry;
  const pos = geometry.attributes.position;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    minX = Math.min(minX, pos.getX(i));
    maxX = Math.max(maxX, pos.getX(i));
    minY = Math.min(minY, pos.getY(i));
    maxY = Math.max(maxY, pos.getY(i));
  }

  // Bottom and top edge centers; the panel leans back, so they differ in z.
  const edge = (y: number) => {
    let z = 0, n = 0;
    for (let i = 0; i < pos.count; i++) {
      if (Math.abs(pos.getY(i) - y) < (maxY - minY) * 0.01) {
        z += pos.getZ(i);
        n++;
      }
    }
    return new THREE.Vector3((minX + maxX) / 2, y, z / n);
  };
  const bottom = edge(minY);
  const top = edge(maxY);
  const up = top.clone().sub(bottom);
  const height = up.length();
  up.normalize();
  const width = maxX - minX;
  const right = new THREE.Vector3(1, 0, 0);
  const normal = new THREE.Vector3().crossVectors(right, up);

  const uv = new Float32Array(pos.count * 2);
  const p = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i).sub(bottom);
    uv[i * 2] = (pos.getX(i) - minX) / width;
    uv[i * 2 + 1] = THREE.MathUtils.clamp(p.dot(up) / height, 0, 1);
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));

  // Anchor whose local axes are the screen's (x right, y up, z out), centered on the panel.
  const anchor = new THREE.Group();
  anchor.matrixAutoUpdate = false;
  anchor.matrix.makeBasis(right, up, normal).setPosition(bottom.clone().add(top).multiplyScalar(0.5));
  mesh.add(anchor);

  return { width, height, anchor };
}

function prepare(source: THREE.Group): Prepared {
  const scene = source.clone(true);
  const aluminum: Prepared["aluminum"] = [];
  const hsl = { h: 0, s: 0, l: 0 };

  scene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    // Own materials per instance so finish changes never leak into the loader cache.
    const material = (mesh.material as THREE.MeshStandardMaterial).clone();
    mesh.material = material;
    if (o.name !== "ScreenImage" && material.metalness >= 0.9 && material.color.getHSL(hsl).l > 0.85) {
      aluminum.push({ material, original: material.color.clone() });
    }
  });

  const screenMesh = scene.getObjectByName("ScreenImage") as THREE.Mesh;
  const screen = { mesh: screenMesh, ...measureScreen(screenMesh) };

  // Fit and ground the laptop while it's still open as authored.
  const box = new THREE.Box3().setFromObject(scene);
  const base = new THREE.Box3().setFromObject(scene.getObjectByName("Base")!);
  const scale = TARGET_WIDTH / (box.max.x - box.min.x);
  const offset = new THREE.Vector3(
    -((box.min.x + box.max.x) / 2) * scale,
    -box.min.y * scale,
    -((base.min.z + base.max.z) / 2) * scale,
  );

  // Re-parent the lid under a pivot on the hinge line so it can swing open.
  const lid = scene.getObjectByName("Lid")!;
  const lidPivot = new THREE.Group();
  lidPivot.position.copy(HINGE);
  lid.parent!.add(lidPivot);
  lidPivot.add(lid);
  lid.position.sub(HINGE);

  return { scene, lidPivot, aluminum, screen, scale, offset };
}

export function MacBookModel({
  finish,
  screenUrl,
  animate,
  onReady,
}: {
  finish: Finish;
  screenUrl: string;
  animate: boolean;
  onReady: () => void;
}) {
  const { scene } = useGLTF(MODEL_URL);
  const model = useMemo(() => prepare(scene), [scene]);
  const invalidate = useThree((s) => s.invalidate);
  const angle = useRef(animate ? CLOSED_ANGLE : OPEN_ANGLE);

  const { material, uniforms } = useScreenMaterial(screenUrl, model.screen.width / model.screen.height, onReady);

  useLayoutEffect(() => {
    model.screen.mesh.material = material;
    invalidate();
  }, [model, material, invalidate]);

  useLayoutEffect(() => {
    const tint = FINISHES[finish].tint;
    for (const { material: m, original } of model.aluminum) m.color.copy(tint ? new THREE.Color(tint) : original);
    invalidate();
  }, [model, finish, invalidate]);

  useFrame((state, delta) => {
    const diff = OPEN_ANGLE - angle.current;
    if (Math.abs(diff) > 0.0005) {
      angle.current += diff * (1 - Math.exp(-Math.min(delta, 1 / 30) * 3.2));
      state.invalidate();
    } else {
      angle.current = OPEN_ANGLE;
    }
    model.lidPivot.rotation.x = angle.current;
  });

  return (
    <group scale={model.scale} position={model.offset}>
      <primitive object={model.scene} />
      {createPortal(
        <Dock uniforms={uniforms} screenWidth={model.screen.width} screenHeight={model.screen.height} />,
        model.screen.anchor,
      )}
    </group>
  );
}

useGLTF.preload(MODEL_URL);
