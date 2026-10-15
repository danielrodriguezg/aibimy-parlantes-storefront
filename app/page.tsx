import Link from "next/link";
import { Lineup, type LineupItem } from "@/components/home/lineup";
import { NightChapters } from "@/components/home/night-chapters";
import { FEATURED_HANDLE, bySize, getSpec, type SpeakerSpec } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { glbUrlFor } from "@/lib/models";
import { getProducts, isShopifyConfigured } from "@/lib/shopify";

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

export default async function HomePage() {
  const products = bySize(await getProducts());
  const featured = products.find((product) => product.handle === FEATURED_HANDLE) ?? products.at(-1);

  const items: LineupItem[] = products.map((product) => {
    const spec = getSpec(product.handle);
    return {
      handle: product.handle,
      code: spec.code,
      powerW: spec.powerW,
      price: formatMoney(product.priceRange.minVariantPrice),
      summary: spec.summary,
      image: product.featuredImage?.url ?? null,
      glbUrl: glbUrlFor(product.handle),
      available: product.availableForSale
    };
  });

  return (
    <main>
      <NightChapters
        handle={featured?.handle ?? FEATURED_HANDLE}
        glbUrl={glbUrlFor(featured?.handle ?? FEATURED_HANDLE)}
        fallbackImage={featured?.featuredImage?.url ?? null}
      />

      <section id="linea" className="dia scroll-mt-16 px-5 pt-28 pb-24 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <h2 className="display display-l max-w-[12ch]">del bolsillo a la fiesta.</h2>
            <p className="lede text-tela/70">
              Los cinco modelos, del más pequeño al más grande, a escala aproximada. Pasa el cursor para ver sus luces.
            </p>
          </div>

          {items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-tela/25 p-10 text-center text-tela/60">
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
        <section id="comparar" className="dia scroll-mt-16 border-t border-tela/10 px-5 py-24 sm:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="display display-m mb-10">compáralos.</h2>
            {/* contain: paint stops mobile Chrome from widening the page to the table's scroll width */}
            <div className="-mx-5 overflow-x-auto px-5 [contain:paint] sm:mx-0 sm:px-0">
              <table className="w-full min-w-[760px] border-collapse text-left text-[0.9375rem]">
                <caption className="sr-only">Comparación de los parlantes AIBIMY</caption>
                <thead>
                  <tr className="border-b border-tela/20 align-bottom">
                    <th scope="col" className="sticky left-0 bg-dia py-4 pr-6 font-normal text-tela/60">
                      Modelo
                    </th>
                    {products.map((product) => (
                      <th key={product.handle} scope="col" className="py-4 pr-6">
                        <Link href={`/parlantes/${product.handle}`} className="display text-lg hover:underline">
                          {getSpec(product.handle).code.toLowerCase()}
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => (
                    <tr key={row.label} className="border-b border-tela/10">
                      <th scope="row" className="sticky left-0 bg-dia py-3.5 pr-6 font-normal text-tela/60">
                        {row.label}
                      </th>
                      {products.map((product) => {
                        const value = row.value(getSpec(product.handle));
                        return (
                          <td key={product.handle} className="py-3.5 pr-6">
                            {value ?? (
                              <span className="text-tela/35">
                                —<span className="sr-only">No confirmado</span>
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className="sticky left-0 bg-dia py-5 pr-6 font-normal text-tela/60">
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
            <p className="mt-6 max-w-[62ch] text-sm text-tela/60">
              Cifras anunciadas por el fabricante. Un guion significa que el fabricante no lo confirma para ese modelo.
            </p>
          </div>
        </section>
      )}

      <section className="px-5 py-28 sm:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:items-end">
          <h2 className="display display-l max-w-[11ch]">llega a tu puerta.</h2>
          <div className="grid gap-8">
            <dl className="grid gap-5 text-blanco/80 sm:grid-cols-2">
              <div>
                <dt className="font-medium text-blanco">Envío a toda Colombia</dt>
                <dd className="mt-1 text-[0.9375rem] text-niebla">El costo se calcula al pagar, según tu ciudad.</dd>
              </div>
              <div>
                <dt className="font-medium text-blanco">Pago seguro</dt>
                <dd className="mt-1 text-[0.9375rem] text-niebla">Pagas en el checkout de Shopify.</dd>
              </div>
            </dl>
            <Link
              href="#linea"
              className="justify-self-start rounded-full bg-caucho px-7 py-4 font-medium text-escenario transition-colors hover:bg-caucho-hondo"
            >
              Elegir mi parlante
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
