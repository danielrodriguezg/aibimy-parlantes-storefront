import Link from "next/link";
import { HeroShowcase, type HeroModel } from "@/components/home/hero-showcase";
import { Lineup, type LineupItem } from "@/components/home/lineup";
import { SpecIcon } from "@/components/icons";
import { Ring } from "@/components/marks";
import { CATALOG, FEATURED_HANDLE, bySize, getSpec, specChips, specFacts, type SpeakerSpec } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { altPhoto, heroPhoto, type ViewPhoto } from "@/lib/product-photos";
import { getProducts, isShopifyConfigured } from "@/lib/shopify";
import type { Product } from "@/lib/types";

/** The cutout for a product, or its Shopify photo for products added after the cutouts were made. */
function mainPhoto(product: Product): ViewPhoto | null {
  const cutout = heroPhoto(product.handle);
  if (cutout) return cutout;
  const image = product.featuredImage;
  return image ? { src: image.url, width: image.width, height: image.height, view: "front-34", label: "Foto" } : null;
}

type Row = { label: string; value: (spec: SpeakerSpec) => string | null };

const ROWS: Row[] = [
  { label: "Potencia", value: (s) => (s.powerW ? `${s.powerW} W` : null) },
  { label: "Bluetooth", value: (s) => s.bluetooth },
  { label: "Batería", value: (s) => s.battery },
  { label: "Autonomía", value: (s) => s.autonomy },
  { label: "Agua", value: (s) => s.water },
  { label: "Luces RGB", value: (s) => (s.rgb === null ? null : s.rgb ? "Sí" : "No") },
  { label: "TWS", value: (s) => (s.tws ? "Sí" : "No") },
  { label: "Reproduce desde", value: (s) => s.inputs }
];

/** The flagship up close; figures are the manufacturer's advertised ones. */
const FEATURES = [
  { icon: "light", title: "Luz en dos caras.", body: "Un panel de luz arriba y otro al costado. Sobre la mesa, se ve desde cualquier lado." },
  { icon: "power", title: "40 W por dentro.", body: "Bajos reforzados y una batería de 5400 mAh para pasar la tarde sin cable." },
  { icon: "water", title: "Aguanta la lluvia.", body: "Protección IPX6 contra salpicaduras y chorros de agua. Para la lluvia, no para sumergirlo." },
  { icon: "pair", title: "Dos suenan mejor.", body: "Con TWS enlazas dos parlantes del mismo modelo y escuchas en estéreo." }
] as const;

function heroModel(handle: string, product: Product | null): HeroModel {
  const spec = getSpec(handle);
  const photo = product ? mainPhoto(product) : heroPhoto(handle);
  return {
    handle,
    code: spec.code,
    summary: spec.summary,
    tone: spec.tone,
    chips: specChips(spec),
    facts: specFacts(spec),
    photo: photo ? { key: handle, src: photo.src, width: photo.width, height: photo.height, alt: `${spec.code}, ${photo.label.toLowerCase()}` } : null,
    product,
    price: product ? formatMoney(product.priceRange.minVariantPrice) : null
  };
}

