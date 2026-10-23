import type { CSSProperties } from "react";
import type { Overlay } from "@/components/flythrough";
import drone1 from "@/public/images/drone-1.png";
import drone2 from "@/public/images/drone-2.png";
import drone3 from "@/public/images/drone-3.png";
import drone4 from "@/public/images/drone-4.png";
import ContactCard from "./ContactCard";
import { WORDMARK_ANCHOR, WORDMARK_HERO_SIZE, WORDMARK_PILL } from "./wordmark";

export const storyOverlays: Overlay[] = [
  {
    id: "hero",
    clip: "intro",
    hero: true,
    start: -0.05,
    end: 0.3,
    position: "left",
    title: (
      <>
        <span className="intro-bar" style={{ "--bar": "var(--foreground)", "--from": "right", "--delay": "0.2s" } as CSSProperties}>
          Every great shot starts at
        </span>
        <span className="mt-4 block">
          <span
            {...{ [WORDMARK_ANCHOR]: "" }}
            className={`intro-swoop ${WORDMARK_PILL} ${WORDMARK_HERO_SIZE} motion-reduce:visible!`}
          >
            Swoop
          </span>
        </span>
      </>
    ),
    body: <span className="intro-fade font-bold text-foreground">Scroll to take off.</span>,
  },
  {
    id: "cam-01",
    clip: "intro",
    start: 0.38,
    end: 0.86,
    position: "right",
    title: (
      <>
        Your <span className="text-accent">No. 1</span> source for the best camera drones
      </>
    ),
  },
  {
    id: "cam-02",
    clip: "vancouver",
    start: 0.14,
    end: 0.86,
    position: "left",
    stamp: "IN STOCK",
    image: { src: drone1, alt: "DJI Mavic Air drone" },
    product: { lead: "Crisp footage from any altitude with the", name: "DJI Mavic Air", price: "$299", cta: "Buy" },
  },
  {
    id: "cam-03",
    clip: "la",
    start: 0.14,
    end: 0.86,
    position: "right",
    stamp: "IN STOCK",
    image: { src: drone4, alt: "Autel X-Star Premium drone" },
    product: { lead: "Chase golden hour with the", name: "Autel X-Star Premium", price: "$249", cta: "Buy" },
  },
  {
    id: "cam-04",
    clip: "mountains",
    start: 0.2,
    end: 0.8,
    position: "left",
    stamp: "IN STOCK",
    image: { src: drone2, alt: "Aeryon SkyRanger drone" },
    product: { lead: "Explore mountain ranges with the", name: "Aeryon SkyRanger", price: "$75,000", cta: "Buy" },
  },
  {
    id: "cam-05",
    clip: "beach",
    start: 0.1,
    end: 0.5,
    position: "right",
    stamp: "IN STOCK",
    image: { src: drone3, alt: "DJI Phantom 4 Pro drone" },
    product: { lead: "Get the whole crew in frame with the", name: "DJI Phantom 4 Pro", price: "$899", cta: "Buy" },
  },
  {
    id: "contact",
    clip: "beach",
    start: 0.58,
    end: 1.05,
    position: "center",
    content: <ContactCard />,
  },
];
