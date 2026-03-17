"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import {
  DEFAULT_HOME_OFFERING_MODE,
  HOME_OFFERING_MODES,
  HOME_PAGE_SHARED_TEXT,
  getHomePageText,
  isHomeOfferingMode,
  type HomeOfferingMode,
} from "@/content/homePageText";

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

const OPTIONS = HOME_PAGE_SHARED_TEXT.offering.options as OfferingOption[];

type HomeOfferingProviderProps = PropsWithChildren<{
  allowedOfferings?: readonly HomeOfferingMode[];
  initialOffering?: HomeOfferingMode;
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
  syncWithUrl = true,
}: HomeOfferingProviderProps) {
  const [offering, setOfferingState] = useState<HomeOfferingMode>(() =>
    resolveInitialOffering(allowedOfferings, initialOffering),
  );
  const options = OPTIONS.filter((option) => allowedOfferings.includes(option.id));

  useEffect(() => {
    if (typeof window === "undefined" || !syncWithUrl) return;

    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const next = params.get("offering");
      if (!isHomeOfferingMode(next) || !allowedOfferings.includes(next)) {
        setOfferingState(resolveInitialOffering(allowedOfferings, initialOffering));
        return;
      }
      setOfferingState(next);
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [allowedOfferings, initialOffering, syncWithUrl]);

  const setOffering = (next: HomeOfferingMode) => {
    if (!allowedOfferings.includes(next)) return;

    startTransition(() => {
      setOfferingState(next);
    });

    if (typeof window === "undefined" || !syncWithUrl) return;

    const url = new URL(window.location.href);
    if (next === DEFAULT_HOME_OFFERING_MODE) {
      url.searchParams.delete("offering");
    } else {
      url.searchParams.set("offering", next);
    }
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const value: HomeOfferingContextValue = {
    content: getHomePageText(offering),
    offering,
    options,
    setOffering,
    shared: HOME_PAGE_SHARED_TEXT,
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
