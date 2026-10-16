"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SceneCanvas = dynamic(() => import("@/components/three/scene-canvas"), { ssr: false });

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Mounts the ornament canvas after hydration; skipped without WebGL or with reduced motion. */
export function SceneRoot() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(!calm && hasWebGL());
  }, []);

  return enabled ? <SceneCanvas /> : null;
}
