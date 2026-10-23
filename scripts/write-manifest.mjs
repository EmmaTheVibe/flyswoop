#!/usr/bin/env node
import { readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const VARIANTS = ["desktop", "mobile"];
const BUDGET_KB = { desktop: 80, mobile: 35 };
const TOTAL_BUDGET_MB = { desktop: 12, mobile: 6 };
const FRAME_FILE = /^frame_\d{4}\.(webp|avif)$/;
const SAFE_VERSION = /^[\w.-]+$/;

export async function writeManifest(outDir, version, source) {
  if (!SAFE_VERSION.test(version)) throw new Error(`Invalid version "${version}"`);

  let frameCount;
  let format;
  const variants = {};
  for (const variant of VARIANTS) {
    const dir = path.join(outDir, version, variant);
    const files = (await readdir(dir)).filter((f) => FRAME_FILE.test(f)).sort();
    if (files.length === 0) throw new Error(`No frames found in ${dir}`);
    if (frameCount !== undefined && files.length !== frameCount) {
      throw new Error(`${variant} has ${files.length} frames, expected ${frameCount}`);
    }
    frameCount = files.length;

    const formats = new Set(files.map((f) => path.extname(f).slice(1)));
    if (formats.size > 1 || (format && !formats.has(format))) {
      throw new Error(`Mixed frame formats in ${path.join(outDir, version)}`);
    }
    format = [...formats][0];

    const { width, height } = await sharp(path.join(dir, files[0])).metadata();
    variants[variant] = { width, height };

    const sizes = await Promise.all(files.map(async (f) => (await stat(path.join(dir, f))).size));
    report(variant, sizes);
  }

  const manifestPath = path.join(outDir, "manifest.json");
  const previous = await readFile(manifestPath, "utf8").then(JSON.parse, () => null);
  const manifest = { version, frameCount, format, source, variants };
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Wrote ${manifestPath} (${frameCount} frames, version ${version})`);

  if (previous?.version && previous.version !== version && SAFE_VERSION.test(previous.version)) {
    await rm(path.join(outDir, previous.version), { recursive: true, force: true });
    console.log(`Removed previous frame set ${previous.version}`);
  }
  return manifest;
}

function report(variant, sizes) {
  const kb = sizes.map((s) => s / 1024);
  const avg = kb.reduce((a, b) => a + b, 0) / kb.length;
  const max = Math.max(...kb);
  const totalMb = kb.reduce((a, b) => a + b, 0) / 1024;
  const over = kb.filter((k) => k > BUDGET_KB[variant]).length;

  console.log(
    `${variant.padEnd(7)} avg ${avg.toFixed(1)} KB, max ${max.toFixed(1)} KB, total ${totalMb.toFixed(2)} MB`,
  );
  if (over > 0) console.warn(`  ⚠ ${over} frames over the ${BUDGET_KB[variant]} KB budget`);
  if (totalMb > TOTAL_BUDGET_MB[variant]) {
    console.warn(`  ⚠ total is over the ${TOTAL_BUDGET_MB[variant]} MB budget`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [outDir, version, source = "unknown"] = process.argv.slice(2);
  if (!outDir || !version) {
    console.error("Usage: node scripts/write-manifest.mjs <outDir> <version> [source]");
    process.exit(1);
  }
  await writeManifest(outDir, version, source);
}
