/**
 * Static facts about each AIBIMY model that Shopify doesn't expose as structured fields.
 * Specs come from the product descriptions in Shopify; anything they mark as "no confirmada"
 * is null here and renders as "—". Dimensions are width × height × depth in decimeters
 * (1 unit = 100 mm), from the manufacturer's dimension drawings; the MY262BT Pro has none
 * published and is estimated from its photos.
 */

export type SpeakerSpec = {
  code: string;
  /** width × height × depth in decimeters */
  size: [number, number, number];
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
  /** the muted studio colour of the arch the product stands in */
  tone: string;
};

export const CATALOG: Record<string, SpeakerSpec> = {
  "parlante-aibimy-my262bt-pro-bluetooth": {
    code: "MY262BT Pro",
    size: [1.12, 1.08, 0.56],
    powerW: 15,
    bluetooth: "5.0",
    autonomy: "Hasta 8 h",
    battery: "1200 mAh",
    water: "IPX6",
    rgb: true,
    tws: true,
    inputs: "USB, microSD",
    summary: "El más pequeño de la línea: cabe en la mano y cuelga de su cordón.",
    tone: "#fccfa8"
  },
  "parlante-aibimy-my264bt-bluetooth-rgb": {
    code: "MY264BT",
    size: [1.16, 2.0, 0.68],
    powerW: null,
    bluetooth: "Sí",
    autonomy: "Hasta 6 h",
    battery: null,
    water: "IPX6",
    rgb: true,
    tws: true,
    inputs: "USB, microSD, auxiliar",
    summary: "Super Bass, luces RGB arriba y al costado, y carga por USB-C.",
    tone: "#bfd6f6"
  },
  "parlante-aibimy-my268bt-bluetooth-20w": {
    code: "MY268BT",
    size: [1.07, 2.01, 1.08],
    powerW: 20,
    bluetooth: "5.3",
    autonomy: null,
    battery: null,
    water: "Resistente a salpicaduras",
    rgb: null,
    tws: true,
    inputs: null,
    summary: "Cilindro estéreo de 20 W con correa naranja para llevarlo colgado.",
    tone: "#fbc3d9"
  },
  "parlante-aibimy-my362bt-bluetooth-30w": {
    code: "MY362BT",
    size: [1.75, 1.77, 0.9],
    powerW: 30,
    bluetooth: "5.3",
    autonomy: "6 a 8 h",
    battery: "4500 mAh",
    water: "IPX6",
    rgb: true,
    tws: true,
    inputs: "USB, microSD, auxiliar",
    summary: "30 W con driver de 92 mm, micrófono para llamadas y USB-C.",
    tone: "#bfd6f6"
  },
  "parlante-aibimy-my274bt-bluetooth-40w": {
    code: "MY274BT",
    size: [1.4, 2.4, 0.8],
    powerW: 40,
    bluetooth: "Sí",
    autonomy: null,
    battery: "5400 mAh",
    water: "IPX6",
    rgb: true,
    tws: true,
    inputs: "USB, microSD, auxiliar",
    summary: "El más potente: 40 W, batería de 5400 mAh y luces en dos caras.",
    tone: "#cbbeff"
  }
};

/** The home hero opens on the flagship. */
export const FEATURED_HANDLE = "parlante-aibimy-my274bt-bluetooth-40w";

const FALLBACK: SpeakerSpec = {
  code: "AIBIMY",
  size: [1.16, 2.0, 0.68],
  powerW: null,
  bluetooth: null,
  autonomy: null,
  battery: null,
  water: null,
  rgb: null,
  tws: false,
  inputs: null,
  summary: "",
  tone: "#cbbeff"
};

/** Products added to Shopify later still render, with generic facts, until they get an entry here. */
export function getSpec(handle: string): SpeakerSpec {
  return CATALOG[handle] ?? FALLBACK;
}

/** Smallest to largest by volume, so the lineup reads as a real size progression. */
export function bySize<T extends { handle: string }>(items: T[]): T[] {
  const volume = (handle: string) => getSpec(handle).size.reduce((a, b) => a * b, 1);
  return [...items].sort((a, b) => volume(a.handle) - volume(b.handle));
}

export type Highlight = { icon: "bolt" | "light" | "drop" | "pair" | "battery"; label: string; detail: string };

/** The two or three facts worth a floating chip, from what the manufacturer confirms. */
export function highlights(spec: SpeakerSpec): Highlight[] {
  const list: Highlight[] = [];
  if (spec.powerW) list.push({ icon: "bolt", label: `${spec.powerW} W`, detail: "de potencia" });
  if (spec.rgb) list.push({ icon: "light", label: "Luces RGB", detail: "en el panel de luz" });
  if (spec.water?.startsWith("IPX")) list.push({ icon: "drop", label: spec.water, detail: "aguanta la lluvia" });
  if (spec.battery) list.push({ icon: "battery", label: spec.battery, detail: "de batería" });
  if (spec.tws) list.push({ icon: "pair", label: "TWS", detail: "estéreo con dos" });
  return list;
}

/** Spec rows for tables and accordions; null means the manufacturer doesn't confirm it. */
export function specRows(spec: SpeakerSpec): Array<[string, string | null]> {
  return [
    ["Potencia", spec.powerW ? `${spec.powerW} W` : null],
    ["Bluetooth", spec.bluetooth],
    ["Batería", spec.battery],
    ["Autonomía", spec.autonomy],
    ["Agua", spec.water],
    ["Luces RGB", spec.rgb === null ? null : spec.rgb ? "Sí" : "No"],
    ["TWS", spec.tws ? "Sí" : "No"],
    ["Reproduce desde", spec.inputs]
  ];
}
