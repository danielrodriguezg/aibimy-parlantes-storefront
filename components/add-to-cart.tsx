"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { Check } from "@/components/ui/icons";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/types";

/**
 * Price, variant choice and the buy button. `compact` is the one-line version used in the
 * mobile buy bar; it always adds the first available variant.
 */
export function AddToCart({ product, compact = false }: { product: Product; compact?: boolean }) {
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
      className={`flex items-center justify-center gap-3 rounded-full bg-tela font-medium text-white transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:bg-tela/25 disabled:hover:translate-y-0 ${
        compact ? "px-6 py-3" : "py-4 pr-8 pl-6 text-lg"
      }`}
    >
      {variant.availableForSale && <Check className="h-5 w-5" />}
      {variant.availableForSale ? "Agregar al carrito" : "Agotado"}
    </button>
  );

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-4">
        <span className="display text-lg tabular-nums">{formatMoney(variant.price)}</span>
        {button}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-6">
      <div className="flex items-baseline gap-3">
        <span className="display text-[clamp(2rem,3.2vw,3rem)] font-medium tabular-nums">{formatMoney(variant.price)}</span>
        {onSale && (
          <span className="text-lg text-niebla line-through">{formatMoney(variant.compareAtPrice!)}</span>
        )}
      </div>

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
                candidate.id === variant.id ? "border-tela bg-tela text-white" : "border-tela/20 hover:border-tela/60"
              }`}
            >
              {candidate.title}
            </button>
          ))}
        </fieldset>
      )}

      {button}
    </div>
  );
}
