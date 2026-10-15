"use client";

import { PerspectiveCamera, QuadraticBezierLine, View, type QuadraticBezierLineRef } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { getSpec } from "@/lib/catalog";
import { stage } from "@/lib/stage-store";
import { panelHue } from "@/components/three/materials";
import { Speaker, defaultControls } from "@/components/three/speaker-models";
import { Studio } from "@/components/three/studio";

type Key = {
  at: number;
  rotY: number;
  x: number;
  cam: [number, number, number];
  look: [number, number, number];
  explode: number;
  wet: number;
  twin: number;
};

/** One pose per chapter (inicio, luz, potencia, agua, pareja), placed at each chapter's center. */
const KEYS: Key[] = [
  { at: 0, rotY: -0.55, x: 2.0, cam: [0, 0.3, 10], look: [0.38, 0, 0], explode: 0, wet: 0, twin: 0 },
  { at: 0.1, rotY: -0.55, x: 2.0, cam: [0, 0.3, 10], look: [0.38, 0, 0], explode: 0, wet: 0, twin: 0 },
  { at: 0.3, rotY: -1.2, x: 1.8, cam: [0.3, 3.4, 8.2], look: [0.6, 0.35, 0], explode: 0, wet: 0, twin: 0 },
  { at: 0.5, rotY: -0.35, x: 1.8, cam: [0, 0.7, 11], look: [0.18, 0.1, 0], explode: 1, wet: 0, twin: 0 },
  { at: 0.7, rotY: -0.45, x: 1.6, cam: [0.2, 0.3, 7.4], look: [0.5, 0.05, 0], explode: 0, wet: 1, twin: 0 },
  { at: 0.9, rotY: -0.25, x: 1.3, cam: [0, 0.45, 12.5], look: [-0.36, 0, 0], explode: 0, wet: 0, twin: 1 },
  { at: 1, rotY: -0.25, x: 1.3, cam: [0, 0.45, 12.5], look: [-0.36, 0, 0], explode: 0, wet: 0, twin: 1 }
];

/** How far below the speaker the camera aims on tall screens, so the speaker rises above the copy. */
const PORTRAIT_DROP = 1.3;

/** Horizontal distance of each speaker from the pair's center in the last chapter. */
const PAIR_GAP = { wide: 1, tall: 0.8 };

const smooth = (t: number) => t * t * (3 - 2 * t);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function pose(progress: number): Key {
  const p = THREE.MathUtils.clamp(progress, 0, 1);
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].at) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = smooth(THREE.MathUtils.clamp((p - a.at) / (b.at - a.at || 1), 0, 1));
  return {
    at: p,
    rotY: mix(a.rotY, b.rotY, t),
    x: mix(a.x, b.x, t),
    cam: [mix(a.cam[0], b.cam[0], t), mix(a.cam[1], b.cam[1], t), mix(a.cam[2], b.cam[2], t)],
    look: [mix(a.look[0], b.look[0], t), mix(a.look[1], b.look[1], t), mix(a.look[2], b.look[2], t)],
    explode: mix(a.explode, b.explode, t),
    wet: mix(a.wet, b.wet, t),
    twin: mix(a.twin, b.twin, t)
  };
}

const DROPS = 90;
const RAIN = 140;

/** Beads of water sitting on the front fabric, sized by `wet`. */
function Droplets({ size, wet }: { size: [number, number, number]; wet: { value: number } }) {
  const [w, h, d] = size;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: DROPS }, () => ({
        x: (Math.random() - 0.5) * (w - d * 0.6) * 0.95,
        y: (Math.random() - 0.5) * (h - 0.3) * 0.95,
        s: 0.012 + Math.random() ** 2 * 0.045
      })),
    [w, h, d]
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        transmission: 1,
        thickness: 0.06,
        roughness: 0.04,
        ior: 1.33,
        color: "#ffffff",
        envMapIntensity: 1.6
      }),
    []
  );

  useFrame(() => {
    if (!mesh.current) return;
    mesh.current.visible = wet.value > 0.01;
    seeds.forEach((seed, i) => {
      const s = seed.s * wet.value;
      dummy.position.set(seed.x, seed.y, d / 2 + s * 0.35);
      dummy.scale.set(s, s * 1.15, s * 0.55);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, material, DROPS]}>
      <sphereGeometry args={[1, 16, 12]} />
    </instancedMesh>
  );
}

