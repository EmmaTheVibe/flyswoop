import type { CSSProperties } from "react";
import { headingClasses } from "../lib/layout";
import type { Overlay } from "../lib/overlays";
import PricePill from "./PricePill";

type Product = NonNullable<Overlay["product"]>;

export default function ProductPitch({ product }: { product: Product }) {
  return (
    <>
      <p className="mb-2 text-lg leading-snug text-foreground/90 [text-shadow:0_1px_16px_rgb(11_15_25/0.5)] md:text-xl short:mb-1 short:text-base">
        <span className="reveal-bar" style={{ "--bar": "var(--foreground)", "--from": "right" } as CSSProperties}>
          {product.lead}
        </span>
      </p>
      <h2 className={headingClasses()}>
        <span
          className="reveal-bar"
          style={{ "--bar": "var(--color-accent)", "--from": "left", "--delay": "0.2s" } as CSSProperties}
        >
          {product.name}
        </span>
      </h2>
      <PricePill price={product.price} cta={product.cta} />
    </>
  );
}
