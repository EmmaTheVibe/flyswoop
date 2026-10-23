import { createContext } from "react";
import type { Timeline } from "./timeline";

export type ProgressListener = (progress: number) => void;

export function createProgressChannel() {
  const listeners = new Set<ProgressListener>();
  let last = NaN;
  return {
    subscribe(listener: ProgressListener) {
      listeners.add(listener);
      if (!Number.isNaN(last)) listener(last);
      return () => {
        listeners.delete(listener);
      };
    },
    publish(progress: number) {
      if (progress === last) return false;
      last = progress;
      listeners.forEach((listener) => listener(progress));
      return true;
    },
  };
}

export type ProgressChannel = ReturnType<typeof createProgressChannel>;

export const ProgressContext = createContext<{ channel: ProgressChannel; timeline: Timeline } | null>(null);
