import Link from "next/link";
import { FaqSection } from "@/components/faq";
import { Features } from "@/components/home/features";
import { UseCases } from "@/components/home/use-cases";
import { TrustBar } from "@/components/trust-bar";
import { homeFaqs } from "@/lib/faq";
import { HeroShowcase, type HeroModel } from "@/components/home/hero-showcase";
import { Lineup, type LineupItem } from "@/components/home/lineup";
import { ArrowRight } from "@/components/ui/icons";
import { FEATURED_HANDLE, bySize, getSpec, highlights, specRows } from "@/lib/catalog";
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

export default async function HomePage() {
  const products = bySize(await getProducts());
  const featuredIndex = Math.max(
    0,
    products.findIndex((product) => product.handle === FEATURED_HANDLE)
  );

  const models: HeroModel[] = products.map((product) => {
    const spec = getSpec(product.handle);
    return {
      product,
      code: spec.code,
      summary: spec.summary || product.description.slice(0, 140),
      tone: spec.tone,
      photo: mainPhoto(product),
      highlights: highlights(spec),
      specs: specRows(spec).filter((row): row is [string, string] => Boolean(row[1]))
    };
  });

  const items: LineupItem[] = products.map((product) => {
    const spec = getSpec(product.handle);
    return {
      handle: product.handle,
      code: spec.code,
      powerW: spec.powerW,
      price: formatMoney(product.priceRange.minVariantPrice),
      summary: spec.summary,
      height: spec.size[1],
      tone: spec.tone,
      photo: mainPhoto(product),
      alt: altPhoto(product.handle),
      available: product.availableForSale
    };
  });

  return (
    <main>
      {models.length > 0 ? (
        <HeroShowcase models={models} startIndex={featuredIndex} />
      ) : (
        <section className="px-5 pt-16 pb-24 sm:px-10">
          <div className="mx-auto max-w-7xl">
            <h1 className="display display-xl max-w-[10ch]">el sonido también se ve.</h1>
          </div>
        </section>
      )}

      <TrustBar />
      <UseCases handles={products.map((product) => product.handle)} />

      <section id="linea" className="scroll-mt-20 px-5 pt-20 pb-12 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <h2 className="display display-l max-w-[12ch]">del bolsillo a la fiesta.</h2>
            <p className="lede text-grafito">
              Los cinco modelos, del más pequeño al más grande, a escala con las medidas del fabricante. Pasa el cursor para verlos desde otro ángulo.
            </p>
          </div>

          {items.length === 0 ? (
            <p className="rounded-[32px] border border-dashed border-tela/20 p-10 text-center text-grafito">
              {isShopifyConfigured()
                ? "No hay parlantes publicados en la tienda en este momento."
                : "Configura SHOPIFY_STORE_DOMAIN y SHOPIFY_STOREFRONT_ACCESS_TOKEN para cargar los parlantes."}
            </p>
          ) : (
            <Lineup items={items} />
          )}
        </div>
      </section>

      <Features handles={products.map((product) => product.handle)} />

      {products.length > 1 && (
        <section id="comparar" className="scroll-mt-20 px-5 py-24 sm:px-10">
          <div className="mx-auto max-w-7xl rounded-[32px] bg-white p-6 sm:p-10">
            <h2 className="display display-m mb-10">
              compáralos<span className="text-caucho">.</span>
            </h2>
            {/* contain: paint stops mobile Chrome from widening the page to the table's scroll width */}
            <div className="-mx-6 overflow-x-auto px-6 [contain:paint] sm:mx-0 sm:px-0">
              <table className="w-full min-w-[760px] border-collapse text-left text-[0.9375rem]">
                <caption className="sr-only">Comparación de los parlantes AIBIMY</caption>
                <thead>
                  <tr className="border-b border-tela/15 align-bottom">
                    <th scope="col" className="sticky left-0 bg-white py-4 pr-6 font-normal text-niebla">
                      Modelo
                    </th>
                    {products.map((product) => (
                      <th key={product.handle} scope="col" className="py-4 pr-6">
                        <Link href={`/parlantes/${product.handle}`} className="display text-lg hover:text-caucho">
                          {getSpec(product.handle).code.toLowerCase()}
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {specRows(getSpec("")).map(([label], row) => (
                    <tr key={label} className="border-b border-tela/8">
                      <th scope="row" className="sticky left-0 bg-white py-3.5 pr-6 font-normal text-niebla">
                        {label}
                      </th>
                      {products.map((product) => {
                        const value = specRows(getSpec(product.handle))[row][1];
                        return (
                          <td key={product.handle} className="py-3.5 pr-6">
                            {value ?? (
                              <span className="text-tela/30">
                                —<span className="sr-only">No confirmado</span>
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className="sticky left-0 bg-white py-5 pr-6 font-normal text-niebla">
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
            <p className="mt-6 max-w-[62ch] text-sm text-niebla">
              Cifras anunciadas por el fabricante. Un guion significa que el fabricante no lo confirma para ese modelo.
            </p>
          </div>
        </section>
      )}

      <FaqSection faqs={homeFaqs(products.map((product) => product.handle))} title="preguntas frecuentes." group="faq-home" />

      <section className="px-5 py-28 sm:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:items-end">
          <h2 className="display display-l max-w-[11ch]">llega a tu puerta.</h2>
          <div className="grid gap-8">
            <dl className="grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="font-medium">Envío a toda Colombia</dt>
                <dd className="mt-1 text-[0.9375rem] text-grafito">El costo se calcula al pagar, según tu ciudad.</dd>
              </div>
              <div>
                <dt className="font-medium">Pago seguro</dt>
                <dd className="mt-1 text-[0.9375rem] text-grafito">Pagas en el checkout de Shopify.</dd>
              </div>
            </dl>
            <Link
              href="#linea"
              className="flex items-center gap-3 justify-self-start rounded-full bg-tela py-4 pr-6 pl-8 font-medium text-white transition-transform hover:-translate-y-0.5"
            >
              Elegir mi parlante
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
