"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { HOME_PAGE_TEXT } from "@/content/homePageText";
import styles from "./ProductsSection.module.scss";
import { CopilotChatSection } from "./CopilotChatSection";
import { DashboardSection } from "./DashboardSection";
import { PlanningSection } from "./PlanningSection";

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

const MONTH_LABELS = HOME_PAGE_TEXT.aicopilot.dashboard.monthLabelsSv;
const MONTH_LABELS_EN = HOME_PAGE_TEXT.aicopilot.planning.monthLabelsEn;
const TREND_X_STEP = 760 / 11;
const PLAN_X_STEP = 682 / 11;
const TREND_AXIS_MIN_K = 0;
const TREND_AXIS_MAX_K = 500;
const TREND_AXIS_TICKS = HOME_PAGE_TEXT.aicopilot.dashboard.trendAxisTicks;
const PLAN_ACTUAL_VARIANCE = [0.052, 0.034, -0.012, -0.026, 0.018, 0.029] as const;
const PLAN_ACTUAL_CUTOFF_INDEX = 5;
const PLAN_FORECAST_BASE_K = [280, 298, 312, 326, 340, 352, 364, 379, 394, 409, 425, 442];

const ANALYSIS_NET_K = [14, 162, 101, 131, 176, 197, 204, 283, 207, 38, 307, 352];
const ANALYSIS_EBIT_K = [122, 148, 139, 161, 178, 194, 207, 226, 212, 166, 242, 263];
const ANALYSIS_EBITDA_K = [168, 194, 183, 207, 229, 246, 259, 281, 268, 224, 301, 323];
const ANALYSIS_GROSS_PROFIT_K = [258, 279, 271, 292, 307, 322, 337, 356, 344, 301, 372, 394];

const EXAMPLES: CopilotExample[] = HOME_PAGE_TEXT.aicopilot.examples.map((example) => ({
  question: example.question,
  answer: example.answer,
  chartTitle: example.chartTitle,
  chartUnit: example.chartUnit,
  yTicks: [...example.yTicks],
  bars: example.bars.map((bar) => ({ label: bar.label, value: bar.value, height: bar.height })),
}));

