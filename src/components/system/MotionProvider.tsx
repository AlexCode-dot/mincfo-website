"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { type MotionPreference, type ResolvedMotionMode } from "@/lib/motion";

type MotionContextValue = {
  isReducedMotion: boolean;
  preference: MotionPreference;
  resolvedMode: ResolvedMotionMode;
  setPreference: (next: MotionPreference) => void;
};

const MotionContext = createContext<MotionContextValue | null>(null);

export function MotionProvider({ children }: { children: ReactNode }) {
  const preference: MotionPreference = "full";
  const resolvedMode: ResolvedMotionMode = "full";

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = resolvedMode;
    root.dataset.motionPreference = preference;
  }, [preference, resolvedMode]);

  const value = useMemo<MotionContextValue>(
    () => ({
      isReducedMotion: false,
      preference,
      resolvedMode,
      setPreference: () => {},
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
