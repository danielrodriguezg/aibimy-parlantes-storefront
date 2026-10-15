"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import type { ComponentProps } from "react";
import * as THREE from "three";
import type { SpeakerSpec } from "@/lib/catalog";
import {
  PanelMode,
  getLogoTexture,
  glossBlack,
  makeFabric,
  makePanel,
  matteBlack,
  metal,
  rope,
  rubberOrange
} from "@/components/three/materials";

/** Values the parent changes every frame (scroll, toggles) without re-rendering the model. */
export type SpeakerControls = {
  /** 0..1 brightness of the RGB panels */
  power: number;
  /** 0..1 exploded view: shell fades, caps lift, drivers come forward (prisms only) */
  explode: number;
};

export const defaultControls = (): SpeakerControls => ({ power: 1, explode: 0 });

type ModelProps = { spec: SpeakerSpec; controls: SpeakerControls; hueOffset?: number };

/* ---------- shapes ---------- */

function squircleShape(rx: number, ry: number, exponent = 4.2, segments = 128) {
  const shape = new THREE.Shape();
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = rx * Math.sign(c) * Math.abs(c) ** (2 / exponent);
    const y = ry * Math.sign(s) * Math.abs(s) ** (2 / exponent);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  return shape;
}

function roundedRectPath<T extends THREE.Path>(path: T, width: number, height: number, radius: number) {
  const w = width / 2;
  const h = height / 2;
  const r = Math.min(radius, w, h);
  path.moveTo(-w + r, -h);
  path.lineTo(w - r, -h);
  path.absarc(w - r, -h + r, r, -Math.PI / 2, 0, false);
  path.lineTo(w, h - r);
  path.absarc(w - r, h - r, r, 0, Math.PI / 2, false);
  path.lineTo(-w + r, h);
  path.absarc(-w + r, h - r, r, Math.PI / 2, Math.PI, false);
  path.lineTo(-w, -h + r);
  path.absarc(-w + r, -h + r, r, Math.PI, Math.PI * 1.5, false);
  return path;
}

const roundedRect = (width: number, height: number, radius: number) =>
  roundedRectPath(new THREE.Shape(), width, height, radius);

const capsule = (width: number, height: number) => roundedRect(width, height, Math.min(width, height) / 2);

/** A capsule band: `outer` minus a hole of `inner`. */
function band(outer: [number, number], inner: [number, number]) {
  const shape = capsule(...outer);
  shape.holes.push(roundedRectPath(new THREE.Path(), inner[0], inner[1], Math.min(...inner) / 2));
  return shape;
}

