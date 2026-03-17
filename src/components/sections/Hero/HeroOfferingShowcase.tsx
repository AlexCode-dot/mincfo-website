"use client";

import {
  ArrowDown,
  ArrowUpRight,
  Blocks,
  Building2,
  CircleDot,
  FileCheck2,
  Siren,
  Sparkles,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useHomeOffering } from "@/components/home/HomeOfferingProvider";
import { useMotion } from "@/components/system/MotionProvider";
import {
  DEFAULT_HOME_OFFERING_MODE,
  type HomeOfferingMode,
} from "@/content/homePageText";
import {
  ShowcaseClippedAreaChart,
  ShowcaseGradientBarChart,
} from "./HeroOfferingCharts";
import TextType from "./TextType";
import styles from "./HeroOfferingShowcase.module.scss";

const OFFERING_ICONS = {
  platform: Blocks,
  "full-service": Sparkles,
  partner: Building2,
} as const;
const SHOWCASE_ORDER: HomeOfferingMode[] = ["platform", "full-service", "partner"];
const AUTOPLAY_INTERVAL_MS = 5200;
const AUTOPLAY_PAUSE_AFTER_INTERACTION_MS = 12000;
const SCROLL_PROGRESS_STEP = 0.01;
const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const formatTranslate3d = (x: number, y: number, scale?: number) => {
  const snappedX = Math.round(x);
  const snappedY = Math.round(y);

  if (Math.abs(snappedX) < 1 && Math.abs(snappedY) < 1 && scale === undefined) {
    return "none";
  }

  if (scale === undefined || Math.abs(scale - 1) < 0.001) {
    return `translate3d(${snappedX}px, ${snappedY}px, 0)`;
  }

  return `translate3d(${snappedX}px, ${snappedY}px, 0) scale(${scale})`;
};

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const getStaggeredProgress = (
  progress: number,
  start: number,
  end: number,
  index: number,
  total: number,
  spread = 0.16,
) => {
  if (total <= 1) return smoothstep(start, end, progress);
  const offset = (index / (total - 1)) * spread;
  return smoothstep(start + offset, end + offset, progress);
};

function FullServiceVisual({
  content,
}: {
  content: ReturnType<typeof useHomeOffering>["shared"]["offering"]["showcase"]["full-service"]["serviceVisual"];
}) {
  return (
    <div className={styles.serviceGraphCard}>
      <div className={styles.serviceChipRow}>
        <span className={`${styles.serviceChip} ${styles.serviceChipOwnership}`}>
          <span className={styles.serviceChipDot} aria-hidden="true" />
          <span>{content.chipOwnership}</span>
        </span>
        <span className={`${styles.serviceChip} ${styles.serviceChipDelivery}`}>
          <span className={styles.serviceChipDot} aria-hidden="true" />
          <span>{content.chipDelivery}</span>
        </span>
        <span className={`${styles.serviceChip} ${styles.serviceChipLeadership}`}>
          <span className={styles.serviceChipDot} aria-hidden="true" />
          <span>{content.chipLeadership}</span>
        </span>
      </div>

      <div className={styles.serviceHeroPanel}>
        <span className={styles.serviceHeroGlow} aria-hidden="true" />
        <span className={styles.serviceHeroVignette} aria-hidden="true" />

        <div className={styles.serviceHeroHeader}>
          <div>
            <p className={styles.serviceHeroEyebrow}>{content.eyebrow}</p>
            <strong className={styles.serviceGraphTitle}>{content.title}</strong>
          </div>

          <span className={styles.serviceHeroBadge}>
            <Sparkles size={15} aria-hidden="true" />
            <span>{content.badge}</span>
          </span>
        </div>

        <div className={styles.serviceOrbitStage}>
          <span className={styles.serviceOrbitRail} aria-hidden="true" />
          <span className={styles.serviceOrbitHalo} aria-hidden="true" />

          <div className={styles.serviceOrbitNodes}>
            <div className={styles.serviceOrbitStep}>
              <span className={styles.serviceNodeDot} />
              <span>{content.steps[0]}</span>
            </div>
            <div className={styles.serviceOrbitStep}>
              <span className={`${styles.serviceNodeDot} ${styles.serviceNodeDotActive}`} />
              <span>{content.steps[1]}</span>
            </div>
            <div className={styles.serviceOrbitStep}>
              <span className={styles.serviceNodeDot} />
              <span>{content.steps[2]}</span>
            </div>
            <div className={styles.serviceOrbitStep}>
              <span className={styles.serviceNodeDot} />
              <span>{content.steps[3]}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.serviceSummaryCompact}>
        <div className={styles.serviceSummaryCard}>
          <span className={styles.serviceSummaryLabel}>
            <span className={styles.serviceSummaryIcon} aria-hidden="true">
              <FileCheck2 size={14} />
            </span>
            <span>{content.summaryReportLabel}</span>
          </span>
          <strong>{content.summaryReportValue}</strong>
        </div>
        <div className={styles.serviceSummaryCard}>
          <span className={styles.serviceSummaryLabel}>
            <span className={styles.serviceSummaryIcon} aria-hidden="true">
              <Siren size={14} />
            </span>
            <span>{content.summaryAlertsLabel}</span>
          </span>
          <strong>{content.summaryAlertsValue}</strong>
        </div>
      </div>
    </div>
  );
}

