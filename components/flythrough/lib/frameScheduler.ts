import { frameUrl, type Clip, type Variant } from "./frames";

const FETCH_CONCURRENCY = 6;
const DECODE_CONCURRENCY = 4;
const AHEAD = 40;
const BEHIND = 16;
const EVICT_MARGIN = 12;
const PREVIEW_STEP = 4;
const PREVIEW_PRIORITY_OFFSET = 4;
const PREVIEW_WIDTH: Record<Variant, number> = { desktop: 640, mobile: 320 };

export type FrameStore = {
  full: (ImageBitmap | null)[][];
  preview: (ImageBitmap | null)[][];
};

export const EMPTY_STORE: FrameStore = { full: [], preview: [] };

export function createFrameScheduler(clips: Clip[], variant: Variant) {
  const offsets: number[] = [];
  let total = 0;
  for (const clip of clips) {
    offsets.push(total);
    total += clip.frameCount;
  }
  const locate = (g: number) => {
    let c = clips.length - 1;
    while (c > 0 && g < offsets[c]) c--;
    return [c, g - offsets[c]] as const;
  };
  const isPreview = (c: number, f: number) => f % PREVIEW_STEP === 0 || f === clips[c].frameCount - 1;

  const emptyClips = () => clips.map((clip) => new Array<ImageBitmap | null>(clip.frameCount).fill(null));
  const frames: FrameStore = { full: emptyClips(), preview: emptyClips() };
  const blobs = new Array<Blob | null>(total).fill(null);
  const fetching = new Set<number>();
  const decodingFull = new Set<number>();
  const decodingPreview = new Set<number>();
  const failed = new Set<number>();
  const controller = new AbortController();
  let focus = 0;
  let direction = 1;
  let stopped = false;

  const inWindow = (g: number, margin = 0) => {
    const back = (direction > 0 ? BEHIND : AHEAD) + margin;
    const forward = (direction > 0 ? AHEAD : BEHIND) + margin;
    return g >= focus - back && g <= focus + forward;
  };
  const distance = (g: number) => {
    const d = (g - focus) * direction;
    return d >= 0 ? d : -d * 2;
  };

  const nextFetch = () => {
    let best = -1;
    let bestScore = Infinity;
    for (let g = 0; g < total; g++) {
      if (blobs[g] || fetching.has(g) || failed.has(g)) continue;
      const score = distance(g);
      if (score < bestScore) {
        best = g;
        bestScore = score;
      }
    }
    return best;
  };

  const nextDecode = () => {
    let best: { g: number; preview: boolean } | null = null;
    let bestScore = Infinity;
    for (let g = 0; g < total; g++) {
      if (!blobs[g] || failed.has(g)) continue;
      const [c, f] = locate(g);
      if (isPreview(c, f) && !frames.preview[c][f] && !decodingPreview.has(g)) {
        const score = distance(g) / PREVIEW_STEP + PREVIEW_PRIORITY_OFFSET;
        if (score < bestScore) {
          best = { g, preview: true };
          bestScore = score;
        }
      }
      if (inWindow(g) && !frames.full[c][f] && !decodingFull.has(g)) {
        const score = distance(g);
        if (score < bestScore) {
          best = { g, preview: false };
          bestScore = score;
        }
      }
    }
    return best;
  };

  const fetchFrame = async (g: number) => {
    fetching.add(g);
    const [c, f] = locate(g);
    try {
      const response = await fetch(frameUrl(clips[c].framePath, variant, f, clips[c].format), {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(String(response.status));
      blobs[g] = await response.blob();
    } catch {
      if (!stopped) failed.add(g);
    } finally {
      fetching.delete(g);
      pump();
    }
  };

  const decodeFrame = async (g: number, preview: boolean) => {
    const decoding = preview ? decodingPreview : decodingFull;
    decoding.add(g);
    const [c, f] = locate(g);
    try {
      const blob = blobs[g]!;
      const bitmap = preview
        ? await createImageBitmap(blob, { resizeWidth: PREVIEW_WIDTH[variant], resizeQuality: "medium" })
        : await createImageBitmap(blob);
      if (stopped || (!preview && !inWindow(g, EVICT_MARGIN))) bitmap.close();
      else (preview ? frames.preview : frames.full)[c][f] = bitmap;
    } catch {
      if (!stopped) failed.add(g);
    } finally {
      decoding.delete(g);
      pump();
    }
  };

  const pump = () => {
    if (stopped) return;
    while (fetching.size < FETCH_CONCURRENCY) {
      const g = nextFetch();
      if (g < 0) break;
      void fetchFrame(g);
    }
    while (decodingFull.size + decodingPreview.size < DECODE_CONCURRENCY) {
      const next = nextDecode();
      if (!next) break;
      void decodeFrame(next.g, next.preview);
    }
  };

  pump();

  return {
    frames,
    setFocus(clip: number, frame: number) {
      const g = offsets[clip] + frame;
      if (stopped || g === focus) return;
      direction = g > focus ? 1 : -1;
      focus = g;
      frames.full.forEach((clipFrames, c) =>
        clipFrames.forEach((bitmap, f) => {
          if (bitmap && !inWindow(offsets[c] + f, EVICT_MARGIN)) {
            bitmap.close();
            clipFrames[f] = null;
          }
        }),
      );
      pump();
    },
    stop() {
      stopped = true;
      controller.abort();
      for (const set of [frames.full, frames.preview]) {
        set.forEach((clipFrames) => clipFrames.forEach((bitmap) => bitmap?.close()));
      }
    },
  };
}

export type FrameScheduler = ReturnType<typeof createFrameScheduler>;

export function pickFrame(store: FrameStore, clip: number, target: number) {
  const full = store.full[clip];
  const preview = store.preview[clip];
  if (!full || !preview) return null;
  for (let d = 0; d < full.length; d++) {
    const candidates = d === 0 ? [target] : [target - d, target + d];
    for (const i of candidates) if (full[i]) return full[i];
    for (const i of candidates) if (preview[i]) return preview[i];
  }
  return null;
}
