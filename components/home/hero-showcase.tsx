"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import { AccordionItem } from "@/components/ui/accordion";
import { ArrowDown, ArrowLeft, ArrowRight, Check, Chip } from "@/components/ui/icons";
import { Arrowed, Circled, Loop } from "@/components/ui/scribble";
import type { Highlight } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import type { ViewPhoto } from "@/lib/product-photos";
import type { Product } from "@/lib/types";

export type HeroModel = {
  product: Product;
  code: string;
  summary: string;
  tone: string;
  photo: ViewPhoto | null;
  highlights: Highlight[];
  specs: Array<[string, string]>;
};

/**
 * The home hero: one model at a time standing in its arch, with the arrows to walk the line,
 * floating chips for its confirmed facts, the price and the buy button, and an accordion with
 * the details.
 */
export function HeroShowcase({ models, startIndex }: { models: HeroModel[]; startIndex: number }) {
  const { add } = useCart();
  const [index, setIndex] = useState(startIndex);
  const model = models[index];
  const { product } = model;
  const variant = product.variants.find((candidate) => candidate.availableForSale) ?? product.variants[0];
  const step = (delta: number) => setIndex((current) => (current + delta + models.length) % models.length);
  const [first, second] = model.highlights;

  const arrows = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => step(-1)}
        aria-label="Modelo anterior"
        className="grid h-12 w-12 place-items-center rounded-full text-tela transition-colors hover:bg-white"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label="Modelo siguiente"
        className="grid h-12 w-12 place-items-center rounded-full text-tela transition-colors hover:bg-white"
      >
        <ArrowRight className="h-6 w-6" />
      </button>
      <span className="ml-2 text-sm tabular-nums text-niebla">
        {String(index + 1).padStart(2, "0")} / {String(models.length).padStart(2, "0")}
      </span>
    </div>
  );

  return (
    <section className="relative overflow-hidden px-5 pt-6 pb-16 sm:px-10 lg:pb-24" aria-roledescription="carrusel">
      {/* A thin circle peeking from the top edge, as in the studio reference. */}
      <div
        className="pointer-events-none absolute -top-[22rem] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full border border-tela/12"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,5fr)_minmax(0,3fr)] lg:items-center lg:gap-8">
        {/* Left: the promise, the model in view, its price and the buy button. */}
        <div className="flex flex-col gap-8 lg:py-10">
          <h1 className="flex items-center gap-2 text-sm font-medium text-grafito">
            <span className="h-2 w-2 rounded-full bg-caucho" aria-hidden />
            Parlantes Bluetooth con luces RGB · AIBIMY originales
          </h1>
          <p className="display -mt-4 text-[clamp(2.75rem,5vw,5rem)] leading-[1.02]">
            el <Circled>sonido</Circled>
            <br />
            <Arrowed>también</Arrowed>
            <br />
            se ve.
            <span className="ml-3 inline-grid h-[0.62em] w-[0.62em] translate-y-[-0.06em] place-items-center rounded-full bg-caucho align-middle text-white">
              <svg viewBox="0 0 24 24" className="h-[0.36em] w-[0.36em]" fill="currentColor" aria-hidden>
                <path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3z" />
              </svg>
            </span>
          </p>

          <div key={product.handle} className="swap-in flex flex-col gap-4" aria-live="polite">
            <p className="display display-s">
              {model.code.toLowerCase()}
              <span className="ml-3 font-sans text-base font-normal tracking-normal text-niebla">Parlante Bluetooth</span>
            </p>
            {variant && (
              <p className="display text-[clamp(2rem,3.2vw,3rem)] font-medium tabular-nums">
                {product.availableForSale ? formatMoney(variant.price) : "Agotado"}
              </p>
            )}
            <p className="lede text-grafito">{model.summary}</p>
          </div>

          <div className="flex items-center gap-4">
            {variant && (
              <button
                type="button"
                disabled={!variant.availableForSale}
                onClick={() =>
                  add({
                    variantId: variant.id,
                    handle: product.handle,
                    title: product.title,
                    variantTitle: product.variants.length > 1 ? variant.title : null,
                    price: variant.price,
                    imageUrl: (variant.image ?? product.featuredImage)?.url ?? null
                  })
                }
                className="flex items-center gap-3 rounded-full bg-tela py-4 pr-8 pl-6 font-medium text-white transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:bg-tela/30"
              >
                <Check className="h-5 w-5" />
                {variant.availableForSale ? "Agregar al carrito" : "Agotado"}
              </button>
            )}
            <Link
              href={`/parlantes/${product.handle}`}
              className="grid h-14 w-14 place-items-center rounded-full border border-tela/15 transition-colors hover:border-tela/50"
              aria-label={`Ver el ${model.code}`}
            >
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Centre: the arch, the product, the white loop, spheres and chips. */}
        <div className="relative mx-auto mb-14 aspect-[4/5] w-full max-w-[520px] lg:mb-0">
          <div className="arch absolute inset-x-[10%] top-[12%] bottom-[4%]" style={{ backgroundColor: model.tone }} aria-hidden />
          <div className="contact-shadow absolute bottom-[1%] left-1/2 h-[4%] w-[42%] -translate-x-1/2" aria-hidden />
          {model.photo && (
            <div key={product.handle} className="swap-in absolute inset-x-[16%] top-[3%] bottom-[3%]">
              <Image
                src={model.photo.src}
                alt={`${model.code}, ${model.photo.label.toLowerCase()}`}
                fill
                preload={index === startIndex}
                sizes="(min-width: 1024px) 34vw, 80vw"
                className="cutout object-contain object-bottom"
              />
            </div>
          )}
          <Loop className="absolute inset-x-[6%] top-[14%] h-[70%] w-[88%]" />
          <span className="sphere absolute top-[30%] left-[4%] h-9 w-9" aria-hidden />
          <span className="sphere absolute top-[58%] right-[8%] h-14 w-14 [animation-delay:-3s]" aria-hidden />
          <span className="sphere absolute bottom-[14%] left-[14%] h-6 w-6 [animation-delay:-5s]" aria-hidden />

          {first && <Chip key={`${product.handle}-a`} highlight={first} className="swap-in absolute top-[34%] -right-2 sm:-right-10" />}
          {second && (
            <Chip
              key={`${product.handle}-b`}
              highlight={second}
              className="swap-in absolute bottom-[22%] -left-2 [animation-delay:0.12s] sm:-left-10"
            />
          )}

          <a
            href="#linea"
            className="absolute bottom-[8%] left-1/2 grid h-16 w-16 -translate-x-1/2 place-items-center rounded-full border border-white/70 text-white backdrop-blur-[2px] transition-colors hover:bg-white/15"
            aria-label="Ver todos los modelos"
          >
            <ArrowDown className="h-6 w-6" />
          </a>
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 lg:hidden">{arrows}</div>
        </div>

        {/* Right: arrows and the details of the model in view. */}
        <div className="flex flex-col gap-10 lg:self-stretch lg:py-10">
          <div className="hidden lg:block">{arrows}</div>
          <div className="lg:mt-auto">
            <AccordionItem title="Descripción" group="hero">
              {model.summary}{" "}
              <Link href={`/parlantes/${product.handle}`} className="text-tela underline underline-offset-4">
                Ver la ficha
              </Link>
            </AccordionItem>
            <AccordionItem title="Especificaciones" group="hero">
              <dl className="grid gap-1.5">
                {model.specs.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <dt>{label}</dt>
                    <dd className="text-right font-medium text-tela">{value}</dd>
                  </div>
                ))}
              </dl>
            </AccordionItem>
            <AccordionItem title="Envío y pago" group="hero" open>
              Envío a toda Colombia, calculado al pagar según tu ciudad. Pagas de forma segura en el checkout de Shopify.
            </AccordionItem>
          </div>
        </div>
      </div>
    </section>
  );
}
