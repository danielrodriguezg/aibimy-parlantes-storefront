"use client";

import dynamic from "next/dynamic";
import { ANGLES, type Angle } from "@/components/three/render-harness";

const RenderHarness = dynamic(() => import("@/components/three/render-harness"), { ssr: false });

export function HarnessStage({ handle, angle }: { handle: string; angle: string }) {
  const safeAngle = (angle in ANGLES ? angle : "tresCuartos") as Angle;
  return (
    // Below the shared canvas (z-30), above the page; the site header is hidden for clean shots.
    <main className="fixed inset-0 z-[25] bg-white">
      <style>{"header{display:none}"}</style>
      <RenderHarness handle={handle} angle={safeAngle} />
    </main>
  );
}