const ANALYSIS_METRICS: Array<{ id: AnalysisMetric; label: string; seriesK: number[] }> = [
  { id: "netIncome", label: HOME_PAGE_TEXT.aicopilot.dashboard.metricOptions[0], seriesK: ANALYSIS_NET_K },
  { id: "ebit", label: HOME_PAGE_TEXT.aicopilot.dashboard.metricOptions[1], seriesK: ANALYSIS_EBIT_K },
  { id: "ebitda", label: HOME_PAGE_TEXT.aicopilot.dashboard.metricOptions[2], seriesK: ANALYSIS_EBITDA_K },
  { id: "grossProfit", label: HOME_PAGE_TEXT.aicopilot.dashboard.metricOptions[3], seriesK: ANALYSIS_GROSS_PROFIT_K },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

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
  const sectionRef = useRef<HTMLElement | null>(null);
  const dashboardSectionRef = useRef<HTMLDivElement | null>(null);
  const planSectionRef = useRef<HTMLDivElement | null>(null);
  const trendMetricMenuRef = useRef<HTMLDivElement | null>(null);

  const [curveScale, setCurveScale] = useState(1);
  const [visible, setVisible] = useState(false);
  const [dashboardVisible, setDashboardVisible] = useState(false);
  const [planVisible, setPlanVisible] = useState(false);
  const [trendAnimating, setTrendAnimating] = useState(false);
  const [trendResetting, setTrendResetting] = useState(false);
  const [curveProgress, setCurveProgress] = useState(0);
  const [dashboardCurveProgress, setDashboardCurveProgress] = useState(0);
  const [planCurveProgress, setPlanCurveProgress] = useState(0);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [typedLength, setTypedLength] = useState(0);
  const [stage, setStage] = useState<CopilotStage>("idle");
  const [analysisMetric, setAnalysisMetric] = useState<AnalysisMetric>("netIncome");
  const [analysisMetricOpen, setAnalysisMetricOpen] = useState(false);
  const [planMonthIndex, setPlanMonthIndex] = useState(11);
  const [analysisUpdating, setAnalysisUpdating] = useState(false);
  const [planUpdating, setPlanUpdating] = useState(false);
  const [animatedPlanValue, setAnimatedPlanValue] = useState(0);
  const [animatedSelectedPlanDelta, setAnimatedSelectedPlanDelta] = useState(0);
  const [animatedPlanTotalDelta, setAnimatedPlanTotalDelta] = useState(0);

  const planStatTweenFrameRef = useRef<number | null>(null);
  const planStatSnapshotRef = useRef<{
    selectedDelta: number;
    selectedValue: number;
    totalDelta: number;
  } | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.12, rootMargin: "0px 0px -28% 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const dashboardSection = dashboardSectionRef.current;
    if (!dashboardSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => setDashboardVisible(entry.isIntersecting),
      { threshold: 0.28, rootMargin: "0px 0px -24% 0px" },
    );

    observer.observe(dashboardSection);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const planSection = planSectionRef.current;
    if (!planSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => setPlanVisible(entry.isIntersecting),
      { threshold: 0.22, rootMargin: "0px 0px -18% 0px" },
    );

    observer.observe(planSection);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = trendMetricMenuRef.current;
      if (!menu) return;
      if (menu.contains(event.target as Node)) return;
      setAnalysisMetricOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!dashboardVisible) return;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;
    let animateTimer: ReturnType<typeof setTimeout> | null = null;

    const startTimer = setTimeout(() => {
      setTrendResetting(true);
      setTrendAnimating(false);
      resetTimer = setTimeout(() => setTrendResetting(false), 90);
      animateTimer = setTimeout(() => setTrendAnimating(true), 220);
    }, 0);

    return () => {
      clearTimeout(startTimer);
      if (resetTimer) clearTimeout(resetTimer);
      if (animateTimer) clearTimeout(animateTimer);
    };
  }, [dashboardVisible, analysisMetric]);

  useEffect(() => {
    if (!dashboardVisible) return;
    const startTimer = setTimeout(() => setAnalysisUpdating(true), 0);
    const timeoutId = setTimeout(() => setAnalysisUpdating(false), 260);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(timeoutId);
    };
  }, [analysisMetric, dashboardVisible]);

  useEffect(() => {
    if (!planVisible) return;
    const startTimer = setTimeout(() => setPlanUpdating(true), 0);
    const timeoutId = setTimeout(() => setPlanUpdating(false), 260);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(timeoutId);
    };
  }, [planMonthIndex, planVisible]);

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
    if (!visible) return;

    let cancelled = false;
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    const intervals: Array<ReturnType<typeof setInterval>> = [];

    const queueTimeout = (fn: () => void, delay: number) => {
      const timeoutId = setTimeout(() => {
        if (!cancelled) fn();
      }, delay);
      timers.push(timeoutId);
    };

    const runCycle = (index: number) => {
      if (cancelled) return;
      const example = EXAMPLES[index];
      const typingTick = 34;
      const typingDuration = example.question.length * typingTick;
      setExampleIndex(index);
      setStage("typing");
      setTypedLength(0);

      const typingInterval = setInterval(() => {
        setTypedLength((previous) => {
          if (previous >= example.question.length) {
            clearInterval(typingInterval);
            return previous;
          }
          return previous + 1;
        });
      }, typingTick);
      intervals.push(typingInterval);

      queueTimeout(() => {
        clearInterval(typingInterval);
        setTypedLength(example.question.length);
        setStage("sending");
      }, typingDuration + 220);
      queueTimeout(() => setStage("loading"), typingDuration + 900);
      queueTimeout(() => setStage("answer"), typingDuration + 2050);
      queueTimeout(() => setStage("chart"), typingDuration + 2850);
      queueTimeout(() => runCycle((index + 1) % EXAMPLES.length), typingDuration + 6900);
    };

    runCycle(0);
    return () => {
      cancelled = true;
      timers.forEach((timer) => clearTimeout(timer));
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [visible]);

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
    ANALYSIS_METRICS.find((metric) => metric.id === analysisMetric) ?? ANALYSIS_METRICS[0];
  const analysisSeries = activeMetric.seriesK;

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

  const trendSeries: Array<[number, number]> = analysisSeries.map((value, index) => [
    index * TREND_X_STEP,
    mapTrendY(value),
  ]);

  const planForecastBaseValues = PLAN_FORECAST_BASE_K.map((base, index) => {
    const seasonal = 1 + Math.sin((((index - 1) / 12) * Math.PI * 2)) * 0.018;
    return base * seasonal;
  });

  const planActualValues = planForecastBaseValues.map((base, index) => {
    if (index > PLAN_ACTUAL_CUTOFF_INDEX) return base;
    return base * (1 + PLAN_ACTUAL_VARIANCE[index]);
  });

  const trailingThreeActuals = planActualValues
    .slice(Math.max(PLAN_ACTUAL_CUTOFF_INDEX - 2, 0), PLAN_ACTUAL_CUTOFF_INDEX + 1);
  const trailingAvg =
    trailingThreeActuals.reduce((sum, value) => sum + value, 0) /
    Math.max(trailingThreeActuals.length, 1);

  const planForecastValues = planForecastBaseValues.map((base, index) => {
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
  });

  const planForecastMin = Math.min(...planForecastBaseValues, ...planForecastValues);
  const planForecastMax = Math.max(...planForecastBaseValues, ...planForecastValues);
  const planForecastPadding = Math.max((planForecastMax - planForecastMin) * 0.18, 24);

  const mapPlanY = (valueK: number) => {
    const min = planForecastMin - planForecastPadding;
    const max = planForecastMax + planForecastPadding;
    const top = 18;
    const bottom = 170;
    const ratio = clamp((max - valueK) / (max - min), 0, 1);
    return top + (bottom - top) * ratio;
  };

  const planForecastSeries: Array<[number, number]> = planForecastValues.map((value, index) => [
    index * PLAN_X_STEP,
    mapPlanY(value),
  ]);

  const planForecastLinePath = buildSmoothPath(planForecastSeries);
  const planForecastAreaPath = `${planForecastLinePath} L682 190 L0 190 Z`;

  const selectedPlanValue = planForecastValues[planMonthIndex];
  const previousPlanValue = planForecastValues[Math.max(planMonthIndex - 1, 0)];
  const selectedPlanDelta =
    ((selectedPlanValue - previousPlanValue) / Math.max(previousPlanValue, 1)) * 100;

  const planTotalValue = planForecastValues.reduce((sum, value) => sum + value, 0);
  const planBaseTotalValue = planForecastBaseValues.reduce((sum, value) => sum + value, 0);
  const planTotalDelta =
    ((planTotalValue - planBaseTotalValue) / Math.max(planBaseTotalValue, 1)) * 100;

  const planActualCutoffX = PLAN_ACTUAL_CUTOFF_INDEX * PLAN_X_STEP;
  const selectedPlanMode =
    planMonthIndex <= PLAN_ACTUAL_CUTOFF_INDEX
      ? HOME_PAGE_TEXT.aicopilot.planning.actualPrefix
      : HOME_PAGE_TEXT.aicopilot.planning.forecastPrefix;

  const trendLinePath = buildSmoothPath(trendSeries);
  const trendAreaPath = `${trendLinePath} L760 290 L0 290 Z`;

  const latestMonthIndex = 11;
  const previousMonthIndex = 10;
  const priorMonthIndex = 9;
  const selectedMetricAmount = analysisSeries[latestMonthIndex] * 1000;
  const selectedMetricPreviousAmount = analysisSeries[previousMonthIndex] * 1000;
  const selectedMetricDelta =
    ((analysisSeries[latestMonthIndex] - analysisSeries[previousMonthIndex]) /
      Math.max(Math.abs(analysisSeries[previousMonthIndex]), 1)) *
    100;
  const selectedMetricPreviousDelta =
    ((analysisSeries[previousMonthIndex] - analysisSeries[priorMonthIndex]) /
      Math.max(Math.abs(analysisSeries[priorMonthIndex]), 1)) *
    100;

  const analysisCompareLabel = HOME_PAGE_TEXT.aicopilot.dashboard.compareLabel;
  const formatSek = (value: number) => new Intl.NumberFormat("sv-SE").format(Math.round(value));
  const formatPercent = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

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

    const duration = 280;
    const start = performance.now();

    const tick = (now: number) => {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = 1 - (1 - t) ** 3;
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

  const currentExample = EXAMPLES[exampleIndex];
  const typedQuestion = currentExample.question.slice(0, typedLength);
  const isTyping = stage === "typing";
  const isSending = stage === "sending";
  const isLoading = stage === "loading";
  const showAnswerText = stage === "answer" || stage === "chart";
  const showChart = stage === "chart";
  const showQuestionBubble = stage !== "idle" && stage !== "typing";

  return (
    <section
      ref={sectionRef}
      id="produkt"
      className={`${styles.section} ${visible ? styles.visible : ""}`}
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
      />

      <CopilotChatSection
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
        analysisMetrics={ANALYSIS_METRICS}
        selectedMetricAmount={selectedMetricAmount}
        selectedMetricPreviousAmount={selectedMetricPreviousAmount}
        selectedMetricDelta={selectedMetricDelta}
        selectedMetricPreviousDelta={selectedMetricPreviousDelta}
        analysisCompareLabel={analysisCompareLabel}
        onToggleMetricMenu={() => setAnalysisMetricOpen((previous) => !previous)}
        onSelectMetric={(metric) => {
          setAnalysisMetric(metric);
          setAnalysisMetricOpen(false);
        }}
        formatSek={formatSek}
        formatPercent={formatPercent}
        monthLabels={MONTH_LABELS}
        trendAxisTicks={TREND_AXIS_TICKS}
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
        planActualCutoffX={planActualCutoffX}
        formatSek={formatSek}
        formatPercent={formatPercent}
        onSelectPlanMonth={setPlanMonthIndex}
        monthLabelsEn={MONTH_LABELS_EN}
      />
    </section>
  );
}
