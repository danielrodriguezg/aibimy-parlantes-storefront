"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/types";

export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const firstAvailable = product.variants.find((variant) => variant.availableForSale) ?? product.variants[0];
  const [variantId, setVariantId] = useState(firstAvailable?.id);
  const variant = product.variants.find((candidate) => candidate.id === variantId) ?? firstAvailable;
  const hasChoice = product.variants.length > 1;

  if (!variant) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold">{formatMoney(variant.price)}</span>
        {variant.compareAtPrice && Number(variant.compareAtPrice.amount) > Number(variant.price.amount) && (
          <span className="text-lg text-neutral-400 line-through">{formatMoney(variant.compareAtPrice)}</span>
        )}
      </div>

      {hasChoice && (
        <div className="flex flex-wrap gap-2">
          {product.variants.map((candidate) => (
            <button
              key={candidate.id}
              onClick={() => setVariantId(candidate.id)}
              disabled={!candidate.availableForSale}
              className={`rounded-full border px-4 py-2 text-sm disabled:opacity-40 ${
                candidate.id === variant.id ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-300"
              }`}
            >
              {candidate.title}
            </button>
          ))}
        </div>
      )}

      <button
        disabled={!variant.availableForSale}
        onClick={() =>
          add({
            variantId: variant.id,
            handle: product.handle,
            title: product.title,
            variantTitle: hasChoice ? variant.title : null,
            price: variant.price,
            imageUrl: (variant.image ?? product.featuredImage)?.url ?? null
          })
        }
        className="rounded-full bg-amber-400 py-4 text-lg font-bold text-neutral-950 transition hover:bg-amber-300 disabled:bg-neutral-200 disabled:text-neutral-500"
      >
        {variant.availableForSale ? "Agregar al carrito" : "Agotado"}
      </button>
    </div>
  );
}
