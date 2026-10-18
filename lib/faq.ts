import "server-only";
import { getSpec, type SpeakerSpec } from "@/lib/catalog";
import { SELLER } from "@/lib/seller";
import { codEnabled } from "@/lib/store";

/**
 * Frequently asked questions, written from what people search before buying a Bluetooth speaker
 * in Colombia (TWS, IPX6, watts, battery, shipping, warranty). Answers are built from the catalog
 * so they only state what the manufacturer confirms. Rendered as an accordion and as FAQPage
 * structured data, so the same text can show up in Google.
 */
export type Faq = { question: string; answer: string; link?: { href: string; label: string } };

const list = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;

const shipping = () =>
  SELLER.shippingTimeKnown
    ? `El pedido llega en ${SELLER.shippingTimeKnown} según tu ciudad.`
    : "El tiempo depende de tu ciudad y lo confirmamos al despachar.";

/** Cash on delivery leads the list when it is on: it is the first question buyers ask in Colombia. */
const codFaqs = (): Faq[] =>
  codEnabled
    ? [
        {
          question: "¿Puedo pagar contra entrega?",
          answer:
            "Sí. Eliges \"Pídelo y paga al recibir\", dejas tu nombre, celular y dirección, y pagas en efectivo cuando el parlante llega a tu casa. No necesitas tarjeta.",
          link: { href: "/legal/envios#contra-entrega", label: "Cómo funciona" }
        },
        {
          question: "¿Cómo funciona el pago contra entrega?",
          answer:
            "Haces el pedido en el sitio, te escribimos por WhatsApp para confirmar la dirección, lo despachamos y le pagas al transportador cuando lo recibes. Revisa el paquete antes de pagar."
        }
      ]
    : [];

export function homeFaqs(handles: string[]): Faq[] {
  const specs = handles.map(getSpec);
  const codes = (pick: (spec: SpeakerSpec) => boolean) => specs.filter(pick).map((spec) => spec.code);
  const strongest = [...specs].sort((a, b) => (b.powerW ?? 0) - (a.powerW ?? 0))[0];
  const smallest = [...specs].sort((a, b) => a.size.reduce((x, y) => x * y, 1) - b.size.reduce((x, y) => x * y, 1))[0];
  const ipx6 = codes((spec) => spec.water === "IPX6");
  const tws = codes((spec) => spec.tws);
  const autonomy = specs.filter((spec) => spec.autonomy).map((spec) => `${spec.code}: ${spec.autonomy!.toLowerCase()}`);

  const faqs: Faq[] = codFaqs();
  if (strongest && smallest)
    faqs.push({
      question: "¿Qué parlante Bluetooth AIBIMY me conviene?",
      answer: `Para fiestas y reuniones, el ${strongest.code}${strongest.powerW ? `, el más potente con ${strongest.powerW} W` : ""}. Para llevar contigo, el ${smallest.code}, el más pequeño de la línea.${
        ipx6.length ? ` Para la piscina o la playa, los que tienen IPX6: ${list(ipx6)}.` : ""
      }`,
      link: { href: "/#comparar", label: "Compararlos" }
    });
  if (tws.length)
    faqs.push({
      question: "¿Qué significa TWS? ¿Puedo conectar dos parlantes?",
      answer: `TWS (True Wireless Stereo) enlaza dos parlantes del mismo modelo por Bluetooth: uno suena como canal izquierdo y el otro como derecho, en estéreo. ${
        tws.length === specs.length ? "Todos los modelos lo traen" : `Lo traen ${list(tws)}`
      }; necesitas dos unidades del mismo modelo.`
    });
  if (ipx6.length)
    faqs.push({
      question: "¿Qué es IPX6? ¿Lo puedo meter a la piscina?",
      answer: `IPX6 es una protección contra salpicaduras y chorros fuertes de agua: aguanta la lluvia o el borde de la piscina, pero no es sumergible. La tienen ${list(ipx6)}.`
    });
  faqs.push({
    question: "¿Cuántos vatios necesito en un parlante?",
    answer:
      "Como referencia: unos 15 a 20 W alcanzan para una habitación o para llevarlo contigo; 30 a 40 W rinden mejor en reuniones en casa o al aire libre. A más vatios, más volumen."
  });
  if (autonomy.length)
    faqs.push({
      question: "¿Cuánto dura la batería?",
      answer: `Según el fabricante: ${list(autonomy)}. La duración real baja con el volumen alto y las luces encendidas. En los modelos sin dato confirmado no lo anunciamos.`
    });
  faqs.push(
    {
      question: "¿Los parlantes son originales y tienen garantía?",
      answer: `Sí, son parlantes AIBIMY originales. ${SELLER.brand} es un vendedor independiente y responde la garantía legal por defectos de calidad o funcionamiento.`,
      link: { href: "/legal/devoluciones", label: "Ver la garantía" }
    },
    {
      question: "¿Hacen envíos a toda Colombia?",
      answer: `Sí, enviamos a toda Colombia. El costo se calcula según tu ciudad y lo ves antes de pagar. ${shipping()}`,
      link: { href: "/legal/envios", label: "Ver envíos" }
    },
    {
      question: "¿Puedo devolverlo si no me gusta?",
      answer: "Sí. Tienes 5 días hábiles desde la entrega para retractarte de la compra, con el producto en el mismo estado en que lo recibiste.",
      link: { href: "/legal/devoluciones", label: "Ver devoluciones" }
    },
    {
      question: "¿Cómo pago?",
      answer: codEnabled
        ? "En efectivo al recibir (contra entrega), o en línea en el checkout seguro de Shopify. No vemos ni guardamos los datos de tu tarjeta."
        : "En el checkout seguro de Shopify, con los medios que allí aparecen. No vemos ni guardamos los datos de tu tarjeta."
    }
  );
  return faqs;
}

