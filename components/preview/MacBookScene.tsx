"use client";

import { Suspense, useEffect, useLayoutEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, PerformanceMonitor, PresentationControls } from "@react-three/drei";
import { MacBook } from "./MacBook";
import type { Finish } from "./finishes";

const TARGET: [number, number, number] = [0, 0.88, -0.45];

/** Keeps the whole laptop in frame on any aspect ratio. */
function Framing() {
  const { camera, size, invalidate } = useThree();
  useLayoutEffect(() => {
    const aspect = size.width / size.height;
    const distance = 5.6 * Math.max(1, 1.7 / aspect);
    camera.position.set(0, 1.55, distance);
    camera.lookAt(...TARGET);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size, invalidate]);
  return null;
}

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return null;
}

export default function MacBookScene({
  screenUrl,
  finish,
  animate,
  onReady,
}: {
  screenUrl: string;
  finish: Finish;
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
      <PerformanceMonitor />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 6, 4]} intensity={0.6} />

      <Suspense fallback={null}>
        <PresentationControls
          global
          snap
          cursor
          speed={1.4}
          polar={[-0.08, 0.18]}
          azimuth={[-0.6, 0.6]}
          damping={0.25}
        >
          <MacBook finish={finish} screenUrl={screenUrl} animate={animate} />
        </PresentationControls>
        <ContactShadows position={[0, -0.002, 0]} opacity={0.42} scale={9} blur={2.6} far={1.4} resolution={512} />
        <Ready onReady={onReady} />
      </Suspense>

      {/* Soft studio: rectangular light panels instead of a downloaded HDR. */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 1]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[-6, 2, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.1} position={[6, 2, 2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[0, 1.5, 7]} scale={[8, 2, 1]} />
        <Lightformer form="ring" intensity={0.6} position={[0, 3, -6]} scale={3} />
      </Environment>
    </Canvas>
  );
}
