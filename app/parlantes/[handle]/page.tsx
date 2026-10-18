import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { ProductGallery } from "@/components/product/product-gallery";
import { AccordionItem } from "@/components/ui/accordion";
import { ArrowLeft, ArrowRight, Chip } from "@/components/ui/icons";
import { Circled } from "@/components/ui/scribble";
import { bySize, getSpec, highlights, specRows } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { heroPhoto, photosFor, type ViewPhoto } from "@/lib/product-photos";
import { getProductByHandle, getProducts } from "@/lib/shopify";

type Params = { params: Promise<{ handle: string }> };

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ handle: product.handle }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = await getProductByHandle((await params).handle);
  if (!product) return {};
  return {
    title: product.title,
    description: product.description.slice(0, 160),
    openGraph: { images: product.featuredImage ? [product.featuredImage.url] : [] }
  };
}

export default async function ProductPage({ params }: Params) {
  const { handle } = await params;
  const [product, all] = await Promise.all([getProductByHandle(handle), getProducts()]);
  if (!product) notFound();

  const spec = getSpec(product.handle);
  const images = product.images.length ? product.images : product.featuredImage ? [product.featuredImage] : [];
  // Cut-out views when we have them; otherwise the Shopify photos as they are.
  const cutouts = photosFor(product.handle);
  const views: ViewPhoto[] = cutouts.length
    ? cutouts
    : images.slice(0, 4).map((image, i) => ({
        src: image.url,
        width: image.width,
        height: image.height,
        view: "front-34",
        label: `Foto ${i + 1}`
      }));
  const others = bySize(all).filter((other) => other.handle !== product.handle);
  const facts = specRows(spec)
    .map(([label, value]): [string, string | null] => [label, label === "TWS" && spec.tws ? "Sí, con otro del mismo modelo" : value])
    .filter((fact): fact is [string, string] => Boolean(fact[1]));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    brand: { "@type": "Brand", name: "AIBIMY" },
    description: product.description,
    image: images.map((image) => image.url),
    offers: {
      "@type": "Offer",
      price: product.priceRange.minVariantPrice.amount,
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      availability: product.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <main className="pb-24 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />

      <section className="relative overflow-hidden px-5 pt-6 pb-20 sm:px-10">
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,5fr)_minmax(0,3fr)] lg:items-center lg:gap-8">
          <div className="order-2 flex flex-col gap-7 lg:order-1">
            <Link href="/#linea" className="flex items-center gap-2 text-sm text-grafito hover:text-tela">
              <ArrowLeft className="h-4 w-4" />
              Todos los modelos
            </Link>
            <div>
              <h1 className="display display-l">
                <Circled>{spec.code.toLowerCase()}</Circled>
              </h1>
              <p className="mt-4 text-grafito">{product.title}</p>
            </div>
            {spec.summary && <p className="lede text-grafito">{spec.summary}</p>}
            <AddToCart product={product} />
          </div>

          <div className="order-1 lg:order-2">
            <ProductGallery photos={views} title={product.title} tone={spec.tone} />
          </div>

          <div className="order-3 flex flex-col gap-8 lg:self-stretch lg:py-6">
            <div className="flex flex-wrap gap-3">
              {highlights(spec)
                .slice(0, 3)
                .map((highlight) => (
                  <Chip key={highlight.label} highlight={highlight} />
                ))}
            </div>
            <div className="lg:mt-auto">
              <AccordionItem title="Lo que trae" group="ficha" open>
                <dl className="grid gap-1.5">
                  {facts.map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4">
                      <dt>{label}</dt>
                      <dd className="text-right font-medium text-tela">{value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-sm text-niebla">Cifras anunciadas por el fabricante.</p>
              </AccordionItem>
              {product.descriptionHtml && (
                <AccordionItem title="Descripción" group="ficha">
                  <div className="product-description" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
                </AccordionItem>
              )}
              <AccordionItem title="Envío y pago" group="ficha">
                Envío a toda Colombia, calculado al pagar según tu ciudad. Pagas de forma segura en el checkout de Shopify.
              </AccordionItem>
            </div>
          </div>
        </div>
      </section>

      {images.length > 0 && (
        <section className="px-5 py-20 sm:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="display display-m mb-10">en fotos.</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <div key={image.url} className="relative aspect-square overflow-hidden rounded-[32px] bg-white">
                  <Image
                    src={image.url}
                    alt={image.altText ?? product.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-contain p-8"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="px-5 py-20 sm:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="display display-m mb-10">los otros modelos.</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {others.map((other) => {
                const otherSpec = getSpec(other.handle);
                const photo = heroPhoto(other.handle);
                return (
                  <li key={other.handle}>
                    <Link href={`/parlantes/${other.handle}`} className="group flex h-full flex-col rounded-[32px] bg-white p-5">
                      <div className="relative mb-5 aspect-square">
                        <div className="arch absolute inset-x-[14%] top-[18%] bottom-0" style={{ backgroundColor: otherSpec.tone }} aria-hidden />
                        {photo && (
                          <div className="absolute inset-x-[18%] top-[4%] bottom-0 transition-transform duration-500 group-hover:-translate-y-2">
                            <Image src={photo.src} alt="" fill sizes="(min-width: 1024px) 20vw, 45vw" className="cutout object-contain object-bottom" />
                          </div>
                        )}
                      </div>
                      <span className="display display-s">{otherSpec.code.toLowerCase()}</span>
                      <span className="mt-2 text-[0.9375rem] leading-snug text-grafito">{otherSpec.summary}</span>
                      <span className="mt-auto flex items-center justify-between pt-5">
                        <span className="font-semibold tabular-nums">{formatMoney(other.priceRange.minVariantPrice)}</span>
                        <span className="grid h-10 w-10 place-items-center rounded-full border border-tela/15 transition-colors group-hover:border-tela group-hover:bg-tela group-hover:text-white">
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Mobile buy bar: the price and the button stay in reach while reading. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-tela/10 bg-papel/90 px-5 py-3 backdrop-blur-xl lg:hidden">
        <AddToCart product={product} compact />
      </div>
    </main>
  );
}
