import { frameUrl, MOBILE_QUERY, type Clip } from "../lib/frames";

export default function Poster({ clip }: { clip: Clip }) {
  return (
    <picture>
      <source media={MOBILE_QUERY} srcSet={frameUrl(clip.framePath, "mobile", 0, clip.format)} />
      <img
        src={frameUrl(clip.framePath, "desktop", 0, clip.format)}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </picture>
  );
}
