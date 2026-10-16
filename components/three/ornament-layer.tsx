"use client";

import dynamic from "next/dynamic";

const Ornaments = dynamic(() => import("@/components/three/ornaments"), { ssr: false });

/**
 * Drop-in ornament layer for a section (the section must be `relative`). "day" and "studio"
 * sections get the light version, and the canvas paints their background once it is running.
 */
export function OrnamentLayer({ variant }: { variant: "night" | "day" | "studio" }) {
  return <Ornaments variant={variant} />;
}
