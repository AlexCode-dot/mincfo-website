import { DEFAULT_LOCALE, type Locale } from "@/i18n/locale";
import fullServiceText from "./home/full-service.json";
import platformText from "./home/platform.json";
import partnerText from "./home/partner.json";
import sharedText from "./home/shared.json";
import fullServiceTextEn from "./home/full-service.en.json";
import platformTextEn from "./home/platform.en.json";
import partnerTextEn from "./home/partner.en.json";
import sharedTextEn from "./home/shared.en.json";

export const HOME_OFFERING_MODES = ["full-service", "platform", "partner"] as const;

export type HomeOfferingMode = (typeof HOME_OFFERING_MODES)[number];
export type DefaultHomeOfferingMode = Exclude<HomeOfferingMode, "partner">;

export const HOME_PAGE_SHARED_TEXT = sharedText;

type SharedText = typeof sharedText;

const SHARED_TEXT_BY_LOCALE: Record<Locale, SharedText> = {
  sv: sharedText,
  en: sharedTextEn as SharedText,
};

export const getSharedText = (locale: Locale = DEFAULT_LOCALE): SharedText =>
  SHARED_TEXT_BY_LOCALE[locale] ?? sharedText;

export const HOME_PAGE_TEXT_BY_MODE = {
  "full-service": {
    ...HOME_PAGE_SHARED_TEXT,
    ...fullServiceText,
  },
  platform: {
    ...HOME_PAGE_SHARED_TEXT,
    ...platformText,
  },
  partner: {
    ...HOME_PAGE_SHARED_TEXT,
    ...partnerText,
  },
} as const;

export type HomePageText = (typeof HOME_PAGE_TEXT_BY_MODE)[HomeOfferingMode];

const HOME_PAGE_TEXT_BY_MODE_EN: Record<HomeOfferingMode, HomePageText> = {
  "full-service": {
    ...(sharedTextEn as SharedText),
    ...fullServiceTextEn,
  } as unknown as HomePageText,
  platform: {
    ...(sharedTextEn as SharedText),
    ...platformTextEn,
  } as unknown as HomePageText,
  partner: {
    ...(sharedTextEn as SharedText),
    ...partnerTextEn,
  } as unknown as HomePageText,
};

const TEXT_BY_LOCALE: Record<Locale, Record<HomeOfferingMode, HomePageText>> = {
  sv: HOME_PAGE_TEXT_BY_MODE,
  en: HOME_PAGE_TEXT_BY_MODE_EN,
};

// Change this to "platform" to make the platform page the default root offering again.
export const DEFAULT_HOME_OFFERING_MODE: DefaultHomeOfferingMode = "full-service";

export const ORDERED_HOME_OFFERING_MODES: readonly HomeOfferingMode[] = [
  DEFAULT_HOME_OFFERING_MODE,
  ...HOME_OFFERING_MODES.filter((mode) => mode !== DEFAULT_HOME_OFFERING_MODE),
];

export const PUBLIC_HOME_OFFERING_MODES: readonly DefaultHomeOfferingMode[] =
  ORDERED_HOME_OFFERING_MODES.filter(
    (mode): mode is DefaultHomeOfferingMode => mode !== "partner",
  );

export const isHomeOfferingMode = (value: string | null): value is HomeOfferingMode =>
  value === "full-service" || value === "platform" || value === "partner";

export const getHomePageText = (
  mode: HomeOfferingMode = DEFAULT_HOME_OFFERING_MODE,
  locale: Locale = DEFAULT_LOCALE,
): HomePageText => (TEXT_BY_LOCALE[locale] ?? HOME_PAGE_TEXT_BY_MODE)[mode];

export const HOME_PAGE_TEXT = getHomePageText();

export type PreFetchedHomeContent = {
  shared: SharedText;
  byMode: Record<HomeOfferingMode, HomePageText>;
};
