"use client";

import { Check, SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./AICopilot.module.scss";

type CopilotStage = "idle" | "typing" | "sending" | "loading" | "answer" | "chart";
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

const EXAMPLES: CopilotExample[] = [
  {
    question: "Hur ser vår runway ut baserat på Q3?",
    answer:
      "Med nuvarande burn-rate har ni cirka 11.4 månader runway. Största påverkan är SaaS-kostnader och rekrytering i november.",
    chartTitle: "Runway forecast",
    chartUnit: "Månader",
    yTicks: ["12", "10", "8", "6"],
    bars: [
      { label: "Nu", value: "11.4", height: "92%" },
      { label: "Okt", value: "10.2", height: "82%" },
      { label: "Nov", value: "8.9", height: "71%" },
      { label: "Dec", value: "7.4", height: "59%" },
      { label: "Jan", value: "6.0", height: "48%" },
    ],
  },
  {
    question: "Hur stor del av kostnaderna är fasta vs rörliga?",
    answer:
      "Kostnadsbasen är ungefär 62% fasta kostnader och 38% rörliga. De rörliga kostnaderna drivs främst av marknadsföring och transaktionsavgifter.",
    chartTitle: "Kostnadsfördelning",
    chartUnit: "Andel %",
    yTicks: ["80", "60", "40", "20"],
    bars: [
      { label: "Fasta", value: "62%", height: "78%" },
      { label: "Rörliga", value: "38%", height: "48%" },
    ],
  },
];

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
  const sectionRef = useRef<HTMLElement | null>(null);
  const dashboardSectionRef = useRef<HTMLDivElement | null>(null);
  const planSectionRef = useRef<HTMLDivElement | null>(null);
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
    if (!dashboardVisible) return;

    let cancelled = false;
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    const queue = (fn: () => void, delay: number) => {
      const timeoutId = setTimeout(() => {
        if (!cancelled) fn();
      }, delay);
      timers.push(timeoutId);
    };

    const runCycle = () => {
      if (cancelled) return;
      setTrendResetting(true);
      setTrendAnimating(false);
      queue(() => setTrendResetting(false), 90);
      queue(() => setTrendAnimating(true), 220);
      queue(runCycle, 7600);
    };

    runCycle();
    return () => {
      cancelled = true;
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [dashboardVisible]);

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
      setStage("idle");
      setTypedLength(0);
      return;
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
  const planForecastSeries: Array<[number, number]> = [
    [0, 138],
    [62, 130],
    [124, 134],
    [186, 118],
    [248, 124],
    [310, 110],
    [372, 114],
    [434, 106],
    [496, 120],
    [558, 102],
    [620, 104],
    [682, 96],
  ];
  const planForecastLinePath = planForecastSeries
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`)
    .join(" ");
  const planForecastAreaPath = `${planForecastLinePath} L682 190 L0 190 Z`;
  const trendSeries: Array<[number, number]> = [
    [0, 230],
    [68, 152],
    [136, 188],
    [220, 170],
    [304, 144],
    [372, 132],
    [440, 128],
    [508, 98],
    [576, 130],
    [644, 210],
    [712, 84],
    [760, 62],
  ];
  const trendLinePath = trendSeries
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`)
    .join(" ");
  const trendAreaPath = `${trendLinePath} L760 290 L0 290 Z`;
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

      <div className={styles.container}>
        <div className={`${styles.left} ${styles.aiLeft}`}>
          <span className={styles.pill}>Vad plattformen gör</span>
          <h2 className={styles.title}>AI-copilot som analyserar och agerar</h2>
          <p className={styles.text}>
            Ställ frågor om resultat, kostnader och runway. Få svar, grafer och
            rapporter direkt. AI kan även förbereda åtgärder i era
            ekonomiflöden med full spårbarhet.
          </p>

          <ul className={styles.list}>
            <li>
              <Check aria-hidden="true" size={14} />
              Chatta med din data - direkta svar
            </li>
            <li>
              <Check aria-hidden="true" size={14} />
              Proaktiva insights och avvikelser
            </li>
            <li>
              <Check aria-hidden="true" size={14} />
              AI-stödda åtgärder med audit log
            </li>
          </ul>
        </div>

        <div className={`${styles.right} ${styles.aiRight}`}>
          <div className={styles.glow} />

          <article className={styles.panel} aria-label="AI Copilot">
            <MiniMincfoBrand />

            <header className={styles.header}>
              <span className={styles.dot} />
              <p>AI Copilot</p>
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
                    aria-label="AI analyserar data"
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
                {isSending && "Skickar fråga..."}
                {isLoading && "AI analyserar data..."}
                {(stage === "idle" || stage === "answer" || stage === "chart") &&
                  "Fråga AI om ekonomi, forecast eller nästa åtgärd"}
              </span>
              <button
                type="button"
                aria-label="Skicka fråga"
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
            <article className={styles.dashboardPanel} aria-label="Dashboard Preview">
              <MiniMincfoBrand />

              <div className={styles.statGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statLabelRow}>
                    <span>Revenue</span>
                  </div>
                  <div className={styles.statAmount}>
                    <strong>4 961 883</strong>
                    <span>SEK</span>
                  </div>
                  <div className={styles.statDelta}>+13.0%</div>
                  <p className={styles.statMeta}>Compared to previous period</p>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statLabelRow}>
                    <span>Net Income</span>
                  </div>
                  <div className={styles.statAmount}>
                    <strong>971 613</strong>
                    <span>SEK</span>
                  </div>
                  <div className={styles.statDelta}>+78.0%</div>
                  <p className={styles.statMeta}>Compared to previous period</p>
                </div>
              </div>

              <div className={styles.trendPanel}>
                <header className={styles.trendHeader}>
                  <p>Income Statement</p>
                  <div className={styles.trendLegend}>
                    <span className={styles.trendDot} />
                    Net Income
                  </div>
                </header>

                <div className={styles.trendChartWrap}>
                  <div className={styles.trendAxisY} aria-hidden="true">
                    <span>450K</span>
                    <span>300K</span>
                    <span>150K</span>
                    <span>0</span>
                    <span>-150K</span>
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
                      <span>Jan</span>
                      <span>Feb</span>
                      <span>Mar</span>
                      <span>Apr</span>
                      <span>Maj</span>
                      <span>Jun</span>
                      <span>Jul</span>
                      <span>Aug</span>
                      <span>Sep</span>
                      <span>Okt</span>
                      <span>Nov</span>
                      <span>Dec</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className={`${styles.left} ${styles.dashboardLeft}`}>
            <span className={styles.pill}>Dashboard</span>
            <h2 className={styles.title}>Analys &amp; översikt</h2>
            <p className={styles.text}>
              Tillgång till dashboard med de senaste finansiella nyckeltalen för
              att ta informerade beslut. Få tydliga insikter för att identifiera
              flaskhalsar och säkerställa bättre likviditet.
            </p>

            <ul className={styles.list}>
              <li>
                <Check aria-hidden="true" size={14} />
                Realtidsrapportering av nyckeltal
              </li>
              <li>
                <Check aria-hidden="true" size={14} />
                Kassaflödesoptimering i realtid
              </li>
              <li>
                <Check aria-hidden="true" size={14} />
                Identifiera lönsamma segment
              </li>
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
            <span className={styles.pill}>Planering &amp; Jämförelse</span>
            <h2 className={styles.title}>Budgetering, prognoser och benchmarking</h2>
            <p className={styles.text}>
              Datadrivna prognoser och strukturerade dimensioner hjälper dig
              att planera framåt, minska ekonomiska risker och prioritera rätt
              initiativ både på kort och lång sikt.
            </p>

            <ul className={styles.list}>
              <li>
                <Check aria-hidden="true" size={14} />
                Automatiserade budgetprocesser
              </li>
              <li>
                <Check aria-hidden="true" size={14} />
                Strukturera intäkter och kostnader med egna dimensioner
              </li>
              <li>
                <Check aria-hidden="true" size={14} />
                Scenariohantering för framtiden
              </li>
              <li>
                <Check aria-hidden="true" size={14} />
                Datadriven riskminimering
              </li>
              <li>
                <Check aria-hidden="true" size={14} />
                Jämför mellan dimensioner och perioder
              </li>
              <li>
                <Check aria-hidden="true" size={14} />
                Identifiera avvikelser mellan segment
              </li>
            </ul>
          </div>

          <div className={`${styles.right} ${styles.planRight}`}>
            <article className={styles.planPanel} aria-label="Planering och benchmarking">
              <div className={styles.planPanelBody}>
              <div className={styles.planVisualStack}>
                <div className={styles.planForecastShell}>
                  <MiniMincfoBrand />

                  <header className={styles.planPanelHeader}>
                    <p>Forecast</p>
                    <span className={styles.liveScenario}>
                      <span className={styles.liveDot} aria-hidden="true" />
                      Live scenario
                    </span>
                  </header>
                    <div className={styles.planRecon}>
                      <div className={styles.planReconHead}>
                        <p>Reconciliation</p>
                        <span>2025</span>
                      </div>
                      <div className={styles.planMonthGrid}>
                        <button type="button" className={`${styles.planMonth} ${styles.planMonthSelected}`}>Jan</button>
                        <button type="button" className={styles.planMonth}>Feb</button>
                        <button type="button" className={styles.planMonth}>Mar</button>
                        <button type="button" className={styles.planMonth}>Apr</button>
                        <button type="button" className={styles.planMonth}>May</button>
                        <button type="button" className={styles.planMonth}>Jun</button>
                        <button type="button" className={styles.planMonth}>Jul</button>
                        <button type="button" className={styles.planMonth}>Aug</button>
                        <button type="button" className={styles.planMonth}>Sep</button>
                        <button type="button" className={styles.planMonth}>Oct</button>
                        <button type="button" className={styles.planMonth}>Nov</button>
                        <button type="button" className={`${styles.planMonth} ${styles.planMonthCurrent}`}>Dec</button>
                      </div>
                      <div className={styles.planForecastChart}>
                        <svg viewBox="0 0 682 190" preserveAspectRatio="none" aria-hidden="true">
                          <path className={styles.planForecastArea} d={planForecastAreaPath} />
                          <path className={styles.planForecastLine} d={planForecastLinePath} />
                          <line className={styles.planForecastBreak} x1="682" y1="18" x2="682" y2="184" />
                        </svg>
                        <div className={styles.planMonthAxis} aria-hidden="true">
                          <span>Jan</span>
                          <span>Feb</span>
                          <span>Mar</span>
                          <span>Apr</span>
                          <span>May</span>
                          <span>Jun</span>
                          <span>Jul</span>
                          <span>Aug</span>
                          <span>Sep</span>
                          <span>Oct</span>
                          <span>Nov</span>
                          <span>Dec</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.planDimensions}>
                    <div className={styles.planDimensionsHead}>
                      <p>Dimensions</p>
                      <button type="button">+ New Dimension</button>
                    </div>
                    <div className={styles.planDimensionRows}>
                      <div className={styles.planDimensionRow}>
                        <p>Recurring - Revenue</p>
                        <span>200 000 kr</span>
                      </div>
                      <div className={styles.planDimensionRow}>
                        <p>Partner Sales</p>
                        <span>144 000 kr</span>
                      </div>
                      <div className={styles.planDimensionRow}>
                        <p>Consulting - Strategic</p>
                        <span>150 000 kr</span>
                      </div>
                      <div className={styles.planDimensionRow}>
                        <p>Project Delivery</p>
                        <span>160 000 kr</span>
                      </div>
                      <div className={styles.planDimensionRow}>
                        <p>Benchmark target</p>
                        <span className={styles.planDimensionPositive}>+12.4%</span>
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
