import type { Metadata } from "next";
import { OrnamentLayer } from "@/components/three/ornament-layer";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { ProductGallery } from "@/components/product/product-gallery";
import { bySize, getSpec } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { photosFor, type ViewPhoto } from "@/lib/product-photos";
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

  const facts = [
    ["Potencia", spec.powerW ? `${spec.powerW} W` : null],
    ["Bluetooth", spec.bluetooth],
    ["Batería", spec.battery],
    ["Autonomía", spec.autonomy],
    ["Agua", spec.water],
    ["Luces RGB", spec.rgb === null ? null : spec.rgb ? "Sí" : "No"],
    ["TWS", spec.tws ? "Sí, con otro del mismo modelo" : "No"],
    ["Reproduce desde", spec.inputs]
  ].filter((fact): fact is [string, string] => Boolean(fact[1]));

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

      <section className="relative px-5 pt-24 pb-20 sm:px-10">
        <OrnamentLayer variant="night" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center">
          <div className="order-2 flex flex-col gap-7 lg:order-1">
            <Link href="/#linea" className="text-sm text-niebla hover:text-blanco">
              Todos los modelos
            </Link>
            <div>
              <h1 className="display display-l">{spec.code.toLowerCase()}</h1>
              <p className="mt-3 text-niebla">{product.title}</p>
            </div>
            {spec.summary && <p className="lede text-blanco/80">{spec.summary}</p>}
            <AddToCart product={product} />
            <ul className="grid gap-1.5 text-[0.9375rem] text-niebla">
              <li>Envío a toda Colombia, calculado al pagar.</li>
              <li>Pago seguro en el checkout de Shopify.</li>
            </ul>
          </div>

          <div className="order-1 lg:order-2">
            <ProductGallery photos={views} title={product.title} />
          </div>
        </div>
      </section>

      <section className="dia relative px-5 py-24 sm:px-10">
        <OrnamentLayer variant="day" />
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <div>
            <h2 className="display display-m">lo que trae.</h2>
            <dl className="mt-10 divide-y divide-tela/10 border-y border-tela/10">
              {facts.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-6 py-3.5">
                  <dt className="text-tela/60">{label}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-tela/55">Cifras anunciadas por el fabricante.</p>
          </div>
          {product.descriptionHtml && (
            <div
              className="product-description max-w-[62ch] text-tela/80"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          )}
        </div>
      </section>

      {images.length > 0 && (
        <section className="dia relative border-t border-tela/10 px-5 py-24 sm:px-10">
          <OrnamentLayer variant="day" />
          <div className="mx-auto max-w-7xl">
            <h2 className="display display-m mb-10">en fotos.</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <div key={image.url} className="relative aspect-square overflow-hidden rounded-2xl bg-white">
                  <Image
                    src={image.url}
                    alt={image.altText ?? product.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-contain p-6"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="relative px-5 py-24 sm:px-10">
          <OrnamentLayer variant="night" />
          <div className="mx-auto max-w-7xl">
            <h2 className="display display-m mb-8">los otros modelos.</h2>
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {others.map((other) => {
                const otherSpec = getSpec(other.handle);
                return (
                  <li key={other.handle}>
                    <Link
                      href={`/parlantes/${other.handle}`}
                      className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-5 sm:grid-cols-[14rem_1fr_auto]"
                    >
                      <span className="display display-s group-hover:text-caucho">{otherSpec.code.toLowerCase()}</span>
                      <span className="col-span-2 row-start-2 text-[0.9375rem] text-niebla sm:col-span-1 sm:row-start-auto">
                        {otherSpec.summary}
                      </span>
                      <span className="row-start-1 tabular-nums sm:row-start-auto">
                        {formatMoney(other.priceRange.minVariantPrice)}
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
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-tela/90 px-5 py-3 backdrop-blur-xl lg:hidden">
        <AddToCart product={product} compact />
      </div>
    </main>
  );
}
