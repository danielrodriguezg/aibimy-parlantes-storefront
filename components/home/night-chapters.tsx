"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { ViewPhoto } from "@/lib/product-photos";
import { CHAPTERS, chapterWeight, stage } from "@/lib/stage-store";

const Ornaments = dynamic(() => import("@/components/three/ornaments"), { ssr: false });

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

/** Where each photo layer sits, in % of the rig, degrees and scale. */
type Layer = { x: number; y: number; scale: number; turn: number; opacity: number };
type Pose = { at: number; front: Layer; back: Layer };

const shown = (layer: Partial<Layer> = {}): Layer => ({ x: 0, y: 0, scale: 1, turn: 0, opacity: 1, ...layer });
const hidden = (layer: Partial<Layer> = {}): Layer => ({ ...shown(layer), opacity: 0 });

/** One pose per chapter centre: hero, zoom to the top panel, turn to the back, front again, the pair. */
const POSES: Pose[] = [
  { at: 0, front: shown(), back: hidden({ x: 18, turn: 45, scale: 0.92 }) },
  { at: 0.1, front: shown(), back: hidden({ x: 18, turn: 45, scale: 0.92 }) },
  { at: 0.3, front: shown({ y: 95, scale: 2.4 }), back: hidden({ x: 18, turn: 45, scale: 0.92 }) },
  { at: 0.5, front: hidden({ x: -14, turn: -45, scale: 0.92 }), back: shown() },
  { at: 0.7, front: shown({ scale: 1.04 }), back: hidden({ x: 14, turn: 45, scale: 0.92 }) },
  { at: 0.9, front: shown({ x: -27, scale: 0.84 }), back: shown({ x: 27, scale: 0.84 }) },
  { at: 1, front: shown({ x: -27, scale: 0.84 }), back: shown({ x: 27, scale: 0.84 }) }
];

const smooth = (t: number) => t * t * (3 - 2 * t);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixLayer = (a: Layer, b: Layer, t: number): Layer => ({
  x: mix(a.x, b.x, t),
  y: mix(a.y, b.y, t),
  scale: mix(a.scale, b.scale, t),
  turn: mix(a.turn, b.turn, t),
  opacity: mix(a.opacity, b.opacity, t)
});

function poseAt(progress: number) {
  const p = Math.min(1, Math.max(0, progress));
  let i = 0;
  while (i < POSES.length - 2 && p > POSES[i + 1].at) i++;
  const a = POSES[i];
  const b = POSES[i + 1];
  const t = smooth(Math.min(1, Math.max(0, (p - a.at) / (b.at - a.at || 1))));
  return { front: mixLayer(a.front, b.front, t), back: mixLayer(a.back, b.back, t) };
}

const toTransform = (layer: Layer) =>
  `translate3d(${layer.x}%, ${layer.y}%, 0) rotateY(${layer.turn}deg) scale(${layer.scale})`;

/** A headline split into words that rise into view one after another. */
function RevealTitle({ text, as: Tag, className }: { text: string; as: "h1" | "h2"; className: string }) {
  const words = text.split(" ");
  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} aria-hidden>
          <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <span className="reveal-word inline-block will-change-transform">{word}</span>
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
}

