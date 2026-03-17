import fullServiceText from "./home/full-service.json";
import partnerText from "./home/partner.json";
import platformText from "./home/platform.json";
import sharedText from "./home/shared.json";

export const HOME_OFFERING_MODES = ["platform", "full-service", "partner"] as const;

export type HomeOfferingMode = (typeof HOME_OFFERING_MODES)[number];

export const HOME_PAGE_SHARED_TEXT = sharedText;

export const HOME_PAGE_TEXT_BY_MODE = {
  platform: {
    ...HOME_PAGE_SHARED_TEXT,
    ...platformText,
  },
  "full-service": {
    ...HOME_PAGE_SHARED_TEXT,
    ...fullServiceText,
  },
  partner: {
    ...HOME_PAGE_SHARED_TEXT,
    ...partnerText,
  },
} as const;

export type HomePageText = (typeof HOME_PAGE_TEXT_BY_MODE)[HomeOfferingMode];

export const DEFAULT_HOME_OFFERING_MODE: HomeOfferingMode = "platform";

export const isHomeOfferingMode = (value: string | null): value is HomeOfferingMode =>
  value === "platform" || value === "full-service" || value === "partner";

export const getHomePageText = (
  mode: HomeOfferingMode = DEFAULT_HOME_OFFERING_MODE,
): HomePageText => HOME_PAGE_TEXT_BY_MODE[mode];

export const HOME_PAGE_TEXT = getHomePageText();