export default function HeroOfferingShowcase() {
  const { offering: siteOffering, options, shared } = useHomeOffering();
  const { isReducedMotion } = useMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const introStageRef = useRef<HTMLDivElement | null>(null);
  const scrollHintRef = useRef<HTMLDivElement | null>(null);
  const showcaseRef = useRef<HTMLDivElement | null>(null);
  const optionSlotRefs = useRef<Array<HTMLDivElement | null>>([]);
  const copyCardRef = useRef<HTMLElement | null>(null);
  const visualCardRef = useRef<HTMLDivElement | null>(null);
  const charRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const autoplayPauseUntilRef = useRef(0);
  const lastProgressRef = useRef(-1);
  const [activeShowcase, setActiveShowcase] = useState<HomeOfferingMode>(
    siteOffering ?? DEFAULT_HOME_OFFERING_MODE,
  );
  const [previewLabelReady, setPreviewLabelReady] = useState(false);
  const showcase = shared.offering.showcase;
  const introLines = showcase.introLines;

  useEffect(() => {
    setActiveShowcase(siteOffering);
  }, [siteOffering]);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      const introStage = introStageRef.current;
      const scrollHint = scrollHintRef.current;
      const showcaseNode = showcaseRef.current;
      const copyCard = copyCardRef.current;
      const visualCard = visualCardRef.current;
      if (!section || !introStage || !scrollHint || !showcaseNode || !copyCard || !visualCard) return;

      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(rect.height - window.innerHeight, 1);
      const next = Math.round(clamp(-rect.top / scrollable, 0, 1) / SCROLL_PROGRESS_STEP) * SCROLL_PROGRESS_STEP;
      if (next === lastProgressRef.current) return;
      lastProgressRef.current = next;

      const introOpacity = isReducedMotion
        ? 1
        : next <= 0.08
          ? 0
          : next <= 0.24
            ? smoothstep(0.08, 0.24, next)
            : next <= 0.58
              ? 1
              : 1 - smoothstep(0.58, 0.8, next);
      const introShift = isReducedMotion
        ? 0
        : next <= 0.24
          ? 22 - smoothstep(0.08, 0.24, next) * 22
          : next <= 0.58
            ? 0
            : smoothstep(0.58, 0.8, next) * -18;
      const showcaseOpacity = isReducedMotion ? 1 : smoothstep(0.52, 0.82, next);
      const showcaseTranslate = isReducedMotion ? 0 : 34 - showcaseOpacity * 34;
      const controlsReveal = isReducedMotion ? 1 : smoothstep(0.56, 0.76, next);
      const copyReveal = isReducedMotion ? 1 : smoothstep(0.6, 0.82, next);
      const visualReveal = isReducedMotion ? 1 : smoothstep(0.66, 0.88, next);
      const scrollHintReveal = isReducedMotion ? 0 : smoothstep(0.16, 0.24, next) * (1 - smoothstep(0.58, 0.68, next));

      introStage.style.opacity = `${introOpacity}`;
      introStage.style.transform = `translate3d(0, ${introShift}px, 0)`;
      introStage.setAttribute("aria-hidden", introOpacity <= 0.02 ? "true" : "false");

      scrollHint.style.opacity = `${scrollHintReveal}`;
      showcaseNode.style.opacity = `${showcaseOpacity}`;
      showcaseNode.style.transform = `translate3d(0, ${showcaseTranslate}px, 0)`;

      const shouldShowPreviewLabel = isReducedMotion || showcaseOpacity >= 0.96;
      setPreviewLabelReady((current) => (current === shouldShowPreviewLabel ? current : shouldShowPreviewLabel));

      optionSlotRefs.current.forEach((node, index) => {
        if (!node) return;
        const optionReveal = isReducedMotion
          ? 1
          : getStaggeredProgress(controlsReveal, 0, 1, index, optionSlotRefs.current.length, 0.22);
        node.style.opacity = `${optionReveal}`;
        node.style.transform = `translate3d(0, ${(1 - optionReveal) * 24}px, 0) scale(${0.96 + optionReveal * 0.04})`;
      });

      copyCard.style.opacity = `${copyReveal}`;
      copyCard.style.transform = formatTranslate3d((1 - copyReveal) * -20, (1 - copyReveal) * 24);
      visualCard.style.opacity = `${visualReveal}`;
      visualCard.style.transform = formatTranslate3d(
        (1 - visualReveal) * 22,
        (1 - visualReveal) * 28,
        0.97 + visualReveal * 0.03,
      );

      charRefs.current.forEach((node) => {
        if (!node) return;
        const lineIndex = Number(node.dataset.lineIndex ?? 0);
        const charIndex = Number(node.dataset.charIndex ?? 0);
        const total = Number(node.dataset.lineLength ?? 1);
        const isSpace = node.dataset.space === "true";
        const lineOffset = lineIndex * 0.03;
        const charIn = getStaggeredProgress(
          next,
          0.08 + lineOffset,
          0.2 + lineOffset,
          charIndex,
          total,
          0.1,
        );
        const charOut = getStaggeredProgress(
          next,
          0.58,
          0.76,
          charIndex,
          total,
          0.08,
        );
        const charOpacity = isReducedMotion ? 1 : isSpace ? 1 : charIn * (1 - charOut);
        const charY = isReducedMotion ? 0 : isSpace ? 0 : (1 - charIn) * 42 - charOut * 24;
        node.style.opacity = `${charOpacity}`;
        node.style.transform = `translate3d(0, ${charY}px, 0)`;
      });
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [isReducedMotion]);

  useEffect(() => {
    if (isReducedMotion) return;

    const interval = window.setInterval(() => {
      if (window.performance.now() < autoplayPauseUntilRef.current) return;

      setActiveShowcase((current) => {
        const currentIndex = SHOWCASE_ORDER.indexOf(current);
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % SHOWCASE_ORDER.length : 0;
        return SHOWCASE_ORDER[nextIndex];
      });
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [isReducedMotion]);
  const visual = showcase[activeShowcase];
  const ActiveEyebrowIcon = OFFERING_ICONS[activeShowcase];
  const currentPageOption = options.find((option) => option.id === siteOffering) ?? options[0];
  const orderedOptions =
    options.length === 3 && currentPageOption
      ? [...options.filter((option) => option.id !== currentPageOption.id).slice(0, 1), currentPageOption, ...options.filter((option) => option.id !== currentPageOption.id).slice(1)]
      : options;
  const isCurrentShowcasePage = currentPageOption?.id === activeShowcase;

  const pauseAutoplay = () => {
    autoplayPauseUntilRef.current = window.performance.now() + AUTOPLAY_PAUSE_AFTER_INTERACTION_MS;
  };

  return (
    <section ref={sectionRef} className={styles.section} aria-label={showcase.sectionAriaLabel}>
      <div className={styles.stickyFrame}>
        <div
          ref={introStageRef}
          className={styles.introStage}
        >
          <div className={styles.splitTitle} aria-label={introLines.join(" ")} role="heading" aria-level={2}>
            {introLines.map((line, lineIndex) => {
              const lineChars = Array.from(line);

              return (
                <p key={line} className={styles.splitLine}>
                  {lineChars.map((char, index) => (
                    <span
                      key={`${lineIndex}-${char}-${index}`}
                      ref={(node) => {
                        charRefs.current[lineIndex * 64 + index] = node;
                      }}
                      className={styles.charWrap}
                      aria-hidden="true"
                      data-line-index={lineIndex}
                      data-char-index={index}
                      data-line-length={lineChars.length}
                      data-space={char === " " ? "true" : "false"}
                    >
                      <span className={styles.charInner}>{char === " " ? "\u00A0" : char}</span>
                    </span>
                  ))}
                </p>
              );
            })}
          </div>

          <div
            ref={scrollHintRef}
            className={styles.scrollHint}
            aria-hidden="true"
          >
            <span className={styles.scrollMouse}>
              <span className={styles.scrollWheel} />
            </span>
          </div>
        </div>

        <div
          ref={showcaseRef}
          className={styles.showcase}
        >
          <div className={styles.panel}>
            <div className={styles.controlsHeader}>
              <p className={styles.previewLabel}>
                {previewLabelReady ? (
                  <TextType
                    text={showcase.previewLabel}
                    typingSpeed={18}
                    initialDelay={140}
                    cursorCharacter="_"
                    cursorClassName={styles.previewLabelCursor}
                  />
                ) : (
                  <span className={styles.previewLabelGhost} aria-hidden="true">
                    {showcase.previewLabel}
                  </span>
                )}
              </p>
            </div>

            <div className={styles.controls} aria-label={showcase.tabListAriaLabel}>
              {orderedOptions.map((option, index) => {
                const Icon = OFFERING_ICONS[option.id];
                const active = activeShowcase === option.id;
                const isCurrentPage = currentPageOption?.id === option.id;

                return (
                  <div
                    key={option.id}
                    ref={(node) => {
                      optionSlotRefs.current[index] = node;
                    }}
                    className={styles.optionSlot}
                  >
                    <button
                      type="button"
                      aria-pressed={active}
                      className={`${styles.option} ${active ? styles.optionActive : ""} ${isCurrentPage ? styles.optionCurrentPage : ""}`}
                      onClick={() => {
                        pauseAutoplay();
                        setActiveShowcase(option.id);
                      }}
                    >
                      <span className={styles.optionIcon}>
                        <Icon size={18} aria-hidden="true" />
                      </span>
                      <span>{option.label}</span>
                    </button>

                    {isCurrentPage ? (
                      <span className={styles.currentPageStatus}>
                        <span aria-hidden="true" className={styles.currentPageStatusDot} />
                        <span className={styles.currentPageStatusLabel}>
                          {showcase.currentPageLabel}
                        </span>
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className={styles.grid}>
              <article
                ref={copyCardRef}
                className={styles.copyCard}
              >
                <span className={styles.copyEyebrow}>
                  <ActiveEyebrowIcon size={13} aria-hidden="true" />
                  <span>{visual.eyebrow}</span>
                </span>
                <h2>{visual.title}</h2>
                <p className={styles.copyBody}>{visual.body}</p>

                <div className={styles.copyBullets}>
                  {options
                    .find((option) => option.id === activeShowcase)
                    ?.bullets.map((bullet) => (
                      <div key={bullet} className={styles.bullet}>
                        <CircleDot size={14} aria-hidden="true" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                </div>

                <a
                  href={visual.ctaHref}
                  className={`${styles.inlineCta} ${isCurrentShowcasePage ? styles.inlineCtaCurrentPage : ""}`}
                >
                  <span>
                    {isCurrentShowcasePage ? showcase.currentPageCtaLabel : visual.ctaLabel}
                  </span>
                  {isCurrentShowcasePage ? (
                    <ArrowDown size={19} aria-hidden="true" />
                  ) : (
                    <ArrowUpRight size={18} aria-hidden="true" />
                  )}
                </a>
              </article>

              <div
                ref={visualCardRef}
                className={styles.visualCard}
                aria-hidden="true"
              >
                <div className={styles.visualChrome}>
                  <span />
                  <span />
                  <span />
                  <div className={styles.visualBrand}>
                    <svg viewBox="0 0 50 50" aria-hidden="true">
                      <g fill="currentColor">
                        <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
                        <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
                        <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
                        <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
                      </g>
                    </svg>
                    <span>MinCFO</span>
                  </div>
                </div>

                <div className={styles.visualBody}>
                  {activeShowcase !== "full-service" && (
                    <div className={styles.metricGrid}>
                      {visual.stats.map((item) => (
                        <div key={item.label} className={styles.metricCard}>
                          <span>{item.label}</span>
                          <strong>{item.value}</strong>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeShowcase === "platform" && (
                    <ShowcaseGradientBarChart />
                  )}
                  {activeShowcase === "full-service" && (
                    <FullServiceVisual content={showcase["full-service"].serviceVisual} />
                  )}
                  {activeShowcase === "partner" && <ShowcaseClippedAreaChart />}
                </div>
              </div>
            </div>

            <div className={styles.showcasePager} aria-label={showcase.pagerAriaLabel}>
              {SHOWCASE_ORDER.map((mode) => {
                const isActive = mode === activeShowcase;
                const label = options.find((option) => option.id === mode)?.label ?? mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    className={`${styles.pagerDot} ${isActive ? styles.pagerDotActive : ""}`}
                    aria-label={`Visa ${label}`}
                    aria-pressed={isActive}
                    onClick={() => {
                      pauseAutoplay();
                      setActiveShowcase(mode);
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
