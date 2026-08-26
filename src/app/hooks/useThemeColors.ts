import { useEffect, useState } from "react";

const TOKENS = [
  "primary",
  "primary-soft",
  "accent",
  "ink",
  "ink-muted",
  "rule",
  "surface",
] as const;

type Token = (typeof TOKENS)[number];
export type ThemeColors = Record<Token, string>;

function read(): ThemeColors {
  const styles = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    TOKENS.map((token) => [token, styles.getPropertyValue(`--${token}`).trim()]),
  ) as ThemeColors;
}

/**
 * Recharts needs literal colour strings — SVG presentation attributes do not
 * resolve `var()`. This reads the current token values and re-reads them
 * whenever the `dark` class on <html> changes, so charts follow the theme.
 */
export function useThemeColors(): ThemeColors {
  const [colors, setColors] = useState<ThemeColors>(read);

  useEffect(() => {
    const observer = new MutationObserver(() => setColors(read()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return colors;
}
