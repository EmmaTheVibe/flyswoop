import type { Clip } from "./frames";

export type FrameRef = { clip: number; frame: number };

export type Scene = { kind: "frame"; at: FrameRef } | { kind: "whip"; from: FrameRef; to: FrameRef; t: number };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function createTimeline(clips: Clip[], transitionVh: number) {
  const starts: number[] = [];
  let total = 0;
  for (const clip of clips) {
    starts.push(total);
    total += clip.scrollVh;
  }
  const indexById = new Map(clips.map((clip, i) => [clip.id, i]));

  const local = (i: number, g: number) => (g * total - starts[i]) / clips[i].scrollVh;
  const frameAt = (i: number, g: number): FrameRef => ({
    clip: i,
    frame: Math.round(clamp01(local(i, g)) * (clips[i].frameCount - 1)),
  });

  return {
    total,
    localFor(clipId: string | undefined, g: number) {
      const i = clipId === undefined ? undefined : indexById.get(clipId);
      return i === undefined ? g : local(i, g);
    },
    scene(g: number): Scene {
      const x = g * total;
      for (let i = 1; i < clips.length; i++) {
        const from = starts[i] - transitionVh / 2;
        if (x >= from && x < from + transitionVh) {
          return { kind: "whip", from: frameAt(i - 1, g), to: frameAt(i, g), t: (x - from) / transitionVh };
        }
      }
      let i = clips.length - 1;
      while (i > 0 && x < starts[i]) i--;
      return { kind: "frame", at: frameAt(i, g) };
    },
  };
}

export type Timeline = ReturnType<typeof createTimeline>;
