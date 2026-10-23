import type { StaticImageData } from "next/image";
import type { ReactNode } from "react";

export type Overlay = {
  id: string;
  clip?: string;
  start: number;
  end: number;
  fade?: number;
  position: "center" | "left" | "right" | "bottom";
  stamp?: string;
  title?: ReactNode;
  body?: ReactNode;
  hero?: boolean;
  image?: { src: StaticImageData; alt: string };
  product?: { lead: string; name: string; price: string; cta: string };
  content?: ReactNode;
};

const DEFAULT_FADE = 0.05;
const SHIFT_PX = 16;
const BLUR_PX = 6;
const DRIFT_PX = 48;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function fades(overlay: Overlay, p: number) {
  const fade = overlay.fade ?? DEFAULT_FADE;
  return {
    fadeIn: clamp01((p - overlay.start) / fade),
    fadeOut: clamp01((overlay.end - p) / fade),
  };
}

export function overlayAmount(overlay: Overlay, p: number) {
  const { fadeIn, fadeOut } = fades(overlay, p);
  return Math.min(fadeIn, fadeOut);
}

export function overlayStyle(overlay: Overlay, p: number) {
  const { fadeIn, fadeOut } = fades(overlay, p);
  const v = Math.min(fadeIn, fadeOut);
  const shift = (fadeIn < 1 ? 1 : -1) * SHIFT_PX * (1 - v);
  return {
    opacity: String(v),
    visibility: v > 0 ? "visible" : "hidden",
    transform: `translate3d(0, ${shift.toFixed(2)}px, 0)`,
    filter: v < 1 ? `blur(${(BLUR_PX * (1 - v)).toFixed(2)}px)` : "none",
  } as const;
}

export function overlayImageStyle(overlay: Overlay, p: number) {
  const v = overlayAmount(overlay, p);
  const through = clamp01((p - overlay.start) / (overlay.end - overlay.start));
  const drift = (0.5 - through) * 2 * DRIFT_PX;
  return {
    opacity: String(v),
    visibility: v > 0 ? "visible" : "hidden",
    transform: `translate3d(0, ${drift.toFixed(2)}px, 0) scale(${(0.94 + 0.06 * v).toFixed(4)})`,
  } as const;
}
