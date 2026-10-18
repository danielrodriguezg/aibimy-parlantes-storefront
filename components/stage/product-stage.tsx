import Image from "next/image";
import { SpecIcon } from "@/components/icons";
import type { SpecChip } from "@/lib/catalog";

export type StagePhoto = { key: string; src: string; width: number; height: number; alt: string };

const CHIP_SPOTS = ["left-0 top-[36%] float-slow", "right-0 bottom-[16%] float-late"];

/**
 * The product on its arch: a coloured arch, the cut-out photo standing in front of it (and
 * rising above it), a hand-drawn loop around the product, a few floating spheres and up to two
 * spec chips. Several photos can be passed; only `active` shows, the rest cross-fade out.
 */
export function ProductStage({
  photos,
  active = 0,
  tone,
  chips = [],
  priority = false,
  sizes = "(min-width: 1024px) 34vw, 86vw"
}: {
  photos: StagePhoto[];
  active?: number;
  tone: string;
  chips?: SpecChip[];
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[34rem]">
      <div
        className="absolute inset-x-[10%] top-[22%] bottom-[4%] rounded-t-full transition-colors duration-700"
        style={{ backgroundColor: tone }}
        aria-hidden
      >
        <div className="absolute inset-0 rounded-t-full bg-gradient-to-b from-white/25 to-transparent" />
      </div>
      <div className="contact-shadow absolute bottom-[1%] left-1/2 h-[4%] w-[46%] -translate-x-1/2" aria-hidden />

      {/* The loop sits half behind the product: drawn first, the photo covers its crossing. */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 500" fill="none" aria-hidden>
        <path
          className="draw"
          pathLength={1}
          style={{ animationDelay: "0.5s" }}
          d="M 18 368 C 50 330, 96 322, 92 296 C 88 268, 52 282, 66 306 C 92 350, 300 330, 318 250 C 334 180, 250 150, 182 166 C 120 182, 134 224, 196 218 C 268 212, 318 150, 340 132 C 360 116, 386 120, 376 140 C 368 154, 350 146, 362 130 C 374 116, 392 112, 400 116"
          stroke="white"
          strokeWidth={2.2}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="float absolute inset-x-[25%] top-[9%] bottom-[2.5%]">
        {photos.map((photo, index) => (
          <Image
            key={photo.key}
            src={photo.src}
            alt={photo.alt}
            fill
            priority={priority && index === 0}
            sizes={sizes}
            aria-hidden={index !== active}
            className="object-contain object-bottom drop-shadow-[0_28px_30px_rgba(17,18,20,0.22)] transition-[opacity,transform] duration-700 ease-out"
            style={{
              opacity: index === active ? 1 : 0,
              transform: index === active ? "none" : `translateX(${index < active ? -8 : 8}%) scale(0.94)`
            }}
          />
        ))}
      </div>

      <span className="sphere float-late absolute left-[14%] top-[30%] h-[6%] w-[4.8%]" aria-hidden />
      <span className="sphere float absolute right-[12%] top-[56%] h-[9%] w-[7.2%] blur-[2px]" aria-hidden />
      <span className="sphere float-slow absolute right-[20%] top-[22%] h-[3%] w-[2.4%]" aria-hidden />

      {chips.map((chip, i) => (
        <div key={chip.title} className={`absolute ${CHIP_SPOTS[i]}`}>
          <div
            className="chip rise flex items-center gap-3 rounded-full py-2 pr-5 pl-2 whitespace-nowrap"
            style={{ animationDelay: `${0.7 + i * 0.25}s` }}
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-papel text-caucho">
              <SpecIcon icon={chip.icon} className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-[0.95rem] font-bold tracking-tight">{chip.title}</span>
              <span className="block text-xs text-gris">{chip.caption}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
