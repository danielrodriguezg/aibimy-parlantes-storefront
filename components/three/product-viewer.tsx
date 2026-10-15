"use client";

import { OrbitControls, PerspectiveCamera, View } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { getSpec } from "@/lib/catalog";
import { stage } from "@/lib/stage-store";
import { Speaker, defaultControls } from "@/components/three/speaker-models";
import { Studio } from "@/components/three/studio";

const FOV = 28;

/** What the product page's buttons ask for; the frame loop eases toward it. */
export type ViewerTargets = { lights: boolean; inside: boolean };

type Props = { handle: string; glbUrl: string | null; targets: ViewerTargets };

function Model({ handle, glbUrl, targets }: Props) {
  const spec = getSpec(handle);
  const [w, h] = spec.size;
  const controls = useMemo(() => ({ ...defaultControls(), power: 0 }), []);

  // Frame the speaker with some air around it, whatever its proportions.
  const distance = Math.max(h * 1.35, w * 1.9) / (2 * Math.tan((FOV / 2) * (Math.PI / 180)));

  useFrame((_, delta) => {
    const k = stage.reducedMotion ? 1 : 1 - Math.exp(-delta * 4);
    controls.power += ((targets.lights ? 1 : 0) - controls.power) * k;
    controls.explode += ((targets.inside ? 1 : 0) - controls.explode) * k;
  });

  return (
    <>
      <PerspectiveCamera makeDefault fov={FOV} position={[distance * 0.45, h * 0.25, distance * 0.9]} />
      <OrbitControls
        makeDefault
        target={[0, 0, 0]}
        enablePan={false}
        minDistance={distance * 0.6}
        maxDistance={distance * 1.4}
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.55}
        autoRotate={!stage.reducedMotion}
        autoRotateSpeed={0.7}
        enableDamping
      />
      <Studio floor={-h / 2} shadowOpacity={0.6} />
      <Speaker spec={spec} glbUrl={glbUrl} controls={controls} />
    </>
  );
}

/** drei connects the view's events to its own div, so dragging only turns the speaker inside it. */
export default function ProductViewer(props: Props) {
  return (
    <View className="absolute inset-0">
      <Model {...props} />
    </View>
  );
}
