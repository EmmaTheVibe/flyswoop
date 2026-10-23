import SocialLinks from "./SocialLinks";

export default function ContactCard() {
  return (
    <div className="w-[min(26rem,calc(100vw-3rem))] rounded-3xl bg-accent/75 p-8 text-left backdrop-blur-md">
      <h2 className="font-display text-4xl md:text-5xl">Shop at Swoop</h2>
      <p className="mt-3 text-foreground/90">Come fly one first.</p>
      <address className="mt-6 leading-relaxed text-foreground/90 not-italic">
        88 Updraft Lane
        <br />
        Santa Cruz, CA 95060
      </address>
      <div className="mt-6">
        <SocialLinks />
      </div>
    </div>
  );
}
