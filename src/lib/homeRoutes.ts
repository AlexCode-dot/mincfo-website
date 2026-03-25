import type { HomeOfferingMode } from "@/content/homePageText";

export const HOME_ROUTE_BY_OFFERING: Record<HomeOfferingMode, string> = {
  platform: "/plattform",
  "full-service": "/full-service",
  partner: "/partner",
};

export const DEFAULT_HOME_ROUTE = "/";

export function getHomeRouteForOffering(offering: HomeOfferingMode) {
  return offering === "platform" ? DEFAULT_HOME_ROUTE : HOME_ROUTE_BY_OFFERING[offering];
}

export function getOfferingFromPathname(pathname: string): HomeOfferingMode | null {
  if (pathname === "/" || pathname === "/plattform") {
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