/** Falling streaks around the speaker during the water chapter. */
function Rain({ wet, center }: { wet: { value: number }; center: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const drops = useMemo(
    () =>
      Array.from({ length: RAIN }, () => ({
        x: (Math.random() - 0.5) * 4.5,
        z: (Math.random() - 0.5) * 3,
        y: Math.random() * 5 - 2,
        v: 5 + Math.random() * 3
      })),
    []
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#dfe8ff", transparent: true, opacity: 0, depthWrite: false }),
    []
  );

  useFrame((_, delta) => {
    if (!mesh.current) return;
    material.opacity = 0.32 * wet.value;
    mesh.current.visible = wet.value > 0.01;
    if (!mesh.current.visible) return;
    const step = stage.reducedMotion ? 0 : Math.min(delta, 0.05);
    drops.forEach((drop, i) => {
      drop.y -= drop.v * step;
      if (drop.y < -2) drop.y = 3;
      dummy.position.set(center + drop.x, drop.y, drop.z);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, material, RAIN]}>
      <cylinderGeometry args={[0.006, 0.006, 0.28, 4]} />
    </instancedMesh>
  );
}

function Stage({ handle, glbUrl }: { handle: string; glbUrl: string | null }) {
  const spec = getSpec(handle);
  const h = spec.size[1];
  const size = useThree((state) => state.size);
  const portrait = size.width / size.height < 0.85;

  const controls = useMemo(defaultControls, []);
  const twinControls = useMemo(defaultControls, []);
  const wet = useMemo(() => ({ value: 0 }), []);

  const camera = useRef<THREE.PerspectiveCamera>(null);
  const hero = useRef<THREE.Group>(null);
  const twin = useRef<THREE.Group>(null);
  const link = useRef<QuadraticBezierLineRef>(null);
  const current = useRef<Key>(pose(0));
  const lookAt = useMemo(() => new THREE.Vector3(), []);
  const startedAt = useRef<number | null>(null);

  // On tall screens the speaker sits centered in the upper half and the copy goes below it.
  const baseY = portrait ? 0.9 : 0;
  const floor = baseY - h / 2;
  const gap = portrait ? PAIR_GAP.tall : PAIR_GAP.wide;
  const pairX = portrait ? 0 : KEYS[KEYS.length - 1].x;
  const top = baseY + h / 2 + 0.15;

  useFrame(({ clock }, delta) => {
    const target = pose(stage.night);
    const now = current.current;
    const k = stage.reducedMotion ? 1 : 1 - Math.exp(-delta * 6);
    now.rotY = mix(now.rotY, target.rotY, k);
    now.x = mix(now.x, target.x, k);
    now.explode = mix(now.explode, target.explode, k);
    now.twin = mix(now.twin, target.twin, k);
    now.wet = mix(now.wet, target.wet, k);
    now.cam = now.cam.map((v, i) => mix(v, target.cam[i], k)) as Key["cam"];
    now.look = now.look.map((v, i) => mix(v, target.look[i], k)) as Key["look"];

    // The one orchestrated moment: the panels power up over the first second and a half.
    if (startedAt.current === null) startedAt.current = clock.elapsedTime;
    const ramp = stage.reducedMotion ? 1 : smooth(Math.min(1, (clock.elapsedTime - startedAt.current) / 1.6));
    controls.power = twinControls.power = ramp;
    controls.explode = now.explode;
    wet.value = now.wet;
    stage.power = ramp;
    stage.hue = panelHue(clock.elapsedTime);

    const idle = stage.reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.4) * 0.08;
    const offsetX = portrait ? 0 : now.x;
    const zoom = portrait ? 1.75 : 1;

    if (hero.current) {
      hero.current.position.set(offsetX - now.twin * gap, baseY, 0);
      hero.current.rotation.y = now.rotY + idle + stage.pointer.x * 0.14;
      hero.current.rotation.x = stage.pointer.y * 0.05;
    }
    if (twin.current) {
      twin.current.visible = now.twin > 0.01;
      twin.current.position.set(offsetX + gap + (1 - now.twin) * 3, baseY, -0.2);
      twin.current.rotation.y = -now.rotY * 0.6 + idle;
    }
    if (link.current) {
      const material = link.current.material as THREE.Material & { color: THREE.Color; dashOffset: number };
      link.current.visible = now.twin > 0.4;
      material.opacity = Math.max(0, (now.twin - 0.4) / 0.6);
      material.color.setHSL(stage.hue, 0.9, 0.62);
      if (!stage.reducedMotion) material.dashOffset -= delta * 0.6;
    }
    if (camera.current) {
      camera.current.position.set(now.cam[0], now.cam[1] + baseY * 0.6, now.cam[2] * zoom);
      // On tall screens the speaker (or the pair) is centered horizontally and sits in the top
      // third: the camera aims at x = 0 and below the speaker, leaving the lower half for the copy.
      lookAt.set(portrait ? 0 : now.look[0], now.look[1] + baseY - (portrait ? PORTRAIT_DROP : 0), now.look[2]);
      camera.current.lookAt(lookAt);
    }
  });

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault fov={26} near={0.1} far={60} position={[0, 0.25, 9]} />
      <Studio floor={floor} />
      <group ref={hero}>
        <Speaker spec={spec} glbUrl={glbUrl} controls={controls} />
        {spec.shape === "prism" && !glbUrl && <Droplets size={spec.size} wet={wet} />}
      </group>
      <group ref={twin} visible={false}>
        <Speaker spec={spec} glbUrl={glbUrl} controls={twinControls} hueOffset={0.5} />
      </group>
      {/* The TWS link: a dashed arc between the two speakers, tinted with the panels. */}
      <QuadraticBezierLine
        ref={link}
        start={[pairX - gap, top, 0]}
        end={[pairX + gap, top, -0.2]}
        mid={[pairX, top + 0.9, -0.1]}
        lineWidth={2}
        dashed
        dashSize={0.08}
        gapSize={0.06}
        transparent
        visible={false}
      />
      <Rain wet={wet} center={portrait ? 0 : KEYS[4].x} />
    </>
  );
}

/** The 3D region of the home's night chapters; fills its sticky parent. */
export default function HomeStage({ handle, glbUrl }: { handle: string; glbUrl: string | null }) {
  return (
    <View className="absolute inset-0">
      <Stage handle={handle} glbUrl={glbUrl} />
    </View>
  );
}
