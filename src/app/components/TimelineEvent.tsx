import { motion } from "motion/react";
import { Calendar, MapPin, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/app/components/ui/drawer";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/app/translations/translations";
import type { Period } from "@/app/data/events";

interface TimelineEventProps {
  id: string;
  year: string;
  date?: string;
  age?: string;
  title: string;
  location: string;
  description: string;
  details: string[];
  period: Period;
  isFirst?: boolean;
  position?: "left" | "right";
}

export function TimelineEvent({
  id,
  year,
  date,
  age,
  title,
  location,
  description,
  details,
  period,
  isFirst = false,
  position = "left",
}: TimelineEventProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { language } = useLanguage();
  const t = translations[language].timeline;

  const card = (
    <EventCard
      year={year}
      date={date}
      age={age}
      title={title}
      location={location}
      description={description}
      period={period}
      onSeeMore={() => setIsDrawerOpen(true)}
    />
  );

  return (
    <>
      <motion.div
        id={id}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative scroll-mt-28 pb-14 md:pb-20"
      >
        {/* Desktop: two columns straddling a central rail */}
        <div className="hidden md:grid md:grid-cols-2 md:items-start md:gap-16">
          <div>{position === "left" && card}</div>
          <div>{position === "right" && card}</div>
        </div>

        {/* The rail itself — one continuous line per event block */}
        <div
          className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-rule-strong md:block"
          aria-hidden="true"
        >
          <span
            className={`absolute left-1/2 top-7 h-4 w-4 -translate-x-1/2 rotate-45 border-2 shadow-sm ${
              isFirst
                ? "border-primary bg-primary"
                : period === "makkah"
                  ? "border-accent bg-surface"
                  : "border-primary bg-surface"
            }`}
          />
        </div>

        {/* Mobile: single column with the rail on the left */}
        <div className="relative pl-9 md:hidden">
          <div
            className="absolute inset-y-0 left-[7px] w-px bg-rule-strong"
            aria-hidden="true"
          />
          <span
            className={`absolute left-0 top-6 h-3.5 w-3.5 rotate-45 border-2 ${
              isFirst
                ? "border-primary bg-primary"
                : period === "makkah"
                  ? "border-accent bg-surface"
                  : "border-primary bg-surface"
            }`}
            aria-hidden="true"
          />
          {card}
        </div>
      </motion.div>

      <Drawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        direction="right"
      >
        <DrawerContent className="h-full w-full border-l border-rule bg-surface md:w-[540px] md:max-w-[92vw]">
          <DrawerHeader className="border-b border-rule text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {age && (
                  <span
                    className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      period === "makkah"
                        ? "bg-accent-subtle text-accent"
                        : "bg-primary-subtle text-primary"
                    }`}
                  >
                    {age}
                  </span>
                )}
                <DrawerTitle className="font-display text-3xl font-bold text-ink">
                  {title}
                </DrawerTitle>
                <DrawerDescription asChild>
                  <div className="mt-3 space-y-1.5 text-ink-muted">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-accent" />
                      <span className="font-medium text-ink-soft">{year}</span>
                    </span>
                    {date && (
                      <span className="ml-6 block text-sm">{date}</span>
                    )}
                    <span className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-accent" />
                      {location}
                    </span>
                  </div>
                </DrawerDescription>
              </div>

              <DrawerClose className="cursor-pointer rounded-md p-1.5 text-ink-muted transition-colors hover:bg-primary-subtle hover:text-primary">
                <X className="h-5 w-5" />
                <span className="sr-only">{t.close}</span>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="space-y-7 overflow-y-auto p-6">
            <section>
              <h3 className="mb-3 font-display text-xl font-semibold text-ink">
                {t.overview}
              </h3>
              <p className="leading-relaxed text-ink-soft">{description}</p>
            </section>

            {details.length > 0 && (
              <section>
                <h3 className="mb-3 font-display text-xl font-semibold text-ink">
                  {t.keyDetails}
                </h3>
                <ul className="space-y-3 rounded-xl border border-rule bg-surface-sunken p-5">
                  {details.map((detail, index) => (
                    <li key={index} className="flex gap-3">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-accent"
                        aria-hidden="true"
                      />
                      <span className="text-sm leading-relaxed text-ink-soft">
                        {detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function EventCard({
  year,
  date,
  age,
  title,
  location,
  description,
  period,
  onSeeMore,
}: {
  year: string;
  date?: string;
  age?: string;
  title: string;
  location: string;
  description: string;
  period: Period;
  onSeeMore: () => void;
}) {
  const { language } = useLanguage();
  const t = translations[language].timeline;

  return (
    <article className="card-manuscript group relative overflow-hidden p-5 sm:p-7">
      {/* Period-coded spine: brass for Makkah, emerald for Madinah. */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1 ${
          period === "makkah" ? "bg-accent" : "bg-primary"
        }`}
      />

      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        {age && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              period === "makkah"
                ? "bg-accent-subtle text-accent"
                : "bg-primary-subtle text-primary"
            }`}
          >
            {age}
          </span>
        )}
        <span className="flex items-center gap-1.5 text-sm font-medium text-ink-soft">
          <Calendar className="h-4 w-4 text-accent" />
          {year}
        </span>
      </div>

      {date && <p className="mb-2 text-xs text-ink-faint">{date}</p>}

      <h3 className="font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">
        {title}
      </h3>

      <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted">
        <MapPin className="h-3.5 w-3.5" />
        {location}
      </p>

      {/* Clamped rather than substring-truncated, so words and
          Bengali conjuncts are never cut mid-glyph. */}
      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-ink-soft">
        {description}
      </p>

      <button
        type="button"
        onClick={onSeeMore}
        className="mt-5 inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-strong"
      >
        {t.seeMore}
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>
    </article>
  );
}
