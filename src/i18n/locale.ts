export const LOCALES = ["sv", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "sv";

export const LOCALE_COOKIE = "NEXT_LOCALE";

// One year, in seconds.
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const isLocale = (value: string | null | undefined): value is Locale =>
  value === "sv" || value === "en";

export const resolveLocale = (value: string | null | undefined): Locale =>
  isLocale(value) ? value : DEFAULT_LOCALE;

export const HTML_LANG: Record<Locale, string> = {
  sv: "sv",
  en: "en",
};

export const OG_LOCALE: Record<Locale, string> = {
  sv: "sv_SE",
  en: "en_US",
};
