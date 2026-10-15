"use client";

import { PerformanceMonitor, View } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";

/**
 * One WebGL canvas for the whole site. Every 3D region on a page is a drei <View> that tracks a
 * DOM element; this canvas sits fixed above the content (pointer-events off) and draws each view
 * into its element's rectangle, so there is a single GL context no matter how many speakers show.
 */
export default function SceneCanvas() {
  const [dpr, setDpr] = useState(1.75);

  return (
    <Canvas
      className="scene-canvas"
      eventSource={document.body}
      eventPrefix="client"
      dpr={[1, dpr]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 30 }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.75)} />
      <View.Port />
    </Canvas>
  );
}
