import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/app/components/Navbar";
import { LanguageProvider, useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/app/translations/translations";
import { ScrollToTop } from "@/app/components/ScrollToTop";
import { ScrollManager } from "@/app/components/ScrollManager";
import { HomePage } from "@/app/pages/HomePage";

// Recharts is large and only these two routes need it — keep it off the
// initial load so the timeline paints fast.
const SeerahCharts = lazy(() =>
  import("@/app/components/SeerahCharts").then((m) => ({
    default: m.SeerahCharts,
  })),
);
const ConversionTree = lazy(() =>
  import("@/app/components/ConversionTree").then((m) => ({
    default: m.ConversionTree,
  })),
);

function AppContent() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="relative min-h-screen bg-parchment">
      {/* Fixed geometric ground behind the whole app. */}
      <div
        className="pattern-girih pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
      />

      <div className="relative z-10">
        <Navbar />
        <ScrollManager />

        <main>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/seerah-charts" element={<SeerahCharts />} />
              <Route path="/conversion-tree" element={<ConversionTree />} />
            </Routes>
          </Suspense>
        </main>

        <footer className="border-t border-rule bg-surface-sunken py-10">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
            <div className="divider-ornament mb-5" aria-hidden="true" />
            <p className="font-display text-lg text-ink sm:text-xl">
              {t.footer.blessing}
            </p>
            <p className="mt-3 text-xs text-ink-muted sm:text-sm">
              {t.footer.disclaimer}
            </p>
          </div>
        </footer>

        <ScrollToTop />
      </div>
    </div>
  );
}

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-rule border-t-primary" />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </LanguageProvider>
  );
}
