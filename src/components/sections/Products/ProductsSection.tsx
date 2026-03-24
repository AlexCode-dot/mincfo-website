"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useHomeOffering } from "@/components/home/HomeOfferingProvider";
import { useMotion } from "@/components/system/MotionProvider";
import styles from "./ProductsSection.module.scss";
import {
  CopilotChatSection,
  CopilotCopy,
  CopilotVisual,
} from "./CopilotChatSection";
import {
  DashboardSection,
  DashboardCopy,
  DashboardVisual,
} from "./DashboardSection";
import {
  PlanningSection,
  PlanningCopy,
  PlanningVisual,
} from "./PlanningSection";

type CopilotStage = "idle" | "typing" | "sending" | "loading" | "answer" | "chart";
type AnalysisMetric = "netIncome" | "ebit" | "ebitda" | "grossProfit";
type CopilotExample = {
  answer: string;
  chartTitle: string;
  chartUnit: string;
  bars: Array<{ height: string; label: string; value: string }>;
  question: string;
  yTicks: string[];
};

type ProductStageDefinition = {
  ambientClassName: string;
  copy: ReactNode;
  id: string;
  visual: ReactNode;
};

const NON_BREAKING_SPACE = "\u00A0";

const DEFAULT_PLAN_MONTH_INDEX = 8;
const PLAN_MONTH_AUTOPLAY_SEQUENCE = [8, 1, 7, 11, 4, 9, 2, 10, 5];
const PLAN_MONTH_AUTOPLAY_DELAY_MS = 3400;
const PLAN_MONTH_AUTOPLAY_PAUSE_AFTER_MANUAL_MS = 6000;
const TREND_X_STEP = 760 / 11;
const PLAN_X_STEP = 682 / 11;
const TREND_AXIS_MIN_K = 0;
const TREND_AXIS_MAX_K = 500;
const PLAN_ACTUAL_VARIANCE = [0.052, 0.034, -0.012, -0.026, 0.018, 0.029] as const;
const PLAN_ACTUAL_CUTOFF_INDEX = 5;
const PLAN_FORECAST_BASE_K = [280, 298, 312, 326, 340, 352, 364, 379, 394, 409, 425, 442];

const ANALYSIS_NET_K = [14, 162, 101, 131, 176, 197, 204, 283, 207, 38, 307, 352];
const ANALYSIS_EBIT_K = [122, 148, 139, 161, 178, 194, 207, 226, 212, 166, 242, 263];
const ANALYSIS_EBITDA_K = [168, 194, 183, 207, 229, 246, 259, 281, 268, 224, 301, 323];
const ANALYSIS_GROSS_PROFIT_K = [258, 279, 271, 292, 307, 322, 337, 356, 344, 301, 372, 394];

const ANALYSIS_METRIC_AUTOPLAY_SEQUENCE: AnalysisMetric[] = [
  "netIncome",
  "ebit",
  "ebitda",
  "grossProfit",
];
const ANALYSIS_METRIC_AUTOPLAY_DELAY_MS = 3600;
const ANALYSIS_METRIC_AUTOPLAY_PAUSE_AFTER_MANUAL_MS = 6000;
const COPILOT_SECTION_REVEAL_START = 0.48;
const DESKTOP_COPILOT_INTRO_START = 0.48;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
const progressBetween = (value: number, start: number, end: number) =>
  clamp((value - start) / Math.max(end - start, 0.0001), 0, 1);
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const lerpSeries = (from: number[], to: number[], t: number) =>
  to.map((targetValue, index) => lerp(from[index] ?? targetValue, targetValue, t));
const easeInOut = (t: number) => t * t * (3 - 2 * t);
const preventShortWordOrphans = (text: string) =>
  text.replace(/\b(\p{L}{1,4}) (?=\p{L}{5,})/gu, `$1${NON_BREAKING_SPACE}`);

const cubic = (
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number,
) =>
  (1 - t) ** 3 * p0 +
  3 * (1 - t) ** 2 * t * p1 +
  3 * (1 - t) * t ** 2 * p2 +
  t ** 3 * p3;

