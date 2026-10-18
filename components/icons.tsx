import type { ChipIcon } from "@/lib/catalog";

type IconProps = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const
};

export function BagIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M5 8h14l-1 12H6L5 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function ArrowIcon({ className, direction = "right" }: IconProps & { direction?: "left" | "right" | "down" }) {
  const rotate = { right: 0, down: 90, left: 180 }[direction];
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ transform: `rotate(${rotate}deg)` }} aria-hidden {...stroke}>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke} strokeWidth={2.4}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function BoltIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  );
}

/** The small icons on the product stage chips and the feature tiles. */
export function SpecIcon({ icon, className }: IconProps & { icon: ChipIcon | "light" }) {
  switch (icon) {
    case "power":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke} strokeWidth={2}>
          <path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4" />
        </svg>
      );
    case "battery":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke} strokeWidth={2}>
          <rect x="3" y="7" width="16" height="10" rx="2" />
          <path d="M21 11v2M6 10v4M9 10v4M12 10v4" />
        </svg>
      );
    case "water":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke} strokeWidth={2}>
          <path d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z" />
        </svg>
      );
    case "pair":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke} strokeWidth={2}>
          <circle cx="9" cy="12" r="5" />
          <circle cx="15" cy="12" r="5" />
        </svg>
      );
    case "light":
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke} strokeWidth={2}>
          <rect x="8" y="3" width="8" height="18" rx="4" />
          <path d="M10.5 8.5l3-1.5M10.5 12l3-1.5M10.5 15.5l3-1.5" />
        </svg>
      );
  }
}
