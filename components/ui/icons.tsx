import type { Highlight } from "@/lib/catalog";

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true
};

export const ArrowLeft = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M20 12H4M10 6l-6 6 6 6" />
  </svg>
);
export const ArrowRight = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
);
export const ArrowDown = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M12 4v16M6 14l6 6 6-6" />
  </svg>
);
export const Check = ({ className }: IconProps) => (
  <svg {...base} strokeWidth={2.4} className={className}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const Plus = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M12 5v14" />
  </svg>
);
export const Bag = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </svg>
);

const HIGHLIGHT_PATHS: Record<Highlight["icon"], React.ReactNode> = {
  bolt: <path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3z" />,
  light: (
    <>
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
    </>
  ),
  drop: <path d="M12 3c3.5 4.4 6 7.7 6 10.8A6 6 0 0 1 6 13.8C6 10.7 8.5 7.4 12 3z" />,
  battery: (
    <>
      <rect x="3" y="7" width="16" height="10" rx="2.5" />
      <path d="M21.5 10.5v3M7 10.5v3M10.5 10.5v3" />
    </>
  ),
  pair: (
    <>
      <rect x="3" y="6" width="6" height="12" rx="2" />
      <rect x="15" y="6" width="6" height="12" rx="2" />
      <path d="M10.6 10.4c.9-.7 1.9-.7 2.8 0M10 8c1.3-1 2.7-1 4 0" />
    </>
  )
};

export function HighlightIcon({ icon, className }: { icon: Highlight["icon"]; className?: string }) {
  return (
    <svg {...base} className={className}>
      {HIGHLIGHT_PATHS[icon]}
    </svg>
  );
}

/** A floating white pill with an icon, a bold label and a short line under it. */
export function Chip({ highlight, className = "" }: { highlight: Highlight; className?: string }) {
  return (
    <div className={`chip flex items-center gap-3 rounded-full bg-white py-2 pr-5 pl-2 ${className}`}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-caucho-suave text-caucho">
        <HighlightIcon icon={highlight.icon} className="h-5 w-5" />
      </span>
      <span className="text-sm leading-tight whitespace-nowrap text-grafito">
        <b className="block font-semibold text-tela">{highlight.label}</b>
        {highlight.detail}
      </span>
    </div>
  );
}
