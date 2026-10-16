/**
 * Mutable state shared between the DOM (scroll, pointer) and the WebGL frame loop.
 * It is read every frame, so it lives outside React to avoid re-rendering on scroll.
 */
export const stage = {
  /** 0..1 progress through the night chapters on the home page */
  night: 0,
  /** hue (0..1) the featured speaker's RGB panel is showing; tints the stage glow */
  hue: 0.08,
  /** 0..1 how bright the RGB panels are on the home stage (the load-in ramp) */
  power: 0,
  reducedMotion: false,
  /** pointer position in -1..1, for a subtle parallax on the stage */
  pointer: { x: 0, y: 0 },
  /** 0..1 progress through the whole page, from Lenis */
  scroll: 0,
  /** Lenis scroll velocity (px per frame, signed); ornaments stir with it */
  velocity: 0,
  /** true while the home's night chapters drive `hue` and `power`; otherwise the ornaments do */
  chaptersActive: false
};

/** The night chapters, in scroll order. Each one owns an equal slice of `stage.night`. */
export const CHAPTERS = ["inicio", "luz", "potencia", "agua", "pareja"] as const;

/** 0..1 visibility of chapter `index` for a given night progress; peaks at the chapter's center. */
export function chapterWeight(progress: number, index: number) {
  const slice = 1 / CHAPTERS.length;
  const center = slice * (index + 0.5);
  // The first chapter is fully visible at the top of the page, before any scroll.
  if (index === 0 && progress < center) return 1;
  // Full opacity around the center, gone before the neighbour starts: copy never overlaps.
  const t = Math.min(1, Math.max(0, (Math.abs(progress - center) - slice * 0.2) / (slice * 0.24)));
  return 1 - t * t * (3 - 2 * t);
}
