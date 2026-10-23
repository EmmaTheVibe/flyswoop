#!/usr/bin/env node
import { spawn, execFileSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const [input, outDir, countArg = "240", format = "avif"] = process.argv.slice(2);
const FFMPEG = process.env.FFMPEG ?? "ffmpeg";
const FFPROBE = process.env.FFPROBE ?? "ffprobe";
const COUNT = Number(countArg);
const WIDTH = 1920;

const QUALITY = {
  avif: { desktop: 40, mobile: 45 },
  webp: { desktop: 60, mobile: 55 },
};
if (!input || !outDir || !QUALITY[format]) {
  console.error("Usage: node scripts/encode-frames.mjs input out/version frameCount avif|webp");
  process.exit(1);
}

const probe = (entries) =>
  execFileSync(FFPROBE, ["-v", "error", "-select_streams", "v:0", "-show_entries", entries, "-of", "csv=p=0", input])
    .toString()
    .trim();
const [srcW, srcH] = probe("stream=width,height").split(",").map(Number);
const START = Number(process.env.START ?? 0);
const END = process.env.END ? Number(process.env.END) : Number(probe("format=duration"));
const duration = END - START;
if (!(duration > 0)) {
  console.error(`Nothing to encode between START=${START} and END=${END}`);
  process.exit(1);
}
const height = Math.round((WIDTH * srcH) / srcW / 2) * 2;
const mobileWidth = Math.trunc((height * 9) / 32) * 2;
const frameBytes = WIDTH * height * 3;

await mkdir(path.join(outDir, "desktop"), { recursive: true });
await mkdir(path.join(outDir, "mobile"), { recursive: true });

const encode = (sharpInstance, variant) =>
  format === "avif"
    ? sharpInstance.avif({ quality: QUALITY.avif[variant], effort: 4 })
    : sharpInstance.webp({ quality: QUALITY.webp[variant], effort: 6 });

async function writeFrame(raw, index) {
  const name = `frame_${String(index + 1).padStart(4, "0")}.${format}`;
  const image = () => sharp(raw, { raw: { width: WIDTH, height, channels: 3 } });
  await Promise.all([
    encode(image(), "desktop").toFile(path.join(outDir, "desktop", name)),
    encode(image().extract({ left: (WIDTH - mobileWidth) / 2, top: 0, width: mobileWidth, height }), "mobile").toFile(
      path.join(outDir, "mobile", name),
    ),
  ]);
}

const ffmpeg = spawn(
  FFMPEG,
  [
    "-hide_banner",
    "-loglevel",
    "error",
    "-ss",
    String(START),
    "-t",
    String(duration),
    "-i",
    input,
    "-an",
    "-vf",
    `fps=${COUNT / duration},scale=${WIDTH}:${height}:flags=lanczos`,
    "-f",
    "rawvideo",
    "-pix_fmt",
    "rgb24",
    "pipe:1",
  ],
  { stdio: ["ignore", "pipe", "inherit"] },
);

const maxInFlight = Math.max(2, Math.floor(os.availableParallelism() / 2));
const inFlight = new Set();
let pending = Buffer.alloc(0);
let index = 0;
const started = Date.now();

ffmpeg.stdout.on("data", (chunk) => {
  pending = Buffer.concat([pending, chunk]);
  while (pending.length >= frameBytes) {
    const raw = pending.subarray(0, frameBytes);
    pending = pending.subarray(frameBytes);
    const job = writeFrame(Buffer.from(raw), index++).finally(() => {
      inFlight.delete(job);
      if (inFlight.size < maxInFlight) ffmpeg.stdout.resume();
    });
    inFlight.add(job);
    if (inFlight.size >= maxInFlight) ffmpeg.stdout.pause();
    if (index % 20 === 0) process.stdout.write(`\r${index} frames encoded…`);
  }
});

const exitCode = await new Promise((resolve) => ffmpeg.on("close", resolve));
await Promise.all(inFlight);
if (exitCode !== 0) {
  console.error(`\nffmpeg exited with code ${exitCode}`);
  process.exit(1);
}
console.log(`\rEncoded ${index} ${format} frames (${WIDTH}x${height}, mobile ${mobileWidth}x${height}) in ${((Date.now() - started) / 1000).toFixed(0)}s`);
