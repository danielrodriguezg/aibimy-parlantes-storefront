"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef, useState } from "react";
import type { ViewPhoto } from "@/lib/product-photos";

const Ornaments = dynamic(() => import("@/components/three/ornaments"), { ssr: false });

const ZOOM = 2.2;

/**
 * The product's cut-out views. Changing view turns the speaker like a turntable; clicking (or
 * the zoom button) magnifies the spot under the pointer; on touch, swiping changes view.
 */
export function ProductGallery({ photos, title }: { photos: ViewPhoto[]; title: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const swipeStart = useRef<number | null>(null);

  const select = (index: number) => {
    setZoomed(false);
    setActive((index + photos.length) % photos.length);
  };

  const aim = (event: React.PointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    setOrigin({
      x: ((event.clientX - box.left) / box.width) * 100,
      y: ((event.clientY - box.top) / box.height) * 100
    });
  };

  return (
    <div className="relative">
      <Ornaments variant="product" />

      <div
        className={`relative aspect-square touch-pan-y select-none [perspective:1400px] ${
          zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
        }`}
        onPointerMove={(event) => event.pointerType === "mouse" && aim(event)}
        onPointerDown={(event) => {
          swipeStart.current = event.clientX;
        }}
        onPointerUp={(event) => {
          const start = swipeStart.current;
          swipeStart.current = null;
          if (start !== null && event.pointerType !== "mouse" && Math.abs(event.clientX - start) > 40 && !zoomed) {
            select(active + (event.clientX < start ? 1 : -1));
            return;
          }
          aim(event);
          setZoomed((value) => !value);
        }}
      >
        <div
          className="pointer-events-none absolute inset-[10%] rounded-full opacity-70 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgb(255 107 0 / 0.2), transparent)" }}
          aria-hidden
        />
        <div className="contact-shadow absolute bottom-[6%] left-1/2 h-[5%] w-1/2 -translate-x-1/2" aria-hidden />

        <div
          className="absolute inset-0 transition-transform duration-500 ease-out"
          style={{ transform: zoomed ? `scale(${ZOOM})` : "none", transformOrigin: `${origin.x}% ${origin.y}%` }}
        >
          {photos.map((photo, index) => {
            const offset = index - active;
            return (
              <div
                key={`${photo.view}-${index}`}
                className="absolute inset-[8%] transition-[opacity,transform] duration-700 ease-out"
                style={{
                  opacity: offset === 0 ? 1 : 0,
                  transform:
                    offset === 0 ? "none" : `translateX(${offset < 0 ? -10 : 10}%) rotateY(${offset < 0 ? -38 : 38}deg) scale(0.9)`
                }}
                aria-hidden={offset !== 0}
              >
                <Image
                  src={photo.src}
                  alt={`${title}, vista ${photo.label.toLowerCase()}`}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.55)]"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {photos.length > 1 && (
          <div className="flex gap-2" role="group" aria-label="Vistas del producto">
            {photos.map((photo, index) => (
              <button
                key={`${photo.view}-${index}`}
                type="button"
                aria-pressed={index === active}
                aria-label={`Ver ${photo.label.toLowerCase()}`}
                onClick={() => select(index)}
                className={`relative h-16 w-16 rounded-xl border bg-white/5 transition-colors ${
                  index === active ? "border-blanco" : "border-white/15 hover:border-white/50"
                }`}
              >
                <Image src={photo.src} alt="" fill sizes="64px" className="object-contain p-1.5" />
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          aria-pressed={zoomed}
          onClick={() => setZoomed((value) => !value)}
          onKeyDown={(event) => event.key === "Escape" && setZoomed(false)}
          className="rounded-full border border-white/20 px-4 py-2 text-sm transition-colors hover:border-white/50"
        >
          {zoomed ? "Reducir" : "Ampliar"}
        </button>
        <span className="text-sm text-niebla">
          {photos.length > 1 ? "Toca la foto para ampliar, desliza para girar" : "Toca la foto para ampliar"}
        </span>
      </div>
    </div>
  );
}
