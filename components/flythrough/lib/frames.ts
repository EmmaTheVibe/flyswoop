export type Variant = "desktop" | "mobile";
export type FrameFormat = "webp" | "avif";

export type Clip = {
  id: string;
  framePath: string;
  frameCount: number;
  format: FrameFormat;
  scrollVh: number;
};

export const MOBILE_QUERY = "(max-width: 767px) and (orientation: portrait)";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function frameUrl(framePath: string, variant: Variant, index: number, format: FrameFormat) {
  return `${framePath}/${variant}/frame_${String(index + 1).padStart(4, "0")}.${format}`;
}
