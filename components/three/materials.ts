import * as THREE from "three";

/*
 * Procedural materials for the speakers: knit fabric, rubber, plastic, glass and the animated RGB
 * panels, plus the printed wordmark and button icons. Textures are generated once on the client
 * and shared by every speaker on the page.
 */

const KNIT_SIZE = 256;
const KNIT_COLUMNS = 16;

let knitNormal: THREE.DataTexture | null = null;

/**
 * The speaker grille fabric: a fine knit with small round openings on a staggered grid, as in
 * the close-up product shots. Built as a height field and turned into a tangent-space normal map.
 */
function getKnitNormal() {
  if (knitNormal) return knitNormal;

  const size = KNIT_SIZE;
  const pitch = size / KNIT_COLUMNS;
  const rowPitch = pitch * 0.866;
  const rows = Math.round(size / rowPitch);
  const height = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Distance to the nearest opening on a hex lattice that tiles seamlessly.
      let nearest = Infinity;
      const row = Math.floor((y / size) * rows);
      for (let dr = -1; dr <= 1; dr++) {
        const r = row + dr;
        const cy = ((r + 0.5) / rows) * size;
        const shift = (((r % 2) + 2) % 2) * pitch * 0.5;
        const col = Math.round((x - shift) / pitch);
        for (let dc = -1; dc <= 1; dc++) {
          const cx = (col + dc) * pitch + shift;
          nearest = Math.min(nearest, Math.hypot(x - cx, y - cy));
        }
      }
      const hole = Math.min(1, Math.max(0, (nearest - pitch * 0.2) / (pitch * 0.22)));
      height[y * size + x] = hole * hole * (3 - 2 * hole) + (Math.random() - 0.5) * 0.05;
    }
  }

  const data = new Uint8Array(size * size * 4);
  const at = (x: number, y: number) => height[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * 1.6;
      const dy = (at(x, y + 1) - at(x, y - 1)) * 1.6;
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
  knitNormal = texture;
  return texture;
}

/**
 * Black speaker fabric. `repeat` is how many knit tiles cover one UV unit; extruded and shape
 * geometries use world-space UVs (decimeters), so 3.2 tiles ≈ 50 openings per 100 mm.
 */
export function makeFabric(repeatU = 3.2, repeatV = repeatU) {
  const normalMap = getKnitNormal().clone();
  normalMap.repeat.set(repeatU, repeatV);
  return new THREE.MeshPhysicalMaterial({
    color: "#17171a",
    roughness: 0.9,
    normalMap,
    normalScale: new THREE.Vector2(0.5, 0.5),
    sheen: 0.8,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color("#3a3b40")
  });
}

/** Black rubber: end caps, frames, feet. */
export const rubberBlack = () =>
  new THREE.MeshPhysicalMaterial({ color: "#121214", roughness: 0.55, clearcoat: 0.15, clearcoatRoughness: 0.5 });

export const rubberOrange = () =>
  new THREE.MeshPhysicalMaterial({ color: "#ff5c00", roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.6 });

export const glossBlack = () =>
  new THREE.MeshPhysicalMaterial({ color: "#09090a", roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.1 });

export const matteBlack = () => new THREE.MeshStandardMaterial({ color: "#151517", roughness: 0.68 });

export const rope = () => new THREE.MeshStandardMaterial({ color: "#1b1b1e", roughness: 0.85 });

export const metal = () => new THREE.MeshStandardMaterial({ color: "#8d9099", roughness: 0.35, metalness: 1 });

/** Brushed aluminium disc, like the centre of the MY262BT Pro ring. */
export const brushedMetal = () =>
  new THREE.MeshPhysicalMaterial({ color: "#2b2c30", roughness: 0.32, metalness: 1, clearcoat: 0.6, clearcoatRoughness: 0.2 });

/** Thin tinted glass laid over the light panels; it only adds reflections. */
export const panelGlass = () =>
  new THREE.MeshPhysicalMaterial({
    color: "#000000",
    roughness: 0.06,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    transparent: true,
    opacity: 0.28,
    depthWrite: false
  });

/** How an RGB panel draws its light. */
export enum PanelMode {
  /** two blocks of diagonal light bars with a gap for the logo (side panels) */
  Stripes = 0,
  /** "infinity mirror": rounded rings receding toward a dark centre (top panels) */
  Rings = 1,
  /** colour sweeping around a ring (end caps, puck backs) */
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
    // Shape geometries carry world-space UVs (decimeters), centred on the panel.
    vec2 q = vUv;
    vec2 p = q / uHalf;
    vec3 glass = vec3(0.012, 0.012, 0.016);
    vec3 light = vec3(0.0);

