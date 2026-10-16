"use client";

import { PerspectiveCamera, View } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { chapterWeight, stage } from "@/lib/stage-store";

/*
 * Abstract ornaments drawn behind the product photos: sound rings, light dust, rain and two
 * acrylic panels. They are never product replicas, take their colour from the speaker's light
 * (stage.hue) and react softly to scroll and pointer. The shared canvas sits behind the page,
 * so they can never cover the photos or the copy.
 */

type Variant = "home" | "product";

const additive = (opacity = 1) =>
  new THREE.MeshBasicMaterial({
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false
  });

/** Concentric rings leaving the product on a steady beat, like sound from a speaker. */
function SoundRings({ center, maxRadius, count }: { center: [number, number]; maxRadius: number; count: number }) {
  const rings = useMemo(
    () => Array.from({ length: count }, () => new THREE.Mesh(new THREE.RingGeometry(0.992, 1, 160), additive(0))),
    [count]
  );

  useFrame(({ clock }) => {
    const beat = 2.2;
    // Stronger in the "40 W" chapter, calm elsewhere.
    const energy = 0.55 + chapterWeight(stage.night, 2) * 0.7;
    rings.forEach((ring, i) => {
      const phase = (clock.elapsedTime / beat + i / count) % 1;
      const radius = 0.7 + phase * (maxRadius - 0.7);
      ring.scale.set(radius, radius, 1);
      const material = ring.material as THREE.MeshBasicMaterial;
      material.opacity = (1 - phase) ** 2 * 0.55 * energy * stage.power;
      material.color.setHSL((stage.hue + i * 0.03) % 1, 0.9, 0.62);
    });
  });

  return (
    <group position={[center[0], center[1], -1]}>
      {rings.map((ring, i) => (
        <primitive key={i} object={ring} />
      ))}
    </group>
  );
}

/** Soft round sprite for the dust, drawn once. */
function dotTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const context = canvas.getContext("2d")!;
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.45)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

/** Specks of coloured light drifting upward; scrolling stirs them, the pointer tilts the field. */
function LightDust({ count, width, height }: { count: number; width: number; height: number }) {
  const group = useRef<THREE.Group>(null);
  const lastNight = useRef(stage.night);
  const { geometry, speeds, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * width;
      positions[i * 3 + 1] = (Math.random() - 0.5) * height;
      positions[i * 3 + 2] = -3 + Math.random() * 3.5;
      speeds[i] = 0.05 + Math.random() * 0.18;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      size: 0.07,
      map: dotTexture(),
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    });
    return { geometry, speeds, material };
  }, [count, width, height]);

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.05);
    const stir = Math.min(4, Math.abs(stage.night - lastNight.current) * 900);
    lastNight.current = stage.night;
    const position = geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = position.getY(i) + speeds[i] * step * (1 + stir);
      if (y > height / 2) y = -height / 2;
      position.setY(i, y);
    }
    position.needsUpdate = true;
    material.color.setHSL(stage.hue, 0.6, 0.72);
    material.opacity = 0.65 * stage.power;
    if (group.current) {
      group.current.rotation.y += (stage.pointer.x * 0.12 - group.current.rotation.y) * 0.05;
      group.current.rotation.x += (stage.pointer.y * 0.06 - group.current.rotation.x) * 0.05;
    }
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={material} />
    </group>
  );
}

/** Falling streaks that only appear in the water chapter. */
function Rain({ width, height }: { width: number; height: number }) {
  const count = 160;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const drops = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * width,
        y: (Math.random() - 0.5) * height,
        z: -2 + Math.random() * 2,
        v: 4 + Math.random() * 3
      })),
    [width, height]
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const material = useMemo(() => additive(0), []);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    const wet = chapterWeight(stage.night, 3);
    mesh.current.visible = wet > 0.01;
    if (!mesh.current.visible) return;
    material.opacity = 0.35 * wet;
    material.color.setHSL(0.58, 0.4, 0.85);
    const step = Math.min(delta, 0.05);
    drops.forEach((drop, i) => {
      drop.y -= drop.v * step;
      if (drop.y < -height / 2) drop.y = height / 2;
      dummy.position.set(drop.x, drop.y, drop.z);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, material, count]} visible={false}>
      <planeGeometry args={[0.012, 0.32]} />
    </instancedMesh>
  );
}

