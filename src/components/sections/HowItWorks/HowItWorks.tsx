"use client";

import {
  ArrowRight,
  BrainCircuit,
  Building2,
  CreditCard,
  FolderPlus,
  Plug,
  RefreshCw,
  ReceiptText,
  Sparkles,
  UserRound,
  UsersRound,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { HOME_PAGE_TEXT } from "@/content/homePageText";
import { useMotion } from "@/components/system/MotionProvider";
import styles from "./HowItWorks.module.scss";

type OfferKey = "platform" | "faas";

type OfferModel = {
  isPrimary: boolean;
  key: OfferKey;
  tabLabel: string;
  steps: Array<{
    body: string;
    highlights?: string[];
    icon: LucideIcon;
    title: string;
  }>;
};

const OFFER_ORDER: OfferKey[] = ["platform", "faas"];
const CUT_HEIGHT = 190;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const cubic = (p0: number, p1: number, p2: number, p3: number, t: number) => {
  const oneMinus = 1 - t;
  return (
    oneMinus ** 3 * p0 +
    3 * oneMinus ** 2 * t * p1 +
    3 * oneMinus * t ** 2 * p2 +
    t ** 3 * p3
  );
};

const lerp = (start: number, end: number, t: number) =>
  start + (end - start) * t;

const PLATFORM_ICONS: LucideIcon[] = [UserRound, Plug, BrainCircuit, Sparkles];
const FAAS_ICONS: LucideIcon[] = [FolderPlus, Plug, Workflow, Sparkles];
const OFFERS: Record<OfferKey, OfferModel> = {
  platform: {
    key: "platform",
    isPrimary: true,
    tabLabel: HOME_PAGE_TEXT.howItWorks.offers.platform.tabLabel,
    steps: HOME_PAGE_TEXT.howItWorks.offers.platform.steps.map((step, index) => ({
      ...step,
      icon: PLATFORM_ICONS[index] ?? Sparkles,
    })),
  },
  faas: {
    key: "faas",
    isPrimary: false,
    tabLabel: HOME_PAGE_TEXT.howItWorks.offers.faas.tabLabel,
    steps: HOME_PAGE_TEXT.howItWorks.offers.faas.steps.map((step, index) => ({
      ...step,
      icon: FAAS_ICONS[index] ?? Sparkles,
    })),
  },
};

export default function HowItWorks() {
  const { isReducedMotion } = useMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);
  const [visible, setVisible] = useState(false);
  const [curveProgress, setCurveProgress] = useState(0);
  const [activeOffer, setActiveOffer] = useState<OfferKey>("platform");
  const [switching, setSwitching] = useState(false);
  const [revealedSteps, setRevealedSteps] = useState(0);

  const currentOffer = OFFERS[activeOffer];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.22, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateCurve = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight;
      if (rect.top >= viewport) {
        setCurveProgress(0);
      } else {
        const start = viewport * 0.9;
        const end = viewport * 0.42;
        const progress = clamp((start - rect.top) / (start - end), 0, 1);
        setCurveProgress(progress);
      }
    };

    updateCurve();
    window.addEventListener("scroll", updateCurve, { passive: true });
    window.addEventListener("resize", updateCurve);
    return () => {
      window.removeEventListener("scroll", updateCurve);
      window.removeEventListener("resize", updateCurve);
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      const resetId = window.setTimeout(() => setRevealedSteps(0), 0);
      return () => window.clearTimeout(resetId);
    }

    if (isReducedMotion) {
      const fullId = window.setTimeout(() => setRevealedSteps(currentOffer.steps.length), 0);
      return () => window.clearTimeout(fullId);
    }

    // Prevent "blank section" on anchor jumps where no step crosses the observer
    // threshold until the user nudges scroll.
    const resetId = window.setTimeout(() => setRevealedSteps(1), 0);
    const seen = new Set<number>();
    const observer = new IntersectionObserver(
      (entries) => {
        let maxSeen = -1;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const stepIndex = Number((entry.target as HTMLElement).dataset.stepIndex);
          if (Number.isNaN(stepIndex)) return;
          seen.add(stepIndex);
        });
        seen.forEach((index) => {
          if (index > maxSeen) maxSeen = index;
        });
        if (maxSeen >= 0) {
          setRevealedSteps((prev) => Math.max(prev, maxSeen + 1));
        }
      },
      { threshold: 0.24, rootMargin: "0px 0px -12% 0px" },
    );

    stepRefs.current.slice(0, currentOffer.steps.length).forEach((node) => {
      if (!node) return;
      observer.observe(node);
    });

    return () => {
      window.clearTimeout(resetId);
      observer.disconnect();
    };
  }, [visible, activeOffer, currentOffer.steps.length, isReducedMotion]);

  const handleSelectOffer = (nextOffer: OfferKey) => {
    if (nextOffer === activeOffer) return;

    if (isReducedMotion) {
      setActiveOffer(nextOffer);
      return;
    }

    setSwitching(true);
    window.setTimeout(() => {
      setActiveOffer(nextOffer);
      setSwitching(false);
    }, 180);
  };

  const handleTabsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = OFFER_ORDER.indexOf(activeOffer);

    if (event.key === "ArrowRight") {
      event.preventDefault();
      const next = OFFER_ORDER[(currentIndex + 1) % OFFER_ORDER.length];
      handleSelectOffer(next);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      const next = OFFER_ORDER[(currentIndex - 1 + OFFER_ORDER.length) % OFFER_ORDER.length];
      handleSelectOffer(next);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      handleSelectOffer(OFFER_ORDER[0]);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      handleSelectOffer(OFFER_ORDER[OFFER_ORDER.length - 1]);
    }
  };

  const sideY = lerp(6, 72, curveProgress);
  const centerY = lerp(6, 2, curveProgress);
  const cutPath = `M0 ${sideY} C280 ${sideY} 480 ${centerY} 720 ${centerY} C960 ${centerY} 1160 ${sideY} 1440 ${sideY}`;
  const curvePoints: string[] = [];
  for (let i = 0; i <= 18; i += 1) {
    const t = i / 18;
    const x = cubic(0, 280, 480, 720, t);
    const y = cubic(sideY, sideY, centerY, centerY, t);
    curvePoints.push(`${(x / 1440) * 100}% ${y}px`);
  }
  for (let i = 1; i <= 18; i += 1) {
    const t = i / 18;
    const x = cubic(720, 960, 1160, 1440, t);
    const y = cubic(centerY, centerY, sideY, sideY, t);
    curvePoints.push(`${(x / 1440) * 100}% ${y}px`);
  }
  const cutClip = `polygon(${curvePoints.join(", ")}, 100% 100%, 0% 100%)`;

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className={`${styles.section} ${visible ? styles.visible : ""}`}
      data-offer={activeOffer}
    >
      <svg
        className={styles.curveCut}
        viewBox={`0 0 1440 ${CUT_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={cutPath} />
      </svg>

      <div
        className={styles.background}
        aria-hidden="true"
        style={{ clipPath: cutClip, WebkitClipPath: cutClip } as CSSProperties}
      />
      <div
        className={styles.backgroundGrid}
        aria-hidden="true"
        style={{ clipPath: cutClip, WebkitClipPath: cutClip } as CSSProperties}
      />
      <div
        className={styles.backgroundGlow}
        aria-hidden="true"
        style={{ clipPath: cutClip, WebkitClipPath: cutClip } as CSSProperties}
      />

      <div className={styles.container}>
        <header className={styles.header}>
          <h2>{HOME_PAGE_TEXT.howItWorks.sectionTitle}</h2>
          <p>{HOME_PAGE_TEXT.howItWorks.sectionIntro}</p>
        </header>

        <div
          className={styles.tabList}
          role="tablist"
          aria-label={HOME_PAGE_TEXT.howItWorks.ui.tabListAria}
          onKeyDown={handleTabsKeyDown}
        >
          {OFFER_ORDER.map((offerKey) => {
            const offer = OFFERS[offerKey];
            const isSelected = activeOffer === offerKey;

            return (
              <button
                key={offerKey}
                id={`how-tab-${offerKey}`}
                className={`${styles.tab} ${isSelected ? styles.tabActive : ""}`}
                role="tab"
                aria-selected={isSelected}
                aria-controls={`how-panel-${offerKey}`}
                tabIndex={isSelected ? 0 : -1}
                type="button"
                onClick={() => handleSelectOffer(offerKey)}
              >
                {offer.tabLabel}
              </button>
            );
          })}
        </div>

        <div
          id={`how-panel-${currentOffer.key}`}
          className={`${styles.panel} ${switching ? styles.panelSwitching : ""} ${
            currentOffer.isPrimary ? styles.panelPrimary : styles.panelSecondary
          }`}
          role="tabpanel"
          aria-labelledby={`how-tab-${currentOffer.key}`}
        >
          <div className={styles.stepsFlow}>
            {currentOffer.steps.map((step, index) => {
              const Icon = step.icon;
              const stepNum = `0${index + 1}`;
              const isRevealed = index < revealedSteps;
              const isReversed = index % 2 === 1;
              const visualVariant = (index % 3) + 1;
              const isCreateAccountStep = currentOffer.key === "platform" && index === 0;
              const isConnectFortnoxStep = currentOffer.key === "platform" && index === 1;
              const isInsightsStep =
                (currentOffer.key === "platform" && index === 2) ||
                (currentOffer.key === "faas" && index === 3);
              const isFaasOnboardingStep = currentOffer.key === "faas" && index === 0;
              const isFaasSystemsStep = currentOffer.key === "faas" && index === 1;
              const isFaasRealtimeStep = currentOffer.key === "faas" && index === 2;
              const faasRealtimeMonths = HOME_PAGE_TEXT.howItWorks.ui.faasRealtime.months;
              const faasRealtimeCashflowK = [180, 205, 232, 261, 296, 320];
              const faasRealtimeRunwayMonths = [12.9, 13.2, 13.4, 13.7, 13.9, 14.2];
              const faasRealtimeVariancePct = [5.2, 4.7, 4.1, 3.6, 3.3, 3.1];
              const faasRealtimeChartWidth = 320;
              const faasRealtimeChartHeight = 120;
              const faasRealtimeLatestIndex = faasRealtimeCashflowK.length - 1;
              const faasRealtimeMinFlow = Math.min(...faasRealtimeCashflowK);
              const faasRealtimeMaxFlow = Math.max(...faasRealtimeCashflowK);
              const faasRealtimeRange = Math.max(faasRealtimeMaxFlow - faasRealtimeMinFlow, 1);
              const faasRealtimeTrendPoints = faasRealtimeCashflowK
                .map((value, dataIndex) => {
                  const x =
                    (dataIndex / Math.max(faasRealtimeLatestIndex, 1)) * faasRealtimeChartWidth;
                  const normalized = (value - faasRealtimeMinFlow) / faasRealtimeRange;
                  const y = faasRealtimeChartHeight - 20 - normalized * 78;
                  return `${x},${y}`;
                })
                .join(" ");
              const isCenteredPlatformStep =
                isCreateAccountStep || isInsightsStep || isFaasOnboardingStep || isFaasRealtimeStep;
              const hasHighlights = Array.isArray(step.highlights) && step.highlights.length > 0;

              return (
                <article
                  ref={(node) => {
                    stepRefs.current[index] = node;
                  }}
                  data-step-index={index}
                  key={`${currentOffer.key}-${step.title}`}
                  className={`${styles.stepRow} ${isReversed ? styles.stepRowReverse : ""} ${
                    isRevealed ? styles.stepRowVisible : ""
                  } ${isCreateAccountStep ? styles.stepRowCreate : ""} ${
                    isInsightsStep ? styles.stepRowInsights : ""
                  } ${isFaasOnboardingStep ? styles.stepRowOnboarding : ""
                  } ${isFaasSystemsStep ? styles.stepRowFaasSystems : ""
                  } ${isFaasRealtimeStep ? styles.stepRowFaasRealtime : ""
                  }`}
                >
                  <span className={styles.stepSpineMarker} aria-hidden="true">
                    {stepNum}
                  </span>

                  <div className={styles.stepText}>
                    {isCenteredPlatformStep ? (
                      <div className={`${styles.stepCopy} ${styles.stepCopyCreate}`}>
                        <div className={styles.stepCreateLead}>
                          <span className={styles.stepOrb}>{stepNum}</span>
                        </div>
                        <div className={styles.stepTitleRow}>
                          <h4>{step.title}</h4>
                        </div>
                        <p>{step.body}</p>
                        {hasHighlights && (
                          <ul className={styles.stepHighlights}>
                            {step.highlights?.map((item) => (
                              <li key={item} className={styles.stepHighlightItem}>
                                <span className={styles.stepHighlightCheck} aria-hidden="true">
                                  ✓
                                </span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <div className={`${styles.stepMain} ${isConnectFortnoxStep ? styles.stepMainCentered : ""}`}>
                        {isConnectFortnoxStep ? (
                          <div className={`${styles.stepCopy} ${styles.stepCopyCentered}`}>
                            <div className={styles.stepCreateLead}>
                              <span className={styles.stepOrb}>{stepNum}</span>
                            </div>
                            <h4>{step.title}</h4>
                            <p>{step.body}</p>
                            {hasHighlights && (
                              <ul className={styles.stepHighlights}>
                                {step.highlights?.map((item) => (
                                  <li key={item} className={styles.stepHighlightItem}>
                                    <span className={styles.stepHighlightCheck} aria-hidden="true">
                                      ✓
                                    </span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : (
                          <>
                            <span className={styles.stepOrb}>{stepNum}</span>

                            <div className={styles.stepCopy}>
                              {!isFaasSystemsStep && (
                                <span className={styles.stepMetaIcon} aria-hidden="true">
                                  <Icon size={16} />
                                </span>
                              )}

                              <h4>{step.title}</h4>
                              <p>{step.body}</p>
                              {hasHighlights && (
                                <ul className={styles.stepHighlights}>
                                  {step.highlights?.map((item) => (
                                    <li key={item} className={styles.stepHighlightItem}>
                                      <span className={styles.stepHighlightCheck} aria-hidden="true">
                                        ✓
                                      </span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    className={`${styles.stepVisual} ${styles[`visualVariant${visualVariant}`]} ${
                      isCreateAccountStep ? styles.stepVisualCreate : ""
                    } ${isConnectFortnoxStep ? styles.stepVisualConnect : ""} ${
                      isInsightsStep ? styles.stepVisualInsights : ""
                    } ${isFaasOnboardingStep ? styles.stepVisualOnboarding : ""
                    } ${isFaasSystemsStep ? styles.stepVisualFaasSystems : ""
                    } ${isFaasRealtimeStep ? styles.stepVisualFaasRealtime : ""
                    }`}
                    aria-hidden="true"
                  >
                    <div className={styles.visualSurface}>
                      {isCreateAccountStep ? (
                        <div className={styles.accountMock}>
                          <div className={styles.accountHeader}>
                            <span className={styles.accountBrand}>{HOME_PAGE_TEXT.footer.brandWord}</span>
                            <span className={styles.accountSecure}>{HOME_PAGE_TEXT.howItWorks.ui.account.secureLabel}</span>
                          </div>

                          <div className={styles.accountTabs}>
                            <span className={`${styles.accountTab} ${styles.accountTabActive}`}>
                              {HOME_PAGE_TEXT.howItWorks.ui.account.tabCreate}
                            </span>
                            <span className={styles.accountTab}>{HOME_PAGE_TEXT.howItWorks.ui.account.tabLogin}</span>
                          </div>

                          <div className={styles.accountInputGroup}>
                            <span className={styles.accountInputLabel}>{HOME_PAGE_TEXT.howItWorks.ui.account.emailLabel}</span>
                            <span className={styles.accountField} />
                          </div>

                          <div className={styles.accountInputGroup}>
                            <span className={styles.accountInputLabel}>{HOME_PAGE_TEXT.howItWorks.ui.account.passwordLabel}</span>
                            <span className={styles.accountFieldShort} />
                          </div>

                          <div className={styles.accountMetaRow}>
                            <span className={styles.accountCheck} />
                            <span className={styles.accountMetaText}>{HOME_PAGE_TEXT.howItWorks.ui.account.termsLabel}</span>
                          </div>

                          <span className={styles.accountButton}>{HOME_PAGE_TEXT.howItWorks.ui.account.buttonLabel}</span>

                          <div className={styles.accountFooter}>
                            <span className={styles.accountFooterText}>{HOME_PAGE_TEXT.howItWorks.ui.account.existingAccountLabel}</span>
                            <span className={styles.accountFooterLink}>{HOME_PAGE_TEXT.howItWorks.ui.account.loginLinkLabel}</span>
                          </div>
                        </div>
                      ) : isConnectFortnoxStep ? (
                        <div className={styles.connectMock}>
                          <div className={`${styles.connectNode} ${styles.connectNodeFortnox}`}>
                            <div className={styles.connectBrand}>
                              <Image
                                className={styles.connectFortnoxLogo}
                                src="/icons/fortnox-icon.png"
                                alt={HOME_PAGE_TEXT.howItWorks.ui.faasSystems.fortnoxAlt}
                                width={88}
                                height={88}
                              />
                              <span className={styles.connectBrandWord}>{HOME_PAGE_TEXT.howItWorks.ui.connect.fortnoxWord}</span>
                            </div>
                            <span className={styles.connectNodeMeta}>{HOME_PAGE_TEXT.howItWorks.ui.connect.accountConnected}</span>
                          </div>
                          <div className={styles.connectBridge}>
                            <span className={styles.connectFlow} />
                            <span className={styles.connectDataDot} />
                          </div>
                          <div className={styles.connectNode}>
                            <div className={styles.connectBrand}>
                              <svg
                                className={styles.connectBrandMark}
                                viewBox="0 0 50 50"
                                role="img"
                                aria-hidden="true"
                              >
                                <g fill="currentColor">
                                  <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
                                  <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
                                  <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
                                  <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
                                </g>
                              </svg>
                              <span className={styles.connectBrandWord}>{HOME_PAGE_TEXT.howItWorks.ui.connect.mincfoWord}</span>
                            </div>
                            <span className={styles.connectNodeMeta}>{HOME_PAGE_TEXT.howItWorks.ui.connect.receivingData}</span>
                          </div>
                          <div className={styles.connectStatusWrap}>
                            <div className={styles.connectStatus}>{HOME_PAGE_TEXT.howItWorks.ui.connect.integrationActive}</div>
                            <span className={styles.connectSyncTime}>{HOME_PAGE_TEXT.howItWorks.ui.connect.lastSyncLabel}</span>
                          </div>
                        </div>
                      ) : isInsightsStep ? (
                        <div className={styles.insightsMock}>
                          <div className={styles.insightsHeader}>
                            <span className={styles.insightsDot} />
                            <span className={styles.insightsTitle}>{HOME_PAGE_TEXT.howItWorks.ui.insights.title}</span>
                          </div>

                          <div className={styles.insightsQuestion}>
                            {HOME_PAGE_TEXT.howItWorks.ui.insights.question}
                          </div>

                          <div className={styles.insightsAnswer}>
                            <div className={styles.insightsThinking} aria-hidden="true">
                              <span />
                              <span />
                              <span />
                              <em>{HOME_PAGE_TEXT.howItWorks.ui.insights.thinkingLabel}</em>
                            </div>

                            <div className={styles.insightsResult}>
                              <div className={styles.insightsAnswerHead}>
                                <span>{HOME_PAGE_TEXT.howItWorks.ui.insights.generatedForecastLabel}</span>
                                <span>{HOME_PAGE_TEXT.howItWorks.ui.insights.runwayMonthsLabel}</span>
                              </div>

                              <div className={styles.insightsBars}>
                                <div className={`${styles.insightsBar} ${styles.insightsBarCurrent}`}>
                                  <span className={styles.insightsBarFill} />
                                  <em>{HOME_PAGE_TEXT.howItWorks.ui.insights.barCurrent}</em>
                                </div>
                                <div className={`${styles.insightsBar} ${styles.insightsBarPlan}`}>
                                  <span className={styles.insightsBarFill} />
                                  <em>{HOME_PAGE_TEXT.howItWorks.ui.insights.barPlan}</em>
                                </div>
                                <div className={`${styles.insightsBar} ${styles.insightsBarScenario}`}>
                                  <span className={styles.insightsBarFill} />
                                  <em>{HOME_PAGE_TEXT.howItWorks.ui.insights.barScenario}</em>
                                </div>
                              </div>

                              <div className={styles.insightsSummary}>{HOME_PAGE_TEXT.howItWorks.ui.insights.summary}</div>
                            </div>
                          </div>

                          <div className={styles.insightsInput}>
                            <span className={styles.insightsInputText}>
                              <span className={styles.insightsInputHint}>{HOME_PAGE_TEXT.howItWorks.ui.insights.inputHint}</span>
                              <span className={styles.insightsInputTyped}>
                                {HOME_PAGE_TEXT.howItWorks.ui.insights.inputTyped}
                              </span>
                              <span className={styles.insightsInputCaret} aria-hidden="true" />
                            </span>
                            <button
                              type="button"
                              className={styles.insightsInputSend}
                              aria-label={HOME_PAGE_TEXT.howItWorks.ui.insights.sendAriaLabel}
                            >
                              <ArrowRight aria-hidden="true" size={12} />
                            </button>
                          </div>
                        </div>
                      ) : isFaasRealtimeStep ? (
                        <div className={styles.faasRealtimeMock}>
                          <div className={styles.faasRealtimeHeader}>
                            <span className={styles.faasRealtimeBadge}>
                              <span className={styles.faasRealtimeLogo} aria-hidden="true">
                                <svg className={styles.faasRealtimeLogoMark} viewBox="0 0 50 50" role="img">
                                  <g fill="currentColor">
                                    <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
                                    <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
                                    <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
                                    <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
                                  </g>
                                </svg>
                                <span className={styles.faasRealtimeLogoWord}>{HOME_PAGE_TEXT.footer.brandWord}</span>
                              </span>
                            </span>
                            <span className={styles.faasRealtimeStatus}>{HOME_PAGE_TEXT.howItWorks.ui.faasRealtime.statusUpdated}</span>
                          </div>

                          <div className={styles.faasRealtimeStats}>
                            <div className={styles.faasRealtimeStat}>
                              <span className={styles.faasRealtimeStatLabel}>{HOME_PAGE_TEXT.howItWorks.ui.faasRealtime.cashflowLabel}</span>
                              <strong>+{faasRealtimeCashflowK[faasRealtimeLatestIndex]} tkr</strong>
                            </div>
                            <div className={styles.faasRealtimeStat}>
                              <span className={styles.faasRealtimeStatLabel}>{HOME_PAGE_TEXT.howItWorks.ui.faasRealtime.runwayLabel}</span>
                              <strong>
                                {faasRealtimeRunwayMonths[faasRealtimeLatestIndex].toFixed(1)} {HOME_PAGE_TEXT.howItWorks.ui.faasRealtime.monthSuffix}
                              </strong>
                            </div>
                            <div className={styles.faasRealtimeStat}>
                              <span className={styles.faasRealtimeStatLabel}>{HOME_PAGE_TEXT.howItWorks.ui.faasRealtime.deviationLabel}</span>
                              <strong>+{faasRealtimeVariancePct[faasRealtimeLatestIndex].toFixed(1)}%</strong>
                            </div>
                          </div>

                          <div className={styles.faasRealtimeChart}>
                            <svg
                              className={styles.faasRealtimeLine}
                              viewBox={`0 0 ${faasRealtimeChartWidth} ${faasRealtimeChartHeight}`}
                              preserveAspectRatio="none"
                              aria-hidden="true"
                            >
                              <polyline points={faasRealtimeTrendPoints} />
                            </svg>
                            <div className={styles.faasRealtimeBars}>
                              {faasRealtimeCashflowK.map((value, dataIndex) => {
                                const normalized = (value - faasRealtimeMinFlow) / faasRealtimeRange;
                                const height = 42 + normalized * 48;
                                return (
                                  <span key={faasRealtimeMonths[dataIndex]} className={styles.faasRealtimeBarItem}>
                                    <span
                                      className={styles.faasRealtimeBar}
                                      style={{ height: `${height}%` } as CSSProperties}
                                    />
                                    <em>{faasRealtimeMonths[dataIndex]}</em>
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          <div className={styles.faasRealtimeAlerts}>
                            <div className={styles.faasRealtimeAlert}>
                              <span className={styles.faasRealtimeAlertDot} />
                              <span>
                                {HOME_PAGE_TEXT.howItWorks.ui.faasRealtime.personnelAlertTemplate.replace(
                                  "{value}",
                                  faasRealtimeVariancePct[faasRealtimeLatestIndex].toFixed(1),
                                )}
                              </span>
                            </div>
                            <div className={styles.faasRealtimeAlert}>
                              <span className={styles.faasRealtimeAlertDot} />
                              <span>{HOME_PAGE_TEXT.howItWorks.ui.faasRealtime.latePaymentsAlert}</span>
                            </div>
                          </div>
                        </div>
                      ) : isFaasOnboardingStep ? (
                        <div className={styles.faasOnboardingConnect}>
                          <div className={styles.faasNodeClient}>
                            <span className={styles.faasNodeIcon} aria-hidden="true">
                              <UserRound size={14} />
                            </span>
                          </div>

                          <div className={styles.faasOnboardingHub}>
                            <span className={styles.faasHubSpinner} aria-hidden="true">
                              <RefreshCw size={18} strokeWidth={1.9} />
                            </span>
                          </div>

                          <div className={styles.faasNodeMincfo}>
                            <span className={styles.faasNodeMincfoIcon} aria-hidden="true">
                              <svg viewBox="0 0 50 50" role="img" aria-hidden="true">
                                <g fill="currentColor">
                                  <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
                                  <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
                                  <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
                                  <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
                                </g>
                              </svg>
                            </span>
                          </div>

                          <span className={styles.faasLinkLeft} aria-hidden="true">
                            <span className={styles.faasPulseLeft} />
                          </span>
                          <span className={styles.faasLinkRight} aria-hidden="true">
                            <span className={styles.faasPulseRight} />
                          </span>

                          <span className={styles.faasLinkBottom} aria-hidden="true">
                            <span className={styles.faasPulseBottom} />
                          </span>

                          <div className={styles.faasOnboardingBadge}>
                            <span className={styles.faasBadgeDot} />
                            <span>{HOME_PAGE_TEXT.howItWorks.ui.faasOnboarding.badgeLabel}</span>
                          </div>
                        </div>
                      ) : isFaasSystemsStep ? (
                        <div className={styles.faasSystemsConnect}>
                          <svg
                            className={styles.faasSystemsMap}
                            viewBox="0 0 620 430"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                          >
                            <g className={`${styles.faasSystemsBranch} ${styles.faasSystemsBranchTopLeft}`}>
                              <path d="M270 170 L270 130 L229 108" />
                            </g>
                            <g className={`${styles.faasSystemsBranch} ${styles.faasSystemsBranchTopCenter}`}>
                              <path d="M310 170 L310 114" />
                            </g>
                            <g className={`${styles.faasSystemsBranch} ${styles.faasSystemsBranchTopRight}`}>
                              <path d="M350 170 L350 130 L391 108" />
                            </g>
                            <g className={`${styles.faasSystemsBranch} ${styles.faasSystemsBranchMidLeft}`}>
                              <path d="M252 214 L170 214 L138 204" />
                            </g>
                            <g className={`${styles.faasSystemsBranch} ${styles.faasSystemsBranchMidRight}`}>
                              <path d="M368 214 L450 214 L482 204" />
                            </g>
                            <g className={`${styles.faasSystemsBranch} ${styles.faasSystemsBranchBottomCenter}`}>
                              <path d="M310 258 L310 308" />
                            </g>

                          </svg>

                          <div className={styles.faasSystemsHub}>
                            <span className={styles.faasSystemsHubLogo} aria-hidden="true">
                              <svg viewBox="0 0 50 50" role="img" aria-hidden="true">
                                <g fill="currentColor">
                                  <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
                                  <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
                                  <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
                                  <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
                                </g>
                              </svg>
                            </span>
                            <span>{HOME_PAGE_TEXT.howItWorks.ui.faasSystems.hubLabel}</span>
                          </div>

                          <div className={`${styles.faasSystemsNode} ${styles.faasSystemsNodeTopLeft}`}>
                            <span className={styles.faasSystemsNodeInner}>
                              <Building2 size={20} />
                            </span>
                            <em>{HOME_PAGE_TEXT.howItWorks.ui.faasSystems.bankLabel}</em>
                          </div>
                          <div className={`${styles.faasSystemsNode} ${styles.faasSystemsNodeTopCenter}`}>
                            <span className={styles.faasSystemsNodeInner}>
                              <Image
                                src="/icons/skatteverket-logo.svg"
                                alt={HOME_PAGE_TEXT.howItWorks.ui.faasSystems.skatteverketAlt}
                                width={26}
                                height={26}
                              />
                            </span>
                            <em>{HOME_PAGE_TEXT.howItWorks.ui.faasSystems.skatteverketLabel}</em>
                          </div>
                          <div
                            className={`${styles.faasSystemsNode} ${styles.faasSystemsNodeTopRight} ${styles.faasSystemsNodeFortnox}`}
                          >
                            <span className={styles.faasSystemsNodeInner}>
                              <Image
                                src="/icons/fortnox-icon.png"
                                alt={HOME_PAGE_TEXT.howItWorks.ui.faasSystems.fortnoxAlt}
                                width={26}
                                height={26}
                              />
                            </span>
                            <em>{HOME_PAGE_TEXT.howItWorks.ui.faasSystems.fortnoxLabel}</em>
                          </div>
                          <div className={`${styles.faasSystemsNode} ${styles.faasSystemsNodeMidLeft}`}>
                            <span className={styles.faasSystemsNodeInner}>
                              <ReceiptText size={20} />
                            </span>
                            <em>{HOME_PAGE_TEXT.howItWorks.ui.faasSystems.payrollLabel}</em>
                          </div>
                          <div className={`${styles.faasSystemsNode} ${styles.faasSystemsNodeMidRight}`}>
                            <span className={styles.faasSystemsNodeInner}>
                              <CreditCard size={20} />
                            </span>
                            <em>{HOME_PAGE_TEXT.howItWorks.ui.faasSystems.paymentsLabel}</em>
                          </div>
                          <div className={`${styles.faasSystemsNode} ${styles.faasSystemsNodeBottomCenter}`}>
                            <span className={styles.faasSystemsNodeInner} aria-hidden="true">
                              <UsersRound size={20} />
                            </span>
                            <em>{HOME_PAGE_TEXT.howItWorks.ui.faasSystems.customerTeamLabel}</em>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.visualCore}>
                          <Icon size={22} />
                        </div>
                      )}
                      <div className={styles.visualBeam} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