const buildSmoothPath = (points: Array<[number, number]>) => {
  if (points.length < 2) return "";
  if (points.length === 2) return `M${points[0][0]} ${points[0][1]} L${points[1][0]} ${points[1][1]}`;

  const [firstX, firstY] = points[0];
  let path = `M${firstX} ${firstY}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    path += ` C${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2[0]} ${p2[1]}`;
  }
  return path;
};

export default function AICopilot() {
  const { content } = useHomeOffering();
  const { isReducedMotion } = useMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const desktopStageRef = useRef(0);
  const desktopIntroFrameRef = useRef<number | null>(null);
  const desktopScrollProgressRef = useRef(0);
  const dashboardSectionRef = useRef<HTMLDivElement | null>(null);
  const planSectionRef = useRef<HTMLDivElement | null>(null);
  const trendMetricMenuRef = useRef<HTMLDivElement | null>(null);

  const [curveScale, setCurveScale] = useState(1);
  const [desktopStickyEnabled, setDesktopStickyEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [desktopStageIndex, setDesktopStageIndex] = useState(0);
  const [desktopActiveDotIndex, setDesktopActiveDotIndex] = useState(0);
  const [desktopStageProgressValue, setDesktopStageProgressValue] = useState(0);
  const [desktopIntroEntered, setDesktopIntroEntered] = useState(false);
  const [dashboardVisible, setDashboardVisible] = useState(false);
  const [planVisible, setPlanVisible] = useState(false);
  const [curveProgress, setCurveProgress] = useState(0);
  const [dashboardCurveProgress, setDashboardCurveProgress] = useState(0);
  const [planCurveProgress, setPlanCurveProgress] = useState(0);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [stage, setStage] = useState<CopilotStage>("idle");
  const [typedQuestion, setTypedQuestion] = useState("");
  const [analysisMetric, setAnalysisMetric] = useState<AnalysisMetric>("netIncome");
  const [analysisMetricOpen, setAnalysisMetricOpen] = useState(false);
  const [analysisAutoplayPreviewMetric, setAnalysisAutoplayPreviewMetric] = useState<AnalysisMetric | null>(null);
  const [analysisAutoplayMenuAnimating, setAnalysisAutoplayMenuAnimating] = useState(false);
  const [planMonthIndex, setPlanMonthIndex] = useState(DEFAULT_PLAN_MONTH_INDEX);
  const [analysisUpdating, setAnalysisUpdating] = useState(false);
  const [planUpdating, setPlanUpdating] = useState(false);
  const [animatedPlanValue, setAnimatedPlanValue] = useState(0);
  const [animatedSelectedPlanDelta, setAnimatedSelectedPlanDelta] = useState(0);
  const [animatedPlanTotalDelta, setAnimatedPlanTotalDelta] = useState(0);
  const [animatedPlanSeriesK, setAnimatedPlanSeriesK] = useState<number[]>([]);
  const [animatedPlanMarkerIndex, setAnimatedPlanMarkerIndex] = useState(DEFAULT_PLAN_MONTH_INDEX);
  const [animatedAnalysisSeriesK, setAnimatedAnalysisSeriesK] = useState<number[]>([]);
  const [animatedSelectedMetricAmount, setAnimatedSelectedMetricAmount] = useState<number>(Number.NaN);
  const [animatedSelectedMetricPreviousAmount, setAnimatedSelectedMetricPreviousAmount] = useState<number>(Number.NaN);
  const [animatedSelectedMetricDelta, setAnimatedSelectedMetricDelta] = useState<number>(Number.NaN);
  const [animatedSelectedMetricPreviousDelta, setAnimatedSelectedMetricPreviousDelta] = useState<number>(Number.NaN);

  const planStatTweenFrameRef = useRef<number | null>(null);
  const planChartTweenFrameRef = useRef<number | null>(null);
  const analysisChartTweenFrameRef = useRef<number | null>(null);
  const analysisStatTweenFrameRef = useRef<number | null>(null);
  const planStatSnapshotRef = useRef<{
    selectedDelta: number;
    selectedValue: number;
    totalDelta: number;
  } | null>(null);
  const planChartSnapshotRef = useRef<{
    markerIndex: number;
    series: number[];
  } | null>(null);
  const analysisChartSnapshotRef = useRef<number[] | null>(null);
  const analysisStatSnapshotRef = useRef<{
    selectedAmount: number;
    previousAmount: number;
    selectedDelta: number;
    previousDelta: number;
  } | null>(null);
  const analysisAutoplayPositionRef = useRef(
    Math.max(ANALYSIS_METRIC_AUTOPLAY_SEQUENCE.indexOf("netIncome"), 0),
  );
  const analysisAutoplayPausedUntilRef = useRef(0);
  const analysisAutoplaySequenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analysisAutoplayStepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analysisMetricOpenRef = useRef(false);
  const analysisAutoplayMenuAnimatingRef = useRef(false);
  const planAutoplayPositionRef = useRef(
    Math.max(PLAN_MONTH_AUTOPLAY_SEQUENCE.indexOf(DEFAULT_PLAN_MONTH_INDEX), 0),
  );
  const planAutoplayPausedUntilRef = useRef(0);
  const monthLabels = content.aicopilot.dashboard.monthLabelsSv;
  const monthLabelsEn = content.aicopilot.planning.monthLabelsEn;
  const trendAxisTicks = content.aicopilot.dashboard.trendAxisTicks;
  const examples = useMemo<CopilotExample[]>(
    () => content.aicopilot.examples.map((example) => ({
      question: example.question,
      answer: example.answer,
      chartTitle: example.chartTitle,
      chartUnit: example.chartUnit,
      yTicks: [...example.yTicks],
      bars: example.bars.map((bar) => ({ label: bar.label, value: bar.value, height: bar.height })),
    })),
    [content],
  );
  const analysisMetrics = useMemo<Array<{ id: AnalysisMetric; label: string; seriesK: number[] }>>(
    () => [
      { id: "netIncome", label: content.aicopilot.dashboard.metricOptions[0], seriesK: ANALYSIS_NET_K },
      { id: "ebit", label: content.aicopilot.dashboard.metricOptions[1], seriesK: ANALYSIS_EBIT_K },
      { id: "ebitda", label: content.aicopilot.dashboard.metricOptions[2], seriesK: ANALYSIS_EBITDA_K },
      { id: "grossProfit", label: content.aicopilot.dashboard.metricOptions[3], seriesK: ANALYSIS_GROSS_PROFIT_K },
    ],
    [content],
  );

  useEffect(() => {
    const syncDesktopMode = () => {
      setDesktopStickyEnabled(window.innerWidth > 1100);
    };

    syncDesktopMode();
    window.addEventListener("resize", syncDesktopMode);
    return () => window.removeEventListener("resize", syncDesktopMode);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;

    const syncVisibility = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const viewportHeight = Math.max(window.innerHeight, 1);
      const revealThreshold = viewportHeight * COPILOT_SECTION_REVEAL_START;
      const nextVisible = rect.top <= revealThreshold && rect.bottom > viewportHeight * 0.2;
      setVisible(nextVisible);
    };

    const scheduleSync = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(syncVisibility);
    };

    scheduleSync();
    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (isReducedMotion) {
      section.style.setProperty("--hero-globe-handoff", "1");
      section.style.setProperty("--hero-globe-handoff-fade", "0.22");
      section.style.setProperty("--hero-globe-handoff-drift", "0px");
      return undefined;
    }

    let frame = 0;

    const updateHandoff = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const viewportHeight = Math.max(window.innerHeight, 1);
      const progress = clamp((viewportHeight - rect.top) / (viewportHeight * 0.88), 0, 1);
      const fade = 1 - progress;
      const drift = (1 - progress) * 72;

      section.style.setProperty("--hero-globe-handoff", progress.toFixed(3));
      section.style.setProperty("--hero-globe-handoff-fade", fade.toFixed(3));
      section.style.setProperty("--hero-globe-handoff-drift", `${drift.toFixed(1)}px`);
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateHandoff);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      section.style.removeProperty("--hero-globe-handoff");
      section.style.removeProperty("--hero-globe-handoff-fade");
      section.style.removeProperty("--hero-globe-handoff-drift");
    };
  }, [isReducedMotion]);

  useEffect(() => {
    const dashboardSection = dashboardSectionRef.current;
    if (!dashboardSection || desktopStickyEnabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => setDashboardVisible(entry.isIntersecting),
      { threshold: 0.28, rootMargin: "0px 0px -24% 0px" },
    );

    observer.observe(dashboardSection);
    return () => observer.disconnect();
  }, [desktopStickyEnabled]);

  useEffect(() => {
    const planSection = planSectionRef.current;
    if (!planSection || desktopStickyEnabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => setPlanVisible(entry.isIntersecting),
      { threshold: 0.22, rootMargin: "0px 0px -18% 0px" },
    );

    observer.observe(planSection);
    return () => observer.disconnect();
  }, [desktopStickyEnabled]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = trendMetricMenuRef.current;
      if (!menu) return;
      if (menu.contains(event.target as Node)) return;
      if (analysisAutoplayStepTimeoutRef.current) {
        clearTimeout(analysisAutoplayStepTimeoutRef.current);
        analysisAutoplayStepTimeoutRef.current = null;
      }
      setAnalysisMetricOpen(false);
      setAnalysisAutoplayPreviewMetric(null);
      setAnalysisAutoplayMenuAnimating(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    analysisMetricOpenRef.current = analysisMetricOpen;
  }, [analysisMetricOpen]);

  useEffect(() => {
    analysisAutoplayMenuAnimatingRef.current = analysisAutoplayMenuAnimating;
  }, [analysisAutoplayMenuAnimating]);

  useEffect(() => {
    if (!desktopStickyEnabled) {
      if (desktopIntroFrameRef.current) {
        window.cancelAnimationFrame(desktopIntroFrameRef.current);
        desktopIntroFrameRef.current = null;
      }
      desktopIntroFrameRef.current = window.requestAnimationFrame(() => {
        desktopIntroFrameRef.current = null;
        setDesktopIntroEntered(false);
      });
      return;
    }

    const section = sectionRef.current;
    if (!section) {
      if (desktopIntroFrameRef.current) {
        window.cancelAnimationFrame(desktopIntroFrameRef.current);
        desktopIntroFrameRef.current = null;
      }
      desktopIntroFrameRef.current = window.requestAnimationFrame(() => {
        desktopIntroFrameRef.current = null;
        setDesktopIntroEntered(false);
      });
      return;
    }

    const syncDesktopIntro = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = Math.max(window.innerHeight, 1);
      const introStartThreshold = viewportHeight * DESKTOP_COPILOT_INTRO_START;
      const shouldEnter = desktopStageIndex === 0 && rect.top <= introStartThreshold;

      if (shouldEnter === desktopIntroEntered) return;

      if (desktopIntroFrameRef.current) {
        window.cancelAnimationFrame(desktopIntroFrameRef.current);
      }
      desktopIntroFrameRef.current = window.requestAnimationFrame(() => {
        desktopIntroFrameRef.current = null;
        setDesktopIntroEntered(shouldEnter);
      });
    };

    syncDesktopIntro();
    window.addEventListener("scroll", syncDesktopIntro, { passive: true });
    window.addEventListener("resize", syncDesktopIntro);

    return () => {
      window.removeEventListener("scroll", syncDesktopIntro);
      window.removeEventListener("resize", syncDesktopIntro);
      if (desktopIntroFrameRef.current) {
        window.cancelAnimationFrame(desktopIntroFrameRef.current);
        desktopIntroFrameRef.current = null;
      }
    };
  }, [desktopIntroEntered, desktopStageIndex, desktopStickyEnabled]);

  useEffect(() => {
    if (!desktopStickyEnabled) return;
    const section = sectionRef.current;
    if (!section) return;

    const updateDesktopStage = () => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = Math.max(window.innerHeight, 1);
      const totalScrollable = Math.max(rect.height - viewportHeight, 1);
      const progress = clamp((-rect.top) / totalScrollable, 0, 1);
      desktopScrollProgressRef.current = progress;
      const phaseHoldStart = 0.04;
      const phaseTransitionFirst = 0.24;
      const phaseHoldMiddle = 0.04;
      const phaseTransitionSecond = 0.44;
      const phaseTransitionFirstEnd = phaseHoldStart + phaseTransitionFirst;
      const phaseHoldMiddleEnd = phaseTransitionFirstEnd + phaseHoldMiddle;
      const phaseTransitionSecondEnd = phaseHoldMiddleEnd + phaseTransitionSecond;
      const settleHysteresis = 0.016;
      const currentStage = desktopStageRef.current;

      let nextStage = 0;
      let stageProgress = 0;
      let nextDotIndex = 0;

      if (
        progress >= phaseTransitionFirstEnd - settleHysteresis
        && progress <= phaseTransitionFirstEnd + settleHysteresis
      ) {
        if (currentStage >= 1) {
          nextStage = 1;
          stageProgress = 0;
          nextDotIndex = 1;
        } else {
          nextStage = 0;
          stageProgress = 1;
          nextDotIndex = 1;
        }
      } else if (
        progress >= phaseTransitionSecondEnd - settleHysteresis
        && progress <= phaseTransitionSecondEnd + settleHysteresis
      ) {
        if (currentStage >= 2) {
          nextStage = 2;
          stageProgress = 0;
          nextDotIndex = 2;
        } else {
          nextStage = 1;
          stageProgress = 1;
          nextDotIndex = 2;
        }
      } else
      if (progress < phaseHoldStart) {
        nextStage = 0;
        stageProgress = 0;
        nextDotIndex = 0;
      } else if (progress < phaseTransitionFirstEnd) {
        nextStage = 0;
        stageProgress = easeInOut((progress - phaseHoldStart) / phaseTransitionFirst);
        nextDotIndex = stageProgress >= 0.5 ? 1 : 0;
      } else if (progress < phaseHoldMiddleEnd) {
        nextStage = 1;
        stageProgress = 0;
        nextDotIndex = 1;
      } else if (progress < phaseTransitionSecondEnd) {
        nextStage = 1;
        stageProgress = easeInOut((progress - phaseHoldMiddleEnd) / phaseTransitionSecond);
        nextDotIndex = stageProgress >= 0.5 ? 2 : 1;
      } else {
        nextStage = 2;
        stageProgress = 0;
        nextDotIndex = 2;
      }
      setDesktopStageProgressValue((current) =>
        Math.abs(current - stageProgress) < 0.01 ? current : stageProgress,
      );
      setDesktopActiveDotIndex((current) => (current === nextDotIndex ? current : nextDotIndex));
      if (desktopStageRef.current !== nextStage) {
        desktopStageRef.current = nextStage;
        setDesktopStageIndex(nextStage);
      }
    };

    updateDesktopStage();
    window.addEventListener("scroll", updateDesktopStage, { passive: true });
    window.addEventListener("resize", updateDesktopStage);
    return () => {
      window.removeEventListener("scroll", updateDesktopStage);
      window.removeEventListener("resize", updateDesktopStage);
    };
  }, [desktopStickyEnabled]);

  const effectiveDashboardVisible = desktopStickyEnabled ? desktopStageIndex === 1 && visible : dashboardVisible;
  const effectivePlanVisible = desktopStickyEnabled ? desktopStageIndex === 2 && visible : planVisible;
  const effectiveCopilotVisible = desktopStickyEnabled ? desktopStageIndex === 0 && visible : visible;

  useEffect(() => {
    if (!effectiveDashboardVisible) return;
    const startTimer = setTimeout(() => setAnalysisUpdating(true), 0);
    const timeoutId = setTimeout(() => setAnalysisUpdating(false), 260);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(timeoutId);
    };
  }, [analysisMetric, effectiveDashboardVisible]);

  useEffect(() => {
    if (!effectiveDashboardVisible || ANALYSIS_METRIC_AUTOPLAY_SEQUENCE.length < 2) return;

    const clearTimers = () => {
      if (analysisAutoplaySequenceTimeoutRef.current) {
        clearTimeout(analysisAutoplaySequenceTimeoutRef.current);
        analysisAutoplaySequenceTimeoutRef.current = null;
      }
      if (analysisAutoplayStepTimeoutRef.current) {
        clearTimeout(analysisAutoplayStepTimeoutRef.current);
        analysisAutoplayStepTimeoutRef.current = null;
      }
    };

    clearTimers();

    const scheduleNext = () => {
      analysisAutoplaySequenceTimeoutRef.current = setTimeout(() => {
        const now = Date.now();
        if (
          now < analysisAutoplayPausedUntilRef.current ||
          analysisMetricOpenRef.current ||
          analysisAutoplayMenuAnimatingRef.current
        ) {
          scheduleNext();
          return;
        }

        const nextIndex =
          (analysisAutoplayPositionRef.current + 1) % ANALYSIS_METRIC_AUTOPLAY_SEQUENCE.length;
        const nextMetric = ANALYSIS_METRIC_AUTOPLAY_SEQUENCE[nextIndex];
        const targetPreviewIndex = Math.max(
          ANALYSIS_METRIC_AUTOPLAY_SEQUENCE.indexOf(nextMetric),
          0,
        );
        setAnalysisAutoplayMenuAnimating(true);
        setAnalysisMetricOpen(true);

        let previewIndex = 0;
        const runPreviewStep = () => {
          setAnalysisAutoplayPreviewMetric(
            ANALYSIS_METRIC_AUTOPLAY_SEQUENCE[previewIndex],
          );

          if (previewIndex < targetPreviewIndex) {
            previewIndex += 1;
            analysisAutoplayStepTimeoutRef.current = setTimeout(runPreviewStep, 140);
            return;
          }

          analysisAutoplayStepTimeoutRef.current = setTimeout(() => {
            setAnalysisMetric(nextMetric);
            analysisAutoplayPositionRef.current = nextIndex;
            setAnalysisMetricOpen(false);
            setAnalysisAutoplayPreviewMetric(null);
            setAnalysisAutoplayMenuAnimating(false);
            scheduleNext();
          }, 260);
        };

        analysisAutoplayStepTimeoutRef.current = setTimeout(runPreviewStep, 180);
      }, ANALYSIS_METRIC_AUTOPLAY_DELAY_MS);
    };

    scheduleNext();
    return () => {
      clearTimers();
    };
  }, [effectiveDashboardVisible]);

  useEffect(() => {
    if (!effectivePlanVisible) return;
    const startTimer = setTimeout(() => setPlanUpdating(true), 0);
    const timeoutId = setTimeout(() => setPlanUpdating(false), 760);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(timeoutId);
    };
  }, [planMonthIndex, effectivePlanVisible]);

  useEffect(() => {
    if (!effectivePlanVisible || PLAN_MONTH_AUTOPLAY_SEQUENCE.length < 2) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const scheduleNext = () => {
      timeoutId = setTimeout(() => {
        const now = Date.now();
        if (now < planAutoplayPausedUntilRef.current) {
          scheduleNext();
          return;
        }
        const nextIndex =
          (planAutoplayPositionRef.current + 1) % PLAN_MONTH_AUTOPLAY_SEQUENCE.length;
        planAutoplayPositionRef.current = nextIndex;
        setPlanMonthIndex(PLAN_MONTH_AUTOPLAY_SEQUENCE[nextIndex]);
        scheduleNext();
      }, PLAN_MONTH_AUTOPLAY_DELAY_MS);
    };

    scheduleNext();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [effectivePlanVisible]);

  useEffect(() => {
    const updateCurve = () => {
      const width = window.innerWidth;
      const nextCurveScale = width <= 600 ? 0.46 : width <= 980 ? 0.62 : 1;
      setCurveScale((previous) =>
        Math.abs(previous - nextCurveScale) < 0.01 ? previous : nextCurveScale,
      );

      const section = sectionRef.current;
      if (section) {
        const rect = section.getBoundingClientRect();
        const start = window.innerHeight * 0.84;
        const end = window.innerHeight * 0.36;
        const progress = clamp((start - rect.top) / (start - end), 0, 1);
        setCurveProgress(progress);
      }

      const dashboardSection = dashboardSectionRef.current;
      if (dashboardSection) {
        const rect = dashboardSection.getBoundingClientRect();
        const viewport = window.innerHeight;
        if (rect.top >= viewport) {
          setDashboardCurveProgress(0);
        } else {
          const start = viewport * 0.9;
          const end = viewport * 0.42;
          const progress = clamp((start - rect.top) / (start - end), 0, 1);
          setDashboardCurveProgress(progress);
        }
      }

      const planSection = planSectionRef.current;
      if (planSection) {
        const rect = planSection.getBoundingClientRect();
        const start = window.innerHeight * 1.12;
        const end = window.innerHeight * 0.58;
        const progress = clamp((start - rect.top) / (start - end), 0, 1);
        setPlanCurveProgress(progress);
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
    if (!effectiveCopilotVisible) return;

    let cancelled = false;
    const timers: Array<ReturnType<typeof setTimeout>> = [];

    const queueTimeout = (fn: () => void, delay: number) => {
      const timeoutId = setTimeout(() => {
        if (!cancelled) fn();
      }, delay);
      timers.push(timeoutId);
    };

    const runCycle = (index: number) => {
      if (cancelled) return;
      setExampleIndex(index);
      setTypedQuestion("");
      setStage("typing");
      queueTimeout(() => setStage("sending"), 1400);
      queueTimeout(() => setStage("loading"), 2160);
      queueTimeout(() => setStage("answer"), 3280);
      queueTimeout(() => setStage("chart"), 4060);
      queueTimeout(() => runCycle((index + 1) % examples.length), 7200);
    };

    runCycle(0);
    return () => {
      cancelled = true;
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [effectiveCopilotVisible, examples]);

  useEffect(() => {
    if (stage !== "typing") return;

    const question = examples[exampleIndex]?.question ?? "";
    if (!question) return;

    let cancelled = false;
    const timeouts: Array<ReturnType<typeof setTimeout>> = [];
    const clearId = setTimeout(() => {
      if (!cancelled) {
        setTypedQuestion("");
      }
    }, 0);
    timeouts.push(clearId);

    Array.from(question).forEach((_, index) => {
      const timeoutId = setTimeout(() => {
        if (!cancelled) {
          setTypedQuestion(question.slice(0, index + 1));
        }
      }, 40 * index + 60);
      timeouts.push(timeoutId);
    });

    return () => {
      cancelled = true;
      timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, [stage, exampleIndex, examples]);

  const waveHeight = curveScale < 0.7 ? 160 : 190;
  const curveValue = (start: number, end: number, progress: number) =>
    lerp(start, start + (end - start) * curveScale, progress);

  const sideY = curveValue(1, 16, curveProgress);
  const centerY = curveValue(1, 128, curveProgress);
  const curvePath = `M0 ${sideY} C280 ${sideY} 480 ${centerY} 720 ${centerY} C960 ${centerY} 1160 ${sideY} 1440 ${sideY}`;

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
  const curveClip = `polygon(${curvePoints.join(", ")}, 100% 100%, 0% 100%)`;

  const dashboardSideY = curveValue(1, 128, dashboardCurveProgress);
  const dashboardCenterY = curveValue(1, 16, dashboardCurveProgress);
  const dashboardCurvePath = `M0 ${dashboardSideY} C280 ${dashboardSideY} 480 ${dashboardCenterY} 720 ${dashboardCenterY} C960 ${dashboardCenterY} 1160 ${dashboardSideY} 1440 ${dashboardSideY}`;
  const dashboardCurvePoints: string[] = [];
  for (let i = 0; i <= 18; i += 1) {
    const t = i / 18;
    const x = cubic(0, 280, 480, 720, t);
    const y = cubic(dashboardSideY, dashboardSideY, dashboardCenterY, dashboardCenterY, t);
    dashboardCurvePoints.push(`${(x / 1440) * 100}% ${y}px`);
  }
  for (let i = 1; i <= 18; i += 1) {
    const t = i / 18;
    const x = cubic(720, 960, 1160, 1440, t);
    const y = cubic(dashboardCenterY, dashboardCenterY, dashboardSideY, dashboardSideY, t);
    dashboardCurvePoints.push(`${(x / 1440) * 100}% ${y}px`);
  }
  const dashboardCurveClip = `polygon(${dashboardCurvePoints.join(", ")}, 100% 100%, 0% 100%)`;

  const planSideY = curveValue(1, 16, planCurveProgress);
  const planCenterY = curveValue(1, 128, planCurveProgress);
  const planCurvePath = `M0 ${planSideY} C280 ${planSideY} 480 ${planCenterY} 720 ${planCenterY} C960 ${planCenterY} 1160 ${planSideY} 1440 ${planSideY}`;
  const planCurvePoints: string[] = [];
  for (let i = 0; i <= 18; i += 1) {
    const t = i / 18;
    const x = cubic(0, 280, 480, 720, t);
    const y = cubic(planSideY, planSideY, planCenterY, planCenterY, t);
    planCurvePoints.push(`${(x / 1440) * 100}% ${y}px`);
  }
  for (let i = 1; i <= 18; i += 1) {
    const t = i / 18;
    const x = cubic(720, 960, 1160, 1440, t);
    const y = cubic(planCenterY, planCenterY, planSideY, planSideY, t);
    planCurvePoints.push(`${(x / 1440) * 100}% ${y}px`);
  }
  const planCurveClip = `polygon(${planCurvePoints.join(", ")}, 100% 100%, 0% 100%)`;

  const activeMetric =
    analysisMetrics.find((metric) => metric.id === analysisMetric) ?? analysisMetrics[0];
  const analysisSeries = activeMetric.seriesK;
  const latestMonthIndex = 11;
  const previousMonthIndex = 10;
  const priorMonthIndex = 9;

  const targetSelectedMetricAmount = analysisSeries[latestMonthIndex] * 1000;
  const targetSelectedMetricPreviousAmount = analysisSeries[previousMonthIndex] * 1000;
  const targetSelectedMetricDelta =
    ((analysisSeries[latestMonthIndex] - analysisSeries[previousMonthIndex]) /
      Math.max(Math.abs(analysisSeries[previousMonthIndex]), 1)) *
    100;
  const targetSelectedMetricPreviousDelta =
    ((analysisSeries[previousMonthIndex] - analysisSeries[priorMonthIndex]) /
      Math.max(Math.abs(analysisSeries[priorMonthIndex]), 1)) *
    100;

  const renderedAnalysisSeriesK =
    animatedAnalysisSeriesK.length === analysisSeries.length ? animatedAnalysisSeriesK : analysisSeries;

  const mapTrendY = (valueK: number) => {
    const top = 32;
    const bottom = 250;
    const ratio = clamp(
      (TREND_AXIS_MAX_K - valueK) / Math.max(TREND_AXIS_MAX_K - TREND_AXIS_MIN_K, 1),
      0,
      1,
    );
    return top + (bottom - top) * ratio;
  };

  const trendSeries: Array<[number, number]> = renderedAnalysisSeriesK.map((value, index) => [
    index * TREND_X_STEP,
    mapTrendY(value),
  ]);

  const planForecastBaseValues = useMemo(
    () =>
      PLAN_FORECAST_BASE_K.map((base, index) => {
        const seasonal = 1 + Math.sin((((index - 1) / 12) * Math.PI * 2)) * 0.018;
        return base * seasonal;
      }),
    [],
  );

  const planActualValues = useMemo(
    () =>
      planForecastBaseValues.map((base, index) => {
        if (index > PLAN_ACTUAL_CUTOFF_INDEX) return base;
        return base * (1 + PLAN_ACTUAL_VARIANCE[index]);
      }),
    [planForecastBaseValues],
  );

  const trailingAvg = useMemo(() => {
    const trailingThreeActuals = planActualValues
      .slice(Math.max(PLAN_ACTUAL_CUTOFF_INDEX - 2, 0), PLAN_ACTUAL_CUTOFF_INDEX + 1);
    return (
      trailingThreeActuals.reduce((sum, value) => sum + value, 0) /
      Math.max(trailingThreeActuals.length, 1)
    );
  }, [planActualValues]);

  const planForecastBaselineValues = useMemo(
    () =>
      planForecastBaseValues.map((base, index) => {
        if (index <= PLAN_ACTUAL_CUTOFF_INDEX) return planActualValues[index];
        const monthsAhead = index - PLAN_ACTUAL_CUTOFF_INDEX;
        const futureMonths = Math.max(12 - PLAN_ACTUAL_CUTOFF_INDEX, 1);
        const phase = monthsAhead / futureMonths;
        const dipDistance = (phase - 0.32) / 0.2;
        const dip = -0.055 * Math.exp(-(dipDistance ** 2));
        const recovery = 0.11 * phase ** 1.7;
        const crossoverTilt = -0.012 + 0.02 * phase;
        const shapedVariance = dip + recovery + crossoverTilt;
        const momentum = ((trailingAvg - base) / Math.max(base, 1)) * (1 - phase * 0.55);
        const driverAdjustment = 1 + Math.sin(((index + 2) / 12) * Math.PI * 2) * 0.024;
        const projected = base * (1 + shapedVariance + momentum) * driverAdjustment;
        return clamp(projected, base * 0.7, base * 1.48);
      }),
    [planActualValues, planForecastBaseValues, trailingAvg],
  );

  const planForecastValues = useMemo(
    () =>
      planForecastBaselineValues.map((baselineValue, index) => {
        const distance = Math.abs(index - planMonthIndex);
        const influence = Math.exp(-((distance / 4.7) ** 2));

        if (index <= PLAN_ACTUAL_CUTOFF_INDEX) {
          const actualPulse = Math.sin((planMonthIndex + 1) * 0.72 + index * 0.46) * 0.009;
          return baselineValue * (1 + actualPulse * influence);
        }

        const horizonSpan = Math.max(11 - PLAN_ACTUAL_CUTOFF_INDEX, 1);
        const selectionPhase = (planMonthIndex - PLAN_ACTUAL_CUTOFF_INDEX) / horizonSpan;
        const horizonTilt = clamp(selectionPhase, -0.22, 1.16) * 0.128 - 0.05;
        const monthsAheadFromSelection = index - planMonthIndex;
        const directionalWeight = clamp(monthsAheadFromSelection / Math.max(11 - planMonthIndex, 1), -1, 1);
        const localWave = Math.sin((index + 1) * 0.64 + planMonthIndex * 0.48) * 0.024 * influence;
        const kneeCompression =
          -0.022 *
          Math.exp(-(((index - (PLAN_ACTUAL_CUTOFF_INDEX + 2.6)) / 1.9) ** 2));
        const selectionLift =
          0.038 * Math.exp(-(((index - planMonthIndex) / 1.75) ** 2));
        const adjustment =
          1 + horizonTilt * directionalWeight + localWave + kneeCompression + selectionLift;

        return clamp(
          baselineValue * adjustment,
          planForecastBaseValues[index] * 0.64,
          planForecastBaseValues[index] * 1.62,
        );
      }),
    [planForecastBaselineValues, planMonthIndex, planForecastBaseValues],
  );

  const planForecastMin = Math.min(...planForecastBaseValues, ...planForecastValues, ...planForecastBaselineValues);
  const planForecastMax = Math.max(...planForecastBaseValues, ...planForecastValues, ...planForecastBaselineValues);
  const planForecastPadding = Math.max((planForecastMax - planForecastMin) * 0.18, 24);

  const mapPlanY = (valueK: number) => {
    const min = planForecastMin - planForecastPadding;
    const max = planForecastMax + planForecastPadding;
    const top = 18;
    const bottom = 170;
    const ratio = clamp((max - valueK) / (max - min), 0, 1);
    return top + (bottom - top) * ratio;
  };

  const renderedPlanSeriesK =
    animatedPlanSeriesK.length === planForecastValues.length ? animatedPlanSeriesK : planForecastValues;

  const planForecastSeries: Array<[number, number]> = renderedPlanSeriesK.map((value, index) => [
    index * PLAN_X_STEP,
    mapPlanY(value),
  ]);

  const planForecastLinePath = buildSmoothPath(planForecastSeries);
  const planForecastAreaPath = `${planForecastLinePath} L682 190 L0 190 Z`;
  const clampIndex = (index: number) => clamp(index, 0, renderedPlanSeriesK.length - 1);
  const markerIndexClamped = clampIndex(animatedPlanMarkerIndex);
  const markerBaseIndex = Math.floor(markerIndexClamped);
  const markerNextIndex = Math.min(markerBaseIndex + 1, renderedPlanSeriesK.length - 1);
  const markerT = markerIndexClamped - markerBaseIndex;
  const markerValueK = lerp(
    renderedPlanSeriesK[markerBaseIndex] ?? planForecastValues[planMonthIndex],
    renderedPlanSeriesK[markerNextIndex] ?? planForecastValues[planMonthIndex],
    markerT,
  );
  const selectedPlanPointX = markerIndexClamped * PLAN_X_STEP;
  const selectedPlanPointY = mapPlanY(markerValueK);

  const selectedPlanValue = planForecastValues[planMonthIndex];
  const previousPlanValue = planForecastValues[Math.max(planMonthIndex - 1, 0)];
  const selectedPlanDelta =
    ((selectedPlanValue - previousPlanValue) / Math.max(previousPlanValue, 1)) * 100;

  const planTotalValue = planForecastValues.reduce((sum, value) => sum + value, 0);
  const planBaseTotalValue = planForecastBaseValues.reduce((sum, value) => sum + value, 0);
  const planTotalDelta =
    ((planTotalValue - planBaseTotalValue) / Math.max(planBaseTotalValue, 1)) * 100;

  const selectedPlanMode =
    planMonthIndex <= PLAN_ACTUAL_CUTOFF_INDEX
      ? content.aicopilot.planning.actualPrefix
      : content.aicopilot.planning.forecastPrefix;

  const trendLinePath = buildSmoothPath(trendSeries);
  const trendAreaPath = `${trendLinePath} L760 290 L0 290 Z`;

  const selectedMetricAmount = Number.isFinite(animatedSelectedMetricAmount)
    ? animatedSelectedMetricAmount
    : targetSelectedMetricAmount;
  const selectedMetricPreviousAmount = Number.isFinite(animatedSelectedMetricPreviousAmount)
    ? animatedSelectedMetricPreviousAmount
    : targetSelectedMetricPreviousAmount;
  const selectedMetricDelta = Number.isFinite(animatedSelectedMetricDelta)
    ? animatedSelectedMetricDelta
    : targetSelectedMetricDelta;
  const selectedMetricPreviousDelta = Number.isFinite(animatedSelectedMetricPreviousDelta)
    ? animatedSelectedMetricPreviousDelta
    : targetSelectedMetricPreviousDelta;

  const analysisCompareLabel = content.aicopilot.dashboard.compareLabel;
  const formatSek = (value: number) => new Intl.NumberFormat("sv-SE").format(Math.round(value));
  const formatPercent = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  const trendAnimating = dashboardVisible;
  const trendResetting = false;

  useEffect(() => {
    const targetSeries = analysisSeries;
    const startSeries =
      analysisChartSnapshotRef.current &&
      analysisChartSnapshotRef.current.length === targetSeries.length
        ? analysisChartSnapshotRef.current
        : targetSeries;

    if (analysisChartTweenFrameRef.current !== null) {
      cancelAnimationFrame(analysisChartTweenFrameRef.current);
      analysisChartTweenFrameRef.current = null;
    }

    const duration = 920;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const t = clamp((now - startedAt) / duration, 0, 1);
      const eased = t < 0.5 ? 4 * t ** 3 : 1 - ((-2 * t + 2) ** 3) / 2;
      const nextSeries = lerpSeries(startSeries, targetSeries, eased);

      analysisChartSnapshotRef.current = nextSeries;
      setAnimatedAnalysisSeriesK(nextSeries);

      if (t < 1) {
        analysisChartTweenFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      analysisChartTweenFrameRef.current = null;
      analysisChartSnapshotRef.current = targetSeries;
    };

    analysisChartTweenFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (analysisChartTweenFrameRef.current !== null) {
        cancelAnimationFrame(analysisChartTweenFrameRef.current);
        analysisChartTweenFrameRef.current = null;
      }
    };
  }, [analysisSeries]);

  useEffect(() => {
    const target = {
      selectedAmount: targetSelectedMetricAmount,
      previousAmount: targetSelectedMetricPreviousAmount,
      selectedDelta: targetSelectedMetricDelta,
      previousDelta: targetSelectedMetricPreviousDelta,
    };
    const start = analysisStatSnapshotRef.current ?? target;

    if (analysisStatTweenFrameRef.current !== null) {
      cancelAnimationFrame(analysisStatTweenFrameRef.current);
      analysisStatTweenFrameRef.current = null;
    }

    const duration = 860;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const t = clamp((now - startedAt) / duration, 0, 1);
      const eased = t < 0.5 ? 4 * t ** 3 : 1 - ((-2 * t + 2) ** 3) / 2;
      const next = {
        selectedAmount: lerp(start.selectedAmount, target.selectedAmount, eased),
        previousAmount: lerp(start.previousAmount, target.previousAmount, eased),
        selectedDelta: lerp(start.selectedDelta, target.selectedDelta, eased),
        previousDelta: lerp(start.previousDelta, target.previousDelta, eased),
      };

      analysisStatSnapshotRef.current = next;
      setAnimatedSelectedMetricAmount(next.selectedAmount);
      setAnimatedSelectedMetricPreviousAmount(next.previousAmount);
      setAnimatedSelectedMetricDelta(next.selectedDelta);
      setAnimatedSelectedMetricPreviousDelta(next.previousDelta);

      if (t < 1) {
        analysisStatTweenFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      analysisStatTweenFrameRef.current = null;
      analysisStatSnapshotRef.current = target;
    };

    analysisStatTweenFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (analysisStatTweenFrameRef.current !== null) {
        cancelAnimationFrame(analysisStatTweenFrameRef.current);
        analysisStatTweenFrameRef.current = null;
      }
    };
  }, [
    targetSelectedMetricAmount,
    targetSelectedMetricPreviousAmount,
    targetSelectedMetricDelta,
    targetSelectedMetricPreviousDelta,
  ]);

  useEffect(() => {
    const target = {
      selectedValue: selectedPlanValue,
      selectedDelta: selectedPlanDelta,
      totalDelta: planTotalDelta,
    };
    const startValues = planStatSnapshotRef.current ?? target;

    if (planStatTweenFrameRef.current !== null) {
      cancelAnimationFrame(planStatTweenFrameRef.current);
      planStatTweenFrameRef.current = null;
    }

    const duration = 720;
    const start = performance.now();

    const tick = (now: number) => {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = t < 0.5 ? 4 * t ** 3 : 1 - ((-2 * t + 2) ** 3) / 2;
      const nextValue = lerp(startValues.selectedValue, target.selectedValue, eased);
      const nextSelectedDelta = lerp(startValues.selectedDelta, target.selectedDelta, eased);
      const nextTotalDelta = lerp(startValues.totalDelta, target.totalDelta, eased);

      planStatSnapshotRef.current = {
        selectedValue: nextValue,
        selectedDelta: nextSelectedDelta,
        totalDelta: nextTotalDelta,
      };

      setAnimatedPlanValue(nextValue);
      setAnimatedSelectedPlanDelta(nextSelectedDelta);
      setAnimatedPlanTotalDelta(nextTotalDelta);

      if (t < 1) {
        planStatTweenFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      planStatTweenFrameRef.current = null;
      planStatSnapshotRef.current = target;
    };

    planStatTweenFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (planStatTweenFrameRef.current !== null) {
        cancelAnimationFrame(planStatTweenFrameRef.current);
        planStatTweenFrameRef.current = null;
      }
    };
  }, [selectedPlanValue, selectedPlanDelta, planTotalDelta]);

  useEffect(() => {
    const target = {
      markerIndex: planMonthIndex,
      series: planForecastValues,
    };
    const startSnapshot = planChartSnapshotRef.current;
    const start =
      startSnapshot &&
      startSnapshot.series.length === target.series.length
        ? startSnapshot
        : target;

    if (planChartTweenFrameRef.current !== null) {
      cancelAnimationFrame(planChartTweenFrameRef.current);
      planChartTweenFrameRef.current = null;
    }

    const duration = 1100;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const t = clamp((now - startedAt) / duration, 0, 1);
      const eased = t < 0.5 ? 4 * t ** 3 : 1 - ((-2 * t + 2) ** 3) / 2;
      const nextSeries = lerpSeries(start.series, target.series, eased);
      const nextMarkerIndex = lerp(start.markerIndex, target.markerIndex, eased);

      planChartSnapshotRef.current = {
        series: nextSeries,
        markerIndex: nextMarkerIndex,
      };

      setAnimatedPlanSeriesK(nextSeries);
      setAnimatedPlanMarkerIndex(nextMarkerIndex);

      if (t < 1) {
        planChartTweenFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      planChartTweenFrameRef.current = null;
      planChartSnapshotRef.current = target;
    };

    planChartTweenFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (planChartTweenFrameRef.current !== null) {
        cancelAnimationFrame(planChartTweenFrameRef.current);
        planChartTweenFrameRef.current = null;
      }
    };
  }, [planForecastValues, planMonthIndex]);

  const currentExample = examples[exampleIndex];
  const isTyping = stage === "typing";
  const isSending = stage === "sending";
  const isLoading = stage === "loading";
  const showAnswerText = stage === "answer" || stage === "chart";
  const showChart = stage === "chart";
  const showQuestionBubble = stage !== "idle";
  const desktopCopilotVisible = desktopStickyEnabled ? desktopIntroEntered : visible;
  const desktopDashboardVisible = desktopStickyEnabled ? true : dashboardVisible;
  const desktopPlanVisible = desktopStickyEnabled ? true : planVisible;
  const desktopStageStyle = desktopStickyEnabled
    ? ({
        "--desktop-stage-progress": desktopStageProgressValue.toFixed(3),
        "--desktop-stage-outgoing-progress": easeInOut(
          progressBetween(desktopStageProgressValue, 0.12, 0.78),
        ).toFixed(3),
        "--desktop-stage-incoming-progress": easeInOut(
          progressBetween(desktopStageProgressValue, 0.22, 0.88),
        ).toFixed(3),
      } as CSSProperties)
    : undefined;
  const handleToggleAnalysisMetricMenu = () => {
    if (analysisAutoplayStepTimeoutRef.current) {
      clearTimeout(analysisAutoplayStepTimeoutRef.current);
      analysisAutoplayStepTimeoutRef.current = null;
    }
    const nextOpen = !analysisMetricOpen;
    setAnalysisMetricOpen(nextOpen);
    setAnalysisAutoplayPreviewMetric(null);
    setAnalysisAutoplayMenuAnimating(false);
    analysisAutoplayPausedUntilRef.current =
      Date.now() + ANALYSIS_METRIC_AUTOPLAY_PAUSE_AFTER_MANUAL_MS;
  };
  const handleSelectAnalysisMetric = (metric: AnalysisMetric) => {
    if (analysisAutoplayStepTimeoutRef.current) {
      clearTimeout(analysisAutoplayStepTimeoutRef.current);
      analysisAutoplayStepTimeoutRef.current = null;
    }
    setAnalysisMetric(metric);
    setAnalysisMetricOpen(false);
    setAnalysisAutoplayPreviewMetric(null);
    setAnalysisAutoplayMenuAnimating(false);
    analysisAutoplayPausedUntilRef.current =
      Date.now() + ANALYSIS_METRIC_AUTOPLAY_PAUSE_AFTER_MANUAL_MS;
    const sequenceIndex = ANALYSIS_METRIC_AUTOPLAY_SEQUENCE.indexOf(metric);
    if (sequenceIndex >= 0) {
      analysisAutoplayPositionRef.current = sequenceIndex;
    }
  };
  const handleSelectPlanMonth = (index: number) => {
    setPlanMonthIndex(index);
    planAutoplayPausedUntilRef.current =
      Date.now() + PLAN_MONTH_AUTOPLAY_PAUSE_AFTER_MANUAL_MS;
    const sequenceIndex = PLAN_MONTH_AUTOPLAY_SEQUENCE.indexOf(index);
    if (sequenceIndex >= 0) {
      planAutoplayPositionRef.current = sequenceIndex;
    }
  };

  const productStages: ProductStageDefinition[] = [
    {
      id: "copilot",
      ambientClassName: styles.ambientCopilot,
      copy: (
        <CopilotCopy
          visible={desktopCopilotVisible}
          pillClassName={styles.desktopCopyPill}
          titleClassName={styles.desktopCopyTitle}
          textClassName={styles.desktopCopyText}
          listClassName={styles.desktopCopyList}
          listItemClassName={styles.desktopCopyListItem}
          title={preventShortWordOrphans(content.aicopilot.leftTitle)}
        />
      ),
      visual: (
        <CopilotVisual
          currentExample={currentExample}
          visible={desktopCopilotVisible}
          showQuestionBubble={showQuestionBubble}
          isSending={isSending}
          isLoading={isLoading}
          showAnswerText={showAnswerText}
          showChart={showChart}
          isTyping={isTyping}
          typedQuestion={typedQuestion}
          stage={stage}
        />
      ),
    },
    {
      id: "dashboard",
      ambientClassName: styles.ambientDashboard,
      copy: (
        <DashboardCopy
          dashboardVisible={desktopDashboardVisible}
          pillClassName={styles.desktopCopyPill}
          titleClassName={styles.desktopCopyTitle}
          textClassName={styles.desktopCopyText}
          listClassName={styles.desktopCopyList}
          listItemClassName={styles.desktopCopyListItem}
          title={preventShortWordOrphans(content.aicopilot.dashboard.title)}
        />
      ),
      visual: (
        <DashboardVisual
          dashboardVisible={desktopDashboardVisible}
          analysisUpdating={analysisUpdating}
          trendAnimating={desktopDashboardVisible}
          trendResetting={trendResetting}
          trendSeries={trendSeries}
          trendAreaPath={trendAreaPath}
          trendLinePath={trendLinePath}
          analysisMetricOpen={analysisMetricOpen}
          trendMetricMenuRef={trendMetricMenuRef}
          activeMetric={activeMetric}
          analysisMetric={analysisMetric}
          analysisMetrics={analysisMetrics}
          selectedMetricAmount={selectedMetricAmount}
          selectedMetricPreviousAmount={selectedMetricPreviousAmount}
          selectedMetricDelta={selectedMetricDelta}
          selectedMetricPreviousDelta={selectedMetricPreviousDelta}
          analysisCompareLabel={analysisCompareLabel}
          autoplayPreviewMetric={analysisAutoplayPreviewMetric}
          autoplayMenuAnimating={analysisAutoplayMenuAnimating}
          onToggleMetricMenu={handleToggleAnalysisMetricMenu}
          onSelectMetric={handleSelectAnalysisMetric}
          formatSek={formatSek}
          formatPercent={formatPercent}
          monthLabels={monthLabels}
          trendAxisTicks={trendAxisTicks}
        />
      ),
    },
    {
      id: "planning",
      ambientClassName: styles.ambientPlanning,
      copy: (
        <PlanningCopy
          planVisible={desktopPlanVisible}
          pillClassName={styles.desktopCopyPill}
          titleClassName={styles.desktopCopyTitle}
          textClassName={styles.desktopCopyText}
          listClassName={styles.desktopCopyList}
          listItemClassName={styles.desktopCopyListItem}
          title={(
            <>
              Forecasting, scenarier
              <br />
              och bättre
              <br />
              framförhållning
            </>
          )}
        />
      ),
      visual: (
        <PlanningVisual
          planVisible={desktopPlanVisible}
          planUpdating={planUpdating}
          planMonthIndex={planMonthIndex}
          selectedPlanMode={selectedPlanMode}
          animatedPlanValue={animatedPlanValue}
          animatedSelectedPlanDelta={animatedSelectedPlanDelta}
          animatedPlanTotalDelta={animatedPlanTotalDelta}
          planForecastAreaPath={planForecastAreaPath}
          planForecastLinePath={planForecastLinePath}
          selectedPlanPointX={selectedPlanPointX}
          selectedPlanPointY={selectedPlanPointY}
          formatSek={formatSek}
          formatPercent={formatPercent}
          onSelectPlanMonth={handleSelectPlanMonth}
          monthLabelsEn={monthLabelsEn}
        />
      ),
    },
  ];
  return (
    <section
      ref={sectionRef}
      id="produkt"
      className={`${styles.section} ${visible ? styles.visible : ""} ${desktopStickyEnabled ? styles.sectionSticky : ""} ${desktopIntroEntered ? styles.desktopIntroEntered : ""}`}
      data-active-stage={productStages[desktopActiveDotIndex]?.id}
      style={desktopStageStyle}
    >
      <svg
        className={styles.curveCut}
        viewBox={`0 0 1440 ${waveHeight}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={curvePath} />
      </svg>

      <div
        className={styles.background}
        aria-hidden="true"
        style={
          {
            clipPath: curveClip,
            WebkitClipPath: curveClip,
          } as CSSProperties
        }
      >
        {productStages.map((productStage, index) => (
          <div
            key={productStage.id}
            className={`${styles.ambientLayer} ${productStage.ambientClassName} ${index === desktopStageIndex ? styles.ambientLayerActive : ""} ${index === desktopStageIndex + 1 ? styles.ambientLayerIncoming : ""}`}
          />
        ))}
      </div>

      <div className={styles.desktopStage}>
        <div className={styles.desktopStageInner}>
          <div className={styles.desktopCopyStack}>
            {productStages.map((productStage, index) => (
              <div
                key={`${productStage.id}-copy`}
                className={`${styles.stageLayer} ${styles.copyLayer} ${index === desktopStageIndex ? styles.stageLayerCurrent : ""} ${index === desktopStageIndex + 1 ? styles.stageLayerIncoming : ""} ${index < desktopStageIndex ? styles.stageLayerBefore : ""} ${index > desktopStageIndex + 1 ? styles.stageLayerAfter : ""} ${index === 0 && desktopStageIndex === 0 ? styles.desktopIntroStage : ""}`}
              >
                {productStage.copy}
              </div>
            ))}
          </div>

          <div className={styles.desktopVisualStack}>
            {productStages.map((productStage, index) => (
              <div
                key={`${productStage.id}-visual`}
                className={`${styles.stageLayer} ${styles.visualLayer} ${index === desktopStageIndex ? styles.stageLayerCurrent : ""} ${index === desktopStageIndex + 1 ? styles.stageLayerIncoming : ""} ${index < desktopStageIndex ? styles.stageLayerBefore : ""} ${index > desktopStageIndex + 1 ? styles.stageLayerAfter : ""} ${index === 0 && desktopStageIndex === 0 ? styles.desktopIntroStage : ""}`}
              >
                {productStage.visual}
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className={styles.mobileFlow}>
        <CopilotChatSection
          anchorId="produkt-copilot"
          currentExample={currentExample}
          visible={visible}
          showQuestionBubble={showQuestionBubble}
          isSending={isSending}
          isLoading={isLoading}
          showAnswerText={showAnswerText}
          showChart={showChart}
          isTyping={isTyping}
          typedQuestion={typedQuestion}
          stage={stage}
        />

        <DashboardSection
          dashboardSectionRef={dashboardSectionRef}
          waveHeight={waveHeight}
          dashboardCurvePath={dashboardCurvePath}
          dashboardCurveClip={dashboardCurveClip}
          dashboardVisible={dashboardVisible}
          analysisUpdating={analysisUpdating}
          trendAnimating={trendAnimating}
          trendResetting={trendResetting}
          trendSeries={trendSeries}
          trendAreaPath={trendAreaPath}
          trendLinePath={trendLinePath}
          analysisMetricOpen={analysisMetricOpen}
          trendMetricMenuRef={trendMetricMenuRef}
          activeMetric={activeMetric}
          analysisMetric={analysisMetric}
          analysisMetrics={analysisMetrics}
          selectedMetricAmount={selectedMetricAmount}
          selectedMetricPreviousAmount={selectedMetricPreviousAmount}
          selectedMetricDelta={selectedMetricDelta}
          selectedMetricPreviousDelta={selectedMetricPreviousDelta}
          analysisCompareLabel={analysisCompareLabel}
          autoplayPreviewMetric={analysisAutoplayPreviewMetric}
          autoplayMenuAnimating={analysisAutoplayMenuAnimating}
          onToggleMetricMenu={handleToggleAnalysisMetricMenu}
          onSelectMetric={handleSelectAnalysisMetric}
          formatSek={formatSek}
          formatPercent={formatPercent}
          monthLabels={monthLabels}
          trendAxisTicks={trendAxisTicks}
        />

        <PlanningSection
          planSectionRef={planSectionRef}
          waveHeight={waveHeight}
          planCurvePath={planCurvePath}
          planCurveClip={planCurveClip}
          planVisible={planVisible}
          planUpdating={planUpdating}
          planMonthIndex={planMonthIndex}
          selectedPlanMode={selectedPlanMode}
          animatedPlanValue={animatedPlanValue}
          animatedSelectedPlanDelta={animatedSelectedPlanDelta}
          animatedPlanTotalDelta={animatedPlanTotalDelta}
          planForecastAreaPath={planForecastAreaPath}
          planForecastLinePath={planForecastLinePath}
          selectedPlanPointX={selectedPlanPointX}
          selectedPlanPointY={selectedPlanPointY}
          formatSek={formatSek}
          formatPercent={formatPercent}
          onSelectPlanMonth={handleSelectPlanMonth}
          monthLabelsEn={monthLabelsEn}
        />
      </div>
    </section>
  );
}
