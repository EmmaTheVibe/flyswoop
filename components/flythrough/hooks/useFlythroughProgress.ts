"use client";

import { useContext, useEffect, useRef } from "react";
import { ProgressContext, type ProgressListener } from "../lib/progressChannel";

export function useFlythroughProgress(listener: ProgressListener, clip?: string) {
  const context = useContext(ProgressContext);
  const latest = useRef(listener);

  useEffect(() => {
    latest.current = listener;
  });

  useEffect(() => {
    if (!context) return;
    const { channel, timeline } = context;
    return channel.subscribe((p) => latest.current(timeline.localFor(clip, p)));
  }, [context, clip]);
}
