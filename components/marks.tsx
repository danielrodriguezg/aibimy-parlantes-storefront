import type { ReactNode } from "react";
import { BoltIcon } from "@/components/icons";

/** A hand-drawn orange ring around a word in a headline. */
export function Ring({ children, delay = 0.35 }: { children: ReactNode; delay?: number }) {
  return (
    <span className="relative inline-block">
      {children}
      <svg
        className="pointer-events-none absolute -top-[14%] -left-[7%] h-[128%] w-[114%] overflow-visible"
        viewBox="0 0 620 190"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden
      >
        <path
          className="draw"
          pathLength={1}
          style={{ animationDelay: `${delay}s` }}
          d="M 330 22 C 520 14, 612 52, 600 98 C 588 150, 380 178, 230 172 C 80 166, 4 140, 10 96 C 18 46, 170 16, 360 18 C 470 20, 540 34, 560 52"
          stroke="var(--color-caucho)"
          strokeWidth={4}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}

/** A loose orange arrow that trails off the end of a headline line. */
export function TrailArrow({ delay = 0.7 }: { delay?: number }) {
  return (
    <svg className="ml-[0.08em] inline-block h-[0.5em] w-[0.95em] align-middle" viewBox="0 0 220 90" fill="none" aria-hidden>
      <path
        className="draw"
        pathLength={1}
        style={{ animationDelay: `${delay}s` }}
        d="M 6 48 C 60 44, 130 44, 196 46 M 160 14 L 200 46 L 160 78"
        stroke="var(--color-caucho)"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** The small orange badge with a bolt that closes the hero headline. */
export function BoltBadge() {
  return (
    <span
      className="rise ml-[0.12em] inline-grid h-[0.6em] w-[0.6em] place-items-center rounded-full bg-caucho align-[0.05em] text-white"
      style={{ animationDelay: "0.9s" }}
      aria-hidden
    >
      <BoltIcon className="h-[55%] w-[55%]" />
    </span>
  );
}
