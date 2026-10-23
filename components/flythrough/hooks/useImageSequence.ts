import { useCallback, useEffect, useRef } from "react";
import { MOBILE_QUERY, REDUCED_MOTION_QUERY, type Clip } from "../lib/frames";
import { createFrameScheduler, type FrameScheduler, type FrameStore } from "../lib/frameScheduler";

export function useImageSequence(clips: Clip[]) {
  const frames = useRef<FrameStore>([]);
  const scheduler = useRef<FrameScheduler | null>(null);
  const setFocus = useCallback((clip: number, frame: number) => scheduler.current?.setFocus(clip, frame), []);

  useEffect(() => {
    const mobile = window.matchMedia(MOBILE_QUERY);
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);

    const restart = () => {
      scheduler.current?.stop();
      scheduler.current = reducedMotion.matches
        ? null
        : createFrameScheduler(clips, mobile.matches ? "mobile" : "desktop");
      frames.current = scheduler.current?.frames ?? [];
    };

    restart();
    mobile.addEventListener("change", restart);
    reducedMotion.addEventListener("change", restart);
    return () => {
      scheduler.current?.stop();
      scheduler.current = null;
      mobile.removeEventListener("change", restart);
      reducedMotion.removeEventListener("change", restart);
    };
  }, [clips]);

  return { frames, setFocus };
}
