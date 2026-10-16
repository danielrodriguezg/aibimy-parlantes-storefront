"use client";

import { PerspectiveCamera, QuadraticBezierLine, View, type QuadraticBezierLineRef } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { chapterWeight, stage } from "@/lib/stage-store";

/*
 * Abstract ornaments that accompany the whole page: sound rings, light dust and orbs, light
 * beams, an equalizer, link arcs, rain and acrylic panels. They are never product replicas, take
 * their colour from the speaker's light (stage.hue), follow the Lenis scroll (stage.scroll /
 * stage.velocity) and the pointer, and keep to the margins. The shared canvas sits behind the
 * page, so they can never cover photos, prices or copy.
 *
 * Variants: "home" (night chapters), "product" (gallery), "night" (any dark section) and "day"
 * (the light compare/buy sections: the canvas paints the daylight background itself and the
 * ornaments switch to a quiet, ink-toned version).
 */

type Variant = "home" | "product" | "night" | "day";
type Tone = "night" | "day";

/** Daylight background, painted by the canvas behind day sections (same as --color-dia). */
const DAY = "#e8e9ed";

const additive = (opacity = 1) =>
  new THREE.MeshBasicMaterial({
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false
  });

/** Concentric rings leaving the product on a steady beat, like sound from a speaker. */
function SoundRings({
  center,
  maxRadius,
  count,
  tone = "night"
}: {
  center: [number, number];
  maxRadius: number;
  count: number;
  tone?: Tone;
}) {
  const rings = useMemo(
    () =>
      Array.from({ length: count }, () => {
        const material = additive(0);
        if (tone === "day") material.blending = THREE.NormalBlending;
        return new THREE.Mesh(new THREE.RingGeometry(0.992, 1, 160), material);
      }),
    [count, tone]
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
      const fade = (1 - phase) ** 2 * energy * stage.power;
      material.opacity = fade * (tone === "day" ? 0.22 : 0.55);
      material.color.setHSL((stage.hue + i * 0.03) % 1, tone === "day" ? 0.5 : 0.9, tone === "day" ? 0.42 : 0.62);
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
function LightDust({ count, width, height, tone = "night" }: { count: number; width: number; height: number; tone?: Tone }) {
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
      size: tone === "day" ? 0.05 : 0.07,
      map: dotTexture(),
      transparent: true,
      opacity: 0.7,
      blending: tone === "day" ? THREE.NormalBlending : THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    });
    return { geometry, speeds, material };
  }, [count, width, height, tone]);

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.05);
    const stir = Math.min(4, Math.abs(stage.night - lastNight.current) * 900 + Math.abs(stage.velocity) * 0.08);
    lastNight.current = stage.night;
    const position = geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = position.getY(i) + speeds[i] * step * (1 + stir);
      if (y > height / 2) y = -height / 2;
      position.setY(i, y);
    }
    position.needsUpdate = true;
    material.color.setHSL(stage.hue, tone === "day" ? 0.45 : 0.6, tone === "day" ? 0.38 : 0.72);
    material.opacity = (tone === "day" ? 0.28 : 0.65) * stage.power;
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
function GlassPanels({
  spots,
  tone = "night",
  drift = 1
}: {
  /** positions in world units, kept to the margins of the section */
  spots: Array<[number, number, number]>;
  tone?: Tone;
  /** how far the panels travel against the scroll (parallax) */
  drift?: number;
}) {
  const panels = useRef<THREE.Group>(null);
  const { geometry, edges, glass, glow } = useMemo(() => {
    const geometry = roundedSlab(1.5, 0.55, 0.27);
    return {
      geometry,
      edges: new THREE.EdgesGeometry(geometry, 30),
      glass: new THREE.MeshPhysicalMaterial({
        color: tone === "day" ? "#ffffff" : "#9aa4b8",
        roughness: 0.08,
        metalness: 0,
        clearcoat: 1,
        transparent: true,
        opacity: tone === "day" ? 0.45 : 0.1,
        depthWrite: false
      }),
      glow: new THREE.LineBasicMaterial({
        transparent: true,
        blending: tone === "day" ? THREE.NormalBlending : THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false
      })
    };
  }, [tone]);

  useFrame(({ clock }) => {
    if (!panels.current) return;
    const t = clock.elapsedTime;
    glow.color.setHSL(stage.hue, tone === "day" ? 0.7 : 0.9, tone === "day" ? 0.5 : 0.62);
    glow.opacity = (tone === "day" ? 0.5 : 0.55) * stage.power;
    // Scroll speed adds a little spin; scroll progress slides them against the page.
    const spin = stage.velocity * 0.004;
    panels.current.children.forEach((panel, i) => {
      panel.rotation.set(0.5 + Math.sin(t * 0.3 + i) * 0.2, t * 0.12 + i * 1.7 + spin, 0.4 + i * 0.6);
      panel.position.y =
        panel.userData.y + Math.sin(t * 0.5 + i * 2) * 0.12 - (stage.night + stage.scroll) * drift * (i ? 0.6 : 1.2);
      panel.position.x = panel.userData.x + stage.pointer.x * 0.12 * (i + 1);
    });
  });

  return (
    <group ref={panels}>
      {spots.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]} userData={{ x, y }} scale={i ? 0.8 : 1}>
          <mesh geometry={geometry} material={glass} />
          <lineSegments geometry={edges} material={glow} />
        </group>
      ))}
    </group>
  );
}

