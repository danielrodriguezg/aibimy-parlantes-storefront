"use client";

import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { ViewPhoto } from "@/lib/product-photos";

export type LineupItem = {
  handle: string;
  code: string;
  powerW: number | null;
  /** real height in decimeters, to stand every model on the same floor at true scale */
  height: number;
  price: string;
  summary: string;
  /** arch colour behind the photo */
  tone: string;
  photo: ViewPhoto | null;
  alt: ViewPhoto | null;
  available: boolean;
};

function Cell({ item, tallest }: { item: LineupItem; tallest: number }) {
  const scale = item.height / tallest;

  return (
    <li className="lineup-cell w-[72vw] shrink-0 snap-center sm:w-[44vw] md:w-auto">
      {/* White card with the model's arch behind it, like the hero, at a smaller scale. */}
      <Link
        href={`/parlantes/${item.handle}`}
        className="chip group flex h-full flex-col rounded-[2rem] px-5 pt-8 pb-6 transition-transform duration-500 hover:-translate-y-1"
      >
        {/* Shared floor: every photo's height is the product's real height relative to the tallest. */}
        <div className="relative mb-10 flex h-[clamp(220px,26vw,400px)] items-end justify-center">
          <div
            className="absolute inset-x-[14%] top-[18%] bottom-0 rounded-t-full transition-[top] duration-500 group-hover:top-[12%]"
            style={{ backgroundColor: item.tone }}
            aria-hidden
          />
          <div className="contact-shadow absolute bottom-0 left-1/2 h-4 w-3/5 -translate-x-1/2" aria-hidden />
          {item.photo && (
            <div
              className="relative w-full transition-transform duration-500 ease-out group-hover:-translate-y-2"
              style={{ height: `${scale * 100}%` }}
            >
              <Image
                src={item.photo.src}
                alt={`${item.code}, ${item.photo.label.toLowerCase()}`}
                fill
                sizes="(min-width: 768px) 18vw, 70vw"
                className={`object-contain object-bottom transition-opacity duration-500 ${item.alt ? "group-hover:opacity-0" : ""}`}
              />
              {item.alt && (
                <Image
                  src={item.alt.src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 18vw, 70vw"
                  className="object-contain object-bottom opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              )}
            </div>
          )}
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-tinta/10 pt-4">
          <h3 className="display display-s">{item.code}</h3>
          <span className="shrink-0 text-sm tabular-nums text-gris">
            {item.powerW ? `${item.powerW} W` : "Super Bass"}
          </span>
        </div>
        <p className="mt-2 text-[0.9375rem] leading-snug text-gris">{item.summary}</p>
        <p className="mt-auto pt-4 font-medium tabular-nums">
          {item.available ? item.price : "Agotado"}
          <span className="ml-2 font-normal text-gris transition-colors group-hover:text-tinta">Ver el {item.code}</span>
        </p>
      </Link>
    </li>
  );
}

/** The five models side by side, smallest to largest, at real relative size. */
export function Lineup({ items }: { items: LineupItem[] }) {
  const list = useRef<HTMLUListElement>(null);
  const tallest = Math.max(...items.map((item) => item.height), 1);

  // Each model rises onto the floor at its own pace as the section scrolls in.
  useEffect(() => {
    if (!list.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cells = list.current.querySelectorAll(".lineup-cell");
    const tweens = Array.from(cells).map((cell, i) =>
      gsap.fromTo(
        cell,
        { y: 70 + i * 26, opacity: 0.35 },
        {
          y: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: { trigger: list.current, start: "top bottom", end: "top 35%", scrub: 0.6 }
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
      className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 max-md:[contain:paint] sm:-mx-10 sm:px-10 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0"
    >
      {items.map((item) => (
        <Cell key={item.handle} item={item} tallest={tallest} />
      ))}
    </ul>
  );
}
