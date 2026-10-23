"use client";

import { Fragment, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import OverlayImage from "./components/OverlayImage";
import OverlayText from "./components/OverlayText";
import Poster from "./components/Poster";
import { useCanvasPlayer } from "./hooks/useCanvasPlayer";
import { useImageSequence } from "./hooks/useImageSequence";
import { useOverlayStyles } from "./hooks/useOverlayStyles";
import { useScrollProgress } from "./hooks/useScrollProgress";
import type { Clip } from "./lib/frames";
import { REDUCED } from "./lib/layout";
import type { Overlay } from "./lib/overlays";
import { createProgressChannel, ProgressContext } from "./lib/progressChannel";
import { createTimeline } from "./lib/timeline";

type FlythroughSectionProps = {
  clips: Clip[];
  transitionVh?: number;
  frameLerp?: number;
  overlays?: Overlay[];
  children?: ReactNode;
};

const NO_OVERLAYS: Overlay[] = [];

export default function FlythroughSection({
  clips,
  transitionVh = 40,
  frameLerp = 0,
  overlays = NO_OVERLAYS,
  children,
}: FlythroughSectionProps) {
  const wrapperRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [channel] = useState(createProgressChannel);
  const timeline = useMemo(() => createTimeline(clips, transitionVh), [clips, transitionVh]);
  const context = useMemo(() => ({ channel, timeline }), [channel, timeline]);

  const progress = useScrollProgress(wrapperRef);
  const { frames, setFocus } = useImageSequence(clips);
  const { textRefs, imageRefs } = useOverlayStyles(channel, overlays, timeline);
  useCanvasPlayer({ wrapperRef, canvasRef, progress, frames, setFocus, channel, timeline, frameLerp });

  return (
    <section
      ref={wrapperRef}
      style={{ "--flythrough-length": `${timeline.total}vh` } as CSSProperties}
      className={`relative h-(--flythrough-length) ${REDUCED.wrapper}`}
    >
      <div className={`sticky top-0 h-lvh w-full overflow-hidden bg-black ${REDUCED.stage}`}>
        <Poster clip={clips[0]} />
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full opacity-0 motion-reduce:hidden"
        />
        <div aria-hidden="true" className="absolute inset-0 hidden bg-background/60 motion-reduce:block" />

        {overlays.map((overlay, i) => {
          const initialProgress = timeline.localFor(overlay.clip, 0);
          return (
            <Fragment key={overlay.id}>
              <OverlayText
                overlay={overlay}
                initialProgress={initialProgress}
                textRef={(el) => {
                  textRefs.current[i] = el;
                }}
              />
              {overlay.image && (
                <OverlayImage
                  overlay={{ ...overlay, image: overlay.image }}
                  initialProgress={initialProgress}
                  imageRef={(el) => {
                    imageRefs.current[i] = el;
                  }}
                />
              )}
            </Fragment>
          );
        })}

        <ProgressContext value={context}>{children}</ProgressContext>
      </div>
    </section>
  );
}
