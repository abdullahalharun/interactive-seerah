import { HeroSection } from "@/app/components/HeroSection";
import { TimelineEvent } from "@/app/components/TimelineEvent";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/app/translations/translations";
import { getEvents } from "@/app/data/events";

export function HomePage() {
  const { language } = useLanguage();
  const t = translations[language];
  const events = getEvents(language);

  return (
    <>
      <HeroSection />

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
        </div>

        <div className="relative">
          {events.map((event, index) => (
            <TimelineEvent
              key={event.id}
              {...event}
              position={index % 2 === 0 ? "right" : "left"}
            />
          ))}
        </div>
      </section>
    </>
  );
}
