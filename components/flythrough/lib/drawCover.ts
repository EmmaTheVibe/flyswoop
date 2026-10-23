export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: ImageBitmap,
  canvasW: number,
  canvasH: number,
  offsetX = 0,
  zoom = 1,
) {
  const scale = Math.max(canvasW / img.width, canvasH / img.height) * zoom;
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (canvasW - w) / 2 + offsetX, (canvasH - h) / 2, w, h);
}

export function sizeCanvas(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.round(canvas.clientWidth * dpr);
  const height = Math.round(canvas.clientHeight * dpr);
  if (canvas.width === width && canvas.height === height) return false;
  canvas.width = width;
  canvas.height = height;
  return true;
}
