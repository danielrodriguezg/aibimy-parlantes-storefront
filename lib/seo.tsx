import type { SpeakerSpec } from "@/lib/catalog";

/** Public origin of the site, for canonical URLs, the sitemap and structured data. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const STORE_NAME = "Luzunido";

/**
 * Search titles lead with what people type ("parlante bluetooth", "luces RGB", the watts) and
 * keep the model code, which is what people search once they know the line.
 */
export function productSearchTitle(spec: SpeakerSpec) {
  const parts = [`${spec.code} · Parlante Bluetooth`];
  if (spec.powerW) parts.push(`${spec.powerW} W`);
  if (spec.rgb) parts.push("con luces RGB");
  return parts.join(" ");
}

export function productSearchDescription(spec: SpeakerSpec) {
  const facts = [
    spec.water?.startsWith("IPX") ? `resistente al agua ${spec.water}` : null,
    spec.tws ? "TWS para conectar dos en estéreo" : null,
    spec.battery ? `batería de ${spec.battery}` : null
  ].filter((fact): fact is string => Boolean(fact) && !spec.summary.includes(fact!.split(" ").pop()!));
  return `Parlante Bluetooth AIBIMY ${spec.code} original. ${spec.summary} ${facts.length ? `${capitalize(facts.join(", "))}.` : ""} Envío a toda Colombia.`
    .replace(/\s+/g, " ")
    .trim();
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** Renders a JSON-LD block; `<` is escaped so product text can't close the script tag. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
