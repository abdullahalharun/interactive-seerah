import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/app/translations/translations";

const STORAGE_KEY = "seerah-theme";

/** Reads whatever the inline bootstrap script in index.html already applied. */
function currentlyDark() {
  return document.documentElement.classList.contains("dark");
}

export function ThemeToggle() {
  const { language } = useLanguage();
  const t = translations[language].navbar;
  const [isDark, setIsDark] = useState(currentlyDark);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
    } catch {
      /* private browsing — the choice just won't persist */
    }
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={() => setIsDark((d) => !d)}
      aria-label={isDark ? t.lightMode : t.darkMode}
      title={isDark ? t.lightMode : t.darkMode}
      className="cursor-pointer rounded-md p-2 text-ink-soft transition-colors hover:bg-primary-subtle hover:text-primary"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
