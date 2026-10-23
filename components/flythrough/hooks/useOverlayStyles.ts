import { useEffect, useRef } from "react";
import { overlayAmount, overlayImageStyle, overlayStyle, type Overlay } from "../lib/overlays";
import type { ProgressChannel } from "../lib/progressChannel";
import type { Timeline } from "../lib/timeline";

const REVEAL_AT = 0.6;

export function useOverlayStyles(channel: ProgressChannel, overlays: Overlay[], timeline: Timeline) {
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(
    () =>
      channel.subscribe((p) => {
        overlays.forEach((overlay, i) => {
          const local = timeline.localFor(overlay.clip, p);
          const text = textRefs.current[i];
          if (text) {
            Object.assign(text.style, overlayStyle(overlay, local));
            if (overlay.product) {
              const v = overlayAmount(overlay, local);
              if (v >= REVEAL_AT) text.dataset.reveal = "in";
              else if (v === 0) text.dataset.reveal = "out";
            }
          }
          const image = imageRefs.current[i];
          if (image) Object.assign(image.style, overlayImageStyle(overlay, local));
        });
      }),
    [channel, overlays, timeline],
  );

  return { textRefs, imageRefs };
}
