"use client";

import { ContactShadows } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

let studioEnvironment: THREE.Texture | null = null;

/** Studio reflections baked once from three's RoomEnvironment; no HDRI download needed. */
function getEnvironment(gl: THREE.WebGLRenderer) {
  if (!studioEnvironment) {
    const pmrem = new THREE.PMREMGenerator(gl);
    studioEnvironment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
  }
  return studioEnvironment;
}

/**
 * Lighting rig shared by every view: soft key from the front-left, cool rim from behind and
 * contact shadows on an invisible floor at `floor`. `shadowFrames` = Infinity for moving models.
 */
export function Studio({
  floor,
  environmentIntensity = 0.55,
  shadowOpacity = 0.55,
  shadowFrames = Infinity
}: {
  floor: number;
  environmentIntensity?: number;
  shadowOpacity?: number;
  shadowFrames?: number;
}) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useLayoutEffect(() => {
    scene.environment = getEnvironment(gl);
    scene.environmentIntensity = environmentIntensity;
  }, [gl, scene, environmentIntensity]);

  return (
    <>
      <ambientLight intensity={0.08} />
      <spotLight position={[-3.5, 5, 5]} angle={0.45} penumbra={1} intensity={55} decay={2} color="#fff4ea" />
      <directionalLight position={[4, 2.5, -4]} intensity={1.3} color="#d4dbff" />
      <directionalLight position={[0, -3, 3]} intensity={0.25} color="#ffffff" />
      <ContactShadows
        position={[0, floor - 0.001, 0]}
        opacity={shadowOpacity}
        scale={9}
        blur={2.4}
        far={3.5}
        resolution={512}
        frames={shadowFrames}
      />
    </>
  );
}
