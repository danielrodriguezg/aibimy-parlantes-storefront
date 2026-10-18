"use client";

import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight } from "@/components/ui/icons";
import type { ViewPhoto } from "@/lib/product-photos";

export type LineupItem = {
  handle: string;
  code: string;
  powerW: number | null;
  /** real height in decimeters, to stand every model on the same floor at true scale */
  height: number;
  price: string;
  summary: string;
  tone: string;
  photo: ViewPhoto | null;
  alt: ViewPhoto | null;
  available: boolean;
};

function Cell({ item, tallest }: { item: LineupItem; tallest: number }) {
  const scale = item.height / tallest;

  return (
    <li className="lineup-cell w-[72vw] shrink-0 snap-center sm:w-[44vw] md:w-auto">
      <Link
        href={`/parlantes/${item.handle}`}
        className="group flex h-full flex-col rounded-[32px] bg-white px-5 pt-6 pb-5 transition-shadow duration-500 hover:shadow-[0_28px_60px_-28px_rgb(28_29_33/0.3)]"
      >
        {/* Shared floor: every photo's height is the product's real height relative to the tallest. */}
        <div className="relative mb-6 flex h-[clamp(240px,26vw,380px)] items-end justify-center">
          <div className="arch absolute inset-x-[6%] top-[22%] bottom-0" style={{ backgroundColor: item.tone }} aria-hidden />
          <div className="contact-shadow absolute -bottom-1 left-1/2 h-3 w-3/5 -translate-x-1/2" aria-hidden />
          {item.photo && (
            <div
              className="relative w-[84%] transition-transform duration-500 ease-out group-hover:-translate-y-2"
              style={{ height: `${scale * 92}%` }}
            >
              <Image
                src={item.photo.src}
                alt={`${item.code}, ${item.photo.label.toLowerCase()}`}
                fill
                sizes="(min-width: 768px) 16vw, 60vw"
                className={`cutout object-contain object-bottom transition-opacity duration-500 ${item.alt ? "group-hover:opacity-0" : ""}`}
              />
              {item.alt && (
                <Image
                  src={item.alt.src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 16vw, 60vw"
                  className="cutout object-contain object-bottom opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="display display-s">{item.code.toLowerCase()}</h3>
          <span className="shrink-0 text-sm tabular-nums text-niebla">{item.powerW ? `${item.powerW} W` : "Super Bass"}</span>
        </div>
        <p className="mt-2 text-[0.9375rem] leading-snug text-grafito">{item.summary}</p>
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="font-semibold tabular-nums">{item.available ? item.price : "Agotado"}</span>
          <span
            className="grid h-10 w-10 place-items-center rounded-full border border-tela/15 transition-colors group-hover:border-tela group-hover:bg-tela group-hover:text-white"
            aria-hidden
          >
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </li>
  );
}

/** The five models side by side, smallest to largest, at real relative size. */
export function Lineup({ items }: { items: LineupItem[] }) {
  const list = useRef<HTMLUListElement>(null);
  const tallest = Math.max(...items.map((item) => item.height), 1);

  // Each card rises at its own pace as the section scrolls in.
  useEffect(() => {
    if (!list.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cells = list.current.querySelectorAll(".lineup-cell");
    const tweens = Array.from(cells).map((cell, i) =>
      gsap.fromTo(
        cell,
        { y: 60 + i * 22, opacity: 0.4 },
        {
          y: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: list.current, start: "top bottom", end: "top 40%", scrub: 0.6 }
        }
      )
    );
    return () => {
      tweens.forEach((tween) => {
        tween.scrollTrigger?.kill();
        tween.kill();
      });
    };
  }, []);

  return (
    <ul
      ref={list}
      className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 max-md:[contain:paint] sm:-mx-10 sm:px-10 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0"
    >
      {items.map((item) => (
        <Cell key={item.handle} item={item} tallest={tallest} />
      ))}
    </ul>
  );
}
