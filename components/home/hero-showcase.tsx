"use client";

import Link from "next/link";
import { useState } from "react";
import { Accordion } from "@/components/accordion";
import { AddToCart } from "@/components/add-to-cart";
import { ArrowIcon } from "@/components/icons";
import { BoltBadge, Ring, TrailArrow } from "@/components/marks";
import { ProductStage, type StagePhoto } from "@/components/stage/product-stage";
import type { SpecChip } from "@/lib/catalog";
import type { Product } from "@/lib/types";

export type HeroModel = {
  handle: string;
  code: string;
  summary: string;
  tone: string;
  chips: SpecChip[];
  facts: Array<[string, string]>;
  photo: StagePhoto | null;
  /** null when Shopify isn't configured: the model shows, without price or button */
  product: Product | null;
  price: string | null;
};

/** The opening screen: headline and buy box, the model on its arch, and model switcher with details. */
export function HeroShowcase({ models, startAt = 0 }: { models: HeroModel[]; startAt?: number }) {
  const [index, setIndex] = useState(startAt);
  const model = models[index];
  const step = (delta: number) => setIndex((current) => (current + delta + models.length) % models.length);
  const photos = models.flatMap((m) => (m.photo ? [m.photo] : []));
  const activePhoto = photos.findIndex((photo) => photo.key === model.photo?.key);

  return (
    <section aria-label="Parlantes AIBIMY" className="relative px-5 pt-28 pb-16 sm:px-10 lg:pt-32">
      <div className="mx-auto grid max-w-7xl items-center gap-x-10 gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,5fr)_minmax(0,3fr)]">
        {/* Headline and buy box */}
        <div className="flex flex-col gap-7">
          <p className="rise text-sm font-semibold tracking-[0.18em] text-gris uppercase">
            {model.code} · aibimy
          </p>
          <h1 className="display display-xl rise" style={{ animationDelay: "0.05s" }}>
            <span className="block">
              El <Ring>sonido</Ring>
            </span>
            <span className="block">
              que se
              <TrailArrow />
            </span>
            <span className="block">
              ve.
              <BoltBadge />
            </span>
          </h1>
          {model.price && (
            <p className="text-4xl font-medium tracking-tight tabular-nums" aria-live="polite">
              {model.product?.availableForSale ? model.price : "Agotado"}
            </p>
          )}
          <p className="lede text-gris">{model.summary}</p>
          <div className="flex flex-wrap items-center gap-4">
            {model.product ? (
              <AddToCart key={model.handle} product={model.product} bare />
            ) : (
              <Link
                href="#linea"
                className="inline-flex items-center gap-2.5 rounded-full bg-tinta px-8 py-4 font-semibold text-white hover:bg-black"
              >
                Ver los modelos
              </Link>
            )}
            <Link
              href={`/parlantes/${model.handle}`}
              className="grid h-14 w-14 place-items-center rounded-full border border-tinta/15 bg-white transition-colors hover:border-tinta/50"
              aria-label={`Ver el ${model.code}`}
            >
              <ArrowIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* The model on its arch */}
        <div className="relative lg:order-none">
          <ProductStage photos={photos} active={Math.max(0, activePhoto)} tone={model.tone} chips={model.chips} priority />
          <Link
            href="#linea"
            aria-label="Ver la línea completa"
            className="absolute bottom-[10%] left-1/2 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full border border-white/70 bg-tinta/20 text-white backdrop-blur-sm transition-colors hover:bg-tinta/40"
          >
            <ArrowIcon direction="down" className="h-6 w-6" />
          </Link>
        </div>

        {/* Switcher and details */}
        <div className="flex flex-col gap-10 lg:self-stretch lg:justify-between lg:py-10">
          {models.length > 1 && (
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => step(-1)}
                className="grid h-11 w-11 place-items-center rounded-full text-gris transition-colors hover:bg-white hover:text-tinta"
                aria-label="Modelo anterior"
              >
                <ArrowIcon direction="left" className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-white"
                aria-label="Modelo siguiente"
              >
                <ArrowIcon className="h-6 w-6" />
              </button>
              <span className="text-sm text-gris tabular-nums" aria-live="polite">
                {String(index + 1).padStart(2, "0")} / {String(models.length).padStart(2, "0")}
              </span>
            </div>
          )}

          <Accordion
            defaultOpen="specs"
            items={[
              {
                id: "about",
                title: "Descripción",
                content: (
                  <>
                    <p>{model.summary}</p>
                    <Link href={`/parlantes/${model.handle}`} className="mt-2 inline-block text-tinta underline underline-offset-4">
                      Ver la ficha completa
                    </Link>
                  </>
                )
              },
              {
                id: "specs",
                title: "Especificaciones",
                content: (
                  <dl className="grid gap-1.5">
                    {model.facts.slice(0, 5).map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4">
                        <dt>{label}</dt>
                        <dd className="text-right text-tinta">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )
              },
              {
                id: "shipping",
                title: "Envío y pago",
                content: <p>Envío a toda Colombia, calculado al pagar según tu ciudad. Pagas seguro en el checkout de Shopify.</p>
              }
            ]}
          />
        </div>
      </div>
    </section>
  );
}
