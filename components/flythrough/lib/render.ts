import { drawCover } from "./drawCover";
import { nearestFrame, type FrameStore } from "./frameScheduler";
import type { FrameRef, Scene } from "./timeline";
import { drawWhip } from "./whip";

export type Drawn = { a: ImageBitmap; b?: ImageBitmap; t: number };

export function focusOf(scene: Scene): FrameRef {
  if (scene.kind === "frame") return scene.at;
  return scene.t < 0.5 ? scene.from : scene.to;
}

export function resolveScene(scene: Scene, frames: FrameStore): Drawn | null {
  if (scene.kind === "frame") {
    const a = nearestFrame(frames[scene.at.clip], scene.at.frame);
    return a ? { a, t: 0 } : null;
  }
  const a = nearestFrame(frames[scene.from.clip], scene.from.frame);
  const b = nearestFrame(frames[scene.to.clip], scene.to.frame);
  if (a && b) return { a, b, t: scene.t };
  const either = a ?? b;
  return either ? { a: either, t: 0 } : null;
}

export function changed(drawn: Drawn | null, next: Drawn) {
  return !drawn || next.a !== drawn.a || next.b !== drawn.b || Math.abs(next.t - drawn.t) > 0.001;
}

export function paint(ctx: CanvasRenderingContext2D, scratch: CanvasRenderingContext2D, d: Drawn) {
  if (d.a.width === 0 || (d.b && d.b.width === 0)) return false;
  const { width, height } = ctx.canvas;
  if (d.b) drawWhip(ctx, scratch, d.a, d.b, d.t, width, height);
  else drawCover(ctx, d.a, width, height);
  return true;
}
