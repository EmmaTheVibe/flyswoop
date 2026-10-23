import Image from "next/image";
import type { Ref } from "react";
import { IMAGE_POSITION_CLASSES, REDUCED } from "../lib/layout";
import { overlayImageStyle, type Overlay } from "../lib/overlays";

type OverlayImageProps = {
  overlay: Overlay & { image: NonNullable<Overlay["image"]> };
  initialProgress: number;
  imageRef: Ref<HTMLDivElement>;
};

export default function OverlayImage({ overlay, initialProgress, imageRef }: OverlayImageProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 flex px-6 ${IMAGE_POSITION_CLASSES[overlay.position]} ${REDUCED.layer}`}
    >
      <div
        ref={imageRef}
        className={`will-change-[opacity,transform] ${REDUCED.image}`}
        style={overlayImageStyle(overlay, initialProgress)}
      >
        <Image
          src={overlay.image.src}
          alt={overlay.image.alt}
          sizes="(min-width: 768px) 38vw, 78vw"
          loading="eager"
          className="h-auto w-[78vw] max-w-md drop-shadow-[0_24px_32px_rgb(11_15_25/0.45)] md:w-[38vw] md:max-w-2xl"
        />
      </div>
    </div>
  );
}
