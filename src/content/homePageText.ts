import fullServiceText from "./home/full-service.json";
import platformText from "./home/platform.json";
import partnerText from "./home/partner.json";
import sharedText from "./home/shared.json";

export const HOME_OFFERING_MODES = ["full-service", "platform", "partner"] as const;

export type HomeOfferingMode = (typeof HOME_OFFERING_MODES)[number];
export type DefaultHomeOfferingMode = Exclude<HomeOfferingMode, "partner">;

export const HOME_PAGE_SHARED_TEXT = sharedText;

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
): HomePageText => HOME_PAGE_TEXT_BY_MODE[mode];

export const HOME_PAGE_TEXT = getHomePageText();

export type PreFetchedHomeContent = {
  shared: typeof sharedText;
  byMode: Record<HomeOfferingMode, HomePageText>;
};
