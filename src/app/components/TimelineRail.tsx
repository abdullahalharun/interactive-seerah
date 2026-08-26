import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/app/translations/translations";
import type { SeerahEvent } from "@/app/data/events";

interface TimelineRailProps {
  events: SeerahEvent[];
  activeId: string | null;
  onJump: (id: string) => void;
}

/**
 * A vertical mini-map of the whole timeline, pinned beside the content on
 * wide screens. Turns 42 events from a long scroll into a structure you can
 * see and aim at.
 */
export function TimelineRail({ events, activeId, onJump }: TimelineRailProps) {
  const { language } = useLanguage();
  const t = translations[language].timeline;

  // The rail is only meaningful once the timeline is on screen — over the
  // hero it just reads as debris.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = document.getElementById("timeline");
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "-20% 0px -20% 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const activeIndex = events.findIndex((e) => e.id === activeId);
  const progress =
    activeIndex < 0 ? 0 : (activeIndex + 1) / Math.max(events.length, 1);

  return (
    <nav
      aria-label={t.timelineProgress}
      className={`pointer-events-none fixed left-[max(1rem,calc(50vw-42rem))] top-1/2 z-30 hidden -translate-y-1/2 transition-opacity duration-500 xl:block ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <ol className="pointer-events-auto flex flex-col gap-[3px]">
        {events.map((event, index) => {
          const isActive = event.id === activeId;
          const isPassed = activeIndex >= 0 && index < activeIndex;

          return (
            <li key={event.id} className="group relative flex items-center">
              <button
                type="button"
                onClick={() => onJump(event.id)}
                aria-label={`${t.jumpTo}: ${event.title}`}
                aria-current={isActive ? "true" : undefined}
                className="flex h-3.5 items-center"
              >
                <span
                  className={`block h-0.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? `w-8 ${event.period === "makkah" ? "bg-accent" : "bg-primary"}`
                      : isPassed
                        ? "w-5 bg-rule-strong group-hover:w-7 group-hover:bg-accent"
                        : "w-3 bg-rule-strong/60 group-hover:w-7 group-hover:bg-accent"
                  }`}
                />
              </button>

              {/* Label appears on hover, or permanently for the active event. */}
              <span
                className="pointer-events-none absolute left-11 whitespace-nowrap rounded-md border border-rule bg-surface px-2 py-1 text-xs text-ink-soft opacity-0 shadow-card transition-opacity duration-200 group-hover:opacity-100"
              >
                <span className="mr-2 tabular-nums text-ink-faint">
                  {event.year}
                </span>
                {event.title}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Percentage read, as a quiet number under the rail. */}
      <p className="mt-3 text-[10px] tabular-nums text-ink-faint">
        {Math.round(progress * 100)}%
      </p>
    </nav>
  );
}