export default async function HomePage() {
  const products = bySize(await getProducts());

  // Without Shopify the hero still shows the line from the catalog, without prices.
  const models: HeroModel[] = products.length
    ? products.map((product) => heroModel(product.handle, product))
    : bySize(Object.keys(CATALOG).map((handle) => ({ handle }))).map(({ handle }) => heroModel(handle, null));
  const startAt = Math.max(0, models.findIndex((model) => model.handle === FEATURED_HANDLE));

  const items: LineupItem[] = products.map((product) => {
    const spec = getSpec(product.handle);
    return {
      handle: product.handle,
      code: spec.code,
      powerW: spec.powerW,
      price: formatMoney(product.priceRange.minVariantPrice),
      summary: spec.summary,
      tone: spec.tone,
      height: spec.size[1],
      photo: mainPhoto(product),
      alt: altPhoto(product.handle),
      available: product.availableForSale
    };
  });

  return (
    <main>
      <HeroShowcase models={models} startAt={startAt} />

      <section aria-labelledby="detalles" className="px-5 py-24 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <h2 id="detalles" className="display display-l max-w-[14ch]">
              El MY274BT, <Ring delay={0.2}>de cerca.</Ring>
            </h2>
            <p className="lede text-gris">El más potente de la línea, con luz, agua y estéreo resueltos.</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="chip rounded-[2rem] p-7">
                <span className="mb-10 grid h-12 w-12 place-items-center rounded-full bg-papel text-caucho">
                  <SpecIcon icon={feature.icon} className="h-6 w-6" />
                </span>
                <h3 className="display display-s">{feature.title}</h3>
                <p className="mt-3 text-[0.9375rem] text-gris">{feature.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="linea" className="scroll-mt-20 px-5 pt-16 pb-24 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <h2 className="display display-l max-w-[12ch]">Del bolsillo a la fiesta.</h2>
            <p className="lede text-gris">
              Los cinco modelos, del más pequeño al más grande, a escala con las medidas del fabricante.
            </p>
          </div>

          {items.length === 0 ? (
            <p className="rounded-[2rem] border border-dashed border-tinta/20 p-10 text-center text-gris">
              {isShopifyConfigured()
                ? "No hay parlantes publicados en la tienda en este momento."
                : "Configura SHOPIFY_STORE_DOMAIN y SHOPIFY_STOREFRONT_ACCESS_TOKEN para cargar los parlantes."}
            </p>
          ) : (
            <Lineup items={items} />
          )}
        </div>
      </section>

      {products.length > 1 && (
        <section id="comparar" className="scroll-mt-20 px-5 py-24 sm:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="display display-m mb-10">Compáralos.</h2>
            {/* contain: paint stops mobile Chrome from widening the page to the table's scroll width */}
            <div className="chip -mx-5 overflow-x-auto rounded-[2rem] px-5 [contain:paint] sm:mx-0 sm:px-8">
              <table className="w-full min-w-[760px] border-collapse text-left text-[0.9375rem]">
                <caption className="sr-only">Comparación de los parlantes AIBIMY</caption>
                <thead>
                  <tr className="border-b border-tinta/12 align-bottom">
                    <th scope="col" className="sticky left-0 bg-white py-5 pr-6 font-normal text-gris">
                      Modelo
                    </th>
                    {products.map((product) => (
                      <th key={product.handle} scope="col" className="py-5 pr-6">
                        <Link href={`/parlantes/${product.handle}`} className="display text-lg hover:underline">
                          {getSpec(product.handle).code}
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => (
                    <tr key={row.label} className="border-b border-tinta/8">
                      <th scope="row" className="sticky left-0 bg-white py-3.5 pr-6 font-normal text-gris">
                        {row.label}
                      </th>
                      {products.map((product) => {
                        const value = row.value(getSpec(product.handle));
                        return (
                          <td key={product.handle} className="py-3.5 pr-6">
                            {value ?? (
                              <span className="text-tinta/30">
                                —<span className="sr-only">No confirmado</span>
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className="sticky left-0 bg-white py-5 pr-6 font-normal text-gris">
                      Precio
                    </th>
                    {products.map((product) => (
                      <td key={product.handle} className="py-5 pr-6 font-semibold tabular-nums">
                        {product.availableForSale ? formatMoney(product.priceRange.minVariantPrice) : "Agotado"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-6 max-w-[62ch] text-sm text-gris">
              Cifras anunciadas por el fabricante. Un guion significa que el fabricante no lo confirma para ese modelo.
            </p>
          </div>
        </section>
      )}

      <section id="envios" className="scroll-mt-20 px-5 pt-8 pb-28 sm:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 rounded-[2.5rem] bg-tinta px-8 py-14 text-white sm:px-14 md:grid-cols-2 md:items-end">
          <h2 className="display display-l max-w-[11ch]">Llega a tu puerta.</h2>
          <div className="grid gap-8">
            <dl className="grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="font-semibold">Envío a toda Colombia</dt>
                <dd className="mt-1 text-[0.9375rem] text-white/60">El costo se calcula al pagar, según tu ciudad.</dd>
              </div>
              <div>
                <dt className="font-semibold">Pago seguro</dt>
                <dd className="mt-1 text-[0.9375rem] text-white/60">Pagas en el checkout de Shopify.</dd>
              </div>
            </dl>
            <Link
              href="#linea"
              className="justify-self-start rounded-full bg-caucho px-7 py-4 font-semibold text-tinta transition-colors hover:bg-caucho-hondo"
            >
              Elegir mi parlante
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
