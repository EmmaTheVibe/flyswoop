export function watchDevicePixelRatio(onChange: () => void) {
  let query: MediaQueryList | null = null;
  const handle = () => {
    onChange();
    arm();
  };
  const arm = () => {
    query?.removeEventListener("change", handle);
    query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    query.addEventListener("change", handle);
  };
  arm();
  return () => query?.removeEventListener("change", handle);
}
