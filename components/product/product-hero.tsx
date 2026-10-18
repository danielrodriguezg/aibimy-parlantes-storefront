"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Accordion } from "@/components/accordion";
import { AddToCart } from "@/components/add-to-cart";
import { ArrowIcon } from "@/components/icons";
import { Ring } from "@/components/marks";
import { ProductStage, type StagePhoto } from "@/components/stage/product-stage";
import type { SpecChip } from "@/lib/catalog";
import type { Product } from "@/lib/types";

export type ProductView = StagePhoto & { label: string };

/** Product page opening: name and buy box, the product on its arch with its views, and details. */
export function ProductHero({
  product,
  code,
  summary,
  tone,
  chips,
  facts,
  views
}: {
  product: Product;
  code: string;
  summary: string;
  tone: string;
  chips: SpecChip[];
  facts: Array<[string, string]>;
  views: ProductView[];
}) {
  const [active, setActive] = useState(0);
  const step = (delta: number) => setActive((current) => (current + delta + views.length) % views.length);

  return (
    <section className="px-5 pt-28 pb-16 sm:px-10 lg:pt-32">
      <div className="mx-auto grid max-w-7xl items-center gap-x-10 gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,5fr)_minmax(0,3fr)]">
        <div className="order-2 flex flex-col gap-7 lg:order-none">
          <Link href="/#linea" className="inline-flex items-center gap-2 text-sm text-gris hover:text-tinta">
            <ArrowIcon direction="left" className="h-4 w-4" />
            Todos los modelos
          </Link>
          <div>
            <h1 className="display display-xl rise">
              <Ring>{code}</Ring>
            </h1>
            <p className="mt-4 text-gris">{product.title}</p>
          </div>
          {summary && <p className="lede text-gris">{summary}</p>}
          <AddToCart product={product} />
          <ul className="grid gap-1.5 text-[0.9375rem] text-gris">
            <li>Envío a toda Colombia, calculado al pagar.</li>
            <li>Pago seguro en el checkout de Shopify.</li>
          </ul>
        </div>

        <div className="order-1 lg:order-none">
          <ProductStage photos={views} active={active} tone={tone} chips={chips} priority />
          {views.length > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3" role="group" aria-label="Vistas del producto">
              {views.map((view, index) => (
                <button
                  key={view.key}
                  type="button"
                  aria-pressed={index === active}
                  aria-label={`Ver ${view.label.toLowerCase()}`}
                  onClick={() => setActive(index)}
                  className={`relative h-16 w-16 rounded-2xl border bg-white transition-colors ${
                    index === active ? "border-tinta" : "border-tinta/10 hover:border-tinta/40"
                  }`}
                >
                  <Image src={view.src} alt="" fill sizes="64px" className="object-contain p-1.5" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="order-3 flex flex-col gap-10 lg:order-none lg:self-stretch lg:justify-between lg:py-10">
          {views.length > 1 ? (
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => step(-1)}
                className="grid h-11 w-11 place-items-center rounded-full text-gris transition-colors hover:bg-white hover:text-tinta"
                aria-label="Vista anterior"
              >
                <ArrowIcon direction="left" className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-white"
                aria-label="Vista siguiente"
              >
                <ArrowIcon className="h-6 w-6" />
              </button>
              <span className="text-sm text-gris">{views[active]?.label}</span>
            </div>
          ) : (
            <span />
          )}
          <Accordion
            defaultOpen="specs"
            items={[
              {
                id: "about",
                title: "Descripción",
                content: product.descriptionHtml ? (
                  <div
                    className="product-description max-h-80 overflow-y-auto pr-2"
                    dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                  />
                ) : (
                  <p>{summary}</p>
                )
              },
              {
                id: "specs",
                title: "Especificaciones",
                content: (
                  <>
                    <dl className="grid gap-1.5">
                      {facts.map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-4">
                          <dt>{label}</dt>
                          <dd className="text-right text-tinta">{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-3 text-sm">Cifras anunciadas por el fabricante.</p>
                  </>
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
