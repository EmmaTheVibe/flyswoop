"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect, type ReactNode } from "react";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let instance: Lenis | null = null;

    const sync = () => {
      instance?.destroy();
      instance = reducedMotion.matches
        ? null
        : new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: true, autoRaf: true });
    };

    sync();
    reducedMotion.addEventListener("change", sync);
    return () => {
      reducedMotion.removeEventListener("change", sync);
      instance?.destroy();
    };
  }, []);

  return children;
}