/** Questions for one model, from its own facts. */
export function productFaqs(spec: SpeakerSpec): Faq[] {
  const faqs: Faq[] = codFaqs().slice(0, 1);
  if (spec.tws)
    faqs.push({
      question: `¿Puedo conectar dos ${spec.code} en estéreo?`,
      answer: `Sí. Con TWS enlazas dos ${spec.code} y suenan en estéreo, uno a cada lado. Tienen que ser del mismo modelo.`
    });
  if (spec.water)
    faqs.push({
      question: `¿El ${spec.code} es resistente al agua?`,
      answer:
        spec.water === "IPX6"
          ? "Tiene protección IPX6 contra salpicaduras y chorros fuertes: aguanta la lluvia o el borde de la piscina, pero no es sumergible."
          : `El fabricante lo anuncia como "${spec.water.toLowerCase()}". No es sumergible.`
    });
  if (spec.autonomy || spec.battery)
    faqs.push({
      question: `¿Cuánto dura la batería del ${spec.code}?`,
      answer: [
        spec.battery ? `Trae una batería de ${spec.battery}.` : "",
        spec.autonomy ? `El fabricante anuncia ${spec.autonomy.toLowerCase()} de reproducción.` : "",
        "La duración baja con el volumen alto y las luces encendidas."
      ]
        .filter(Boolean)
        .join(" ")
    });
  if (spec.inputs)
    faqs.push({
      question: `¿Además de Bluetooth, cómo pongo música en el ${spec.code}?`,
      answer: `Reproduce desde ${spec.inputs.replace(/, ([^,]*)$/, " y $1")}.`
    });
  faqs.push({
    question: "¿Hacen envíos a toda Colombia?",
    answer: `Sí. El costo se calcula según tu ciudad y lo ves antes de pagar. ${shipping()}`
  });
  return faqs;
}

export const faqJsonLd = (faqs: Faq[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer }
  }))
});
