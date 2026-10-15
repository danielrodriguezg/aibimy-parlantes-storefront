"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo } from "react";

const LineupView = dynamic(() => import("@/components/three/lineup-view"), { ssr: false });

export type LineupItem = {
  handle: string;
  code: string;
  powerW: number | null;
  price: string;
  summary: string;
  image: string | null;
  glbUrl: string | null;
  available: boolean;
};

function Cell({ item }: { item: LineupItem }) {
  const hover = useMemo(() => ({ value: false }), []);
  const on = () => {
    hover.value = true;
  };
  const off = () => {
    hover.value = false;
  };

  return (
    <li className="w-[72vw] shrink-0 snap-center sm:w-[44vw] md:w-auto">
      <Link
        href={`/parlantes/${item.handle}`}
        onPointerEnter={on}
        onPointerLeave={off}
        onFocus={on}
        onBlur={off}
        className="group flex h-full flex-col"
      >
        <div className="relative aspect-[3/4]">
          {item.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image} alt="" className="webgl-fallback absolute inset-0 h-full w-full object-contain p-4" />
          )}
          <LineupView handle={item.handle} glbUrl={item.glbUrl} hover={hover} />
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-tela/15 pt-4">
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

/** The five models side by side, smallest to largest, rendered at the same scale. */
export function Lineup({ items }: { items: LineupItem[] }) {
  return (
    <ul className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 max-md:[contain:paint] sm:-mx-10 sm:px-10 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
      {items.map((item) => (
        <Cell key={item.handle} item={item} />
      ))}
    </ul>
  );
}
