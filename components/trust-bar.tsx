import Link from "next/link";

const ITEMS = [
  { title: "Envío a toda Colombia", detail: "Costo según tu ciudad, antes de pagar", href: "/legal/envios" },
  { title: "AIBIMY originales", detail: "Con garantía legal del vendedor", href: "/legal/devoluciones" },
  { title: "5 días de retracto", detail: "Si no te convence, lo devuelves", href: "/legal/devoluciones" },
  { title: "Pago seguro", detail: "En el checkout de Shopify", href: "/legal/terminos" }
];

/** The four answers to "is it safe to buy here?", right under the hero. */
export function TrustBar() {
  return (
    <section aria-label="Compra con confianza" className="px-5 sm:px-10">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden rounded-[28px] bg-tela/8 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <li key={item.title} className="bg-white">
            <Link href={item.href} className="flex h-full flex-col gap-1 px-5 py-5 transition-colors hover:bg-papel sm:px-7">
              <span className="font-semibold">{item.title}</span>
              <span className="text-sm text-grafito">{item.detail}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
