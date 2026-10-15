"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect } from "react";
import { stage } from "@/lib/stage-store";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooth scrolling driven by GSAP's ticker so ScrollTrigger and the scroll stay in step.
 * With reduced motion the page keeps native scrolling; scroll-linked scenes still follow it.
 */
export function SmoothScroll() {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    stage.reducedMotion = motion.matches;

    const onPointer = (event: PointerEvent) => {
      stage.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      stage.pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    if (motion.matches) {
      return () => window.removeEventListener("pointermove", onPointer);
    }

    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -72 } });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      window.removeEventListener("pointermove", onPointer);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
