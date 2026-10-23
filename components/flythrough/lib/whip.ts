import { drawCover } from "./drawCover";

const MAX_SHIFT = 0.2;
const MAX_SPREAD = 0.14;
const SAMPLES = 8;

const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function smear(ctx: CanvasRenderingContext2D, img: ImageBitmap, x: number, spread: number, w: number, h: number) {
  const zoom = 1 + (2 * (Math.abs(x) + spread / 2)) / w;
  for (let k = 0; k < SAMPLES; k++) {
    ctx.globalAlpha = 1 / (k + 1);
    drawCover(ctx, img, w, h, x + (k / (SAMPLES - 1) - 0.5) * spread, zoom);
  }
  ctx.globalAlpha = 1;
}

export function drawWhip(
  ctx: CanvasRenderingContext2D,
  scratch: CanvasRenderingContext2D,
  from: ImageBitmap,
  to: ImageBitmap,
  t: number,
  w: number,
  h: number,
) {
  const outgoing = Math.min(1, t * 2) ** 2;
  const incoming = (1 - Math.max(0, t * 2 - 1)) ** 2;
  const spread = Math.sin(Math.PI * t) * MAX_SPREAD * w;
  const mix = smoothstep(0.35, 0.65, t);

  smear(ctx, from, -outgoing * MAX_SHIFT * w, spread, w, h);
  if (mix <= 0) return;

  if (scratch.canvas.width !== w || scratch.canvas.height !== h) {
    scratch.canvas.width = w;
    scratch.canvas.height = h;
  }
  scratch.clearRect(0, 0, w, h);
  smear(scratch, to, incoming * MAX_SHIFT * w, spread, w, h);
  ctx.globalAlpha = mix;
  ctx.drawImage(scratch.canvas, 0, 0);
  ctx.globalAlpha = 1;
}
