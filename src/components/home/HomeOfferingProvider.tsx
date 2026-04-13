"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useSyncExternalStore,
  type PropsWithChildren,
} from "react";
import {
  DEFAULT_HOME_OFFERING_MODE,
  HOME_OFFERING_MODES,
  HOME_PAGE_SHARED_TEXT,
  getHomePageText,
  type HomeOfferingMode,
  type HomePageText,
  type PreFetchedHomeContent,
} from "@/content/homePageText";
import { getHomeRouteForOffering, getOfferingFromPathname } from "@/lib/homeRoutes";

type OfferingOption = (typeof HOME_PAGE_SHARED_TEXT.offering.options)[number] & {
  id: HomeOfferingMode;
};

type HomeOfferingContextValue = {
  content: ReturnType<typeof getHomePageText>;
  offering: HomeOfferingMode;
  options: OfferingOption[];
  setOffering: (next: HomeOfferingMode) => void;
  shared: typeof HOME_PAGE_SHARED_TEXT;
};

const HomeOfferingContext = createContext<HomeOfferingContextValue | null>(null);

type HomeOfferingProviderProps = PropsWithChildren<{
  allowedOfferings?: readonly HomeOfferingMode[];
  initialOffering?: HomeOfferingMode;
  prefetchedContent?: PreFetchedHomeContent;
  syncWithUrl?: boolean;
}>;

const getFallbackOffering = (allowedOfferings: readonly HomeOfferingMode[]) =>
  allowedOfferings.includes(DEFAULT_HOME_OFFERING_MODE)
    ? DEFAULT_HOME_OFFERING_MODE
    : allowedOfferings[0];

const resolveInitialOffering = (
  allowedOfferings: readonly HomeOfferingMode[],
  initialOffering?: HomeOfferingMode,
) => {
  if (initialOffering && allowedOfferings.includes(initialOffering)) {
    return initialOffering;
  }

  return getFallbackOffering(allowedOfferings);
};

const getPathname = () =>
  typeof window !== "undefined" ? window.location.pathname : "/";

const subscribeToPathname = (cb: () => void) => {
  window.addEventListener("popstate", cb);
  return () => window.removeEventListener("popstate", cb);
};

export function HomeOfferingProvider({
  children,
  allowedOfferings = HOME_OFFERING_MODES,
  initialOffering,
  prefetchedContent,
  syncWithUrl = true,
}: HomeOfferingProviderProps) {
  const serverPathname = getHomeRouteForOffering(
    resolveInitialOffering(allowedOfferings, initialOffering),
  );
  const pathname = useSyncExternalStore(
    subscribeToPathname,
    getPathname,
    () => serverPathname,
  );
  const [localOffering, setOfferingState] = useState<HomeOfferingMode>(() =>
    resolveInitialOffering(allowedOfferings, initialOffering),
  );

  const shared = (prefetchedContent?.shared ?? HOME_PAGE_SHARED_TEXT) as typeof HOME_PAGE_SHARED_TEXT;
  const OPTIONS = shared.offering.options as OfferingOption[];
  const options = OPTIONS.filter((option) => allowedOfferings.includes(option.id));

  const pathnameOffering = pathname ? getOfferingFromPathname(pathname) : null;
  const offering = syncWithUrl
    ? (pathnameOffering && allowedOfferings.includes(pathnameOffering)
        ? pathnameOffering
        : resolveInitialOffering(allowedOfferings, initialOffering))
    : localOffering;

  const setOffering = useCallback((next: HomeOfferingMode) => {
    if (!allowedOfferings.includes(next)) return;

    setOfferingState(next);

    if (typeof window === "undefined" || !syncWithUrl) return;

    const targetRoute = getHomeRouteForOffering(next);
    if (window.location.pathname !== targetRoute) {
      window.history.replaceState(null, "", targetRoute);
    }
  }, [allowedOfferings, syncWithUrl]);

  const getContent = (mode: HomeOfferingMode): HomePageText =>
    prefetchedContent
      ? (prefetchedContent.byMode[mode] as HomePageText)
      : getHomePageText(mode);

  const value: HomeOfferingContextValue = {
    content: getContent(offering),
    offering,
    options,
    setOffering,
    shared,
  };

  return (
    <HomeOfferingContext.Provider value={value}>
      {children}
    </HomeOfferingContext.Provider>
  );
}

export function useHomeOffering() {
  const context = useContext(HomeOfferingContext);
  if (!context) {
    throw new Error("useHomeOffering must be used within HomeOfferingProvider.");
  }
  return context;
}

export function useOptionalHomeOffering() {
  return useContext(HomeOfferingContext);
}
