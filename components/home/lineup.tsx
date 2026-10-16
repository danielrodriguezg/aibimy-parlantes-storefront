"use client";

import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { ViewPhoto } from "@/lib/product-photos";
import { stage } from "@/lib/stage-store";

export type LineupItem = {
  handle: string;
  code: string;
  powerW: number | null;
  /** real height in decimeters, to stand every model on the same floor at true scale */
  height: number;
  price: string;
  summary: string;
  photo: ViewPhoto | null;
  alt: ViewPhoto | null;
  available: boolean;
};

function Cell({ item, tallest }: { item: LineupItem; tallest: number }) {
  const scale = item.height / tallest;

  return (
    <li className="lineup-cell w-[72vw] shrink-0 snap-center sm:w-[44vw] md:w-auto">
      <Link href={`/parlantes/${item.handle}`} className="group flex h-full flex-col">
        {/* Shared floor: every photo's height is the product's real height relative to the tallest. */}
        <div className="relative flex h-[clamp(240px,30vw,440px)] items-end justify-center">
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
        <div className="mt-6 flex items-baseline justify-between gap-3 border-t border-tela/15 pt-4">
          <h3 className="display display-s">{item.code.toLowerCase()}</h3>
          <span className="shrink-0 text-sm tabular-nums text-tela/60">
            {item.powerW ? `${item.powerW} W` : "Super Bass"}
          </span>
        </div>
        <p className="mt-2 text-[0.9375rem] leading-snug text-tela/70">{item.summary}</p>
        <p className="mt-auto pt-4 font-medium tabular-nums">
          {item.available ? item.price : "Agotado"}
          <span className="ml-2 font-normal text-tela/50 transition-colors group-hover:text-tela">Ver el {item.code}</span>
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
    if (!list.current || stage.reducedMotion) return;
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
