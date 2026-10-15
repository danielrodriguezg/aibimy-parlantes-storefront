"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { CHAPTERS, chapterWeight, stage } from "@/lib/stage-store";

const HomeStage = dynamic(() => import("@/components/three/home-stage"), { ssr: false });

type Chapter = { title: string; body: string };

/** Copy for each chapter after the opening one; figures are the manufacturer's advertised ones. */
const STORY: Chapter[] = [
  {
    title: "luz en dos caras.",
    body: "Un panel de luz arriba y otro al costado. Sobre la mesa, se ve desde cualquier lado."
  },
  {
    title: "40 W por dentro.",
    body: "Bajos reforzados y una batería de 5400 mAh para pasar la tarde sin cable. Potencia anunciada por el fabricante."
  },
  {
    title: "aguanta la lluvia.",
    body: "Protección IPX6 anunciada contra salpicaduras y chorros de agua. Para la lluvia, no para sumergirlo."
  },
  {
    title: "dos suenan mejor.",
    body: "Con TWS enlazas dos parlantes del mismo modelo y escuchas en estéreo, uno a cada lado."
  }
];

export function NightChapters({
  handle,
  glbUrl,
  fallbackImage
}: {
  handle: string;
  glbUrl: string | null;
  fallbackImage: string | null;
}) {
  const section = useRef<HTMLElement>(null);
  const blocks = useRef<Array<HTMLDivElement | null>>([]);
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = section.current;
    if (!element) return;

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        stage.night = self.progress;
      }
    });

    // Copy and glow follow the same progress the 3D scene reads, once per frame.
    let frame = 0;
    const render = () => {
      blocks.current.forEach((block, index) => {
        if (!block) return;
        const weight = chapterWeight(stage.night, index);
        block.style.opacity = String(weight);
        // `transform`, not `translate`: the placement classes already use the translate property.
        block.style.transform = stage.reducedMotion ? "" : `translate3d(0, ${(1 - weight) * 28}px, 0)`;
        block.style.visibility = weight < 0.01 ? "hidden" : "visible";
      });
      element.style.setProperty("--glow-h", String(Math.round(stage.hue * 360)));
      element.style.setProperty("--glow-a", stage.power.toFixed(3));
      if (rail.current) rail.current.style.transform = `scaleY(${stage.night})`;
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      trigger.kill();
    };
  }, []);

  const placement =
    "absolute inset-x-5 bottom-[10svh] sm:inset-x-10 min-[881px]:top-1/2 min-[881px]:bottom-auto min-[881px]:-translate-y-1/2";

  return (
    <section ref={section} aria-label="El MY274BT" style={{ height: `${CHAPTERS.length * 120}svh` }} className="relative">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="stage-glow absolute inset-0" aria-hidden />
        {fallbackImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fallbackImage}
            alt=""
            className="webgl-fallback absolute top-[12%] right-[6%] h-[62%] w-auto object-contain max-[880px]:right-1/2 max-[880px]:h-[42%] max-[880px]:translate-x-1/2"
          />
        )}
        <HomeStage handle={handle} glbUrl={glbUrl} />

        <div className="relative mx-auto h-full max-w-7xl">
          {/* Opening chapter: the page's h1, visible before any script runs. */}
          <div
            ref={(node) => {
              blocks.current[0] = node;
            }}
            className={placement}
          >
            <h1 className="display display-xl max-w-[9ch]">el sonido también se ve.</h1>
            <p className="lede mt-6 text-blanco/75">
              Cinco parlantes Bluetooth con luces RGB, emparejamiento TWS y resistencia al agua. Envío a toda
              Colombia.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="#linea"
                className="rounded-full bg-blanco px-6 py-3.5 font-medium text-escenario transition-colors hover:bg-white"
              >
                Ver los 5 modelos
              </Link>
              <span className="text-sm text-niebla">Desliza para conocer el MY274BT</span>
            </div>
          </div>

          {STORY.map((chapter, i) => (
            <div
              key={chapter.title}
              ref={(node) => {
                blocks.current[i + 1] = node;
              }}
              style={{ opacity: 0, visibility: "hidden" }}
              className={placement}
            >
              <h2 className="display display-l max-w-[10ch]">{chapter.title}</h2>
              <p className="lede mt-5 text-blanco/75">{chapter.body}</p>
            </div>
          ))}
        </div>

        {/* Scroll progress through the chapters. */}
        <div className="absolute top-1/2 right-5 h-32 w-px -translate-y-1/2 bg-white/15 sm:right-10" aria-hidden>
          <div ref={rail} className="h-full w-full origin-top scale-y-0 bg-blanco" />
        </div>
      </div>
    </section>
  );
}
