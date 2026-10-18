/**
 * Hand-drawn marks from the art direction: an orange ring around a word, an orange arrow after
 * one, and the white loop that wraps the product. Each one draws itself once (CSS `.draw-on`).
 */

export function Circled({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span className="relative z-10">{children}</span>
      <svg
        viewBox="0 0 200 80"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -top-[16%] -left-[9%] h-[132%] w-[118%] overflow-visible"
        aria-hidden
      >
        <path
          d="M 62 77 C 6 75, 2 8, 100 4 C 196 2, 199 70, 106 75 C 52 78, 14 62, 20 32"
          pathLength={1}
          fill="none"
          stroke="var(--color-caucho)"
          strokeWidth={3.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="draw-on"
        />
      </svg>
    </span>
  );
}

export function Arrowed({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap">
      {children}
      <svg viewBox="0 0 80 40" className="ml-[0.12em] h-[0.5em] w-[1.05em] overflow-visible" aria-hidden>
        <path
          d="M 2 22 C 22 15, 44 27, 72 20 M 56 7 L 73 20 L 56 33"
          pathLength={1}
          fill="none"
          stroke="var(--color-caucho)"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="draw-on"
          style={{ animationDelay: "0.9s" }}
        />
      </svg>
    </span>
  );
}

/** The white loop drawn across the arch; it sits over the product like a thrown cable. */
export function Loop({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 500" className={`pointer-events-none overflow-visible ${className}`} aria-hidden>
      <path
        d="M 352 40 C 400 6, 412 74, 360 70 C 300 66, 210 92, 120 150 C 30 208, 70 290, 190 278 C 310 266, 360 190, 300 158 C 240 126, 140 190, 92 290 C 64 350, 30 384, 8 376 C -14 366, 0 336, 22 346"
        pathLength={1}
        fill="none"
        stroke="#fff"
        strokeWidth={2.5}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="draw-on"
        style={{ animationDuration: "1.8s", animationDelay: "0.5s" }}
      />
    </svg>
  );
}