function roundedSlab(width: number, height: number, radius: number) {
  const shape = new THREE.Shape();
  const w = width / 2;
  const h = height / 2;
  shape.moveTo(-w + radius, -h);
  shape.lineTo(w - radius, -h);
  shape.absarc(w - radius, -h + radius, radius, -Math.PI / 2, 0, false);
  shape.lineTo(w, h - radius);
  shape.absarc(w - radius, h - radius, radius, 0, Math.PI / 2, false);
  shape.lineTo(-w + radius, h);
  shape.absarc(-w + radius, h - radius, radius, Math.PI / 2, Math.PI, false);
  shape.lineTo(-w, -h + radius);
  shape.absarc(-w + radius, -h + radius, radius, Math.PI, Math.PI * 1.5, false);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 6,
    curveSegments: 24
  });
  geometry.center();
  return geometry;
}

/**
 * Two acrylic panels shaped like the speakers' light panels: a faint glass slab whose edges glow
 * in the speaker's colour, as if lit from inside.
 */
function GlassPanels({ width, height }: { width: number; height: number }) {
  const panels = useRef<THREE.Group>(null);
  const { geometry, edges, glass, glow } = useMemo(() => {
    const geometry = roundedSlab(1.5, 0.55, 0.27);
    return {
      geometry,
      edges: new THREE.EdgesGeometry(geometry, 30),
      glass: new THREE.MeshPhysicalMaterial({
        color: "#9aa4b8",
        roughness: 0.08,
        metalness: 0,
        clearcoat: 1,
        transparent: true,
        opacity: 0.1,
        depthWrite: false
      }),
      glow: new THREE.LineBasicMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })
    };
  }, []);

  useFrame(({ clock }) => {
    if (!panels.current) return;
    const t = clock.elapsedTime;
    glow.color.setHSL(stage.hue, 0.9, 0.62);
    glow.opacity = 0.55 * stage.power;
    panels.current.children.forEach((panel, i) => {
      panel.rotation.set(0.5 + Math.sin(t * 0.3 + i) * 0.2, t * 0.12 + i * 1.7, 0.4 + i * 0.6);
      panel.position.y = panel.userData.y + Math.sin(t * 0.5 + i * 2) * 0.12 - stage.night * (i ? 0.6 : 1.2);
    });
  });

  // Corners only: top right above the product, bottom left below the copy.
  const spots: Array<[number, number, number]> = [
    [width * 0.4, height * 0.36, -0.4],
    [-width * 0.36, -height * 0.4, -0.8]
  ];

  return (
    <group ref={panels}>
      {spots.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]} userData={{ y }} scale={i ? 0.8 : 1}>
          <mesh geometry={geometry} material={glass} />
          <lineSegments geometry={edges} material={glow} />
        </group>
      ))}
    </group>
  );
}

function Scene({ variant }: { variant: Variant }) {
  const viewport = useThree((state) => state.viewport);
  const size = useThree((state) => state.size);
  const portrait = size.width / size.height < 0.85;
  const small = size.width < 700;
  const { width, height } = viewport;

  // Ring centre follows where the product photo sits on the page.
  const center: [number, number] =
    variant === "product" ? [0, 0] : portrait ? [0, height * 0.18] : [width * 0.18, 0];

  return (
    <>
      <PerspectiveCamera makeDefault fov={35} position={[0, 0, 10]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      <SoundRings
        center={center}
        maxRadius={Math.min(width, height) * (variant === "product" ? 0.62 : 0.55)}
        count={small ? 5 : 8}
      />
      <LightDust count={variant === "product" ? (small ? 90 : 200) : small ? 220 : 600} width={width * 1.2} height={height * 1.2} />
      {variant === "home" && <Rain width={width} height={height} />}
      {variant === "home" && !small && <GlassPanels width={width} height={height} />}
    </>
  );
}

/** Ornament layer for a section; fills its positioned parent. */
export default function Ornaments({ variant }: { variant: Variant }) {
  return (
    <View className="pointer-events-none absolute inset-0">
      <Scene variant={variant} />
    </View>
  );
}