/** Radial falloff sprite for the light orbs and beams, drawn once. */
let glowTexture: THREE.Texture | null = null;
function getGlowTexture() {
  if (glowTexture) return glowTexture;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d")!;
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.35)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  glowTexture = new THREE.CanvasTexture(canvas);
  return glowTexture;
}

/**
 * Large soft orbs of coloured light living in the side margins. Each sits at its own depth, so
 * scrolling and the pointer move them at different speeds (parallax); their colours walk through
 * the spectrum as the page scrolls.
 */
function LightOrbs({ width, height, count, tone }: { width: number; height: number; count: number; tone: Tone }) {
  const orbs = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const side = i % 2 ? 1 : -1;
        const material = new THREE.MeshBasicMaterial({
          map: getGlowTexture(),
          transparent: true,
          depthWrite: false,
          toneMapped: false,
          blending: tone === "day" ? THREE.NormalBlending : THREE.AdditiveBlending
        });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
        const depth = 0.4 + Math.random() * 0.8;
        mesh.userData = {
          x: side * width * (0.38 + Math.random() * 0.14),
          y: (Math.random() - 0.5) * height,
          z: -1.5 - depth * 2,
          size: Math.min(width, height) * (0.25 + Math.random() * 0.3),
          depth,
          hue: i * 0.17
        };
        return mesh;
      }),
    [width, height, count, tone]
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const span = height * 1.4;
    orbs.forEach((orb) => {
      const { x, y, z, size, depth, hue } = orb.userData;
      // Wrap vertically so orbs keep coming as you scroll the whole page.
      const travel = (((y + stage.scroll * span * depth * 2 + span / 2) % span) + span) % span;
      orb.position.set(x + stage.pointer.x * depth * 0.4, travel - span / 2, z);
      const pulse = 1 + Math.sin(t * 0.8 + hue * 10) * 0.06 + Math.min(0.3, Math.abs(stage.velocity) * 0.01);
      orb.scale.setScalar(size * pulse);
      const material = orb.material as THREE.MeshBasicMaterial;
      material.color.setHSL((stage.hue + hue + stage.scroll * 0.6) % 1, tone === "day" ? 0.75 : 0.85, tone === "day" ? 0.62 : 0.55);
      material.opacity = (tone === "day" ? 0.32 : 0.42) * stage.power;
    });
  });

  return (
    <group>
      {orbs.map((orb, i) => (
        <primitive key={i} object={orb} />
      ))}
    </group>
  );
}