    if (uMode < 0.5) {
      // Thin diagonal bars in two blocks, white-hot cores tinted by a slow rainbow.
      float block = smoothstep(0.24, 0.3, abs(p.y)) * (1.0 - smoothstep(0.86, 0.94, abs(p.y)));
      float bars = fract((q.x * 0.9 + q.y) * 16.0 - uTime * 0.25);
      float line = smoothstep(0.0, 0.06, bars) * smoothstep(0.26, 0.16, bars);
      vec3 tint = hsv2rgb(vec3(fract(p.y * 0.45 + q.x * 0.6 + uTime * 0.06 + uHue), 0.85, 1.0));
      light = mix(tint, vec3(1.0), 0.12) * line * block;
    } else if (uMode < 1.5) {
      // Infinity mirror: bright rounded rings, dimmer and tighter toward the centre.
      float r = min(uHalf.x, uHalf.y);
      float d = sdRoundBox(q, uHalf, r);
      float depth = clamp(-d / r, 0.0, 1.0);
      float rings = fract(depth * 5.0 - uTime * 0.3);
      float line = smoothstep(0.0, 0.1, rings) * smoothstep(0.32, 0.18, rings);
      float hue = atan(q.y, q.x) / 6.2831 + depth * 0.4 + uTime * 0.06 + uHue;
      light = hsv2rgb(vec3(fract(hue), 0.8, 1.0)) * line * (1.0 - depth * 0.85);
    } else {
      // A ring of light: geometry gives the shape, colour sweeps around it.
      float hue = atan(q.y, q.x) / 6.2831 + uTime * 0.08 + uHue;
      light = hsv2rgb(vec3(fract(hue), 0.95, 1.0));
    }

    gl_FragColor = vec4(glass + light * uPower * 1.7, 1.0);
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

/** How the wordmark is printed: orange ink on fabric, white on dark discs, rainbow behind glass. */
export type LogoInk = "orange" | "white" | "rainbow";

const logoCache = new Map<string, THREE.CanvasTexture>();

/** The lowercase "aibimy" wordmark on a transparent 4:1 texture. */
export function getLogoTexture(fontFamily: string, ink: LogoInk = "orange") {
  const key = `${fontFamily}|${ink}`;
  const cached = logoCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const context = canvas.getContext("2d")!;
  if (ink === "rainbow") {
    const gradient = context.createLinearGradient(160, 0, 864, 0);
    ["#ff4d4d", "#ffb02e", "#f5f749", "#3dfc8b", "#38c8ff", "#8a63ff", "#ff5ad1"].forEach((color, i, all) =>
      gradient.addColorStop(i / (all.length - 1), color)
    );
    context.fillStyle = gradient;
  } else {
    // The printed orange is deeper than the screen brand colour once lit.
    context.fillStyle = ink === "white" ? "#f4f4f6" : "#f25a00";
  }
  context.font = `700 190px ${fontFamily}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("aibimy", 512, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  logoCache.set(key, texture);
  return texture;
}

/** Which row of moulded button symbols to draw. */
export type IconRow = "transport" | "top";

const iconCache = new Map<IconRow, THREE.CanvasTexture>();

/**
 * Button symbols moulded into the rubber: ◁ ⏻ ▷ ▷| on the prisms' front pill, ⏻ − + M on top
 * of the MY262BT Pro. Drawn as strokes in a grey a shade lighter than the rubber.
 */
export function getIconTexture(row: IconRow) {
  const cached = iconCache.get(row);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const c = canvas.getContext("2d")!;
  c.strokeStyle = "#6a6b72";
  c.fillStyle = "#6a6b72";
  c.lineWidth = 16;
  c.lineCap = "round";
  c.lineJoin = "round";

  const power = (x: number) => {
    c.beginPath();
    c.arc(x, 132, 46, -Math.PI * 0.32, Math.PI * 1.32);
    c.stroke();
    c.beginPath();
    c.moveTo(x, 72);
    c.lineTo(x, 128);
    c.stroke();
  };
  const triangle = (x: number, dir: 1 | -1) => {
    c.beginPath();
    c.moveTo(x - 30 * dir, 84);
    c.lineTo(x + 34 * dir, 128);
    c.lineTo(x - 30 * dir, 172);
    c.closePath();
    c.stroke();
  };

  if (row === "transport") {
    triangle(160, -1);
    power(400);
    triangle(632, 1);
    triangle(850, 1);
    c.beginPath();
    c.moveTo(904, 84);
    c.lineTo(904, 172);
    c.stroke();
  } else {
    power(150);
    c.beginPath();
    c.moveTo(330, 128);
    c.lineTo(430, 128);
    c.moveTo(600, 128);
    c.lineTo(700, 128);
    c.moveTo(650, 78);
    c.lineTo(650, 178);
    c.stroke();
    c.font = "700 120px sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("M", 880, 132);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  iconCache.set(row, texture);
  return texture;
}
