import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/app/translations/translations";
import type { Period } from "@/app/data/events";

function localeCount(n: number, language: string) {
  return n.toLocaleString(language === "bn" ? "bn-BD" : "en-US");
}

export function ChapterHeading({
  period,
  count,
}: {
  period: Period;
  count: number;
}) {
  const { language } = useLanguage();
  const t = translations[language].timeline;

  const isMakkah = period === "makkah";
  const title = isMakkah ? t.makkanPeriod : t.madinanPeriod;
  const years = isMakkah ? t.makkanYears : t.madinanYears;
  const subtitle = isMakkah ? t.makkanSubtitle : t.madinanSubtitle;
  const tone = isMakkah ? "text-accent" : "text-primary";

  return (
    <header className="mb-12 scroll-mt-28" id={`chapter-${period}`}>
      <div className="flex items-center gap-4">
        <span className={`h-px flex-1 bg-current opacity-20 ${tone}`} />
        <span
          className={`text-xs font-semibold uppercase tracking-[0.2em] ${tone}`}
        >
          {years}
        </span>
        <span className={`h-px flex-1 bg-current opacity-20 ${tone}`} />
      </div>

      <h3 className="mt-5 text-center font-display text-4xl font-bold text-ink sm:text-5xl">
        {title}
      </h3>

      <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-ink-muted">
        {subtitle}
      </p>

      <p className="mt-3 text-center text-xs tabular-nums text-ink-faint">
        {localeCount(count, language)} {t.eventsLabel}
      </p>
    </header>
  );
}

/**
 * The Hijrah is the hinge of the whole Seerah — it earns a full-bleed
 * band rather than another card, and it is where the Islamic calendar
 * starts counting.
 */
export function HijrahInterstitial() {
  const { language } = useLanguage();
  const t = translations[language].timeline;

  return (
    <div className="relative my-4 overflow-hidden rounded-2xl border border-rule bg-primary py-14 text-center">
      <div
        className="pattern-girih pointer-events-none absolute inset-0 opacity-[0.12]"
        aria-hidden="true"
      />
      <div className="relative">
        <p className="font-arabic text-3xl text-white/80" lang="ar">
          ٱلْهِجْرَة
        </p>
        <h3 className="mt-3 font-display text-5xl font-bold text-white sm:text-6xl">
          {t.hijrahBanner}
        </h3>
        <p className="mt-3 text-sm uppercase tracking-[0.2em] text-white/70">
          {t.hijrahCaption}
        </p>
      </div>
    </div>
  );
}
