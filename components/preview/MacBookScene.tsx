"use client";

import { Suspense, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Box3, PerspectiveCamera, Vector3 } from "three";
import type { Group } from "three";
import { ContactShadows, Environment, Lightformer, OrbitControls, PresentationControls } from "@react-three/drei";
import { MacBookModel } from "./MacBookModel";
import type { Finish } from "./finishes";

const TARGET: [number, number, number] = [0, 0.95, -0.5];
// The camera always sits along this line from the target, so the laptop is seen from the same
// angle everywhere — phone, desktop and full screen. Only how far along it moves.
const EYE = new Vector3(0, 0.75, 6.5);
const EYE_LENGTH = EYE.length();
// Full screen puts the camera much further back, where perspective flattens the laptop and hides
// its body; looking down more brings the keyboard deck back into view.
const EYE_FULLSCREEN = new Vector3(0, 2.1, 6.5);
const PHONE = "(max-width: 639px)";
// Phones have 3x screens; rendering at 2x there makes the wallpaper on the screen look soft.
const isPhone = () => typeof window !== "undefined" && window.matchMedia(PHONE).matches;

// Breathing room around the laptop in full screen: 1 would touch the edges.
const FULLSCREEN_MARGIN = 1.12;

/**
 * How far back the camera has to sit, along `dir` from `center`, for every corner of `box` to land
 * inside the frustum. Exact rather than a bounding sphere, so the laptop actually fills the frame.
 */
function fitDistance(box: Box3, center: Vector3, dir: Vector3, vFov: number, aspect: number) {
  const back = dir.clone().normalize(); // center → camera
  const right = new Vector3(0, 1, 0).cross(back).normalize();
  const up = back.clone().cross(right).normalize();
  const tanV = Math.tan(vFov / 2);
  const tanH = tanV * aspect;
  const corner = new Vector3();
  let distance = 0;
  for (let i = 0; i < 8; i++) {
    corner.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).sub(center);
    const depth = corner.dot(back); // toward the camera, so it needs even more room
    distance = Math.max(distance, depth + Math.abs(corner.dot(right)) / tanH, depth + Math.abs(corner.dot(up)) / tanV);
  }
  return distance;
}

/** Keeps the whole laptop in frame on any aspect ratio. */
function Framing({ fullscreen, ready }: { fullscreen: boolean; ready: boolean }) {
  const { camera, size, invalidate, scene } = useThree();
  // In full screen OrbitControls drives the camera; it has to be told the new framing, or it puts
  // the camera straight back where it was.
  const controls = useThree((s) => s.controls) as { target: Vector3; update: () => void } | null;
  // Switching to full screen swaps the controls, which remounts the laptop: the first attempt can
  // run before it exists, so it is retried each frame until there is something to measure. The lid
  // also opens over the first moments, growing the laptop, so the fit repeats until it settles.
  const pending = useRef(false);
  const lastDistance = useRef(0);
  const settled = useRef(0);

  const apply = useCallback(() => {
    const aspect = size.width / size.height;
    const laptop = scene.getObjectByName("laptop");
    if (fullscreen && !laptop) {
      pending.current = true;
      return;
    }
    pending.current = false;
    // Full screen measures the laptop and backs off until the whole of it fits, with a margin.
    if (fullscreen && laptop) {
      const box = new Box3().setFromObject(laptop);
      const center = box.getCenter(new Vector3());
      const vFov = ((camera as PerspectiveCamera).fov * Math.PI) / 180;
      const distance = FULLSCREEN_MARGIN * fitDistance(box, center, EYE_FULLSCREEN, vFov, aspect);
      settled.current = Math.abs(distance - lastDistance.current) < 0.005 ? settled.current + 1 : 0;
      lastDistance.current = distance;
      camera.position.copy(EYE_FULLSCREEN).normalize().multiplyScalar(distance).add(center);
      camera.lookAt(center);
      camera.updateProjectionMatrix();
      if (controls) {
        controls.target.copy(center);
        controls.update();
      }
      invalidate();
      return;
    }
    const distance = EYE_LENGTH * (isPhone() ? 0.96 : 1) * Math.max(1, 1.62 / aspect);
    camera.position.copy(EYE).normalize().multiplyScalar(distance).add(new Vector3(...TARGET));
    camera.lookAt(...TARGET);
    camera.updateProjectionMatrix();
    if (controls) {
      controls.target.set(...TARGET);
      controls.update();
    }
    invalidate();
  }, [camera, size, invalidate, fullscreen, controls, scene]);

  // `ready` is when the laptop has loaded; entering full screen also changes `size`.
  useLayoutEffect(() => {
    lastDistance.current = 0;
    settled.current = 0;
    apply();
  }, [apply, ready]);

  // Once the fit has held steady for a few frames the camera is left alone, so zoom and pan stick.
  useFrame(() => {
    if (pending.current || (fullscreen && settled.current < 6)) apply();
  });

  return null;
}