/** Two tall, slanted beams of light that sweep across the dark sections as you scroll. */
function LightBeams({ width, height }: { width: number; height: number }) {
  const beams = useMemo(
    () =>
      [0, 1].map((i) => {
        const material = new THREE.MeshBasicMaterial({
          map: getGlowTexture(),
          transparent: true,
          depthWrite: false,
          toneMapped: false,
          blending: THREE.AdditiveBlending
        });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
        mesh.userData = { offset: i * 0.5 };
        return mesh;
      }),
    []
  );

  useFrame(() => {
    beams.forEach((beam, i) => {
      const phase = ((stage.scroll * 1.6 + beam.userData.offset) % 1) * 2 - 1;
      beam.position.set(phase * width * 0.6, 0, -3.5);
      beam.rotation.z = (i ? -1 : 1) * 0.35;
      beam.scale.set(width * 0.16, height * 1.8, 1);
      const material = beam.material as THREE.MeshBasicMaterial;
      material.color.setHSL((stage.hue + i * 0.3) % 1, 0.8, 0.5);
      material.opacity = 0.16 * stage.power * (1 - Math.abs(phase) * 0.6);
    });
  });

  return (
    <group>
      {beams.map((beam, i) => (
        <primitive key={i} object={beam} />
      ))}
    </group>
  );
}

/** A row of equalizer bars along the bottom edge; they jump with the beat and the scroll speed. */
function Equalizer({ width, height, bars, tone }: { width: number; height: number; bars: number; tone: Tone }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const material = useMemo(() => {
    const m = additive(tone === "day" ? 0.22 : 0.4);
    if (tone === "day") m.blending = THREE.NormalBlending;
    return m;
  }, [tone]);
  const gap = width / bars;

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime;
    const energy = 0.35 + Math.min(1, Math.abs(stage.velocity) * 0.03);
    for (let i = 0; i < bars; i++) {
      const x = -width / 2 + gap * (i + 0.5);
      const wave = Math.abs(Math.sin(t * 2.4 + i * 0.55) * Math.sin(t * 1.1 + i * 0.23));
      const h = height * 0.012 + wave * height * 0.07 * energy;
      dummy.position.set(x, -height / 2 + h / 2, -2);
      dummy.scale.set(gap * 0.42, h, 1);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
      color.setHSL((stage.hue + i / bars + stage.scroll * 0.4) % 1, tone === "day" ? 0.5 : 0.85, tone === "day" ? 0.45 : 0.6);
      mesh.current.setColorAt(i, color);
    }
    material.opacity = (tone === "day" ? 0.22 : 0.4) * stage.power;
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, material, bars]}>
      <planeGeometry args={[1, 1]} />
    </instancedMesh>
  );
}

/** Dashed "link" arcs between the upper corners, like the TWS connection, flowing with scroll. */
function LinkArcs({ width, height, tone }: { width: number; height: number; tone: Tone }) {
  const arcs = useRef<Array<QuadraticBezierLineRef | null>>([]);
  useFrame((_, delta) => {
    arcs.current.forEach((arc, i) => {
      if (!arc) return;
      const material = arc.material as THREE.Material & { color: THREE.Color; dashOffset: number; opacity: number };
      material.color.setHSL((stage.hue + 0.5 + i * 0.2) % 1, tone === "day" ? 0.5 : 0.85, tone === "day" ? 0.4 : 0.62);
      material.opacity = (tone === "day" ? 0.25 : 0.4) * stage.power;
      material.dashOffset -= delta * (0.3 + Math.abs(stage.velocity) * 0.02);
    });
  });
  const y = height * 0.42;
  return (
    <>
      {[0, 1].map((i) => (
        <QuadraticBezierLine
          key={i}
          ref={(node) => {
            arcs.current[i] = node;
          }}
          start={[-width * 0.48, y - i * height * 0.84, -2.5]}
          end={[-width * 0.3, y - i * height * 0.84 - height * 0.08, -2.5]}
          mid={[-width * 0.4, y - i * height * 0.84 + height * 0.1, -2.5]}
          lineWidth={1.5}
          dashed
          dashSize={0.08}
          gapSize={0.07}
          transparent
        />
      ))}
    </>
  );
}

