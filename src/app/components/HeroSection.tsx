import { motion, useReducedMotion } from "motion/react";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/app/translations/translations";

export function HeroSection() {
  const { language } = useLanguage();
  const t = translations[language].hero;
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
      {/* Warm radial wash behind the title. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,var(--primary-subtle),transparent_65%)]"
      />

      <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Bismillah — sets the register before the English title. */}
          <p
            lang="ar"
            className="font-arabic mb-8 text-2xl text-accent sm:text-3xl"
          >
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>

          <h1 className="font-display text-5xl font-bold leading-[1.05] text-ink sm:text-7xl md:text-8xl">
            {t.title}
            <span className="mt-1 block text-primary">{t.peace}</span>
          </h1>

          <div className="divider-ornament my-7" aria-hidden="true" />

          <p className="mb-6 text-lg text-ink-soft sm:text-xl md:text-2xl">
            {t.subtitle}
          </p>

          <p className="mx-auto mb-12 max-w-2xl px-4 text-base leading-relaxed text-ink-muted">
            {t.description}
          </p>

          <motion.a
            href="#birth"
            className="group inline-flex flex-col items-center gap-2 text-primary transition-colors hover:text-primary-strong"
            animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-sm font-medium tracking-wide">
              {t.beginJourney}
            </span>
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
