export default function PricePill({ price, cta }: { price: string; cta: string }) {
  return (
    <div className="reveal-pill mt-4 inline-grid items-center rounded-full bg-foreground p-1.5">
      <span>
        <span className="block pr-4 pl-3.5 text-lg font-medium whitespace-nowrap text-background tabular-nums md:text-xl">
          {price}
        </span>
      </span>
      <button
        type="button"
        className="rounded-full bg-accent px-6 py-2 text-sm font-medium text-background transition-transform hover:scale-105 active:scale-95 md:text-base"
      >
        {cta}
      </button>
    </div>
  );
}
