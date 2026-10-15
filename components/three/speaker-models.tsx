"use client";

import { RoundedBox, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import type { SpeakerSpec } from "@/lib/catalog";
import {
  PanelMode,
  brushedMetal,
  getIconTexture,
  getLogoTexture,
  glossBlack,
  makeFabric,
  makePanel,
  matteBlack,
  metal,
  panelGlass,
  rope,
  rubberBlack,
  rubberOrange,
  type IconRow,
  type LogoInk
} from "@/components/three/materials";

/*
 * Procedural models of the five AIBIMY speakers, built from the manufacturer's dimension drawings
 * and product photos (front, back, top and side). Units are decimeters; every model is centred on
 * the origin and stands on y = -height / 2.
 */

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

const circle = (radius: number) => new THREE.Shape().absarc(0, 0, radius, 0, Math.PI * 2, false);

/** A capsule band: `outer` minus a hole of `inner`. */
function band(outer: [number, number], inner: [number, number]) {
  const shape = capsule(...outer);
  shape.holes.push(roundedRectPath(new THREE.Path(), inner[0], inner[1], Math.min(...inner) / 2));
  return shape;
}

function annulus(outer: number, inner: number) {
  const shape = circle(outer);
  shape.holes.push(new THREE.Path().absarc(0, 0, inner, 0, Math.PI * 2, true));
  return shape;
}

/** Extrudes `shape` upward (along +y), centred on y = 0, with rounded top and bottom edges. */
function extrudeUp(shape: THREE.Shape, height: number, bevel: number, bevelSize = bevel, curveSegments = 48) {
  const depth = Math.max(0.001, height - bevel * 2);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize,
    bevelSegments: 6,
    curveSegments
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, -depth / 2, 0);
  return geometry;
}

/**
 * Bends a flat XY geometry around a vertical cylinder of `radius` whose axis passes through
 * (cx, cz), centred at `angle` (0 = facing +Z). Local z becomes an offset off the surface.
 */
