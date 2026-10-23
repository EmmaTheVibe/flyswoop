import { FlythroughSection } from "@/components/flythrough";
import { storyClips } from "@/components/swoop/clips";
import { storyOverlays } from "@/components/swoop/overlays";
import WordmarkFlight from "@/components/swoop/WordmarkFlight";

export default function Home() {
  return (
    <main className="font-sans">
      <a
        href="#"
        className="fixed top-5 right-6 z-10 flex size-11 items-center justify-center rounded-full bg-accent text-foreground transition-transform hover:scale-105 active:scale-95 md:top-8 md:right-16 md:size-auto md:px-5 md:py-2.5 md:text-base md:font-medium"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
          className="md:hidden"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <span className="sr-only md:not-sr-only">View catalog</span>
      </a>

      <FlythroughSection clips={storyClips} overlays={storyOverlays}>
        <WordmarkFlight />
      </FlythroughSection>
    </main>
  );
}
