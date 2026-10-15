import * as THREE from "three";

/*
 * Procedural materials for the speakers: woven fabric, rubber, plastic and the animated RGB panels.
 * Textures are generated once on the client and shared by every speaker on the page.
 */

const WEAVE_SIZE = 256;
const WEAVE_CELLS = 16;

let weaveNormal: THREE.DataTexture | null = null;

/** Basket-weave height field turned into a tangent-space normal map. */
function getWeaveNormal() {
  if (weaveNormal) return weaveNormal;

  const size = WEAVE_SIZE;
  const height = new Float32Array(size * size);
  const cell = size / WEAVE_CELLS;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = Math.floor(x / cell);
      const j = Math.floor(y / cell);
      const u = (x % cell) / cell;
      const v = (y % cell) / cell;
      // Alternate horizontal and vertical threads, two per cell, like the speaker mesh.
      const across = (i + j) % 2 === 0;
      const t = across ? (v * 2) % 1 : (u * 2) % 1;
      const thread = Math.sin(Math.PI * t) ** 0.7;
      const along = across ? u : v;
      height[y * size + x] = thread * (0.8 + 0.2 * Math.cos(2 * Math.PI * along)) + (Math.random() - 0.5) * 0.06;
    }
  }

  const data = new Uint8Array(size * size * 4);
  const at = (x: number, y: number) => height[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * 2.2;
      const dy = (at(x, y + 1) - at(x, y - 1)) * 2.2;
      const n = new THREE.Vector3(-dx, -dy, 1).normalize();
      const o = (y * size + x) * 4;
      data[o] = (n.x * 0.5 + 0.5) * 255;
      data[o + 1] = (n.y * 0.5 + 0.5) * 255;
      data[o + 2] = (n.z * 0.5 + 0.5) * 255;
      data[o + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  weaveNormal = texture;
  return texture;
}

/**
 * Black speaker fabric. `repeat` is how many weave tiles cover one UV unit; extruded and shape
 * geometries use world-space UVs (decimeters), so ~2.6 tiles ≈ 40 threads per 100 mm.
 */
export function makeFabric(repeatU = 2.6, repeatV = repeatU) {
  const normalMap = getWeaveNormal().clone();
  normalMap.repeat.set(repeatU, repeatV);
  return new THREE.MeshPhysicalMaterial({
    color: "#141415",
    roughness: 0.95,
    normalMap,
    normalScale: new THREE.Vector2(0.8, 0.8),
    sheen: 1,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color("#3e3f44")
  });
}

export const rubberOrange = () =>
  new THREE.MeshPhysicalMaterial({ color: "#ff5c00", roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.6 });

export const glossBlack = () =>
  new THREE.MeshPhysicalMaterial({ color: "#09090a", roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12 });

export const matteBlack = () => new THREE.MeshStandardMaterial({ color: "#131315", roughness: 0.62 });

export const rope = () => new THREE.MeshStandardMaterial({ color: "#1b1b1e", roughness: 0.85 });

export const metal = () => new THREE.MeshStandardMaterial({ color: "#8d9099", roughness: 0.35, metalness: 1 });

/** How an RGB panel draws its light. */
export enum PanelMode {
  /** diagonal bars sweeping through the spectrum (side panels) */
  Stripes = 0,
  /** concentric rounded rings, "infinity mirror" (top of the prisms) */
  Rings = 1,
  /** hue follows the angle around the center (ring lights) */
  Radial = 2
}

const panelVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const panelFragment = /* glsl */ `
  uniform float uTime;
  uniform float uPower;
  uniform float uHue;
  uniform float uMode;
  uniform vec2 uHalf;
  varying vec2 vUv;

  vec3 hsv2rgb(vec3 c) {
    vec3 p = abs(fract(c.xxx + vec3(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0);
    return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
  }

  float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    // Shape geometries carry world-space UVs; normalize to -1..1 across the panel.
    vec2 p = vUv / uHalf;
    float hue;
    float lit = 1.0;

    if (uMode < 0.5) {
      hue = p.y * 0.35 + uTime * 0.07 + uHue;
      float bars = fract((p.x * 0.55 + p.y) * 4.5 - uTime * 0.35);
      lit = smoothstep(0.0, 0.1, bars) * smoothstep(0.62, 0.5, bars);
      lit = mix(0.05, 1.0, lit);
    } else if (uMode < 1.5) {
      float d = sdRoundBox(p, vec2(1.0), 0.55);
      hue = d * 0.45 + atan(p.y, p.x) / 6.2831 * 0.3 + uTime * 0.07 + uHue;
      float rings = fract(d * 3.2 + uTime * 0.25);
      lit = mix(0.08, 1.0, smoothstep(0.0, 0.08, rings) * smoothstep(0.5, 0.38, rings));
      lit *= smoothstep(0.02, -0.08, d);
    } else {
      hue = atan(p.y, p.x) / 6.2831 + uTime * 0.07 + uHue;
    }

    vec3 color = hsv2rgb(vec3(fract(hue), 0.82, 1.0));
    // Above 1.0 so the panels read as light sources, not paint.
    gl_FragColor = vec4(color * lit * uPower * 1.6, 1.0);
    #include <colorspace_fragment>
  }
`;

/** Emissive RGB panel. `half` is half the panel's width/height in its local (world-UV) units. */
export function makePanel(mode: PanelMode, half: [number, number], hueOffset = 0) {
  return new THREE.ShaderMaterial({
    vertexShader: panelVertex,
    fragmentShader: panelFragment,
    toneMapped: false,
    uniforms: {
      uTime: { value: 0 },
      uPower: { value: 1 },
      uHue: { value: hueOffset },
      uMode: { value: mode },
      uHalf: { value: new THREE.Vector2(...half) }
    }
  });
}

/** Hue a panel is showing at `time`, so the DOM glow can match the 3D light. */
export const panelHue = (time: number, hueOffset = 0) => (time * 0.07 + hueOffset) % 1;

const logoCache = new Map<string, THREE.CanvasTexture>();

/** The lowercase "aibimy" wordmark, printed in rubber orange on a transparent texture. */
export function getLogoTexture(fontFamily: string) {
  const cached = logoCache.get(fontFamily);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#ff6b00";
  context.font = `600 168px ${fontFamily}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("aibimy", 512, 140);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  logoCache.set(fontFamily, texture);
  return texture;
}
