import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { ArrowIcon } from "@/components/icons";
import { ProductHero, type ProductView } from "@/components/product/product-hero";
import { bySize, getSpec, specChips, specFacts } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { photosFor } from "@/lib/product-photos";
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
  const views: ProductView[] = (
    cutouts.length
      ? cutouts
      : images.slice(0, 4).map((image, i) => ({ src: image.url, width: image.width, height: image.height, label: `Foto ${i + 1}` }))
  ).map((view, i) => ({
    key: `${view.src}-${i}`,
    src: view.src,
    width: view.width,
    height: view.height,
    label: view.label,
    alt: `${product.title}, vista ${view.label.toLowerCase()}`
  }));
  const others = bySize(all).filter((other) => other.handle !== product.handle);

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

      <ProductHero
        product={product}
        code={spec.code}
        summary={spec.summary}
        tone={spec.tone}
        chips={specChips(spec)}
        facts={specFacts(spec)}
        views={views}
      />

      {images.length > 0 && (
        <section className="px-5 py-20 sm:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="display display-m mb-10">En fotos.</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <div key={image.url} className="chip relative aspect-square overflow-hidden rounded-[2rem]">
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
        <section className="px-5 py-20 sm:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="display display-m mb-8">Los otros modelos.</h2>
            <ul className="border-t border-tinta/12">
              {others.map((other) => {
                const otherSpec = getSpec(other.handle);
                return (
                  <li key={other.handle} className="border-b border-tinta/12">
                    <Link
                      href={`/parlantes/${other.handle}`}
                      className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 py-6 sm:grid-cols-[14rem_1fr_auto_auto]"
                    >
                      <span className="display display-s group-hover:text-caucho">{otherSpec.code}</span>
                      <span className="col-span-2 row-start-2 text-[0.9375rem] text-gris sm:col-span-1 sm:row-start-auto">
                        {otherSpec.summary}
                      </span>
                      <span className="col-start-2 row-start-1 tabular-nums sm:col-start-auto sm:row-start-auto">
                        {formatMoney(other.priceRange.minVariantPrice)}
                      </span>
                      <ArrowIcon className="hidden h-5 w-5 text-gris transition-transform group-hover:translate-x-1 group-hover:text-tinta sm:block" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Mobile buy bar: the price and the button stay in reach while reading. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-tinta/10 bg-papel/90 px-5 py-3 backdrop-blur-xl lg:hidden">
        <AddToCart product={product} compact />
      </div>
    </main>
  );
}
