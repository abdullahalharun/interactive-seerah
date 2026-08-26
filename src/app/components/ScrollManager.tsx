import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * React Router does not restore or reset scroll on navigation, and it does
 * not act on the hash in a `to` prop. This handles both, so `/#badr` works
 * from any route. `scroll-padding-top` in theme.css keeps the target clear
 * of the fixed navbar.
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const id = decodeURIComponent(hash.slice(1));

    // The target may not be mounted yet on a cross-route jump; retry briefly.
    let frames = 0;
    let raf = 0;

    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (frames++ < 30) raf = requestAnimationFrame(tryScroll);
    };

    raf = requestAnimationFrame(tryScroll);
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);

  return null;
}
