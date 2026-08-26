import { BookOpen, ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/app/translations/translations";
import { LanguageSwitcher } from "@/app/components/LanguageSwitcher";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { getEvents, type SeerahEvent } from "@/app/data/events";

export function Navbar() {
  const { language } = useLanguage();
  const t = translations[language].navbar;
  const events = getEvents(language);
  const location = useLocation();

  const [isEventsOpen, setIsEventsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const eventsRef = useRef<HTMLDivElement>(null);

  const makkah = events.filter((e) => e.period === "makkah");
  const madinah = events.filter((e) => e.period === "madinah");

  // Close both menus whenever we navigate.
  useEffect(() => {
    setIsEventsOpen(false);
    setIsMobileMenuOpen(false);
  }, [location]);

  // Escape closes the dropdown; clicking outside dismisses it.
  useEffect(() => {
    if (!isEventsOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsEventsOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!eventsRef.current?.contains(e.target as Node)) setIsEventsOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isEventsOpen]);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-rule bg-surface/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80 sm:gap-3"
          >
            <BookOpen className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            <div>
              <span className="block font-display text-base font-semibold text-ink sm:text-xl">
                {t.title}
              </span>
              <span className="hidden text-xs text-ink-muted sm:block sm:text-sm">
                {t.subtitle}
              </span>
            </div>
          </Link>

          {/* Desktop */}
          <div className="hidden items-center gap-6 md:flex">
            <div ref={eventsRef} className="relative">
              <button
                type="button"
                onClick={() => setIsEventsOpen((open) => !open)}
                aria-expanded={isEventsOpen}
                aria-haspopup="true"
                className="flex cursor-pointer items-center gap-1 text-sm text-ink-soft transition-colors hover:text-primary"
              >
                {t.events}
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isEventsOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isEventsOpen && (
                <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
                  <div className="grid max-h-[70vh] w-[min(46rem,90vw)] grid-cols-2 gap-x-6 overflow-y-auto rounded-xl border border-rule bg-surface p-5 shadow-xl">
                    <EventColumn label={t.makkanPeriod} events={makkah} />
                    <EventColumn label={t.madinanPeriod} events={madinah} />
                  </div>
                </div>
              )}
            </div>

            <NavLink to="/#timeline">{t.timeline}</NavLink>
            <NavLink to="/seerah-charts">{t.seerahCharts}</NavLink>
            <NavLink to="/conversion-tree">{t.conversionTree}</NavLink>

            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? t.closeMenu : t.openMenu}
              className="cursor-pointer rounded-md p-2 text-ink-soft transition-colors hover:bg-primary-subtle hover:text-primary"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sheet */}
      {isMobileMenuOpen && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-rule bg-surface px-4 pb-8 pt-4 md:hidden">
          <div className="space-y-1">
            <MobileLink to="/#timeline" emphasis>
              {t.timeline}
            </MobileLink>
            <MobileLink to="/seerah-charts" emphasis>
              {t.seerahCharts}
            </MobileLink>
            <MobileLink to="/conversion-tree" emphasis>
              {t.conversionTree}
            </MobileLink>
          </div>

          <EventColumn label={t.makkanPeriod} events={makkah} mobile />
          <EventColumn label={t.madinanPeriod} events={madinah} mobile />
        </div>
      )}
    </nav>
  );
}

function EventColumn({
  label,
  events,
  mobile = false,
}: {
  label: string;
  events: SeerahEvent[];
  mobile?: boolean;
}) {
  return (
    <div className={mobile ? "mt-6" : ""}>
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-accent">
        {label}
      </p>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <Link
              to={`/#${event.id}`}
              className="flex items-baseline gap-3 rounded-md px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-primary-subtle hover:text-primary"
            >
              <span className="w-16 shrink-0 text-xs tabular-nums text-ink-faint">
                {event.year}
              </span>
              <span>{event.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-sm text-ink-soft transition-colors hover:text-primary"
    >
      {children}
    </Link>
  );
}

function MobileLink({
  to,
  children,
  emphasis = false,
}: {
  to: string;
  children: React.ReactNode;
  emphasis?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`block rounded-md px-3 py-2 text-sm transition-colors hover:bg-primary-subtle hover:text-primary ${
        emphasis ? "font-semibold text-ink" : "text-ink-soft"
      }`}
    >
      {children}
    </Link>
  );
}
