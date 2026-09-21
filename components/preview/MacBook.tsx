"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { FINISHES, type Finish } from "./finishes";

// Real-world MacBook Pro 14" proportions, 1 unit = 10 cm.
const W = 3.126;
const D = 2.212;
const BASE_H = 0.1;
const LID_T = 0.05;
const HINGE_Z = -D / 2 + 0.03;

// Display area: 1.54:1 panel with thin bezels and a small chin.
const SCREEN_W = 2.98;
const SCREEN_H = 1.935;
const SCREEN_Y = D - 0.055 - SCREEN_H / 2;

const OPEN_ANGLE = -0.2; // radians past vertical, ~101° open
const CLOSED_ANGLE = Math.PI / 2 - 0.02;

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return new THREE.ShapeGeometry(s, 12);
}

// Key rows in key units; each row sums to 14u.
const KEY_ROWS: { widths: number[]; depth: number }[] = [
  { widths: Array(14).fill(1), depth: 0.55 },
  { widths: Array(14).fill(1), depth: 1 },
  { widths: [1.5, ...Array(11).fill(1), 1.5], depth: 1 },
  { widths: [1.75, ...Array(10).fill(1), 2.25], depth: 1 },
  { widths: [2.25, ...Array(10).fill(1), 1.75], depth: 1 },
  { widths: [1, 1, 1, 1.25, 5.5, 1.25, 1, 1, 1], depth: 1 },
];
const KEY_U = 2.6 / 14;
const KEY_GAP = 0.022;
const KEYBOARD_BACK_Z = HINGE_Z + 0.17;

function Keyboard() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const keys = useMemo(() => {
    const out: { x: number; z: number; w: number; d: number }[] = [];
    let z = KEYBOARD_BACK_Z;
    for (const row of KEY_ROWS) {
      const d = row.depth * KEY_U;
      let x = -(14 * KEY_U) / 2;
      for (const u of row.widths) {
        const w = u * KEY_U;
        out.push({ x: x + w / 2, z: z + d / 2, w: w - KEY_GAP, d: d - KEY_GAP });
        x += w;
      }
      z += d;
    }
    return out;
  }, []);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    keys.forEach((k, i) => {
      m.compose(new THREE.Vector3(k.x, BASE_H + 0.003, k.z), new THREE.Quaternion(), new THREE.Vector3(k.w, 1, k.d));
      ref.current!.setMatrixAt(i, m);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [keys]);

  const depth = KEY_ROWS.reduce((a, r) => a + r.depth, 0) * KEY_U;
  const well = useMemo(() => roundedRect(14 * KEY_U + 0.05, depth + 0.05, 0.03), [depth]);

  return (
    <group>
      <mesh geometry={well} rotation-x={-Math.PI / 2} position={[0, BASE_H + 0.0008, KEYBOARD_BACK_Z + depth / 2]}>
        <meshStandardMaterial color="#0c0c0d" roughness={0.9} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, keys.length]}>
        <boxGeometry args={[1, 0.003, 1]} />
        <meshStandardMaterial color="#101011" roughness={0.7} metalness={0.05} envMapIntensity={0.4} />
      </instancedMesh>
    </group>
  );
}

function Base({ finish }: { finish: Finish }) {
  const f = FINISHES[finish];
  const trackpad = useMemo(() => roundedRect(1.31, 0.82, 0.04), []);
  const grille = useMemo(() => roundedRect(0.13, 1.04, 0.02), []);
  const keyboardDepth = KEY_ROWS.reduce((a, r) => a + r.depth, 0) * KEY_U;
  const grilleZ = KEYBOARD_BACK_Z + keyboardDepth / 2;

  return (
    <group>
      <RoundedBox args={[W, BASE_H, D]} radius={0.045} smoothness={6} position={[0, BASE_H / 2, 0]}>
        <meshStandardMaterial color={f.body} metalness={0.85} roughness={0.32} />
      </RoundedBox>
      <Keyboard />
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          geometry={grille}
          rotation-x={-Math.PI / 2}
          position={[side * 1.44, BASE_H + 0.0008, grilleZ]}
        >
          <meshStandardMaterial color={f.detail} metalness={0.5} roughness={0.7} />
        </mesh>
      ))}
      <mesh geometry={trackpad} rotation-x={-Math.PI / 2} position={[0, BASE_H + 0.0008, D / 2 - 0.12 - 0.41]}>
        <meshStandardMaterial color={f.trackpad} metalness={0.6} roughness={0.22} />
      </mesh>
      {/* Hinge barrel, visible as a dark line where lid meets base */}
      <mesh rotation-z={Math.PI / 2} position={[0, BASE_H - 0.005, HINGE_Z - 0.01]}>
        <cylinderGeometry args={[0.028, 0.028, W * 0.84, 24]} />
        <meshStandardMaterial color="#111" metalness={0.6} roughness={0.5} />
      </mesh>
    </group>
  );
}

function Screen({ url }: { url: string }) {
  const texture = useTexture(url, (t) => {
    const tex = t as THREE.Texture;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    // screen.webp is 16:10; the panel is slightly taller, so cover-crop horizontally.
    const panel = SCREEN_W / SCREEN_H;
    const image = 16 / 10;
    tex.repeat.set(panel / image, 1);
    tex.offset.set((1 - panel / image) / 2, 0);
  });
  return (
    <mesh position={[0, SCREEN_Y, 0.0016]}>
      <planeGeometry args={[SCREEN_W, SCREEN_H]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function Lid({ finish, screenUrl, animate }: { finish: Finish; screenUrl: string; animate: boolean }) {
  const f = FINISHES[finish];
  const ref = useRef<THREE.Group>(null);
  const angle = useRef(animate ? CLOSED_ANGLE : OPEN_ANGLE);
  const bezel = useMemo(() => roundedRect(W - 0.03, D - 0.03, 0.1), []);
  const notch = useMemo(() => roundedRect(0.34, 0.07, 0.025), []);

  useFrame((state, delta) => {
    const g = ref.current;
    if (!g) return;
    const diff = OPEN_ANGLE - angle.current;
    if (Math.abs(diff) > 0.0005) {
      angle.current += diff * (1 - Math.exp(-Math.min(delta, 1 / 30) * 3.2));
      state.invalidate();
    } else {
      angle.current = OPEN_ANGLE;
    }
    g.rotation.x = angle.current;
  });

  return (
    <group ref={ref} position={[0, BASE_H, HINGE_Z]} rotation-x={animate ? CLOSED_ANGLE : OPEN_ANGLE}>
      <RoundedBox args={[W, D, LID_T]} radius={0.022} smoothness={6} position={[0, D / 2, -LID_T / 2]}>
        <meshStandardMaterial color={f.body} metalness={0.85} roughness={0.3} />
      </RoundedBox>
      <mesh geometry={bezel} position={[0, D / 2, 0.0008]}>
        <meshStandardMaterial color="#050506" roughness={0.25} metalness={0.2} />
      </mesh>
      <Screen url={screenUrl} />
      <mesh geometry={notch} position={[0, D - 0.015 - 0.035, 0.0024]}>
        <meshBasicMaterial color="#050506" />
      </mesh>
    </group>
  );
}

export function MacBook({ finish, screenUrl, animate }: { finish: Finish; screenUrl: string; animate: boolean }) {
  return (
    <group>
      <Base finish={finish} />
      <Lid finish={finish} screenUrl={screenUrl} animate={animate} />
    </group>
  );
}