function wrapToCylinder(geometry: THREE.BufferGeometry, radius: number, angle: number, cx = 0, cz = 0) {
  const position = geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < position.count; i++) {
    const theta = angle + position.getX(i) / radius;
    const r = radius + position.getZ(i);
    position.setXYZ(i, cx + r * Math.sin(theta), position.getY(i), cz + r * Math.cos(theta));
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

/** A 4:1 plane for the wordmark; `vertical` turns it to read top-to-bottom as on the speakers. */
function logoPlane(width: number, vertical = false, segments = 1) {
  const geometry = new THREE.PlaneGeometry(width, width / 4, vertical ? 1 : segments, vertical ? segments : 1);
  if (vertical) geometry.rotateZ(-Math.PI / 2);
  return geometry;
}

/* ---------- shared materials ---------- */

/** Reads the logo font next/font registered on <html>, once it has loaded. */
function useLogoFont() {
  const [family, setFamily] = useState<string | null>(null);
  useEffect(() => {
    const root = getComputedStyle(document.documentElement);
    const value =
      root.getPropertyValue("--font-logo").trim() || root.getPropertyValue("--font-display").trim() || "sans-serif";
    let cancelled = false;
    document.fonts
      .load(`700 100px ${value}`)
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

/**
 * Material printing the wordmark. Orange and white are ink on the surface; rainbow sits behind
 * the panel glass and glows. Stays invisible until the font is ready.
 */
function useLogoMaterial(ink: LogoInk = "orange") {
  const family = useLogoFont();
  const material = useMemo(() => {
    const options = { transparent: true, polygonOffset: true, polygonOffsetFactor: -2, visible: false, depthWrite: false };
    return ink === "rainbow"
      ? new THREE.MeshBasicMaterial({ ...options, toneMapped: false, color: new THREE.Color(1.5, 1.5, 1.5) })
      : new THREE.MeshStandardMaterial({ ...options, roughness: ink === "white" ? 0.45 : 0.7 });
  }, [ink]);
  useEffect(() => {
    if (!family) return;
    material.map = getLogoTexture(family, ink);
    material.visible = true;
    material.needsUpdate = true;
  }, [family, ink, material]);
  return material;
}

function useIconMaterial(row: IconRow) {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: getIconTexture(row),
        transparent: true,
        roughness: 0.6,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        depthWrite: false
      }),
    [row]
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

function Puck({ spec, controls, hueOffset = 0 }: ModelProps) {
  const [w, h, d] = spec.size;
  const { look } = spec;
  const footH = 0.05;
  const bodyH = h - footH;
  const bodyY = footH / 2;
  const plateT = 0.03;
  const ringOuter = Math.min(w, bodyH) * 0.3;
  const ringInner = ringOuter * 0.78;

  const parts = useMemo(() => {
    const bevelThickness = d * 0.3;
    const bevelSize = Math.min(w, bodyH) * 0.085;
    const depth = d - bevelThickness * 2;
    const body = new THREE.ExtrudeGeometry(squircleShape(w / 2 - bevelSize, bodyH / 2 - bevelSize), {
      depth,
      bevelEnabled: true,
      bevelThickness,
      bevelSize,
      bevelSegments: 12,
      curveSegments: 128
    });
    body.translate(0, bodyY, -depth / 2);

    // The back is a separate plate: smooth plastic on the MY362BT, fabric on the MY262BT Pro.
    const plate = new THREE.ExtrudeGeometry(squircleShape(w / 2 - bevelSize * 1.2, bodyH / 2 - bevelSize * 1.2), {
      depth: plateT,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.03,
      bevelSegments: 4,
      curveSegments: 96
    });
    plate.translate(0, bodyY, -d / 2 - plateT + 0.012);

    const back = -d / 2 - plateT - 0.004;
    const ring = new THREE.ShapeGeometry(annulus(ringOuter, ringInner), 96).rotateY(Math.PI).translate(0, bodyY, back);
    const ringGlass = new THREE.ShapeGeometry(annulus(ringOuter, ringInner), 96)
      .rotateY(Math.PI)
      .translate(0, bodyY, back - 0.004);
    const disc = new THREE.CylinderGeometry(ringInner * 0.97, ringInner * 0.97, 0.02, 64)
      .rotateX(Math.PI / 2)
      .translate(0, bodyY, back);
    const discLogo = logoPlane(ringInner * 1.35).rotateY(Math.PI).translate(0, bodyY, back - 0.012);

    const flap = new THREE.ExtrudeGeometry(roundedRect(w * 0.36, bodyH * 0.13, 0.04), {
      depth: 0.025,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 3
    })
      .rotateY(Math.PI)
      .translate(0, bodyY + bodyH * 0.36, -d / 2 - plateT);

    const topIcons = logoPlane(w * 0.46).rotateX(-Math.PI / 2).translate(0, bodyY + bodyH / 2 + 0.003, 0);
    const frontLogo = logoPlane(w * 0.56).translate(0, bodyY - bodyH * 0.02, d / 2 + 0.004);

    // The braided cord leaves the right edge near the top and hangs below the speaker.
    const ax = w / 2 - bevelSize * 0.4;
    const ay = bodyY + bodyH * 0.24;
    const loop = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(ax, ay, -d * 0.1),
        new THREE.Vector3(ax + 0.12, ay - 0.1, -d * 0.05),
        new THREE.Vector3(ax + 0.17, -h * 0.25, d * 0.02),
        new THREE.Vector3(ax + 0.12, -h * 0.62, d * 0.06),
        new THREE.Vector3(ax + 0.04, -h * 0.3, d * 0.02)
      ],
      true
    );
    const cord = new THREE.TubeGeometry(loop, 160, 0.018 + w * 0.006, 10, true);
    const slider = new THREE.CylinderGeometry(0.035, 0.035, 0.11, 16).translate(ax + 0.155, -h * 0.12, d * 0.0);

    const fabric = makeFabric();
    const panel = makePanel(PanelMode.Radial, [ringOuter, ringInner], hueOffset);

    return {
      body,
      plate,
      ring,
      ringGlass,
      disc,
      discLogo,
      flap,
      topIcons,
      frontLogo,
      cord,
      slider,
      fabric,
      plateMaterial: look.back === "fabric" ? fabric : matteBlack(),
      discMaterial: look.disc === "brushed" ? brushedMetal() : glossBlack(),
      rubber: rubberBlack(),
      plastic: matteBlack(),
      glass: panelGlass(),
      rope: rope(),
      panels: [panel]
    };
  }, [w, h, d, bodyH, bodyY, ringOuter, ringInner, look.back, look.disc, hueOffset]);

  usePanels(parts.panels, controls);
  const orangeInk = useLogoMaterial("orange");
  const whiteInk = useLogoMaterial("white");
  const icons = useIconMaterial("top");

  return (
    <group>
      <mesh geometry={parts.body} material={parts.fabric} castShadow />
      <mesh geometry={parts.plate} material={parts.plateMaterial} />
      <mesh geometry={parts.ring} material={parts.panels[0]} />
      <mesh geometry={parts.ringGlass} material={parts.glass} />
      <mesh geometry={parts.disc} material={parts.discMaterial} />
      <mesh geometry={parts.discLogo} material={whiteInk} />
      <mesh geometry={parts.frontLogo} material={orangeInk} />
      {look.portFlap && <mesh geometry={parts.flap} material={parts.rubber} />}
      {look.topButtons && <mesh geometry={parts.topIcons} material={icons} />}
      <RoundedBox args={[w * 0.46, footH + 0.03, d * 0.5]} radius={0.015} position={[0, -h / 2 + (footH + 0.03) / 2, 0]}>
        <primitive object={parts.plastic} attach="material" />
      </RoundedBox>
      <mesh geometry={parts.cord} material={parts.rope} castShadow />
      <mesh geometry={parts.slider} material={parts.rubber} />
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

/** Light panel wrapped around one rounded end of a prism: bezel, light, glass and a small logo. */
function useEndPanel(radius: number, centerX: number, side: 1 | -1, width: number, height: number) {
  return useMemo(() => {
    const angle = (side * Math.PI) / 2;
    const wrap = (geometry: THREE.BufferGeometry, lift: number) =>
      wrapToCylinder(geometry.translate(0, 0, lift), radius, angle, centerX, 0);
    return {
      bezel: wrap(new THREE.ShapeGeometry(capsule(width + 0.08, height + 0.08), 32), 0.006),
      light: wrap(new THREE.ShapeGeometry(capsule(width, height), 32), 0.01),
      glass: wrap(new THREE.ShapeGeometry(capsule(width, height), 32), 0.016),
      logo: wrap(logoPlane(height * 0.3, true, 12), 0.013)
    };
  }, [radius, centerX, side, width, height]);
}

function Prism({ spec, controls, hueOffset = 0 }: ModelProps) {
  const [w, h, d] = spec.size;
  const { look } = spec;
  const R = d / 2;
  const L = w / 2 - R;
  const capH = h * 0.05;
  const lineH = 0.022;
  const bodyH = h - (capH + lineH) * 2;
  const panelW = d * 0.6;
  const panelH = bodyH * 0.56;
  const sideHalf: [number, number] = [panelW / 2, panelH / 2];

  const parts = useMemo(() => {
    // Stadium cross-section: flat front and back, fully rounded ends (manufacturer top view).
    const body = extrudeUp(roundedRect(w, d, R), bodyH, 0, 0, 64);
    const line = extrudeUp(roundedRect(w + 0.012, d + 0.012, R + 0.006), lineH, 0, 0, 64);
    const cap = extrudeUp(roundedRect(w + 0.02, d + 0.02, R + 0.01), capH, 0.03, 0.022, 64);

    const topW = w - 0.18;
    const topD = d - 0.18;
    const topHalf: [number, number] = [topW / 2, topD / 2];
    const top = new THREE.ShapeGeometry(roundedRect(topW, topD, topD / 2), 64).rotateX(-Math.PI / 2);
    const topLogo = logoPlane(topW * 0.42).rotateX(-Math.PI / 2);

    const pillW = Math.min(2 * L * 1.08, w * 0.56);
    const pill = new THREE.ExtrudeGeometry(roundedRect(pillW, 0.15, 0.075), {
      depth: 0.016,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 3,
      curveSegments: 24
    });
    const pillIcons = logoPlane(pillW * 0.8);

    // MY274BT: two orange cords down the back, held by a black clip; every prism has a top hook.
    const cord = (x: number) =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(x, h / 2 - capH * 0.6, -R + 0.01),
          new THREE.Vector3(x, h * 0.25, -R - 0.03),
          new THREE.Vector3(x, -h * 0.25, -R - 0.03),
          new THREE.Vector3(x, -h / 2 + capH * 0.6, -R + 0.01)
        ]),
        64,
        0.02,
        10
      );

    const fabric = makeFabric();
    // Transparent from the start: toggling it later would recompile the shader mid-scroll.
    fabric.transparent = true;

    return {
      body,
      line,
      cap,
      top,
      topLogo,
      topHalf,
      pill,
      pillW,
      pillIcons,
      cords: [cord(-0.055), cord(0.055)],
      fabric,
      rubber: rubberBlack(),
      orange: rubberOrange(),
      gloss: glossBlack(),
      glass: panelGlass(),
      plastic: matteBlack(),
      panels: [
        makePanel(PanelMode.Rings, topHalf, hueOffset),
        makePanel(PanelMode.Stripes, sideHalf, hueOffset + 0.25),
        makePanel(PanelMode.Stripes, sideHalf, hueOffset + 0.6)
      ],
      cellWrap: new THREE.MeshStandardMaterial({ color: "#1d3557", roughness: 0.5 }),
      board: new THREE.MeshStandardMaterial({ color: "#0f3d2e", roughness: 0.45, metalness: 0.2 })
    };
  }, [w, h, d, R, L, capH, bodyH, sideHalf, hueOffset]);

  const right = useEndPanel(R, L, 1, panelW, panelH);
  const left = useEndPanel(R, -L, -1, panelW, panelH);

  usePanels(parts.panels, controls);
  const orangeInk = useLogoMaterial("orange");
  const rainbowInk = useLogoMaterial("rainbow");
  const icons = useIconMaterial("transport");

  const groups = useMemo(
    () => ({
      top: new THREE.Group(),
      bottom: new THREE.Group(),
      right: new THREE.Group(),
      left: new THREE.Group(),
      front: new THREE.Group(),
      driverA: new THREE.Group(),
      driverB: new THREE.Group()
    }),
    []
  );

  useFrame(() => {
    const e = controls.explode;
    parts.fabric.opacity = 1 - e * 0.8;
    parts.fabric.depthWrite = e <= 0.01;
    orangeInk.opacity = 1 - e;
    groups.top.position.y = e * 0.75;
    groups.bottom.position.y = -e * 0.45;
    groups.right.position.x = e * 0.35;
    groups.left.position.x = -e * 0.35;
    groups.front.position.z = e * 0.35;
    groups.driverA.position.set(0, bodyH * 0.22, d * 0.06 + e * 0.5);
    groups.driverB.position.set(0, -bodyH * 0.22, d * 0.06 + e * 0.5);
  });

  const [topPanel, rightPanel, leftPanel] = parts.panels;
  const topY = h / 2;
  const capY = bodyH / 2 + lineH + capH / 2;
  const lineY = bodyH / 2 + lineH / 2;
  const driverRadius = Math.min(d * 0.9, bodyH / 2) * 0.36;

  return (
    <group>
      <mesh geometry={parts.body} material={parts.fabric} castShadow />

      <primitive object={groups.top}>
        <mesh geometry={parts.line} material={parts.orange} position-y={lineY} />
        <mesh geometry={parts.cap} material={parts.rubber} position-y={capY} castShadow />
        <mesh geometry={parts.top} material={topPanel} position-y={topY + 0.002} />
        <mesh geometry={parts.topLogo} material={rainbowInk} position-y={topY + 0.004} />
        <mesh geometry={parts.top} material={parts.glass} position-y={topY + 0.006} />
        <mesh material={parts.orange} position={[0, topY - 0.005, -R + 0.07]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.055, 0.018, 12, 32]} />
        </mesh>
      </primitive>

      <primitive object={groups.bottom}>
        <mesh geometry={parts.line} material={parts.orange} position-y={-lineY} />
        <mesh geometry={parts.cap} material={parts.rubber} position-y={-capY} castShadow />
      </primitive>

      {(
        [
          [groups.right, right, rightPanel],
          [groups.left, left, leftPanel]
        ] as const
      ).map(([group, panel, light], i) => (
        <primitive key={i} object={group}>
          <mesh geometry={panel.bezel} material={parts.gloss} />
          <mesh geometry={panel.light} material={light} />
          <mesh geometry={panel.logo} material={rainbowInk} />
          <mesh geometry={panel.glass} material={parts.glass} />
        </primitive>
      ))}

      <primitive object={groups.front}>
        <mesh material={orangeInk} position={[-L * 0.12, bodyH * 0.06, R + 0.004]}>
          <primitive object={logoPlane(bodyH * 0.54, true)} attach="geometry" />
        </mesh>
        <group position={[0, -bodyH / 2 + h * 0.1, R - 0.006]}>
          <mesh geometry={parts.pill} material={parts.rubber} />
          <mesh geometry={parts.pillIcons} material={icons} position-z={0.026} />
        </group>
      </primitive>

      {look.cords && (
        <>
          {parts.cords.map((geometry, i) => (
            <mesh key={i} geometry={geometry} material={parts.orange} castShadow />
          ))}
          <RoundedBox args={[0.2, 0.42, 0.05]} radius={0.02} position={[0, 0, -R - 0.045]}>
            <primitive object={parts.plastic} attach="material" />
          </RoundedBox>
        </>
      )}

      {/* What the exploded view reveals: two drivers, the battery cells and the board.
          Always mounted (hidden by the shell) so their shaders are compiled before the reveal. */}
      <primitive object={groups.driverA}>
        <Driver radius={driverRadius} />
      </primitive>
      <primitive object={groups.driverB}>
        <Driver radius={driverRadius} />
      </primitive>
      {[-1, 0, 1].map((i) => (
        <mesh key={i} material={parts.cellWrap} position={[0, i * 0.2, -d * 0.18]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, w * 0.6, 24]} />
        </mesh>
      ))}
      <mesh material={parts.board} position={[0, bodyH * 0.42, -d * 0.05]}>
        <boxGeometry args={[w * 0.55, 0.03, d * 0.5]} />
      </mesh>
    </group>
  );
}

