/**
 * Static facts about each AIBIMY model that Shopify doesn't expose as structured fields.
 * Specs come from the product descriptions in Shopify; anything they mark as "no confirmada"
 * is null here and renders as "—". Dimensions are in decimeters (1 unit = 100 mm), taken from the
 * manufacturer's dimension drawings; the MY262BT Pro has none published and is estimated from photos.
 */

export type SpeakerShape = "puck" | "prism" | "cylinder";

/** Visual details the procedural models need, read off the product photos. */
export type SpeakerLook = {
  /** puck: the back face is woven fabric or smooth plastic */
  back?: "fabric" | "plastic";
  /** puck: disc in the middle of the back RGB ring */
  disc?: "brushed" | "gloss";
  /** puck: power, volume and mode buttons on the top edge */
  topButtons?: boolean;
  /** puck: rubber cover over the ports, top of the back */
  portFlap?: boolean;
  /** prism: two orange cords with a black clip down the back */
  cords?: boolean;
};

export type SpeakerSpec = {
  code: string;
  shape: SpeakerShape;
  /** width × height × depth in decimeters */
  size: [number, number, number];
  look: SpeakerLook;
  powerW: number | null;
  bluetooth: string | null;
  autonomy: string | null;
  battery: string | null;
  water: string | null;
  rgb: boolean | null;
  tws: boolean;
  inputs: string | null;
  /** one plain sentence for the lineup and the product hero */
  summary: string;
};

export const CATALOG: Record<string, SpeakerSpec> = {
  "parlante-aibimy-my262bt-pro-bluetooth": {
    code: "MY262BT Pro",
    shape: "puck",
    size: [1.12, 1.08, 0.56],
    look: { back: "fabric", disc: "brushed", topButtons: true },
    powerW: 15,
    bluetooth: "5.0",
    autonomy: "Hasta 8 h",
    battery: "1200 mAh",
    water: "IPX6",
    rgb: true,
    tws: true,
    inputs: "USB, microSD",
    summary: "El más pequeño de la línea: cabe en la mano y cuelga de su cordón."
  },
  "parlante-aibimy-my264bt-bluetooth-rgb": {
    code: "MY264BT",
    shape: "prism",
    size: [1.16, 2.0, 0.68],
    look: {},
    powerW: null,
    bluetooth: "Sí",
    autonomy: "Hasta 6 h",
    battery: null,
    water: "IPX6",
    rgb: true,
    tws: true,
    inputs: "USB, microSD, auxiliar",
    summary: "Super Bass, luces RGB arriba y al costado, y carga por USB-C."
  },
  "parlante-aibimy-my268bt-bluetooth-20w": {
    code: "MY268BT",
    shape: "cylinder",
    size: [1.07, 2.01, 1.08],
    look: {},
    powerW: 20,
    bluetooth: "5.3",
    autonomy: null,
    battery: null,
    water: "Resistente a salpicaduras",
    rgb: null,
    tws: true,
    inputs: null,
    summary: "Cilindro estéreo de 20 W con correa naranja para llevarlo colgado."
  },
  "parlante-aibimy-my362bt-bluetooth-30w": {
    code: "MY362BT",
    shape: "puck",
    size: [1.75, 1.77, 0.9],
    look: { back: "plastic", disc: "gloss", portFlap: true },
    powerW: 30,
    bluetooth: "5.3",
    autonomy: "6 a 8 h",
    battery: "4500 mAh",
    water: "IPX6",
    rgb: true,
    tws: true,
    inputs: "USB, microSD, auxiliar",
    summary: "30 W con driver de 92 mm, micrófono para llamadas y USB-C."
  },
  "parlante-aibimy-my274bt-bluetooth-40w": {
    code: "MY274BT",
    shape: "prism",
    size: [1.4, 2.4, 0.8],
    look: { cords: true },
    powerW: 40,
    bluetooth: "Sí",
    autonomy: null,
    battery: "5400 mAh",
    water: "IPX6",
    rgb: true,
    tws: true,
    inputs: "USB, microSD, auxiliar",
    summary: "El más potente: 40 W, batería de 5400 mAh y luces en dos caras."
  }
};

/** The hero and the night chapters feature the flagship. */
export const FEATURED_HANDLE = "parlante-aibimy-my274bt-bluetooth-40w";

const FALLBACK: SpeakerSpec = {
  code: "AIBIMY",
  shape: "prism",
  size: [1.16, 2.0, 0.68],
  look: {},
  powerW: null,
  bluetooth: null,
  autonomy: null,
  battery: null,
  water: null,
  rgb: null,
  tws: false,
  inputs: null,
  summary: ""
};

/** Products added to Shopify later still render, as a generic prism, until they get an entry here. */
export function getSpec(handle: string): SpeakerSpec {
  return CATALOG[handle] ?? FALLBACK;
}

/** Smallest to largest by volume, so the lineup reads as a real size progression. */
export function bySize<T extends { handle: string }>(items: T[]): T[] {
  const volume = (handle: string) => getSpec(handle).size.reduce((a, b) => a * b, 1);
  return [...items].sort((a, b) => volume(a.handle) - volume(b.handle));
}
