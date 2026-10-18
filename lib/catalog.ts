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
  /** colour of the arch behind the product, picked to sit well with its orange trim */
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
    tone: "#c9d2cf"
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
    tone: "#c4cbd6"
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
    tone: "#e8d6c4"
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
    tone: "#bccab9"
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
    tone: "#a9b4b6"
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
  tone: "#c4cbd6"
};

/** Products added to Shopify later still render, with neutral defaults, until they get an entry here. */
export function getSpec(handle: string): SpeakerSpec {
  return CATALOG[handle] ?? FALLBACK;
}

/** Smallest to largest by volume, so the lineup reads as a real size progression. */
export function bySize<T extends { handle: string }>(items: T[]): T[] {
  const volume = (handle: string) => getSpec(handle).size.reduce((a, b) => a * b, 1);
  return [...items].sort((a, b) => volume(a.handle) - volume(b.handle));
}

/** The figures worth listing for a model, in reading order; unconfirmed ones are left out. */
export function specFacts(spec: SpeakerSpec): Array<[string, string]> {
  const facts: Array<[string, string | null]> = [
    ["Potencia", spec.powerW ? `${spec.powerW} W` : null],
    ["Bluetooth", spec.bluetooth],
    ["Batería", spec.battery],
    ["Autonomía", spec.autonomy],
    ["Agua", spec.water],
    ["Luces RGB", spec.rgb === null ? null : spec.rgb ? "Sí" : "No"],
    ["TWS", spec.tws ? "Sí, con otro del mismo modelo" : "No"],
    ["Reproduce desde", spec.inputs]
  ];
  return facts.filter((fact): fact is [string, string] => Boolean(fact[1]));
}

export type ChipIcon = "power" | "water" | "pair" | "battery";
export type SpecChip = { icon: ChipIcon; title: string; caption: string };

/** Up to two short facts to float beside the product, strongest first. */
export function specChips(spec: SpeakerSpec): SpecChip[] {
  const chips: SpecChip[] = [];
  if (spec.powerW) chips.push({ icon: "power", title: `${spec.powerW} W`, caption: "de potencia" });
  else if (spec.battery) chips.push({ icon: "battery", title: spec.battery, caption: "de batería" });
  if (spec.water === "IPX6") chips.push({ icon: "water", title: "IPX6", caption: "resiste el agua" });
  else if (spec.tws) chips.push({ icon: "pair", title: "Conecta dos", caption: "en estéreo TWS" });
  return chips.slice(0, 2);
}
