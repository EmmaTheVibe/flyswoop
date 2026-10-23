import { frameUrl, type Clip, type Variant } from "./frames";

const CONCURRENCY = 6;
const AHEAD = 36;
const BEHIND = 18;
const EVICT_MARGIN = 12;
const ANCHOR_STEP = 16;
const ANCHOR_PRIORITY = 12;

export type FrameStore = (ImageBitmap | null)[][];

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
  const isAnchor = (c: number, f: number) => f % ANCHOR_STEP === 0 || f === clips[c].frameCount - 1;

  const frames: FrameStore = clips.map((clip) => new Array<ImageBitmap | null>(clip.frameCount).fill(null));
  const inFlight = new Set<number>();
  const failed = new Set<number>();
  let focus = 0;
  let stopped = false;

  const priority = (g: number) => {
    const [c, f] = locate(g);
    const d = g - focus;
    let p = d >= 0 ? (d <= AHEAD ? d : Infinity) : -d <= BEHIND ? -d * 2 : Infinity;
    if (isAnchor(c, f)) p = Math.min(p, ANCHOR_PRIORITY);
    return p;
  };
  const keep = (g: number) => {
    const [c, f] = locate(g);
    return isAnchor(c, f) || (g >= focus - BEHIND - EVICT_MARGIN && g <= focus + AHEAD + EVICT_MARGIN);
  };

  const pickNext = () => {
    let best = -1;
    let bestPriority = Infinity;
    for (let g = 0; g < total; g++) {
      const [c, f] = locate(g);
      if (frames[c][f] || inFlight.has(g) || failed.has(g)) continue;
      const p = priority(g);
      if (p < bestPriority) {
        best = g;
        bestPriority = p;
      }
    }
    return best;
  };

  const load = async (g: number) => {
    inFlight.add(g);
    const [c, f] = locate(g);
    try {
      const response = await fetch(frameUrl(clips[c].framePath, variant, f, clips[c].format));
      if (!response.ok) throw new Error(String(response.status));
      const bitmap = await createImageBitmap(await response.blob());
      if (stopped || !keep(g)) bitmap.close();
      else frames[c][f] = bitmap;
    } catch {
      failed.add(g);
    } finally {
      inFlight.delete(g);
      pump();
    }
  };

  const pump = () => {
    while (!stopped && inFlight.size < CONCURRENCY) {
      const g = pickNext();
      if (g < 0) return;
      void load(g);
    }
  };

  pump();

  return {
    frames,
    setFocus(clip: number, frame: number) {
      const g = offsets[clip] + frame;
      if (stopped || g === focus) return;
      focus = g;
      frames.forEach((clipFrames, c) =>
        clipFrames.forEach((bitmap, f) => {
          if (bitmap && !keep(offsets[c] + f)) {
            bitmap.close();
            clipFrames[f] = null;
          }
        }),
      );
      pump();
    },
    stop() {
      stopped = true;
      frames.forEach((clipFrames) => clipFrames.forEach((bitmap) => bitmap?.close()));
    },
  };
}

export type FrameScheduler = ReturnType<typeof createFrameScheduler>;

export function nearestFrame(frames: (ImageBitmap | null)[] | undefined, target: number) {
  if (!frames) return null;
  for (let d = 0; d < frames.length; d++) {
    const before = frames[target - d];
    if (before) return before;
    const after = frames[target + d];
    if (after) return after;
  }
  return null;
}
