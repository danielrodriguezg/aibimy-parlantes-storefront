import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/parlantes/${product.handle}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-square bg-neutral-100">
        {product.featuredImage && (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-6 transition group-hover:scale-105"
          />
        )}
        {!product.availableForSale && (
          <span className="absolute left-4 top-4 rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-white">
            Agotado
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-semibold leading-tight">{product.title}</h3>
        <p className="mt-auto text-lg font-bold">
          {product.priceRange.minVariantPrice.amount !== product.priceRange.maxVariantPrice.amount && "Desde "}
          {formatMoney(product.priceRange.minVariantPrice)}
        </p>
      </div>
    </Link>
  );
}
