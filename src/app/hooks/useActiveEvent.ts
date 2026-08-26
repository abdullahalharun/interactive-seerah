import { useEffect, useState } from "react";

/**
 * Tracks which timeline event is currently nearest the top of the reading
 * area, for the progress rail and the sticky context bar.
 *
 * The root margin biases the "active" band toward the upper third of the
 * viewport, which is where the eye sits while scrolling long-form content.
 */
export function useActiveEvent(ids: readonly string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    if (ids.length === 0) return;

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio);
          } else {
            visible.delete(entry.target.id);
          }
        }

        if (visible.size === 0) return;

        // Of the events in the band, take the earliest in document order.
        const first = ids.find((id) => visible.has(id));
        if (first) setActiveId(first);
      },
      { rootMargin: "-96px 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}
