"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { clearContactReturnLocation, readContactReturnLocation } from "./contactReturn";

const SECTION_RESTORE_OFFSETS: Record<string, number> = {
  footer: 220,
};

export default function ContactReturnRestore() {
  const pathname = usePathname();

  useEffect(() => {
    const returnTarget = readContactReturnLocation();
    if (!returnTarget) return;
    if (window.location.pathname !== returnTarget.path) return;

    if (!returnTarget.sectionId) {
      clearContactReturnLocation();
      return;
    }

    let attempts = 0;
    const maxAttempts = 24;

    const restore = () => {
      const target = document.getElementById(returnTarget.sectionId ?? "");
      if (!target) {
        attempts += 1;
        if (attempts < maxAttempts) {
          window.setTimeout(restore, 80);
        }
        return;
      }

      const scrollPaddingTop = Number.parseFloat(
        window.getComputedStyle(document.documentElement).scrollPaddingTop,
      ) || 0;
      const extraOffset = SECTION_RESTORE_OFFSETS[returnTarget.sectionId ?? ""] ?? 0;
      const targetY = target.getBoundingClientRect().top + window.scrollY - scrollPaddingTop - extraOffset;

      window.scrollTo({
        top: Math.max(0, targetY),
        left: 0,
        behavior: "auto",
      });

      // Some sections only finalize layout/visibility after a scroll tick.
      // Trigger the same update path immediately after restoring position.
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("resize"));

      window.setTimeout(() => {
        window.dispatchEvent(new Event("scroll"));
      }, 50);

      window.history.replaceState(window.history.state, "", returnTarget.path);
      clearContactReturnLocation();
    };

    const timeout = window.setTimeout(restore, 80);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  return null;
}
