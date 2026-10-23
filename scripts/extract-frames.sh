#!/usr/bin/env bash
set -euo pipefail

USAGE="Usage: extract-frames.sh input.mp4 out_dir [frame_count] [avif|webp]"
INPUT=${1:?$USAGE}
OUT=${2:?$USAGE}
COUNT=${3:-240}
FORMAT=${4:-avif}
VERSION="v$(date +%Y%m%d%H%M%S)"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

FFMPEG=$(command -v ffmpeg || (cd "$ROOT" && node -p "require('ffmpeg-static')"))
FFPROBE=$(command -v ffprobe || (cd "$ROOT" && node -p "require('ffprobe-static').path"))

FFMPEG="$FFMPEG" FFPROBE="$FFPROBE" \
  node "$ROOT/scripts/encode-frames.mjs" "$INPUT" "$OUT/$VERSION" "$COUNT" "$FORMAT"

node "$ROOT/scripts/write-manifest.mjs" "$OUT" "$VERSION" "$(basename "$INPUT")"