/**
 * Off the home page nothing else drives the light, so the ornaments ramp `power` up on load and
 * let `hue` drift slowly with time and scroll.
 */
function LightDriver() {
  const started = useRef<number | null>(null);
  useFrame(({ clock }) => {
    if (stage.chaptersActive) return;
    if (started.current === null) started.current = clock.elapsedTime;
    const t = clock.elapsedTime - started.current;
    stage.power = Math.min(1, t / 1.6);
    stage.hue = (0.07 + clock.elapsedTime * 0.04 + stage.scroll * 0.5) % 1;
  });
  return null;
}

function Scene({ variant }: { variant: Variant }) {
  const viewport = useThree((state) => state.viewport);
  const size = useThree((state) => state.size);
  const portrait = size.width / size.height < 0.85;
  const small = size.width < 700;
  const { width, height } = viewport;
  const tone: Tone = variant === "day" ? "day" : "night";

  // Ring centre follows where the product photo sits on the page.
  const center: [number, number] =
    variant === "product" ? [0, 0] : portrait ? [0, height * 0.18] : [width * 0.18, 0];

  return (
    <>
      {tone === "day" && <color attach="background" args={[DAY]} />}
      <PerspectiveCamera makeDefault fov={35} position={[0, 0, 10]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      <LightDriver />

      {(variant === "home" || variant === "product") && (
        <SoundRings
          center={center}
          maxRadius={Math.min(width, height) * (variant === "product" ? 0.62 : 0.55)}
          count={small ? 5 : 8}
        />
      )}
      {variant === "day" && !small && (
        <SoundRings center={[width * 0.46, height * 0.3]} maxRadius={Math.min(width, height) * 0.5} count={5} tone="day" />
      )}

      <LightOrbs width={width} height={height} count={small ? 2 : variant === "product" ? 3 : 4} tone={tone} />
      {(variant === "night" || variant === "home") && <LightBeams width={width} height={height} />}

      <LightDust
        count={variant === "home" ? (small ? 220 : 600) : small ? 70 : 180}
        width={width * 1.2}
        height={height * 1.2}
        tone={tone}
      />

      {(variant === "night" || variant === "day") && (
        <Equalizer width={width} height={height} bars={small ? 18 : 42} tone={tone} />
      )}
      {(variant === "night" || variant === "day") && !small && <LinkArcs width={width} height={height} tone={tone} />}

      {variant === "home" && <Rain width={width} height={height} />}
      {!small && variant !== "product" && (
        <GlassPanels
          tone={tone}
          drift={variant === "home" ? 1 : 0.5}
          spots={
            variant === "home"
              ? [
                  [width * 0.4, height * 0.36, -0.4],
                  [-width * 0.36, -height * 0.4, -0.8]
                ]
              : tone === "day"
                ? [
                    // Daylight: right margin only, clear of headings and tables.
                    [width * 0.47, -height * 0.26, -1.2],
                    [width * 0.48, height * 0.3, -1.6]
                  ]
                : [
                    [width * 0.44, -height * 0.28, -1.2],
                    [-width * 0.46, height * 0.3, -1.6]
                  ]
          }
        />
      )}
    </>
  );
}

/** Ornament layer for a section; fills its positioned parent. */
export default function Ornaments({ variant }: { variant: Variant }) {
  // Day layers paint the section background, so they overlap their neighbours by 2 px to
  // leave no seam where two views meet.
  return (
    <View className={`pointer-events-none absolute ${variant === "day" ? "-inset-[2px]" : "inset-0"}`}>
      <Scene variant={variant} />
    </View>
  );
}
