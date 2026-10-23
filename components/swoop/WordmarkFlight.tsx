"use client";

import { useEffect, useRef } from "react";
import { useFlythroughProgress } from "@/components/flythrough";
import { WORDMARK_ANCHOR, WORDMARK_CORNER_SIZE, WORDMARK_HERO_SIZE, WORDMARK_PILL } from "./wordmark";

const FLIGHT = [0.24, 0.38] as const;
const ARC = 60;

type Geometry = { fromX: number; fromY: number; toX: number; toY: number; scale: number };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

function offsetWithin(el: HTMLElement, stage: HTMLElement) {
  let x = 0;
  let y = 0;
  for (let node: HTMLElement | null = el; node && node !== stage; node = node.offsetParent as HTMLElement | null) {
    x += node.offsetLeft;
    y += node.offsetTop;
  }
  return { x, y };
}

export default function WordmarkFlight() {
  const flyerRef = useRef<HTMLSpanElement>(null);
  const cornerRef = useRef<HTMLParagraphElement>(null);
  const geometry = useRef<Geometry | null>(null);
  const lastT = useRef(0);

  const apply = (t: number) => {
    lastT.current = t;
    const flyer = flyerRef.current;
    const corner = cornerRef.current;
    const g = geometry.current;
    if (!flyer || !corner || !g) return;

    const e = easeInOut(t);
    const x = g.fromX + (g.toX - g.fromX) * e;
    const y = g.fromY + (g.toY - g.fromY) * e + Math.sin(Math.PI * e) * ARC;
    const s = 1 + (g.scale - 1) * e;
    flyer.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
    flyer.style.opacity = t >= 1 ? "0" : "1";
    corner.style.opacity = t >= 1 ? "1" : "0";
  };

  useFlythroughProgress((p) => apply(clamp01((p - FLIGHT[0]) / (FLIGHT[1] - FLIGHT[0]))), "intro");

  useEffect(() => {
    const flyer = flyerRef.current;
    const corner = cornerRef.current;
    const stage = flyer?.offsetParent as HTMLElement | null;
    const anchor = stage?.querySelector<HTMLElement>(`[${WORDMARK_ANCHOR}]`);
    if (!flyer || !corner || !stage || !anchor) return;

    const measure = () => {
      const from = offsetWithin(anchor, stage);
      const to = corner.getBoundingClientRect();
      geometry.current = { fromX: from.x, fromY: from.y, toX: to.left, toY: to.top, scale: to.width / anchor.offsetWidth };
      anchor.style.visibility = "hidden";
      apply(lastT.current);
    };

    measure();
    void document.fonts.ready.then(measure);
    const resize = new ResizeObserver(measure);
    resize.observe(stage);
    resize.observe(anchor);
    return () => {
      resize.disconnect();
      anchor.style.visibility = "";
    };
  }, []);

  return (
    <>
      <span
        ref={flyerRef}
        aria-hidden="true"
        className={`pointer-events-none absolute top-0 left-0 z-10 origin-top-left motion-reduce:hidden ${WORDMARK_HERO_SIZE}`}
        style={{ opacity: 0 }}
      >
        <span className={`intro-swoop ${WORDMARK_PILL}`}>Swoop</span>
      </span>
      <p
        ref={cornerRef}
        className={`fixed top-5 left-6 z-10 md:top-8 md:left-16 motion-reduce:opacity-100! ${WORDMARK_PILL} ${WORDMARK_CORNER_SIZE}`}
        style={{ opacity: 0 }}
      >
        Swoop
      </p>
    </>
  );
}
