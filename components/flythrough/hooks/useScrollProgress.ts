import { useEffect, useRef, type RefObject } from "react";

export function useScrollProgress(wrapperRef: RefObject<HTMLElement | null>) {
  const progress = useRef(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let top = 0;
    let range = 1;

    const update = () => {
      const p = (window.scrollY - top) / range;
      progress.current = Math.min(1, Math.max(0, p));
    };

    const measure = () => {
      top = wrapper.getBoundingClientRect().top + window.scrollY;
      range = Math.max(1, wrapper.offsetHeight - window.innerHeight);
      update();
    };

    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(wrapper);
    resize.observe(document.body);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", update, { passive: true });

    return () => {
      resize.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", update);
    };
  }, [wrapperRef]);

  return progress;
}
