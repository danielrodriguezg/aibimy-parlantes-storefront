"use client";

import { PerformanceMonitor, View } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";

/**
 * One WebGL canvas for the whole site, used only for the abstract ornaments. Every ornament
 * layer is a drei <View> that tracks a DOM element; the canvas sits fixed *behind* the page
 * content (which is positioned above it in the layout), so ornaments never cover photos or copy.
 * Views that are off screen are skipped, so scrolled-away sections cost nothing.
 */
export default function SceneCanvas() {
  const [dpr, setDpr] = useState(1.5);

  return (
    <Canvas
      className="scene-canvas"
      eventSource={document.body}
      eventPrefix="client"
      dpr={[1, dpr]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
      <View.Port />
    </Canvas>
  );
}