export function NightChapters({ front, back }: { front: ViewPhoto | null; back: ViewPhoto | null }) {
  const section = useRef<HTMLElement>(null);
  const blocks = useRef<Array<HTMLDivElement | null>>([]);
  const rail = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const frontLayer = useRef<HTMLDivElement>(null);
  const backLayer = useRef<HTMLDivElement>(null);
  const watts = useRef<HTMLDivElement>(null);

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

    stage.chaptersActive = true;
    const startedAt = performance.now();
    const current = poseAt(stage.night);
    let frame = 0;

    // One loop drives the copy, the photo rig, the glow and (through `stage`) the ornaments.
    const render = (now: number) => {
      const calm = stage.reducedMotion;
      const seconds = (now - startedAt) / 1000;
      // The one orchestrated moment: the light powers up over the first second and a half.
      stage.power = calm ? 1 : smooth(Math.min(1, seconds / 1.6));
      stage.hue = calm ? 0.07 : (0.07 + seconds * 0.05) % 1;

      blocks.current.forEach((block, index) => {
        if (!block) return;
        const weight = chapterWeight(stage.night, index);
        block.style.visibility = weight < 0.01 ? "hidden" : "visible";
        const words = block.querySelectorAll<HTMLElement>(".reveal-word");
        words.forEach((word, i) => {
          const rise = calm ? 1 : smooth(Math.min(1, Math.max(0, weight * 1.5 - i * 0.12)));
          word.style.transform = `translate3d(0, ${(1 - rise) * 110}%, 0)`;
        });
        const body = block.querySelector<HTMLElement>("[data-body]");
        if (body) {
          body.style.opacity = String(weight);
          body.style.transform = calm ? "" : `translate3d(0, ${(1 - weight) * 18}px, 0)`;
        }
      });

      const target = poseAt(stage.night);
      const k = calm ? 1 : 0.14;
      current.front = mixLayer(current.front, target.front, k);
      current.back = mixLayer(current.back, target.back, k);
      if (frontLayer.current) {
        frontLayer.current.style.transform = toTransform(current.front);
        frontLayer.current.style.opacity = String(current.front.opacity);
      }
      if (backLayer.current) {
        backLayer.current.style.transform = toTransform(current.back);
        backLayer.current.style.opacity = String(current.back.opacity);
      }
      if (tilt.current && !calm) {
        tilt.current.style.transform = `rotateY(${stage.pointer.x * 7}deg) rotateX(${-stage.pointer.y * 4}deg)`;
      }
      if (watts.current) {
        const w = chapterWeight(stage.night, 2);
        watts.current.style.opacity = String(w);
        watts.current.style.transform = `translate(-50%, -50%) scale(${0.85 + w * 0.15})`;
      }

      element.style.setProperty("--glow-h", String(Math.round(stage.hue * 360)));
      element.style.setProperty("--glow-a", stage.power.toFixed(3));
      if (rail.current) rail.current.style.transform = `scaleY(${stage.night})`;
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      trigger.kill();
      stage.chaptersActive = false;
    };
  }, []);

  const placement =
    "absolute inset-x-5 bottom-[8svh] sm:inset-x-10 min-[881px]:top-1/2 min-[881px]:bottom-auto min-[881px]:max-w-[46%] min-[881px]:-translate-y-1/2";
  const rigBox =
    "absolute inset-x-0 top-[9svh] h-[44svh] min-[881px]:inset-x-auto min-[881px]:right-[3%] min-[881px]:top-[10%] min-[881px]:h-[80%] min-[881px]:w-[46%]";

  return (
    <section ref={section} aria-label="El MY274BT" style={{ height: `${CHAPTERS.length * 120}svh` }} className="relative">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="stage-glow absolute inset-0" aria-hidden />
        <div className="stage-toplight absolute inset-0" aria-hidden />
        <Ornaments variant="home" />

        {/* Giant outlined "40 W" behind the speaker in the power chapter. */}
        <div className={`${rigBox} pointer-events-none`} aria-hidden>
          <div
            ref={watts}
            className="display absolute top-1/2 left-1/2 text-[clamp(9rem,26vw,24rem)] leading-none whitespace-nowrap text-transparent opacity-0"
            style={{ WebkitTextStroke: "1.5px rgb(245 246 248 / 0.28)" }}
          >
            40 W
          </div>
        </div>

        {/* The product photos: one floating rig with the front and back cutouts. */}
        <div className={`${rigBox} [perspective:1400px]`} aria-hidden>
          <div ref={tilt} className="relative h-full w-full [transform-style:preserve-3d]">
            <div className="contact-shadow absolute bottom-[2%] left-1/2 h-[5%] w-[46%] -translate-x-1/2" />
            <div className="float absolute inset-0 [transform-style:preserve-3d]">
              {front && (
                <div ref={frontLayer} className="absolute inset-[4%] will-change-transform">
                  <Image
                    src={front.src}
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 881px) 40vw, 80vw"
                    className="rim-light object-contain"
                  />
                  {/* Glossy floor: a faded mirror image under the speaker. */}
                  <div className="floor-reflection" aria-hidden>
                    <Image src={front.src} alt="" fill sizes="(min-width: 881px) 40vw, 80vw" className="object-contain" />
                  </div>
                </div>
              )}
              {back && (
                <div ref={backLayer} className="absolute inset-[4%] opacity-0 will-change-transform">
                  <Image
                    src={back.src}
                    alt=""
                    fill
                    sizes="(min-width: 881px) 40vw, 80vw"
                    className="rim-light object-contain"
                  />
                  {/* Glossy floor: a faded mirror image under the speaker. */}
                  <div className="floor-reflection" aria-hidden>
                    <Image src={back.src} alt="" fill sizes="(min-width: 881px) 40vw, 80vw" className="object-contain" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative mx-auto h-full max-w-7xl">
          {/* Opening chapter: the page's h1, visible before any script runs. */}
          <div
            ref={(node) => {
              blocks.current[0] = node;
            }}
            className={placement}
          >
            <RevealTitle as="h1" text="el sonido también se ve." className="display display-xl max-w-[10ch]" />
            <div data-body>
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
          </div>

          {STORY.map((chapter, i) => (
            <div
              key={chapter.title}
              ref={(node) => {
                blocks.current[i + 1] = node;
              }}
              style={{ visibility: "hidden" }}
              className={placement}
            >
              <RevealTitle as="h2" text={chapter.title} className="display display-l max-w-[10ch]" />
              <p data-body className="lede mt-5 text-blanco/75" style={{ opacity: 0 }}>
                {chapter.body}
              </p>
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
