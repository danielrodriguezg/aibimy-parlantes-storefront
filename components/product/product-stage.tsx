"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { ViewerTargets } from "@/components/three/product-viewer";

const ProductViewer = dynamic(() => import("@/components/three/product-viewer"), { ssr: false });

/** The product's 3D viewer plus the two things you can do to it: lights and the inside view. */
export function ProductStage({
  handle,
  glbUrl,
  canOpen,
  fallbackImage,
  alt
}: {
  handle: string;
  glbUrl: string | null;
  /** only the procedural prisms have an inside to show */
  canOpen: boolean;
  fallbackImage: string | null;
  alt: string;
}) {
  const targets = useMemo<ViewerTargets>(() => ({ lights: true, inside: false }), []);
  const [lights, setLights] = useState(true);
  const [inside, setInside] = useState(false);

  return (
    <div className="relative">
      <div
        className="relative aspect-square w-full cursor-grab touch-pan-y active:cursor-grabbing"
        aria-label={`Vista 3D del ${alt}. Arrastra para girarlo.`}
        role="img"
      >
        <div
          className="pointer-events-none absolute inset-[8%] rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgb(255 107 0 / 0.18), transparent)" }}
          aria-hidden
        />
        {fallbackImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fallbackImage} alt={alt} className="webgl-fallback absolute inset-0 h-full w-full object-contain p-6" />
        )}
        <ProductViewer handle={handle} glbUrl={glbUrl} targets={targets} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <button
          type="button"
          aria-pressed={lights}
          onClick={() => {
            targets.lights = !lights;
            setLights(!lights);
          }}
          className="rounded-full border border-white/20 px-4 py-2 transition-colors hover:border-white/50"
        >
          {lights ? "Apagar luces" : "Encender luces"}
        </button>
        {canOpen && (
          <button
            type="button"
            aria-pressed={inside}
            onClick={() => {
              targets.inside = !inside;
              setInside(!inside);
            }}
            className="rounded-full border border-white/20 px-4 py-2 transition-colors hover:border-white/50"
          >
            {inside ? "Cerrar" : "Ver por dentro"}
          </button>
        )}
        <span className="text-niebla">Arrastra para girarlo</span>
      </div>
    </div>
  );
}
