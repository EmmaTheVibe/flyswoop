import type { CSSProperties, Ref } from "react";
import { headingClasses, REDUCED, TEXT_POSITION_CLASSES } from "../lib/layout";
import { overlayStyle, type Overlay } from "../lib/overlays";
import ProductPitch from "./ProductPitch";

type OverlayTextProps = {
  overlay: Overlay;
  initialProgress: number;
  textRef: Ref<HTMLDivElement>;
};

export default function OverlayText({ overlay, initialProgress, textRef }: OverlayTextProps) {
  const Heading = overlay.hero ? "h1" : "h2";
  return (
    <div
      className={`pointer-events-none absolute inset-0 flex px-6 md:px-16 ${TEXT_POSITION_CLASSES[overlay.position]} ${REDUCED.layer}`}
    >
      <div
        ref={textRef}
        className={`pointer-events-auto ${overlay.hero ? "max-w-3xl" : "max-w-md"} will-change-[opacity,transform,filter] ${REDUCED.text}`}
        style={overlayStyle(overlay, initialProgress)}
        data-reveal={overlay.product ? "out" : undefined}
      >
        {overlay.stamp && (
          <p className="mb-4 text-sm md:text-base">
            <span
              className={`inline-block font-medium text-accent tabular-nums ${overlay.product ? "reveal-type" : ""}`}
              style={{ "--chars": overlay.stamp.length } as CSSProperties}
            >
              {overlay.stamp}
            </span>
          </p>
        )}
        {overlay.product ? (
          <ProductPitch product={overlay.product} />
        ) : (
          overlay.title && <Heading className={headingClasses(overlay.hero)}>{overlay.title}</Heading>
        )}
        {overlay.body && <p className="mt-5 text-base leading-relaxed text-foreground/80 md:text-lg">{overlay.body}</p>}
        {overlay.content}
      </div>
    </div>
  );
}
