import { DEFAULT_HOME_OFFERING_MODE, type HomeOfferingMode } from "@/content/homePageText";

export const HOME_ROUTE_BY_OFFERING: Record<HomeOfferingMode, string> = {
  "full-service": "/full-service",
  platform: "/plattform",
  partner: "/partner",
};

export const DEFAULT_HOME_ROUTE = "/";

export function getHomeRouteForOffering(offering: HomeOfferingMode) {
  return offering === DEFAULT_HOME_OFFERING_MODE
    ? DEFAULT_HOME_ROUTE
    : HOME_ROUTE_BY_OFFERING[offering];
}

export function getOfferingFromPathname(pathname: string): HomeOfferingMode | null {
  if (pathname === "/") {
    return DEFAULT_HOME_OFFERING_MODE;
  }

  if (pathname === "/plattform") {
    return "platform";
  }

  if (pathname === "/full-service") {
    return "full-service";
  }

  if (pathname === "/partner") {
    return "partner";
  }

  return null;
}
