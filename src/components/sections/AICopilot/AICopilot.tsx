"use client";

import { Check, ChevronDown, SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { homeContent } from "@/content/homeContent";
import styles from "./AICopilot.module.scss";

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

const TREND_X_STEP = 760 / 11;
const PLAN_X_STEP = 682 / 11;
const ANALYSIS_NET_K = [14, 162, 101, 131, 176, 197, 204, 283, 207, 38, 307, 352];
const ANALYSIS_EBIT_K = [122, 148, 139, 161, 178, 194, 207, 226, 212, 166, 242, 263];
const ANALYSIS_EBITDA_K = [168, 194, 183, 207, 229, 246, 259, 281, 268, 224, 301, 323];
const ANALYSIS_GROSS_PROFIT_K = [258, 279, 271, 292, 307, 322, 337, 356, 344, 301, 372, 394];
const TREND_AXIS_MIN_K = 0;
const TREND_AXIS_MAX_K = 500;
const PLAN_FORECAST_BASE_K = [280, 298, 312, 326, 340, 352, 364, 379, 394, 409, 425, 442];
const PLAN_ACTUAL_VARIANCE = [0.052, 0.034, -0.012, -0.026, 0.018, 0.029] as const;
const PLAN_ACTUAL_CUTOFF_INDEX = 5; // Jun

const PLAN_DIMENSION_BASE = [
  { amount: 200000 },
  { amount: 144000 },
  { amount: 150000 },
  { amount: 160000 },
] as const;

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

function MiniMincfoBrand() {
  return (
    <span className={styles.visualBrand} aria-hidden="true">
      <svg className={styles.visualMark} viewBox="0 0 50 50" role="img">
        <g fill="currentColor">
          <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
          <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
          <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
          <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
        </g>
      </svg>
      <span className={styles.visualWordmark}>MinCFO</span>
    </span>
  );
}

export default function AICopilot() {
  const content = homeContent.aiCopilot;
  const examples = content.examples as CopilotExample[];
  const monthLabels = content.monthLabelsSv;
  const monthLabelsEn = content.monthLabelsEn;
  const trendAxisTicks = content.trendAxisTicks;
  const analysisMetrics: Array<{ id: AnalysisMetric; label: string; seriesK: number[] }> = [
    { id: "netIncome", label: content.analysisMetrics.netIncome, seriesK: ANALYSIS_NET_K },
    { id: "ebit", label: content.analysisMetrics.ebit, seriesK: ANALYSIS_EBIT_K },
    { id: "ebitda", label: content.analysisMetrics.ebitda, seriesK: ANALYSIS_EBITDA_K },
    { id: "grossProfit", label: content.analysisMetrics.grossProfit, seriesK: ANALYSIS_GROSS_PROFIT_K },
  ];
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

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible((previous) => previous || entry.isIntersecting);
      },
      { threshold: 0.12, rootMargin: "0px 0px -28% 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const dashboardSection = dashboardSectionRef.current;
    if (!dashboardSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setDashboardVisible((previous) => previous || entry.isIntersecting);
      },
      { threshold: 0.28, rootMargin: "0px 0px -24% 0px" },
    );

    observer.observe(dashboardSection);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const planSection = planSectionRef.current;
    if (!planSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setPlanVisible((previous) => previous || entry.isIntersecting);
      },
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
        // Keep the divider fully straight until the dashboard section actually
        // approaches the viewport. This prevents the "always bent" feel when
        // scrolling back up.
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
    if (!visible) {
      const resetTimer = setTimeout(() => {
        setStage("idle");
        setTypedLength(0);
      }, 0);
      return () => clearTimeout(resetTimer);
    }

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
      const example = examples[index];
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
      queueTimeout(() => runCycle((index + 1) % examples.length), typingDuration + 6900);
    };

    runCycle(0);
    return () => {
      cancelled = true;
      timers.forEach((timer) => clearTimeout(timer));
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [examples, visible]);

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
    const y = cubic(
      dashboardSideY,
      dashboardSideY,
      dashboardCenterY,
      dashboardCenterY,
      t,
    );
    dashboardCurvePoints.push(`${(x / 1440) * 100}% ${y}px`);
  }
  for (let i = 1; i <= 18; i += 1) {
    const t = i / 18;
    const x = cubic(720, 960, 1160, 1440, t);
    const y = cubic(
      dashboardCenterY,
      dashboardCenterY,
      dashboardSideY,
      dashboardSideY,
      t,
    );
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
    analysisMetrics.find((metric) => metric.id === analysisMetric) ??
    analysisMetrics[0];
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
    const projected =
      base * (1 + shapedVariance + momentum) * driverAdjustment;
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
  const selectedPlanDelta = ((selectedPlanValue - previousPlanValue) / Math.max(previousPlanValue, 1)) * 100;
  const planTotalValue = planForecastValues.reduce((sum, value) => sum + value, 0);
  const planBaseTotalValue = planForecastBaseValues.reduce((sum, value) => sum + value, 0);
  const planTotalDelta = ((planTotalValue - planBaseTotalValue) / Math.max(planBaseTotalValue, 1)) * 100;
  const planActualCutoffX = PLAN_ACTUAL_CUTOFF_INDEX * PLAN_X_STEP;
  const selectedPlanMode =
    planMonthIndex <= PLAN_ACTUAL_CUTOFF_INDEX
      ? content.plan.actualMonthPrefix
      : content.plan.forecastMonthPrefix;
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
  const analysisCompareLabel = content.analysisCompareLabel;
  const formatSek = (value: number) => new Intl.NumberFormat("sv-SE").format(Math.round(value));
  const formatPercent = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  const benchmarkTarget = 12.4 + planTotalDelta * 0.52;
  const dimensionMonthModifier = 1 + (planMonthIndex / 11 - 0.5) * 0.08;
  const selectedMonthPlanGap = selectedPlanValue / Math.max(planForecastBaseValues[planMonthIndex], 1) - 1;
  const planDimensionRows = PLAN_DIMENSION_BASE.map((row, index) => {
    const rowBias = 1 + (index - 1.5) * 0.02;
    const amount = row.amount * (1 + selectedMonthPlanGap * 0.9) * dimensionMonthModifier * rowBias;
    return { name: content.plan.dimensionRows[index] ?? "", amount };
  });
  const currentExample = examples[exampleIndex];
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

      <div className={styles.container}>
        <div className={`${styles.left} ${styles.aiLeft}`}>
          <span className={styles.pill}>{content.left.pill}</span>
          <h2 className={styles.title}>{content.left.title}</h2>
          <p className={styles.text}>{content.left.text}</p>

          <ul className={styles.list}>
            {content.left.list.map((item) => (
              <li key={item}>
                <Check aria-hidden="true" size={14} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={`${styles.right} ${styles.aiRight}`}>
          <div className={styles.glow} />

          <article className={styles.panel} aria-label={content.chatPanel.title}>
            <MiniMincfoBrand />

            <header className={styles.header}>
              <span className={styles.dot} />
              <p>{content.chatPanel.title}</p>
            </header>

            <div className={styles.body}>
              <div
                className={`${styles.question} ${showQuestionBubble ? styles.questionVisible : styles.questionHidden} ${isSending ? styles.questionSent : ""}`}
              >
                {showQuestionBubble ? currentExample.question : <span className={styles.ghostText}> </span>}
              </div>

              <div className={styles.answer} aria-live="polite">
                {isLoading && (
                  <div
                    className={styles.loadingAnswer}
                    role="status"
                    aria-label={content.chatPanel.loadingAriaLabel}
                  >
                    <span />
                    <span />
                    <span />
                  </div>
                )}
                {showAnswerText && (
                  <p>{currentExample.answer}</p>
                )}
                <div
                  className={`${styles.chart} ${showChart ? styles.chartVisible : ""}`}
                  aria-hidden={!showChart}
                >
                  <div className={styles.chartHead}>
                    <span>{currentExample.chartTitle}</span>
                    <span>{currentExample.chartUnit}</span>
                  </div>
                  <div className={styles.chartPlot}>
                    <div className={styles.chartYAxis} aria-hidden="true">
                      {currentExample.yTicks.map((tick) => (
                        <span key={tick}>{tick}</span>
                      ))}
                    </div>
                    <div
                      className={styles.chartBars}
                      style={{ "--bar-count": currentExample.bars.length } as CSSProperties}
                    >
                      {currentExample.bars.map((bar, index) => (
                        <div
                          key={bar.label}
                          className={styles.chartBar}
                          style={
                            {
                              "--bar-height": bar.height,
                              "--bar-delay": `${index * 110}ms`,
                            } as CSSProperties
                          }
                        >
                          <span className={styles.barValue}>{bar.value}</span>
                          <span className={styles.barFill} />
                          <span className={styles.barLabel}>{bar.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <footer className={styles.inputRow}>
              <span className={styles.inputText}>
                {isTyping && (
                  <>
                    {typedQuestion}
                    <span className={styles.caret} aria-hidden="true" />
                  </>
                )}
                {isSending && content.chatPanel.sendingQuestion}
                {isLoading && content.chatPanel.loadingText}
                {(stage === "idle" || stage === "answer" || stage === "chart") &&
                  content.chatPanel.inputPlaceholder}
              </span>
              <button
                type="button"
                aria-label={content.chatPanel.sendQuestionAriaLabel}
                className={`${isSending ? styles.sending : ""} ${isLoading ? styles.loading : ""}`}
              >
                <SendHorizontal aria-hidden="true" size={14} />
              </button>
            </footer>
          </article>
        </div>
      </div>

      <div className={styles.dashboardSection} ref={dashboardSectionRef}>
        <svg
          className={styles.dashboardCut}
          viewBox={`0 0 1440 ${waveHeight}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={dashboardCurvePath} />
        </svg>

        <div
          className={styles.dashboardBackground}
          aria-hidden="true"
          style={
            {
              clipPath: dashboardCurveClip,
              WebkitClipPath: dashboardCurveClip,
            } as CSSProperties
          }
        />

        <div
          className={`${styles.container} ${styles.dashboardContainer} ${dashboardVisible ? styles.dashboardVisible : ""}`}
        >
          <div className={`${styles.right} ${styles.dashboardRight}`}>
            <article className={styles.dashboardPanel} aria-label={content.dashboard.panelAriaLabel}>
              <MiniMincfoBrand />

              <div className={styles.statGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statLabelRow}>
                    <span>{activeMetric.label} ({content.dashboard.currentLabelSuffix})</span>
                  </div>
                  <div className={styles.statAmount}>
                    <strong>{formatSek(selectedMetricAmount)}</strong>
                    <span>{content.dashboard.currencyLabel}</span>
                  </div>
                  <div className={`${styles.statDelta} ${selectedMetricDelta < 0 ? styles.down : ""}`}>
                    {formatPercent(selectedMetricDelta)}
                  </div>
                  <p className={styles.statMeta}>{analysisCompareLabel}</p>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statLabelRow}>
                    <span>{activeMetric.label} ({content.dashboard.previousLabelSuffix})</span>
                  </div>
                  <div className={styles.statAmount}>
                    <strong>{formatSek(selectedMetricPreviousAmount)}</strong>
                    <span>{content.dashboard.currencyLabel}</span>
                  </div>
                  <div className={`${styles.statDelta} ${selectedMetricPreviousDelta < 0 ? styles.down : ""}`}>
                    {formatPercent(selectedMetricPreviousDelta)}
                  </div>
                  <p className={styles.statMeta}>{analysisCompareLabel}</p>
                </div>
              </div>

              <div className={`${styles.trendPanel} ${analysisUpdating ? styles.panelUpdating : ""}`}>
                <header className={styles.trendHeader}>
                  <p>{content.dashboard.incomeStatementLabel}</p>
                  <div className={styles.trendHeaderRight} ref={trendMetricMenuRef}>
                    <button
                      type="button"
                      className={styles.metricTrigger}
                      aria-haspopup="menu"
                      aria-expanded={analysisMetricOpen}
                      onClick={() => setAnalysisMetricOpen((previous) => !previous)}
                    >
                      {activeMetric.label}
                      <ChevronDown
                        aria-hidden="true"
                        size={14}
                        className={`${styles.metricTriggerIcon} ${analysisMetricOpen ? styles.metricTriggerIconOpen : ""}`}
                      />
                    </button>
                    {analysisMetricOpen && (
                      <div className={styles.metricMenu} role="menu" aria-label={content.dashboard.metricMenuAriaLabel}>
                        {analysisMetrics.map((metric) => (
                          <button
                            key={metric.id}
                            type="button"
                            role="menuitemradio"
                            aria-checked={analysisMetric === metric.id}
                            className={`${styles.metricOption} ${analysisMetric === metric.id ? styles.metricOptionActive : ""}`}
                            onClick={() => {
                              setAnalysisMetric(metric.id);
                              setAnalysisMetricOpen(false);
                            }}
                          >
                            {metric.label}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className={styles.trendLegend}>
                      <span className={styles.trendDot} />
                      {activeMetric.label}
                    </div>
                  </div>
                </header>

                <div className={styles.trendChartWrap}>
                  <div className={styles.trendAxisY} aria-hidden="true">
                    {trendAxisTicks.map((tick) => (
                      <span key={tick}>{tick}</span>
                    ))}
                  </div>

                  <div className={styles.trendSvgWrap}>
                    <svg
                      className={`${styles.trendSvg} ${trendAnimating ? styles.trendVisible : ""} ${trendResetting ? styles.trendReset : ""}`}
                      viewBox="0 0 760 290"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path
                        className={styles.trendArea}
                        d={trendAreaPath}
                      />
                      <path
                        className={styles.trendLine}
                        d={trendLinePath}
                      />
                      <g className={styles.trendPoints}>
                        {trendSeries.map(([x, y], index) => (
                          <circle
                            key={`${x}-${y}`}
                            cx={x}
                            cy={y}
                            r="4"
                            style={{ "--point-delay": `${index * 170 + 180}ms` } as CSSProperties}
                          />
                        ))}
                      </g>
                    </svg>

                    <div className={styles.trendMonths} aria-hidden="true">
                      {monthLabels.map((month) => (
                        <span key={month}>{month}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className={`${styles.left} ${styles.dashboardLeft}`}>
            <span className={styles.pill}>{content.dashboard.pill}</span>
            <h2 className={styles.title}>{content.dashboard.title}</h2>
            <p className={styles.text}>{content.dashboard.text}</p>

            <ul className={styles.list}>
              {content.dashboard.list.map((item) => (
                <li key={item}>
                  <Check aria-hidden="true" size={14} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.planSection} ref={planSectionRef}>
        <svg
          className={styles.planCut}
          viewBox={`0 0 1440 ${waveHeight}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={planCurvePath} />
        </svg>

        <div
          className={styles.planBackground}
          aria-hidden="true"
          style={
            {
              clipPath: planCurveClip,
              WebkitClipPath: planCurveClip,
            } as CSSProperties
          }
        />

        <div
          className={`${styles.container} ${styles.planContainer} ${planVisible ? styles.planVisible : ""}`}
        >
          <div className={`${styles.left} ${styles.planLeft}`}>
            <span className={styles.pill}>{content.plan.pill}</span>
            <h2 className={styles.title}>{content.plan.title}</h2>
            <p className={styles.text}>{content.plan.text}</p>

            <ul className={styles.list}>
              {content.plan.list.map((item) => (
                <li key={item}>
                  <Check aria-hidden="true" size={14} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles.right} ${styles.planRight}`}>
            <article className={styles.planPanel} aria-label={content.plan.panelAriaLabel}>
              <div className={styles.planPanelBody}>
              <div className={styles.planVisualStack}>
                <div className={styles.planForecastShell}>
                  <MiniMincfoBrand />

                  <header className={styles.planPanelHeader}>
                    <p>{content.plan.forecastTitle}</p>
                    <span className={styles.liveScenario}>
                      <span className={styles.liveDot} aria-hidden="true" />
                      {content.plan.liveForecast}
                    </span>
                  </header>
                    <div className={styles.planRecon}>
                      <div className={styles.planReconHead}>
                        <p>{content.plan.reconciliationTitle}</p>
                        <span>{content.plan.actualsThroughJun}</span>
                      </div>
                      <div className={styles.planForecastStats}>
                        <div className={styles.planForecastStat}>
                          <p>{selectedPlanMode} ({monthLabelsEn[planMonthIndex]})</p>
                          <strong>{formatSek(selectedPlanValue * 1000)} {content.plan.currencySuffix}</strong>
                        </div>
                        <div className={styles.planForecastStat}>
                          <p>{content.plan.vsPreviousMonth}</p>
                          <strong className={selectedPlanDelta < 0 ? styles.planStatDown : styles.planStatUp}>
                            {formatPercent(selectedPlanDelta)}
                          </strong>
                        </div>
                        <div className={styles.planForecastStat}>
                          <p>{content.plan.annualVarianceVsBaseline}</p>
                          <strong className={planTotalDelta < 0 ? styles.planStatDown : styles.planStatUp}>
                            {formatPercent(planTotalDelta)}
                          </strong>
                        </div>
                      </div>
                      <div className={styles.planMonthGrid}>
                        {monthLabelsEn.map((month, index) => (
                          <button
                            key={month}
                            type="button"
                            className={`${styles.planMonth} ${planMonthIndex === index ? styles.planMonthSelected : ""}`}
                            onClick={() => setPlanMonthIndex(index)}
                            aria-pressed={planMonthIndex === index}
                            aria-label={`${content.plan.showBudgetForPrefix} ${month}`}
                          >
                            {month}
                          </button>
                        ))}
                      </div>
                      <div className={`${styles.planForecastChart} ${planUpdating ? styles.panelUpdating : ""}`}>
                        <svg viewBox="0 0 682 190" preserveAspectRatio="none" aria-hidden="true">
                          <path className={styles.planForecastArea} d={planForecastAreaPath} />
                          <path className={styles.planForecastLine} d={planForecastLinePath} />
                          <line className={styles.planActualSplit} x1={planActualCutoffX} y1="16" x2={planActualCutoffX} y2="184" />
                        </svg>
                        <p className={styles.planForecastLegend} aria-hidden="true">
                          {content.plan.actualForecastLegend}
                        </p>
                        <div className={styles.planMonthAxis} aria-hidden="true">
                          {monthLabelsEn.map((month) => (
                            <span key={month}>{month}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.planDimensions}>
                    <div className={styles.planDimensionsHead}>
                      <p>{content.plan.dimensionsTitle}</p>
                      <button type="button">{content.plan.newDimensionButton}</button>
                    </div>
                    <div className={styles.planDimensionRows}>
                      {planDimensionRows.map((row) => (
                        <div key={row.name} className={styles.planDimensionRow}>
                          <p>{row.name}</p>
                          <span>{formatSek(row.amount)} {content.plan.currencySuffix}</span>
                        </div>
                      ))}
                      <div className={styles.planDimensionRow}>
                        <p>{content.plan.benchmarkTargetLabel}</p>
                        <span className={styles.planDimensionPositive}>{formatPercent(benchmarkTarget)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
