"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  MOTION_PREFERENCE_EXPLICIT_KEY,
  isMotionPreference,
  MOTION_PREFERENCE_KEY,
  resolveMotionMode,
  type MotionPreference,
  type ResolvedMotionMode,
} from "@/lib/motion";

type MotionContextValue = {
  isReducedMotion: boolean;
  preference: MotionPreference;
  resolvedMode: ResolvedMotionMode;
  setPreference: (next: MotionPreference) => void;
};

const MotionContext = createContext<MotionContextValue | null>(null);

export function MotionProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<MotionPreference>(() => {
    if (typeof window === "undefined") return "full";
    const explicit = window.localStorage.getItem(MOTION_PREFERENCE_EXPLICIT_KEY);
    if (explicit !== "1") return "full";
    const saved = window.localStorage.getItem(MOTION_PREFERENCE_KEY);
    return isMotionPreference(saved) ? saved : "full";
  });

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (
        event.key !== MOTION_PREFERENCE_KEY &&
        event.key !== MOTION_PREFERENCE_EXPLICIT_KEY
      ) {
        return;
      }

      const explicit = window.localStorage.getItem(MOTION_PREFERENCE_EXPLICIT_KEY);
      if (explicit !== "1") {
        setPreferenceState("full");
        return;
      }

      const saved = window.localStorage.getItem(MOTION_PREFERENCE_KEY);
      setPreferenceState(isMotionPreference(saved) ? saved : "full");
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const resolvedMode = useMemo(
    () => resolveMotionMode(preference),
    [preference],
  );

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = resolvedMode;
    root.dataset.motionPreference = preference;
  }, [preference, resolvedMode]);

  const value = useMemo<MotionContextValue>(
    () => ({
      isReducedMotion: resolvedMode === "reduced",
      preference,
      resolvedMode,
      setPreference: (next: MotionPreference) => {
        setPreferenceState(next);
        window.localStorage.setItem(MOTION_PREFERENCE_EXPLICIT_KEY, "1");
        window.localStorage.setItem(MOTION_PREFERENCE_KEY, next);
      },
    }),
    [preference, resolvedMode],
  );

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export const useMotion = () => {
  const value = useContext(MotionContext);
  if (!value) {
    throw new Error("useMotion must be used within MotionProvider");
  }
  return value;
};