/* ---------- squircle column: MY268BT ---------- */

function Column({ spec, controls, hueOffset = 0 }: ModelProps) {
  const [w, h, d] = spec.size;
  const capH = 0.13;
  const bodyH = h - capH * 2;
  const panelW = d * 0.32;
  const panelH = h * 0.4;
  const sideHalf: [number, number] = [panelW / 2, panelH / 2];
  const ringOuter = Math.min(w, d) * 0.3;
  const ringInner = ringOuter * 0.74;

  const parts = useMemo(() => {
    // Rounded-square section (107 × 108 mm) whose fabric rolls into black rubber end caps.
    const body = extrudeUp(squircleShape(w / 2 - 0.12, d / 2 - 0.12, 2.7), bodyH + 0.08, 0.13, 0.12, 96);
    const cap = extrudeUp(squircleShape(w / 2 - 0.13, d / 2 - 0.13, 2.7), capH, 0.05, 0.05, 96);

    const flat = (shape: THREE.Shape) => new THREE.ShapeGeometry(shape, 64).rotateX(-Math.PI / 2);
    const recess = flat(circle(ringOuter * 1.18));
    const ring = flat(annulus(ringOuter, ringInner));
    const disc = flat(circle(ringInner * 0.94));
    const discLogo = logoPlane(ringInner * 1.3).rotateX(-Math.PI / 2);

    const frame = new THREE.ExtrudeGeometry(band([panelW + 0.17, panelH + 0.17], [panelW + 0.04, panelH + 0.04]), {
      depth: 0.025,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 3,
      curveSegments: 32
    });
    const bezel = new THREE.ShapeGeometry(band([panelW + 0.04, panelH + 0.04], [panelW, panelH]), 32);
    const light = new THREE.ShapeGeometry(capsule(panelW, panelH), 32);

    // The wide orange strap runs down the back between the end caps.
    const strap = ribbon(
      [
        new THREE.Vector3(0, bodyH / 2 + 0.02, -d / 2 + 0.01),
        new THREE.Vector3(0, bodyH * 0.3, -d / 2 - 0.07),
        new THREE.Vector3(0, -bodyH * 0.3, -d / 2 - 0.07),
        new THREE.Vector3(0, -bodyH / 2 - 0.02, -d / 2 + 0.01)
      ],
      0.24,
      new THREE.Vector3(1, 0, 0)
    );

    const strapMaterial = rubberOrange();
    strapMaterial.side = THREE.DoubleSide;

    return {
      body,
      cap,
      recess,
      ring,
      disc,
      discLogo,
      frame,
      bezel,
      light,
      strap,
      strapMaterial,
      fabric: makeFabric(),
      rubber: rubberBlack(),
      gloss: glossBlack(),
      glass: panelGlass(),
      glow: new THREE.MeshStandardMaterial({ color: "#ff5200", emissive: "#ff3d00", emissiveIntensity: 0.75, roughness: 0.35 }),
      panels: [
        makePanel(PanelMode.Radial, [ringOuter, ringInner], hueOffset),
        makePanel(PanelMode.Stripes, sideHalf, hueOffset + 0.3),
        makePanel(PanelMode.Stripes, sideHalf, hueOffset + 0.65)
      ]
    };
  }, [w, h, d, bodyH, panelW, panelH, sideHalf, ringOuter, ringInner, hueOffset]);

  usePanels(parts.panels, controls);
  const orangeInk = useLogoMaterial("orange");
  const whiteInk = useLogoMaterial("white");
  const rainbowInk = useLogoMaterial("rainbow");
  const [ringLight, rightLight, leftLight] = parts.panels;
  const top = h / 2;
  const sideLogo = useMemo(() => logoPlane(panelW * 0.62), [panelW]);

  return (
    <group>
      <mesh geometry={parts.body} material={parts.fabric} castShadow />
      <mesh geometry={parts.cap} material={parts.rubber} position-y={top - capH / 2} castShadow />
      <mesh geometry={parts.cap} material={parts.rubber} position-y={-top + capH / 2} castShadow />

      {/* Recessed light ring on the top end, around a dark disc with the wordmark. */}
      <group position-y={top + 0.001}>
        <mesh geometry={parts.recess} material={parts.gloss} />
        <mesh geometry={parts.ring} material={ringLight} position-y={0.002} />
        <mesh geometry={parts.disc} material={parts.gloss} position-y={0.004} />
        <mesh geometry={parts.discLogo} material={whiteInk} position-y={0.006} />
        <mesh geometry={parts.recess} material={parts.glass} position-y={0.008} />
      </group>

      {(
        [
          [1, rightLight],
          [-1, leftLight]
        ] as const
      ).map(([side, light]) => (
        <group key={side} position={[(side * w) / 2 - side * 0.012, 0, 0]} rotation={[0, (side * Math.PI) / 2, 0]}>
          <mesh geometry={parts.frame} material={parts.glow} />
          <mesh geometry={parts.bezel} material={parts.gloss} position-z={0.03} />
          <mesh geometry={parts.light} material={light} position-z={0.032} />
          <mesh geometry={sideLogo} material={rainbowInk} position-z={0.034} />
          <mesh geometry={parts.light} material={parts.glass} position-z={0.036} />
        </group>
      ))}

      <mesh material={orangeInk} position={[0, bodyH * 0.02, d / 2 + 0.004]}>
        <primitive object={logoPlane(bodyH * 0.62, true)} attach="geometry" />
      </mesh>
      <mesh geometry={parts.strap} material={parts.strapMaterial} castShadow />
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
  if (spec.shape === "cylinder") return <Column spec={spec} controls={controls} hueOffset={hueOffset} />;
  return <Prism spec={spec} controls={controls} hueOffset={hueOffset} />;
}
