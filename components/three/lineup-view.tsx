"use client";

import { PerspectiveCamera, View } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type * as THREE from "three";
import { getSpec } from "@/lib/catalog";
import { stage } from "@/lib/stage-store";
import { Speaker, defaultControls } from "@/components/three/speaker-models";
import { Studio } from "@/components/three/studio";

/** Shared by every cell: same camera and floor, so the five models keep their relative size. */
const FLOOR = -1.2;
const CAMERA: [number, number, number] = [0, 0.25, 8.4];

function Model({ handle, glbUrl, hover }: { handle: string; glbUrl: string | null; hover: { value: boolean } }) {
  const spec = getSpec(handle);
  const controls = useMemo(defaultControls, []);
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!group.current) return;
    // Hovering the cell turns the speaker to show its side, where the light panels are.
    const target = hover.value ? -1.05 : -0.4;
    const k = stage.reducedMotion ? 1 : 1 - Math.exp(-delta * 5);
    group.current.rotation.y += (target - group.current.rotation.y) * k;
  });

  return (
    <>
      <PerspectiveCamera makeDefault fov={26} position={CAMERA} onUpdate={(camera) => camera.lookAt(0, 0, 0)} />
      <Studio floor={FLOOR} shadowOpacity={0.4} shadowFrames={3} environmentIntensity={0.7} />
      <group ref={group} position={[0, FLOOR + spec.size[1] / 2, 0]} rotation={[0, -0.4, 0]}>
        <Speaker spec={spec} glbUrl={glbUrl} controls={controls} />
      </group>
    </>
  );
}

/** One cell of the lineup. `hover` is flipped by the DOM cell around it. */
export default function LineupView({
  handle,
  glbUrl,
  hover
}: {
  handle: string;
  glbUrl: string | null;
  hover: { value: boolean };
}) {
  return (
    <View className="absolute inset-0">
      <Model handle={handle} glbUrl={glbUrl} hover={hover} />
    </View>
  );
}
