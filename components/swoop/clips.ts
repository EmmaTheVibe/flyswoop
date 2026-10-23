import type { Clip, FrameFormat } from "@/components/flythrough";
import beach from "@/public/frames/beach/manifest.json";
import intro from "@/public/frames/intro/manifest.json";
import la from "@/public/frames/la/manifest.json";
import mountains from "@/public/frames/mountains/manifest.json";
import vancouver from "@/public/frames/vancouver/manifest.json";

type Manifest = { version: string; frameCount: number; format: string };

const clip = (id: string, manifest: Manifest, scrollVh: number): Clip => ({
  id,
  framePath: `/frames/${id}/${manifest.version}`,
  frameCount: manifest.frameCount,
  format: manifest.format as FrameFormat,
  scrollVh,
});

export const storyClips: Clip[] = [
  clip("intro", intro, 200),
  clip("vancouver", vancouver, 230),
  clip("la", la, 220),
  clip("mountains", mountains, 140),
  clip("beach", beach, 300),
];
