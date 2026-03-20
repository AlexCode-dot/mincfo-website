"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHomeOffering } from "@/components/home/HomeOfferingProvider";
import { useMotion } from "@/components/system/MotionProvider";
import styles from "./HomeSnapShell.module.scss";

type SnapSection = {
  id: string;
  label: string;
};

type HomeSnapShellProps = {
  sections: SnapSection[];
};

const SNAP_TRANSITION_MS = 720;
const REDUCED_MOTION_TRANSITION_MS = 120;
const SCROLL_EDGE_TOLERANCE_PX = 4;
const SECTION_PROBE_OFFSET_VH = 0.14;
const SHOW_HOME_SNAP_DOTS = false;

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;
  return (
    target.isContentEditable ||
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT"
  );
};

const getPageTop = (element: HTMLElement) =>
  element.getBoundingClientRect().top + window.scrollY;

const isWithinFreeScrollRegion = () => {
  const regions = document.querySelectorAll<HTMLElement>("[data-home-snap-free='true']");
  const probe = window.scrollY + window.innerHeight * 0.5;

  for (const region of regions) {
    const top = getPageTop(region);
    const bottom = top + region.offsetHeight;
    if (probe >= top && probe <= bottom) {
      return true;
    }
  }

  return false;
};

export default function HomeSnapShell({ sections }: HomeSnapShellProps) {
  const { offering } = useHomeOffering();
  const { isReducedMotion } = useMotion();
  const filteredSections = useMemo(() => {
    if (offering === "platform") {
      return sections;
    }

    return sections.filter((section) => section.id !== "losningar");
  }, [offering, sections]);
  const [activeSectionId, setActiveSectionId] = useState<string>(filteredSections[0]?.id ?? "");
  const [availableSections, setAvailableSections] = useState<SnapSection[]>(filteredSections);
  const releaseTimeoutRef = useRef<number | null>(null);
  const transitionRef = useRef<{
    active: boolean;
    targetId: string | null;
  }>({
    active: false,
    targetId: null,
  });
  const timing = useMemo(
    () => ({
      transitionMs: isReducedMotion
        ? REDUCED_MOTION_TRANSITION_MS
        : SNAP_TRANSITION_MS,
    }),
    [isReducedMotion],
  );

  const getRenderedSections = useCallback(
    () => filteredSections.flatMap((section) => {
      const element = document.getElementById(section.id);
      return element instanceof HTMLElement ? [{ ...section, element }] : [];
    }),
    [filteredSections],
  );

  const getSectionIndexFromScroll = useCallback((sectionIds?: string[]) => {
    const rendered = getRenderedSections();
    if (rendered.length === 0) return -1;

    if (sectionIds) {
      const explicitIndex = rendered.findIndex((section) => sectionIds.includes(section.id));
      if (explicitIndex >= 0) return explicitIndex;
    }

    const probe = window.scrollY + window.innerHeight * SECTION_PROBE_OFFSET_VH;
    let currentIndex = 0;

    for (let index = 0; index < rendered.length; index += 1) {
      if (getPageTop(rendered[index].element) <= probe) {
        currentIndex = index;
      } else {
        break;
      }
    }

    return currentIndex;
  }, [getRenderedSections]);

  const syncAvailableSections = useCallback(() => {
    const rendered = getRenderedSections().map(({ id, label }) => ({ id, label }));
    setAvailableSections((current) => {
      if (
        current.length === rendered.length &&
        current.every((section, index) => section.id === rendered[index]?.id)
      ) {
        return current;
      }
      return rendered;
    });
    return rendered;
  }, [getRenderedSections]);

  const releaseTransition = useCallback(() => {
    transitionRef.current.active = false;
    transitionRef.current.targetId = null;
    if (releaseTimeoutRef.current) {
      window.clearTimeout(releaseTimeoutRef.current);
      releaseTimeoutRef.current = null;
    }
  }, []);

  const scheduleTransitionRelease = useCallback(() => {
    if (releaseTimeoutRef.current) {
      window.clearTimeout(releaseTimeoutRef.current);
    }
    releaseTimeoutRef.current = window.setTimeout(
      releaseTransition,
      timing.transitionMs,
    );
  }, [releaseTransition, timing.transitionMs]);

  const updateActiveSection = useCallback(() => {
    const rendered = getRenderedSections();
    if (rendered.length === 0) return;

    const activeIndex = getSectionIndexFromScroll(
      transitionRef.current.targetId ? [transitionRef.current.targetId] : undefined,
    );
    const nextActive = rendered[Math.max(activeIndex, 0)] ?? rendered[0];

    setActiveSectionId(nextActive.id);

    const activeTargetId = transitionRef.current.targetId;
    if (!activeTargetId) return;
    const target = rendered.find((section) => section.id === activeTargetId);
    if (!target) {
      releaseTransition();
      return;
    }

    if (
      Math.abs(window.scrollY - getPageTop(target.element)) <= SCROLL_EDGE_TOLERANCE_PX
    ) {
      releaseTransition();
    }
  }, [getRenderedSections, getSectionIndexFromScroll, releaseTransition]);

  const navigateToSection = useCallback((index: number) => {
    const rendered = getRenderedSections();
    if (rendered.length === 0) return false;

    const clampedIndex = Math.max(0, Math.min(index, rendered.length - 1));
    const target = rendered[clampedIndex];
    if (!target) return false;

    transitionRef.current.active = true;
    transitionRef.current.targetId = target.id;
    setActiveSectionId(target.id);
    scheduleTransitionRelease();
    window.scrollTo({
      top: getPageTop(target.element),
      left: 0,
      behavior: isReducedMotion ? "auto" : "smooth",
    });
    return true;
  }, [getRenderedSections, isReducedMotion, scheduleTransitionRelease]);

  const navigateByStep = useCallback((direction: 1 | -1) => {
    const rendered = getRenderedSections();
    if (rendered.length === 0) return false;
    const currentIndex = Math.max(
      getSectionIndexFromScroll(
        transitionRef.current.targetId
          ? [transitionRef.current.targetId]
          : activeSectionId
            ? [activeSectionId]
            : undefined,
      ),
      0,
    );
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= rendered.length) {
      return false;
    }
    return navigateToSection(nextIndex);
  }, [activeSectionId, getRenderedSections, getSectionIndexFromScroll, navigateToSection]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.dataset.homeSnap = "true";
    body.dataset.homeSnap = "true";
    const frame = window.requestAnimationFrame(() => {
      syncAvailableSections();
      updateActiveSection();
    });

    const observer = new MutationObserver(() => {
      syncAvailableSections();
      updateActiveSection();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const onResize = () => {
      syncAvailableSections();
      updateActiveSection();
    };

    window.addEventListener("resize", onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      window.cancelAnimationFrame(frame);
      delete root.dataset.homeSnap;
      delete body.dataset.homeSnap;
    };
  }, [filteredSections, syncAvailableSections, updateActiveSection]);

  useEffect(() => {
    const rendered = getRenderedSections();
    const currentHash = window.location.hash;
    const shouldResetToHero =
      currentHash === "#hero" ||
      currentHash === "#hero-demo" ||
      window.scrollY < window.innerHeight * 1.2;

    if (rendered.length === 0) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      if (!shouldResetToHero) {
        syncAvailableSections();
        updateActiveSection();
        return;
      }

      const hero = document.getElementById("hero");
      releaseTransition();
      syncAvailableSections();
      setActiveSectionId(rendered[0]?.id ?? "hero");
      window.scrollTo({
        top: hero instanceof HTMLElement ? getPageTop(hero) : 0,
        left: 0,
        behavior: "auto",
      });
      updateActiveSection();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [getRenderedSections, offering, releaseTransition, syncAvailableSections, updateActiveSection]);

  useEffect(() => {
    const onScroll = () => {
      updateActiveSection();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) {
        return;
      }

      if (isWithinFreeScrollRegion()) {
        return;
      }

      if (transitionRef.current.active) {
        if (
          event.key === "ArrowDown" ||
          event.key === "ArrowUp" ||
          event.key === "PageDown" ||
          event.key === "PageUp" ||
          event.key === "Home" ||
          event.key === "End"
        ) {
          event.preventDefault();
        }
        return;
      }

      if (
        event.key === "ArrowDown" ||
        event.key === "PageDown"
      ) {
        event.preventDefault();
        navigateByStep(1);
        return;
      }

      if (
        event.key === "ArrowUp" ||
        event.key === "PageUp"
      ) {
        event.preventDefault();
        navigateByStep(-1);
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        navigateToSection(0);
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        navigateToSection(Number.POSITIVE_INFINITY);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
      releaseTransition();
    };
  }, [
    activeSectionId,
    isReducedMotion,
    navigateByStep,
    navigateToSection,
    releaseTransition,
    timing.transitionMs,
    updateActiveSection,
  ]);

  if (!SHOW_HOME_SNAP_DOTS || availableSections.length < 2) {
    return null;
  }

  return (
    <nav
      className={styles.dots}
      aria-label="Section progress"
    >
      {availableSections.map((section, index) => {
        const isActive = section.id === activeSectionId;
        return (
          <button
            key={section.id}
            type="button"
            className={`${styles.dot} ${isActive ? styles.dotActive : ""}`}
            aria-label={`Go to ${section.label}`}
            aria-current={isActive ? "true" : undefined}
            onClick={() => {
              navigateToSection(index);
            }}
          >
            <span className={styles.dotCore} />
            <span className={styles.dotLabel}>{section.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
