/**
 * Static facts about each AIBIMY model that Shopify doesn't expose as structured fields.
 * Specs come from the product descriptions in Shopify; anything they mark as "no confirmada"
 * is null here and renders as "—". Dimensions are in decimeters (1 unit = 100 mm) and only
 * the MY362BT ones are published; the rest are estimated from the product photos.
 */

export type SpeakerShape = "puck" | "prism" | "cylinder";

export type SpeakerSpec = {
  code: string;
  shape: SpeakerShape;
  /** width × height × depth in decimeters */
  size: [number, number, number];
  /** carries a strap or cord (the photos show one on these models) */
  strap: boolean;
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
    size: [1.15, 1.15, 0.6],
    strap: true,
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
    size: [1.1, 1.85, 0.85],
    strap: false,
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
    size: [1.2, 2.0, 1.2],
    strap: true,
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
    strap: true,
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
    size: [1.3, 2.35, 1.0],
    strap: true,
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
  size: [1.1, 1.85, 0.85],
  strap: false,
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
