import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { HeroSection } from "@/app/components/HeroSection";
import { TimelineEvent } from "@/app/components/TimelineEvent";
import { TimelineRail } from "@/app/components/TimelineRail";
import {
  ChapterHeading,
  HijrahInterstitial,
} from "@/app/components/ChapterHeading";
import { useLanguage } from "@/app/context/LanguageContext";
import { useActiveEvent } from "@/app/hooks/useActiveEvent";
import { translations } from "@/app/translations/translations";
import { getEvents, type Period } from "@/app/data/events";

type Filter = "all" | Period;

const FILTERS: Filter[] = ["all", "makkah", "madinah"];

function isFilter(value: string | null): value is Filter {
  return value !== null && (FILTERS as string[]).includes(value);
}

export function HomePage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [searchParams, setSearchParams] = useSearchParams();

  const allEvents = useMemo(() => getEvents(language), [language]);

  // Both the open event and the period filter live in the URL, so any view
  // of the timeline can be shared or bookmarked as-is.
  const openEventId = searchParams.get("event");
  const filterParam = searchParams.get("period");
  const filter: Filter = isFilter(filterParam) ? filterParam : "all";

  const events = useMemo(
    () =>
      filter === "all"
        ? allEvents
        : allEvents.filter((e) => e.period === filter),
    [allEvents, filter],
  );

  const eventIds = useMemo(() => events.map((e) => e.id), [events]);
  const activeId = useActiveEvent(eventIds);

  const setFilter = useCallback(
    (next: Filter) => {
      setSearchParams(
        (params) => {
          if (next === "all") params.delete("period");
          else params.set("period", next);
          params.delete("event");
          return params;
        },
        { replace: true },
      );
      document
        .getElementById("timeline")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [setSearchParams],
  );

  const setOpenEvent = useCallback(
    (id: string, open: boolean) => {
      setSearchParams(
        (params) => {
          if (open) params.set("event", id);
          else params.delete("event");
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // Arriving on a shared `?event=` link should land on that event, not at
  // the top of the page. The drawer locks body scroll while open, so the
  // page is positioned first and `drawersEnabled` holds every drawer shut
  // until that has happened. It only gates the initial load.
  const handledDeepLink = useRef(false);
  const [drawersEnabled, setDrawersEnabled] = useState(false);

  useEffect(() => {
    if (handledDeepLink.current) return;
    handledDeepLink.current = true;

    // `behavior: "instant"` matters twice over: it overrides the page's
    // `scroll-behavior: smooth` (so the jump is synchronous and the drawer
    // can lock the body at the right offset), and it avoids animating the
    // reader through ten thousand pixels of timeline to reach a shared link.
    if (openEventId) {
      document
        .getElementById(openEventId)
        ?.scrollIntoView({ behavior: "instant", block: "start" });
    }

    setDrawersEnabled(true);
  }, [openEventId]);

  const jumpTo = useCallback((id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const makkah = events.filter((e) => e.period === "makkah");
  const madinah = events.filter((e) => e.period === "madinah");

  // Position alternates across the whole visible list, not per chapter, so
  // the left/right rhythm never breaks at a chapter boundary.
  const sideOf = (id: string) =>
    events.findIndex((e) => e.id === id) % 2 === 0 ? "right" : "left";

  const renderEvents = (list: typeof events) =>
    list.map((event) => (
      <TimelineEvent
        key={event.id}
        {...event}
        position={sideOf(event.id)}
        isOpen={drawersEnabled && openEventId === event.id}
        onOpenChange={(open) => setOpenEvent(event.id, open)}
      />
    ));

  return (
    <>
      <HeroSection />

      <TimelineRail events={events} activeId={activeId} onJump={jumpTo} />

      <section
        id="timeline"
        className="mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16 md:py-24"
      >
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
            {t.timeline.heading}
          </h2>
          <div className="divider-ornament my-5" aria-hidden="true" />
          <p className="mx-auto max-w-2xl px-4 text-sm text-ink-muted sm:text-base">
            {t.timeline.description}
          </p>

          {/* Period filter */}
          <div
            role="group"
            aria-label={t.timeline.showing}
            className="mt-8 inline-flex items-center gap-0.5 rounded-xl border border-rule bg-surface-sunken p-1"
          >
            {FILTERS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  filter === value
                    ? "bg-surface text-primary shadow-sm"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {value === "all"
                  ? t.timeline.filterAll
                  : value === "makkah"
                    ? t.timeline.makkanPeriod
                    : t.timeline.madinanPeriod}
              </button>
            ))}
          </div>
        </div>

        {makkah.length > 0 && (
          <section>
            <ChapterHeading period="makkah" count={makkah.length} />
            <div className="relative">{renderEvents(makkah)}</div>
          </section>
        )}

        {makkah.length > 0 && madinah.length > 0 && <HijrahInterstitial />}

        {madinah.length > 0 && (
          <section className="pt-16">
            <ChapterHeading period="madinah" count={madinah.length} />
            <div className="relative">{renderEvents(madinah)}</div>
          </section>
        )}
      </section>
    </>
  );
}