// Yaw at the outermost view stops (about 40°).
const MAX_VIEW_ANGLE = 0.7;

/** Eases the laptop's yaw toward the view control's value. */
function ViewRig({ view, children }: { view: number; children: React.ReactNode }) {
  const ref = useRef<Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  const target = view * MAX_VIEW_ANGLE;
  useEffect(() => invalidate(), [target, invalidate]);
  useFrame((state, delta) => {
    const g = ref.current;
    if (!g) return;
    const diff = target - g.rotation.y;
    if (Math.abs(diff) < 0.0005) {
      g.rotation.y = target;
      return;
    }
    g.rotation.y += diff * (1 - Math.exp(-Math.min(delta, 1 / 30) * 6));
    state.invalidate();
  });
  return (
    <group ref={ref} name="laptop">
      {children}
    </group>
  );
}

export default function MacBookScene({
  screenUrl,
  finish,
  view,
  animate,
  fullscreen = false,
  ready = false,
  onReady,
}: {
  screenUrl: string;
  finish: Finish;
  view: number;
  animate: boolean;
  fullscreen?: boolean;
  /** The laptop has loaded, so it can be measured for the full-screen fit. */
  ready?: boolean;
  onReady: () => void;
}) {
  const model = <MacBookModel finish={finish} screenUrl={screenUrl} animate={animate} onReady={onReady} />;
  return (
    <Canvas
      // Full screen adds inertia to the controls, which needs every frame while it settles.
      frameloop={fullscreen ? "always" : "demand"}
      dpr={isPhone() ? [1, 3] : [1, 2]}
      camera={{ fov: 28, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className={fullscreen ? "!touch-none" : "!touch-pan-y"}
    >
      <Framing fullscreen={fullscreen} ready={ready} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 6, 4]} intensity={0.5} />

      <Suspense fallback={null}>
        {fullscreen ? (
          <>
            {/* Drag or one finger turns it, scroll or pinch zooms, two fingers pan. */}
            <OrbitControls
              makeDefault
              target={TARGET}
              enableDamping
              dampingFactor={0.12}
              rotateSpeed={0.55}
              zoomSpeed={0.9}
              panSpeed={0.8}
              minDistance={1.6}
              maxDistance={16}
              minPolarAngle={0.2}
              maxPolarAngle={Math.PI / 2.02}
            />
            <ViewRig view={view}>{model}</ViewRig>
          </>
        ) : (
          <PresentationControls global snap cursor speed={1.4} polar={[-0.08, 0.18]} azimuth={[-0.6, 0.6]} damping={0.25}>
            <ViewRig view={view}>{model}</ViewRig>
          </PresentationControls>
        )}
      </Suspense>
      <ContactShadows position={[0, -0.002, 0]} opacity={0.38} scale={9} blur={2.6} far={1.4} resolution={512} />

      {/* Soft studio: rectangular light panels instead of a downloaded HDR. */}
      <Environment resolution={512} frames={1}>
        <Lightformer form="rect" intensity={2.6} position={[0, 5, 1]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={1.3} position={[-6, 2, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1} position={[6, 2, 2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={0.5} position={[0, 1.5, 7]} scale={[8, 2, 1]} />
        {/* Large soft key light above and behind the viewer: what the keyboard deck and lid edges reflect. */}
        <Lightformer form="rect" intensity={1} position={[0, 6, 5]} rotation-x={-Math.PI / 4} scale={[12, 4, 1]} />
        <Lightformer form="ring" intensity={0.5} position={[0, 3, -6]} scale={3} />
      </Environment>
    </Canvas>
  );
}
