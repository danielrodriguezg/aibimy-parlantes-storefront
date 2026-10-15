import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
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
  const product = await getProductByHandle((await params).handle);
  if (!product) notFound();

  const images = product.images.length ? product.images : product.featuredImage ? [product.featuredImage] : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/#parlantes" className="text-sm text-neutral-500 hover:underline">
        ← Todos los parlantes
      </Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="grid gap-4">
          {images.map((image, index) => (
            <div key={image.url} className="relative aspect-square overflow-hidden rounded-3xl bg-neutral-100">
              <Image
                src={image.url}
                alt={image.altText ?? product.title}
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain p-8"
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <h1 className="text-3xl font-black leading-tight sm:text-4xl">{product.title}</h1>
          <AddToCart product={product} />
          <ul className="grid gap-2 text-sm text-neutral-600">
            <li>✓ Envío a toda Colombia</li>
            <li>✓ Pago seguro</li>
          </ul>
          {product.descriptionHtml && (
            <div
              className="product-description border-t border-neutral-200 pt-6 text-neutral-700"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          )}
        </div>
      </div>
    </main>
  );
}
