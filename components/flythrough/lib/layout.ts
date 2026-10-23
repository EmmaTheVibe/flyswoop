import type { Overlay } from "./overlays";

type Position = Overlay["position"];

export const TEXT_POSITION_CLASSES: Record<Position, string> = {
  left: "items-start justify-start pt-[16svh] md:items-center md:pt-0",
  right: "items-start justify-start pt-[16svh] md:items-center md:justify-end md:pt-0 md:text-right",
  center: "items-center justify-center text-center",
  bottom: "items-end justify-center pb-[12svh] text-center",
};

export const IMAGE_POSITION_CLASSES: Record<Position, string> = {
  left: "items-end justify-center pb-[8svh] md:items-center md:justify-end md:pr-[6vw] md:pb-0",
  right: "items-end justify-center pb-[8svh] md:items-center md:justify-start md:pl-[6vw] md:pb-0",
  center: "items-end justify-center pb-[8svh]",
  bottom: "items-start justify-center pt-[16svh]",
};

export const REDUCED = {
  wrapper: "motion-reduce:h-auto",
  stage: "motion-reduce:relative motion-reduce:h-auto motion-reduce:min-h-svh",
  layer: "motion-reduce:relative motion-reduce:inset-auto",
  text: "motion-reduce:py-[12svh] motion-reduce:visible! motion-reduce:opacity-100! motion-reduce:transform-none! motion-reduce:filter-none!",
  image: "motion-reduce:visible! motion-reduce:opacity-100! motion-reduce:transform-none!",
};

export function headingClasses(hero = false) {
  return `font-display font-normal text-balance [text-shadow:0_2px_28px_rgb(11_15_25/0.45)] ${
    hero ? "text-5xl leading-[1.02] md:text-8xl short:text-4xl" : "text-4xl leading-[1.08] md:text-6xl short:text-3xl"
  }`;
}
