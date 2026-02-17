import svHomeContent from "./locales/sv/home.json";

export const homeContentByLocale = {
  sv: svHomeContent,
} as const;

export type HomeLocale = keyof typeof homeContentByLocale;

export const DEFAULT_HOME_LOCALE: HomeLocale = "sv";

export const getHomeContent = (locale: HomeLocale = DEFAULT_HOME_LOCALE) =>
  homeContentByLocale[locale];

export const homeContent = getHomeContent();
