"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { CheckIcon } from "@/components/icons";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/types";

/**
 * Price, variant choice and the buy button. `compact` is the one-line version used in the
 * mobile buy bar; `bare` drops the price for layouts that show it elsewhere.
 */
export function AddToCart({
  product,
  compact = false,
  bare = false
}: {
  product: Product;
  compact?: boolean;
  bare?: boolean;
}) {
  const { add } = useCart();
  const firstAvailable = product.variants.find((variant) => variant.availableForSale) ?? product.variants[0];
  const [variantId, setVariantId] = useState(firstAvailable?.id);
  const variant = product.variants.find((candidate) => candidate.id === variantId) ?? firstAvailable;
  const hasChoice = product.variants.length > 1;

  if (!variant) return null;

  const onSale = variant.compareAtPrice && Number(variant.compareAtPrice.amount) > Number(variant.price.amount);

  const button = (
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
      className={`inline-flex items-center justify-center gap-2.5 rounded-full bg-tinta font-semibold text-white transition-[background-color,transform] hover:bg-black active:scale-[0.98] disabled:bg-tinta/15 disabled:text-gris ${
        compact ? "px-6 py-3" : "px-8 py-4 text-[1.0625rem]"
      }`}
    >
      {variant.availableForSale && <CheckIcon className="h-5 w-5" />}
      {variant.availableForSale ? "Agregar al carrito" : "Agotado"}
    </button>
  );

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-4">
        <span className="display text-xl tabular-nums">{formatMoney(variant.price)}</span>
        {button}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {!bare && (
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-medium tracking-tight tabular-nums">{formatMoney(variant.price)}</span>
          {onSale && <span className="text-lg text-gris line-through">{formatMoney(variant.compareAtPrice!)}</span>}
        </div>
      )}

      {hasChoice && (
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Opciones</legend>
          {product.variants.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              aria-pressed={candidate.id === variant.id}
              onClick={() => setVariantId(candidate.id)}
              disabled={!candidate.availableForSale}
              className={`rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-40 ${
                candidate.id === variant.id ? "border-tinta bg-tinta text-white" : "border-tinta/20 hover:border-tinta/60"
              }`}
            >
              {candidate.title}
            </button>
          ))}
        </fieldset>
      )}

      <div>{button}</div>
    </div>
  );
}
