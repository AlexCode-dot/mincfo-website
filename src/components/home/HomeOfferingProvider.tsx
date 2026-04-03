"use client";

import {
  createContext,
  startTransition,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";
import { usePathname, useRouter } from "next/navigation";
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

export function HomeOfferingProvider({
  children,
  allowedOfferings = HOME_OFFERING_MODES,
  initialOffering,
  prefetchedContent,
  syncWithUrl = true,
}: HomeOfferingProviderProps) {
  const pathname = usePathname();
  const router = useRouter();
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

  const setOffering = (next: HomeOfferingMode) => {
    if (!allowedOfferings.includes(next)) return;

    startTransition(() => {
      setOfferingState(next);
    });

    if (typeof window === "undefined" || !syncWithUrl) return;

    const targetRoute = getHomeRouteForOffering(next);
    if (pathname !== targetRoute) {
      router.replace(targetRoute, { scroll: false });
    }
  };

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
