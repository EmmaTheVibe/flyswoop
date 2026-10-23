import { useEffect, type RefObject } from "react";
import { watchDevicePixelRatio } from "../lib/dom";
import { sizeCanvas } from "../lib/drawCover";
import type { FrameStore } from "../lib/frameScheduler";
import { REDUCED_MOTION_QUERY } from "../lib/frames";
import type { ProgressChannel } from "../lib/progressChannel";
import { changed, focusOf, paint, resolveScene, type Drawn } from "../lib/render";
import type { Timeline } from "../lib/timeline";

type CanvasPlayerOptions = {
  wrapperRef: RefObject<HTMLElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  progress: RefObject<number>;
  frames: RefObject<FrameStore>;
  setFocus: (clip: number, frame: number) => void;
  channel: ProgressChannel;
  timeline: Timeline;
  frameLerp: number;
};

export function useCanvasPlayer({
  wrapperRef,
  canvasRef,
  progress,
  frames,
  setFocus,
  channel,
  timeline,
  frameLerp,
}: CanvasPlayerOptions) {
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    const scratch = document.createElement("canvas").getContext("2d");
    if (!wrapper || !canvas || !ctx || !scratch) return;

    let drawn: Drawn | null = null;
    let g = progress.current;
    let raf = 0;
    let visible = false;

    const draw = (d: Drawn) => {
      if (!paint(ctx, scratch, d)) return;
      drawn = d;
      canvas.style.opacity = "1";
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      channel.publish(progress.current);
      g = frameLerp > 0 ? g + (progress.current - g) * frameLerp : progress.current;

      const scene = timeline.scene(g);
      const focus = focusOf(scene);
      setFocus(focus.clip, focus.frame);

      const next = resolveScene(scene, frames.current);
      if (next && changed(drawn, next)) draw(next);
    };

    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    const run = () => {
      cancelAnimationFrame(raf);
      if (reducedMotion.matches) channel.publish(1);
      else if (visible) raf = requestAnimationFrame(tick);
    };
    reducedMotion.addEventListener("change", run);

    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        run();
      },
      { rootMargin: "100% 0px" },
    );
    visibility.observe(wrapper);

    const resize = () => {
      if (sizeCanvas(canvas) && drawn) draw(drawn);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const stopWatchingDpr = watchDevicePixelRatio(resize);

    return () => {
      cancelAnimationFrame(raf);
      reducedMotion.removeEventListener("change", run);
      visibility.disconnect();
      resizeObserver.disconnect();
      stopWatchingDpr();
    };
  }, [wrapperRef, canvasRef, progress, frames, setFocus, channel, timeline, frameLerp]);
}
