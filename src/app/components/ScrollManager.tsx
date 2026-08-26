import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * React Router does not restore or reset scroll on navigation, and it does
 * not act on the hash in a `to` prop. This handles both, so `/#badr` works
 * from any route. `scroll-padding-top` in theme.css keeps the target clear
 * of the fixed navbar.
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation();

  // The browser already positions a fresh page load, and the timeline may
  // want to jump to a `?event=` deep link on mount. Only take over on
  // in-app navigation.
  const isInitialRender = useRef(true);

  useEffect(() => {
    const isInitial = isInitialRender.current;
    isInitialRender.current = false;

    if (!hash) {
      if (!isInitial) window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const id = decodeURIComponent(hash.slice(1));

    // The target may not be mounted yet on a cross-route jump; retry briefly.
    let frames = 0;
    let raf = 0;

    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        // Instant, not smooth: the timeline is ~20,000px tall, so animating
        // to a far event would scroll for several seconds. Ordinary in-page
        // anchors still animate via `scroll-behavior` in theme.css.
        el.scrollIntoView({ behavior: "instant", block: "start" });
        return;
      }
      if (frames++ < 30) raf = requestAnimationFrame(tryScroll);
    };

    raf = requestAnimationFrame(tryScroll);
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);

  return null;
}
