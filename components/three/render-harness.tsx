"use client";

import { PerspectiveCamera, View } from "@react-three/drei";
import { useMemo } from "react";
import { getSpec } from "@/lib/catalog";
import { Speaker, defaultControls } from "@/components/three/speaker-models";
import { Studio } from "@/components/three/studio";

/** Camera directions matching the product photos, as [azimuth, elevation] in degrees. */
export const ANGLES = {
  frente: [0, 6],
  tresCuartos: [35, 14],
  lado: [-90, 4],
  atras: [180, 8],
  arriba: [0, 80]
} as const;

export type Angle = keyof typeof ANGLES;

function Shot({ handle, angle }: { handle: string; angle: Angle }) {
  const spec = getSpec(handle);
  const controls = useMemo(defaultControls, []);
  const [w, h, d] = spec.size;
  const [az, el] = ANGLES[angle].map((deg) => (deg * Math.PI) / 180);
  const fov = 24;
  const distance = (Math.max(w, h, d) * 1.5) / (2 * Math.tan(((fov / 2) * Math.PI) / 180));
  const position: [number, number, number] = [
    distance * Math.cos(el) * Math.sin(az),
    distance * Math.sin(el),
    distance * Math.cos(el) * Math.cos(az)
  ];

  return (
    <>
      <PerspectiveCamera makeDefault fov={fov} position={position} onUpdate={(camera) => camera.lookAt(0, 0, 0)} />
      <Studio floor={-h / 2} shadowOpacity={0.45} environmentIntensity={0.8} />
      <Speaker spec={spec} controls={controls} />
    </>
  );
}

/** Dev-only: one speaker from a fixed angle on a white backdrop, to compare against product photos. */
export default function RenderHarness({ handle, angle }: { handle: string; angle: Angle }) {
  return (
    <View className="absolute inset-0">
      <Shot handle={handle} angle={angle} />
    </View>
  );
}
