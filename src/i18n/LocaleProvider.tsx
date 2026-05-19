"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  useTransition,
  type PropsWithChildren,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  type Locale,
} from "./locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  toggleLocale: () => void;
  isPending: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

type LocaleProviderProps = PropsWithChildren<{
  initialLocale?: Locale;
}>;

export function LocaleProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: LocaleProviderProps) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isPending, startTransition] = useTransition();

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${LOCALE_COOKIE_MAX_AGE};samesite=lax`;
      setLocaleState(next);
      startTransition(() => {
        router.refresh();
      });
    },
    [locale, router],
  );

  const toggleLocale = useCallback(() => {
    setLocale(locale === "sv" ? "en" : "sv");
  }, [locale, setLocale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, toggleLocale, isPending }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider.");
  }
  return context;
}

export function useOptionalLocale(): LocaleContextValue | null {
  return useContext(LocaleContext);
}
