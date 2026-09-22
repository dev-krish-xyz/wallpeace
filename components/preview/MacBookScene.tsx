"use client";

import { Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import { ContactShadows, Environment, Lightformer, PresentationControls } from "@react-three/drei";
import { MacBookModel } from "./MacBookModel";
import type { Finish } from "./finishes";

const TARGET: [number, number, number] = [0, 0.95, -0.5];

/** Keeps the whole laptop in frame on any aspect ratio. */
function Framing() {
  const { camera, size, invalidate } = useThree();
  useLayoutEffect(() => {
    const aspect = size.width / size.height;
    const distance = 6.6 * Math.max(1, 1.62 / aspect);
    camera.position.set(0, 1.7, distance);
    camera.lookAt(...TARGET);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size, invalidate]);
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
  return <group ref={ref}>{children}</group>;
}

export default function MacBookScene({
  screenUrl,
  finish,
  view,
  animate,
  onReady,
}: {
  screenUrl: string;
  finish: Finish;
  view: number;
  animate: boolean;
  onReady: () => void;
}) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      camera={{ fov: 28, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="!touch-pan-y"
    >
      <Framing />
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 6, 4]} intensity={0.5} />

      <Suspense fallback={null}>
        <PresentationControls global snap cursor speed={1.4} polar={[-0.08, 0.18]} azimuth={[-0.6, 0.6]} damping={0.25}>
          <ViewRig view={view}>
            <MacBookModel finish={finish} screenUrl={screenUrl} animate={animate} onReady={onReady} />
          </ViewRig>
        </PresentationControls>
      </Suspense>
      <ContactShadows position={[0, -0.002, 0]} opacity={0.38} scale={9} blur={2.6} far={1.4} resolution={1024} />

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
