import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, SUPPORTED_LOCALES, type Locale, type TranslationKey } from "./localeContract";
import { PT_BR } from "./pt-BR";
import { EN_US } from "./en-US";

const CATALOGS: Record<Locale, Record<TranslationKey, string>> = {
  "pt-BR": PT_BR,
  "en-US": EN_US,
};

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return (SUPPORTED_LOCALES as readonly string[]).includes(stored ?? "")
    ? (stored as Locale)
    : DEFAULT_LOCALE;
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

// V10-X2T: single source of truth for the active interface locale.
// Switching locale never touches DRE selections, Capital Decision
// workspace state, or any engine output — it only swaps which translation
// catalog `t()` reads from.
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale());

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey) => {
      const catalog = CATALOGS[locale];
      const value = catalog[key];
      if (value === undefined) {
        throw new Error(`V10-X2T: missing translation key "${key}" for locale "${locale}"`);
      }
      return value;
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