/** Bends a flat XY geometry around a vertical cylinder of `radius`, centered at `angle` (0 = +Z). */
function wrapToCylinder(geometry: THREE.BufferGeometry, radius: number, angle: number) {
  const position = geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const theta = angle + x / radius;
    const r = radius + position.getZ(i);
    position.setXYZ(i, r * Math.sin(theta), position.getY(i), r * Math.cos(theta));
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

/** Flat strap that follows `points`, lying across `side` (unit vector of its width). */
function ribbon(points: THREE.Vector3[], width: number, side: THREE.Vector3) {
  const samples = new THREE.CatmullRomCurve3(points).getPoints(48);
  const vertices: number[] = [];
  const indices: number[] = [];
  samples.forEach((point, i) => {
    const a = point.clone().addScaledVector(side, width / 2);
    const b = point.clone().addScaledVector(side, -width / 2);
    vertices.push(a.x, a.y, a.z, b.x, b.y, b.z);
    if (i > 0) {
      const o = (i - 1) * 2;
      indices.push(o, o + 1, o + 2, o + 1, o + 3, o + 2);
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/* ---------- shared pieces ---------- */

/** Reads the display font next/font registered on <html>, once it has loaded. */
function useDisplayFont() {
  const [family, setFamily] = useState<string | null>(null);
  useEffect(() => {
    const value = getComputedStyle(document.documentElement).getPropertyValue("--font-display").trim() || "sans-serif";
    let cancelled = false;
    document.fonts
      .load(`600 100px ${value}`)
      .catch(() => undefined)
      .then(() => {
        if (!cancelled) setFamily(value);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return family;
}

/** Material printing the orange wordmark; stays empty until the display font is ready. */
function useLogoMaterial() {
  const family = useDisplayFont();
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        transparent: true,
        roughness: 0.7,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        visible: false
      }),
    []
  );
  useEffect(() => {
    if (!family) return;
    material.map = getLogoTexture(family);
    material.visible = true;
    material.needsUpdate = true;
  }, [family, material]);
  return material;
}

function Logo({ width, ...props }: { width: number } & ComponentProps<"mesh">) {
  const material = useLogoMaterial();
  return (
    <mesh material={material} {...props}>
      <planeGeometry args={[width, width / 4]} />
    </mesh>
  );
}

/** Advances every RGB panel's clock and brightness each frame. */
function usePanels(panels: THREE.ShaderMaterial[], controls: SpeakerControls) {
  useFrame(({ clock }) => {
    for (const panel of panels) {
      panel.uniforms.uTime.value = clock.elapsedTime;
      panel.uniforms.uPower.value = controls.power;
    }
  });
}

/* ---------- puck: MY262BT Pro, MY362BT ---------- */

function Puck({ spec }: ModelProps) {
  const [w, h, d] = spec.size;
  const parts = useMemo(() => {
    const bevelThickness = d * 0.28;
    const bevelSize = Math.min(w, h) * 0.08;
    const depth = d - bevelThickness * 2;
    const body = new THREE.ExtrudeGeometry(squircleShape(w / 2 - bevelSize, h / 2 - bevelSize), {
      depth,
      bevelEnabled: true,
      bevelThickness,
      bevelSize,
      bevelSegments: 12,
      curveSegments: 128
    });
    body.translate(0, 0, -depth / 2);

    const back = new THREE.ExtrudeGeometry(squircleShape(w / 2 - bevelSize * 2.2, h / 2 - bevelSize * 2.2), {
      depth: 0.04,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 4,
      curveSegments: 96
    });
    back.translate(0, 0, -d / 2 - 0.035);

    // The cord loops out of the upper right edge, like in the product photos.
    const ax = w / 2 - bevelSize * 0.6;
    const ay = h * 0.3;
    const az = -d * 0.12;
    const loop = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(ax, ay, az),
        new THREE.Vector3(ax + 0.16, ay - 0.12, az + 0.05),
        new THREE.Vector3(ax + 0.26, -h * 0.2, az + 0.12),
        new THREE.Vector3(ax + 0.17, -h * 0.5, az + 0.14),
        new THREE.Vector3(ax + 0.06, -h * 0.26, az + 0.04)
      ],
      true
    );
    const cord = new THREE.TubeGeometry(loop, 160, 0.028 * (w / 1.5 + 0.4), 12, true);

    return { body, back, cord, fabric: makeFabric(), plastic: matteBlack(), rope: rope() };
  }, [w, h, d]);

  return (
    <group>
      <mesh geometry={parts.body} material={parts.fabric} castShadow />
      <mesh geometry={parts.back} material={parts.plastic} />
      {spec.strap && <mesh geometry={parts.cord} material={parts.rope} castShadow />}
      <Logo width={w * 0.56} position={[0, -h * 0.02, d / 2 + 0.004]} />
    </group>
  );
}

/* ---------- prism: MY264BT, MY274BT ---------- */

function Driver({ radius }: { radius: number }) {
  const parts = useMemo(() => {
    const profile = [
      [0, 0.06],
      [radius * 0.18, 0.06],
      [radius * 0.22, 0.02],
      [radius * 0.78, 0.12],
      [radius * 0.88, 0.15],
      [radius * 0.98, 0.12],
      [radius, 0.1]
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const cone = new THREE.LatheGeometry(profile, 64);
    cone.rotateX(Math.PI / 2);
    return { cone, paper: matteBlack(), cap: rubberOrange(), steel: metal() };
  }, [radius]);
  return (
    <group>
      <mesh geometry={parts.cone} material={parts.paper} />
      <mesh material={parts.cap} position={[0, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[radius * 0.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={parts.steel} position={[0, 0, -0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 0.42, radius * 0.42, 0.14, 48]} />
      </mesh>
    </group>
  );
}

function Prism({ spec, controls, hueOffset = 0 }: ModelProps) {
  const [w, h, d] = spec.size;
  const capH = 0.11;
  const rim = 0.035;
  const bodyH = h - capH * 2;
  const radius = d * 0.3;

  const parts = useMemo(() => {
    const body = new THREE.ExtrudeGeometry(roundedRect(w, d, radius), {
      depth: bodyH,
      bevelEnabled: false,
      curveSegments: 32
    });
    body.rotateX(-Math.PI / 2);
    body.translate(0, -bodyH / 2, 0);

    const cap = new THREE.ExtrudeGeometry(roundedRect(w + 0.04, d + 0.04, radius + 0.02), {
      depth: capH - rim * 2,
      bevelEnabled: true,
      bevelThickness: rim,
      bevelSize: 0.02,
      bevelSegments: 6,
      curveSegments: 32
    });
    cap.rotateX(-Math.PI / 2);

    const topHalf: [number, number] = [w * 0.37, d * 0.3];
    const topPanel = new THREE.ShapeGeometry(roundedRect(topHalf[0] * 2, topHalf[1] * 2, d * 0.26), 32);
    topPanel.rotateX(-Math.PI / 2);

    const sideHalf: [number, number] = [d * 0.17, bodyH * 0.25];
    const sidePanel = new THREE.ShapeGeometry(capsule(sideHalf[0] * 2, sideHalf[1] * 2), 32);
    const sideFrame = new THREE.ExtrudeGeometry(capsule(sideHalf[0] * 2 + 0.09, sideHalf[1] * 2 + 0.09), {
      depth: 0.04,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 4,
      curveSegments: 32
    });

    const buttons = new THREE.ExtrudeGeometry(roundedRect(w * 0.5, 0.16, 0.06), {
      depth: 0.02,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 3
    });

    // The MY274BT carries an orange cord down its back.
    const strap = ribbon(
      [
        new THREE.Vector3(0, h / 2 - capH, -d / 2 - 0.01),
        new THREE.Vector3(0, h * 0.2, -d / 2 - 0.05),
        new THREE.Vector3(0, -h * 0.2, -d / 2 - 0.05),
        new THREE.Vector3(0, -h / 2 + capH, -d / 2 - 0.01)
      ],
      0.07,
      new THREE.Vector3(1, 0, 0)
    );

    const strapMaterial = rubberOrange();
    strapMaterial.side = THREE.DoubleSide;
    // Transparent from the start: toggling it later would recompile the shader mid-scroll.
    const fabric = makeFabric();
    fabric.transparent = true;

    return {
      body,
      cap,
      topPanel,
      sidePanel,
      sideFrame,
      buttons,
      strap,
      strapMaterial,
      fabric,
      caps: [glossBlack(), rubberOrange()],
      gloss: glossBlack(),
      plastic: matteBlack(),
      panels: [makePanel(PanelMode.Rings, topHalf, hueOffset), makePanel(PanelMode.Stripes, sideHalf, hueOffset + 0.25)],
      cellWrap: new THREE.MeshStandardMaterial({ color: "#1d3557", roughness: 0.5 }),
      board: new THREE.MeshStandardMaterial({ color: "#0f3d2e", roughness: 0.45, metalness: 0.2 })
    };
  }, [w, h, d, bodyH, radius, hueOffset]);

  usePanels(parts.panels, controls);
  const logo = useLogoMaterial();

  const groups = useMemo(
    () => ({
      top: new THREE.Group(),
      bottom: new THREE.Group(),
      side: new THREE.Group(),
      front: new THREE.Group(),
      inside: new THREE.Group(),
      driverA: new THREE.Group(),
      driverB: new THREE.Group()
    }),
    []
  );

  useFrame(() => {
    const e = controls.explode;
    parts.fabric.opacity = 1 - e * 0.8;
    parts.fabric.depthWrite = e <= 0.01;
    logo.opacity = 1 - e;
    groups.top.position.y = e * 0.75;
    groups.bottom.position.y = -e * 0.45;
    groups.side.position.x = e * 0.4;
    groups.front.position.z = e * 0.35;
    groups.driverA.position.set(0, bodyH * 0.22, d * 0.08 + e * 0.5);
    groups.driverB.position.set(0, -bodyH * 0.22, d * 0.08 + e * 0.5);
  });

  const [top, side] = parts.panels;
  const driverRadius = Math.min(w, bodyH / 2) * 0.33;

  return (
    <group>
      <mesh geometry={parts.body} material={parts.fabric} castShadow />

      <primitive object={groups.top}>
        <mesh geometry={parts.cap} material={parts.caps} position={[0, bodyH / 2 + rim, 0]} castShadow />
        <mesh geometry={parts.topPanel} material={top} position={[0, bodyH / 2 + capH + 0.002, 0]} />
      </primitive>

      <primitive object={groups.bottom}>
        <mesh geometry={parts.cap} material={parts.caps} position={[0, -bodyH / 2 - capH + rim, 0]} castShadow />
      </primitive>

      <primitive object={groups.side}>
        <group position={[w / 2 - 0.02, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh geometry={parts.sideFrame} material={parts.gloss} />
          <mesh geometry={parts.sidePanel} material={side} position={[0, 0, 0.058]} />
        </group>
      </primitive>

      <primitive object={groups.front}>
        <mesh material={logo} position={[-w * 0.12, bodyH * 0.04, d / 2 + 0.004]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[bodyH * 0.5, bodyH * 0.125]} />
        </mesh>
        <mesh geometry={parts.buttons} material={parts.plastic} position={[0, -bodyH / 2 + 0.2, d / 2 - 0.01]} />
      </primitive>

      {spec.strap && <mesh geometry={parts.strap} material={parts.strapMaterial} castShadow />}

      {/* What the exploded view reveals: two drivers, the battery cells and the board.
          Always mounted (hidden by the shell) so their shaders are compiled before the reveal. */}
      <primitive object={groups.inside}>
        <primitive object={groups.driverA}>
          <Driver radius={driverRadius} />
        </primitive>
        <primitive object={groups.driverB}>
          <Driver radius={driverRadius} />
        </primitive>
        {[-1, 0, 1].map((i) => (
          <mesh key={i} material={parts.cellWrap} position={[0, i * 0.2, -d * 0.2]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.09, 0.09, w * 0.62, 24]} />
          </mesh>
        ))}
        <mesh material={parts.board} position={[0, bodyH * 0.42, -d * 0.05]}>
          <boxGeometry args={[w * 0.6, 0.03, d * 0.5]} />
        </mesh>
      </primitive>
    </group>
  );
}

/* ---------- cylinder: MY268BT ---------- */

function Cylinder({ spec, controls, hueOffset = 0 }: ModelProps) {
  const [width, h] = spec.size;
  const r = width / 2;
  const panelAngle = 0.85;
  const logoAngle = -0.6;

  const parts = useMemo(() => {
    const corner = 0.09;
    const profile: THREE.Vector2[] = [];
    for (let i = 0; i <= 8; i++) {
      const a = -Math.PI / 2 + (i / 8) * (Math.PI / 2);
      profile.push(new THREE.Vector2(r - corner + Math.cos(a) * corner, -h / 2 + corner + Math.sin(a) * corner));
    }
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * (Math.PI / 2);
      profile.push(new THREE.Vector2(r - corner + Math.cos(a) * corner, h / 2 - corner + Math.sin(a) * corner));
    }
    const body = new THREE.LatheGeometry(profile, 128);

    const ring = new THREE.Shape().absarc(0, 0, r * 0.8, 0, Math.PI * 2, false);
    ring.holes.push(new THREE.Path().absarc(0, 0, r * 0.58, 0, Math.PI * 2, true));
    const ringLight = new THREE.ShapeGeometry(ring, 96);
    ringLight.rotateX(-Math.PI / 2);

    const panelHalf: [number, number] = [width * 0.14, h * 0.21];
    const pw = panelHalf[0] * 2;
    const ph = panelHalf[1] * 2;
    const panel = wrapToCylinder(new THREE.ShapeGeometry(capsule(pw, ph), 24).translate(0, 0, 0.016), r, panelAngle);
    const bezel = wrapToCylinder(
      new THREE.ShapeGeometry(band([pw + 0.05, ph + 0.05], [pw, ph]), 24).translate(0, 0, 0.014),
      r,
      panelAngle
    );
    const frame = wrapToCylinder(
      new THREE.ShapeGeometry(band([pw + 0.13, ph + 0.13], [pw + 0.05, ph + 0.05]), 24).translate(0, 0, 0.012),
      r,
      panelAngle
    );

    const logo = wrapToCylinder(
      new THREE.PlaneGeometry(h * 0.5, h * 0.125, 8, 24).rotateZ(Math.PI / 2).translate(0, -h * 0.04, 0.005),
      r,
      logoAngle
    );

    const strapAngle = Math.PI * 0.62;
    const radial = (radius: number, y: number) =>
      new THREE.Vector3(radius * Math.sin(strapAngle), y, radius * Math.cos(strapAngle));
    const strap = ribbon(
      [radial(r + 0.01, h * 0.4), radial(r + 0.14, h * 0.18), radial(r + 0.16, -h * 0.08), radial(r + 0.01, -h * 0.32)],
      0.2,
      new THREE.Vector3(Math.cos(strapAngle), 0, -Math.sin(strapAngle))
    );

    const strapMaterial = rubberOrange();
    strapMaterial.side = THREE.DoubleSide;

    return {
      body,
      ringLight,
      panel,
      bezel,
      frame,
      logo,
      strap,
      strapMaterial,
      fabric: makeFabric(2 * Math.PI * r * 2.6, h * 2.6),
      glow: new THREE.MeshStandardMaterial({ color: "#ff5c00", emissive: "#ff4d00", emissiveIntensity: 0.9 }),
      gloss: glossBlack(),
      panels: [makePanel(PanelMode.Radial, [r * 0.8, r * 0.8], hueOffset), makePanel(PanelMode.Stripes, panelHalf, hueOffset + 0.3)]
    };
  }, [width, h, r, hueOffset]);

  usePanels(parts.panels, controls);
  const logo = useLogoMaterial();
  const [ringPanel, sidePanel] = parts.panels;

  return (
    <group>
      <mesh geometry={parts.body} material={parts.fabric} castShadow />
      <mesh material={parts.gloss} position={[0, h / 2 - 0.02, 0]}>
        <cylinderGeometry args={[r - 0.04, r - 0.06, 0.06, 96]} />
      </mesh>
      <mesh geometry={parts.ringLight} material={ringPanel} position={[0, h / 2 + 0.012, 0]} />
      <mesh material={parts.gloss} position={[0, -h / 2 + 0.01, 0]}>
        <cylinderGeometry args={[r - 0.08, r - 0.1, 0.04, 96]} />
      </mesh>
      <mesh geometry={parts.frame} material={parts.glow} />
      <mesh geometry={parts.bezel} material={parts.gloss} />
      <mesh geometry={parts.panel} material={sidePanel} />
      <mesh geometry={parts.logo} material={logo} />
      {spec.strap && <mesh geometry={parts.strap} material={parts.strapMaterial} castShadow />}
    </group>
  );
}

/* ---------- glTF override ---------- */

/** A real modelled speaker dropped in public/models/<handle>.glb, scaled to the catalog height. */
function GlbSpeaker({ url, spec }: { url: string; spec: SpeakerSpec }) {
  const { scene } = useGLTF(url);
  const object = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const scale = spec.size[1] / (size.y || 1);
    clone.scale.setScalar(scale);
    const center = box.getCenter(new THREE.Vector3()).multiplyScalar(scale);
    clone.position.set(-center.x, -center.y, -center.z);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) child.castShadow = true;
    });
    return clone;
  }, [scene, spec.size]);
  return <primitive object={object} />;
}

/* ---------- public component ---------- */

export function Speaker({
  spec,
  glbUrl,
  controls,
  hueOffset
}: {
  spec: SpeakerSpec;
  glbUrl?: string | null;
  controls: SpeakerControls;
  hueOffset?: number;
}) {
  if (glbUrl) return <GlbSpeaker url={glbUrl} spec={spec} />;
  if (spec.shape === "puck") return <Puck spec={spec} controls={controls} hueOffset={hueOffset} />;
  if (spec.shape === "cylinder") return <Cylinder spec={spec} controls={controls} hueOffset={hueOffset} />;
  return <Prism spec={spec} controls={controls} hueOffset={hueOffset} />;
}
