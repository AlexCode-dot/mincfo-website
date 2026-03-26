"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.scss";
import SectionTopCurve from "./SectionTopCurve";

type ScenarioStage = "typing" | "sending" | "loading" | "result";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"] as const;

const DEFAULT_SCENARIO = {
  activeMonth: "Aug",
  currentRunway: "13.8 mån",
  delta: "-1.4 månader",
  prompt:
    "Om vi ökar säljbudgeten med 18% från augusti och anställer två AE i september, hur påverkas runway och EBITDA till årsskiftet?",
  scenarioRunway: "12.4 mån",
  summary: [
    "Med nuvarande antaganden sjunker runway från 13.8 till 12.4 månader. EBITDA blir cirka 0.8 procentenheter svagare i Q4.",
    "Om rekryteringen flyttas sex veckor framåt ligger runway fortsatt över 13 månader samtidigt som tillväxtmålet till årsskiftet kan behållas.",
  ] as [string, string],
} as const;

const BASE_PATH =
  "M0 146 C52 142 100 132 148 126 C194 120 242 114 286 108 C332 102 378 94 430 84 C474 74 520 66 560 58";
const CHART_PATH_NEGATIVE_STRONG =
  "M0 146 C52 143 100 136 148 132 C194 130 242 134 286 142 C332 150 378 156 430 150 C474 142 520 120 560 96";
const CHART_PATH_NEGATIVE_MEDIUM =
  "M0 146 C52 142 100 134 148 129 C194 126 242 128 286 136 C332 144 378 149 430 144 C474 135 520 111 560 82";
const CHART_PATH_NEGATIVE_MILD =
  "M0 146 C52 141 100 132 148 125 C194 120 242 121 286 126 C332 132 378 136 430 132 C474 124 520 102 560 74";
const CHART_PATH_POSITIVE_MILD =
  "M0 146 C52 141 100 130 148 122 C194 114 242 104 286 96 C332 88 378 78 430 70 C474 62 520 54 560 48";
const CHART_PATH_POSITIVE_STRONG =
  "M0 146 C52 140 100 128 148 118 C194 106 242 94 286 82 C332 70 378 58 430 48 C474 40 520 34 560 28";

const parseScenarioImpact = (value: string): number | null => {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const match = normalized.match(/[+-]?\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number.parseFloat(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
};

const getScenarioChartPath = (value: string) => {
  const impact = parseScenarioImpact(value);
  if (impact === null) return CHART_PATH_NEGATIVE_MEDIUM;
  if (impact <= -1.5) return CHART_PATH_NEGATIVE_STRONG;
  if (impact < -0.75) return CHART_PATH_NEGATIVE_MEDIUM;
  if (impact < 0) return CHART_PATH_NEGATIVE_MILD;
  if (impact >= 1) return CHART_PATH_POSITIVE_STRONG;
  return CHART_PATH_POSITIVE_MILD;
};

type ScenarioOverrides = {
  heading?: string;
  description?: string;
  prompt?: string;
  visualPreset?: "compare" | "forecast" | "gauge" | "ring";
  scenarioVariants?: Array<{
    question: string;
    answer: [string, string];
    metricValues: [string, string];
    metricHints: [string, string];
    activeMonth: string;
    visualPreset?: "compare" | "forecast" | "gauge" | "ring";
  }>;
  summary?: [string, string];
  currentRunway?: string;
  scenarioRunway?: string;
  delta?: string;
  activeMonth?: string;
  primaryMetricLabel?: string;
  primaryMetricValue?: string;
  primaryMetricHint?: string;
  secondaryMetricLabel?: string;
  secondaryMetricValue?: string;
  secondaryMetricHint?: string;
  chartSubtitle?: string;
  ui?: {
    typingStatus: string;
    analyzingStatus: string;
    readyStatus: string;
    copilotLabel: string;
    copilotResponseLabel: string;
    metaLoadingLabel: string;
    metaReadyLabel: string;
    boardAriaLabel: string;
    boardTitle: string;
    boardBadge: string;
    chartComparisonLabel: string;
    legendBase: string;
    legendScenario: string;
    startLabel: string;
    waitingLabel: string;
    rerunAriaLabel: string;
    disclaimer: string;
  };
};

export default function ScenarioVisualization({
  heading = "Scenario visualization",
  description = "Ett konkret exempel på hur en CEO kan testa tillväxtbeslut och direkt se effekt på runway och EBITDA.",
  prompt = DEFAULT_SCENARIO.prompt,
  visualPreset = "compare",
  scenarioVariants,
  summary = DEFAULT_SCENARIO.summary,
  currentRunway = DEFAULT_SCENARIO.currentRunway,
  scenarioRunway = DEFAULT_SCENARIO.scenarioRunway,
  delta = DEFAULT_SCENARIO.delta,
  activeMonth = DEFAULT_SCENARIO.activeMonth,
  primaryMetricLabel = "Runway (Current)",
  primaryMetricValue = currentRunway,
  primaryMetricHint = "Nuvarande plan",
  secondaryMetricLabel = "Runway (Scenario)",
  secondaryMetricValue = scenarioRunway,
  secondaryMetricHint = delta,
  chartSubtitle = "Runway forecast",
  ui = {
    typingStatus: "Användare skriver fråga...",
    analyzingStatus: "AI analyserar data...",
    readyStatus: "Scenario klart. Fråga AI om budget, headcount eller nästa åtgärd",
    copilotLabel: "AI Copilot",
    copilotResponseLabel: "MinCFO Copilot",
    metaLoadingLabel: "Analyserar...",
    metaReadyLabel: "Generated in 1.2s",
    boardAriaLabel: "Scenario dashboard visual",
    boardTitle: "Forecast Impact",
    boardBadge: "Live Scenario",
    chartComparisonLabel: "Base vs Proposed",
    legendBase: "Base",
    legendScenario: "Proposed",
    startLabel: "Start",
    waitingLabel: "Väntar på scenario...",
    rerunAriaLabel: "Kör scenariot igen",
    disclaimer: "MinCFO can make mistakes. Verify important financial data.",
  },
}: ScenarioOverrides) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [runId, setRunId] = useState(0);
  const [stage, setStage] = useState<ScenarioStage>("typing");
  const [typedLength, setTypedLength] = useState(0);
  const [visible, setVisible] = useState(false);
  const scenarios = useMemo(() => {
    const fallbackScenario = {
      question: prompt,
      answer: summary,
      metricValues: [primaryMetricValue, secondaryMetricValue] as [string, string],
      metricHints: [primaryMetricHint, secondaryMetricHint] as [string, string],
      activeMonth,
      visualPreset,
    };

    const nextScenarios = (scenarioVariants && scenarioVariants.length > 0 ? scenarioVariants : [fallbackScenario])
      .map((scenario) => ({
        ...scenario,
        question: scenario.question.trim(),
      }))
      .filter((scenario, index, array) =>
        scenario.question.length > 0 &&
        array.findIndex((candidate) => candidate.question === scenario.question) === index,
      );

    return nextScenarios.length > 0 ? nextScenarios : [fallbackScenario];
  }, [
    activeMonth,
    primaryMetricHint,
    primaryMetricValue,
    prompt,
    scenarioVariants,
    secondaryMetricHint,
    secondaryMetricValue,
    summary,
    visualPreset,
  ]);
  const activeScenario = scenarios[runId % scenarios.length] ?? scenarios[0];
  const activePrompt = activeScenario.question;

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting && entry.intersectionRatio > 0.08);
      },
      { threshold: [0, 0.08, 0.18], rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    let typingInterval: ReturnType<typeof setInterval> | null = null;
    const startTimer = setTimeout(() => {
      setStage("typing");
      setTypedLength(0);

      typingInterval = setInterval(() => {
        setTypedLength((prev) => {
          if (prev >= activePrompt.length) {
            if (typingInterval) clearInterval(typingInterval);
            return prev;
          }
          return prev + 1;
        });
      }, 24);

      const typingDoneDelay = activePrompt.length * 24 + 120;
      const resultDelay = typingDoneDelay + 1900;
      timers.push(
        setTimeout(() => {
          if (typingInterval) clearInterval(typingInterval);
          setTypedLength(activePrompt.length);
          setStage("sending");
        }, typingDoneDelay),
      );
      timers.push(setTimeout(() => setStage("loading"), typingDoneDelay + 460));
      timers.push(setTimeout(() => setStage("result"), resultDelay));
      timers.push(
        setTimeout(() => {
          setRunId((prev) => prev + 1);
        }, resultDelay + 3200),
      );
    }, 0);
    timers.push(startTimer);

    return () => {
      if (typingInterval) clearInterval(typingInterval);
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [activePrompt, runId]);

  const typedQuestion = activePrompt.slice(0, typedLength);
  const activeSummary = activeScenario.answer;
  const activeMetricValues = activeScenario.metricValues;
  const activeMetricHints = activeScenario.metricHints;
  const activeScenarioMonth = activeScenario.activeMonth;
  const activeVisualPreset = activeScenario.visualPreset ?? visualPreset;
  const proposedPath = useMemo(
    () => getScenarioChartPath(activeMetricValues[1]),
    [activeMetricValues],
  );
  const proposedArea = useMemo(
    () => `${proposedPath} L560 210 L0 210 Z`,
    [proposedPath],
  );
  const showResult = stage === "result";
  const showLoading = stage === "loading" || stage === "sending";
  const promptLabel = useMemo(() => {
    if (stage === "typing") return ui.typingStatus;
    if (stage === "sending" || stage === "loading") return ui.analyzingStatus;
    return ui.readyStatus;
  }, [stage, ui.analyzingStatus, ui.readyStatus, ui.typingStatus]);
  const showCopilotMeta = stage === "loading" || showResult;
  const showResponseText = showResult;
  const showInsights = stage !== "typing";
  const inputText = useMemo(() => {
    if (stage === "typing") return typedQuestion || " ";
    return promptLabel;
  }, [promptLabel, stage, typedQuestion]);
  const gaugeValue = Math.max(0, Math.min(100, Math.abs(parseScenarioImpact(activeMetricValues[1]) ?? 12) / 36 * 100));
  const ringPrimaryValue = activeMetricValues[0];
  const ringSecondaryValue = activeMetricValues[1];

  const renderCompareBoard = () => (
    <>
      <div className={styles.scenarioBoardHeader}>
        <p>{ui.boardTitle}</p>
        <span>{ui.boardBadge}</span>
      </div>

      <div className={styles.scenarioKpis}>
        <div className={styles.scenarioKpiCard}>
          <p>{primaryMetricLabel}</p>
          <strong>{showResult ? activeMetricValues[0] : "--"}</strong>
          <span className={styles.kpiNeutral}>{activeMetricHints[0]}</span>
        </div>
        <div className={styles.scenarioKpiCard}>
          <p>{secondaryMetricLabel}</p>
          <strong>{showResult ? activeMetricValues[1] : "--"}</strong>
          <span className={styles.kpiNegative}>
            {showResult ? activeMetricHints[1] : ui.waitingLabel}
          </span>
        </div>
      </div>

      <div className={styles.scenarioChartCard}>
        <div className={styles.scenarioTop}>
          <p>{ui.chartComparisonLabel}</p>
          <span>{chartSubtitle}</span>
        </div>

        <div className={styles.scenarioLegend}>
          <span className={styles.legendBase}>{ui.legendBase}</span>
          <span className={styles.legendProposed}>{ui.legendScenario}</span>
          <span className={styles.scenarioChip}>{ui.startLabel}: {activeScenarioMonth}</span>
        </div>

        <div className={`${styles.linesCard} ${showResult ? styles.linesCardReady : styles.linesCardLoading}`}>
          {showResult ? (
            <svg viewBox="0 0 560 210" className={styles.chart} aria-hidden="true">
              <path d="M0 52H560 M0 94H560 M0 136H560 M0 178H560" className={styles.gridLine} />
              <path d={BASE_PATH} className={styles.baseLine} />
              <path d={proposedPath} className={styles.proposedLine} />
              <path d={proposedArea} className={styles.proposedArea} />
            </svg>
          ) : (
            <div className={styles.chartLoading} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>

        <div className={styles.monthGrid}>
          {MONTHS.map((month) => (
            <span
              key={month}
              className={showResult && month === activeScenarioMonth ? styles.monthActive : styles.monthButton}
            >
              {month}
            </span>
          ))}
        </div>
      </div>
    </>
  );

  const renderForecastBoard = () => (
    <>
      <div className={styles.scenarioBoardHeader}>
        <p>Forecast</p>
        <span>{ui.boardBadge}</span>
      </div>

      <div className={styles.forecastStatGrid}>
        <div className={styles.forecastStatCard}>
          <p>{primaryMetricLabel}</p>
          <strong>{showResult ? activeMetricValues[0] : "--"}</strong>
          <span>{activeMetricHints[0]}</span>
        </div>
        <div className={styles.forecastStatCard}>
          <p>{secondaryMetricLabel}</p>
          <strong>{showResult ? activeMetricValues[1] : "--"}</strong>
          <span>{showResult ? activeMetricHints[1] : ui.waitingLabel}</span>
        </div>
        <div className={styles.forecastStatCard}>
          <p>{chartSubtitle}</p>
          <strong>{activeScenarioMonth}</strong>
          <span>Aktiv prognosmånad</span>
        </div>
      </div>

      <div className={styles.forecastMonthGrid}>
        {MONTHS.map((month) => (
          <span
            key={month}
            className={showResult && month === activeScenarioMonth ? styles.forecastMonthActive : styles.forecastMonth}
          >
            {month}
          </span>
        ))}
      </div>

      <div className={`${styles.forecastPlotCard} ${showResult ? styles.linesCardReady : styles.linesCardLoading}`}>
        {showResult ? (
          <svg viewBox="0 0 560 210" className={styles.chart} aria-hidden="true">
            <path d="M0 52H560 M0 94H560 M0 136H560 M0 178H560" className={styles.gridLine} />
            <path d={proposedArea} className={styles.proposedArea} />
            <path d={proposedPath} className={styles.proposedLineSolid} />
            <line x1="286" y1="18" x2="286" y2="188" className={styles.forecastGuide} />
          </svg>
        ) : (
          <div className={styles.chartLoading} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        )}
        <div className={styles.monthGrid}>
          {MONTHS.map((month) => (
            <span
              key={month}
              className={showResult && month === activeScenarioMonth ? styles.monthActive : styles.monthButton}
            >
              {month}
            </span>
          ))}
        </div>
      </div>
    </>
  );

  const renderGaugeBoard = () => (
    <>
      <div className={styles.scenarioBoardHeader}>
        <p>{primaryMetricLabel}</p>
        <span>{chartSubtitle}</span>
      </div>
      <div className={styles.gaugeBoardBody}>
        <div className={styles.gaugeMetricBlock}>
          <p>{activeMetricHints[0]}</p>
          <strong>{showResult ? activeMetricValues[0] : "--"}</strong>
          <span>{secondaryMetricLabel}</span>
        </div>
        <div className={styles.gaugeWrap}>
          <svg viewBox="0 0 300 180" className={styles.gaugeSvg} aria-hidden="true">
            <path d="M 30 150 A 120 120 0 0 1 270 150" className={styles.gaugeTrack} pathLength={100} />
            <path
              d="M 30 150 A 120 120 0 0 1 270 150"
              className={styles.gaugeArc}
              pathLength={100}
              strokeDasharray={`${gaugeValue} 100`}
            />
          </svg>
          <div className={styles.gaugeCenter}>
            <span>{secondaryMetricLabel}</span>
            <strong>{showResult ? activeMetricValues[1] : "--"}</strong>
            <small>{showResult ? activeMetricHints[1] : ui.waitingLabel}</small>
          </div>
        </div>
      </div>
    </>
  );

  const renderRingBoard = () => (
    <>
      <div className={styles.scenarioBoardHeader}>
        <p>{chartSubtitle}</p>
        <span>{ui.boardBadge}</span>
      </div>
      <div className={styles.ringBoardBody}>
        <div className={styles.ringVisual}>
          <svg viewBox="0 0 220 220" className={styles.ringSvg} aria-hidden="true">
            <circle cx="110" cy="110" r="74" className={styles.ringTrack} />
            <circle cx="110" cy="110" r="74" className={styles.ringArcPrimary} pathLength={100} strokeDasharray="62 38" />
            <circle cx="110" cy="110" r="58" className={styles.ringArcSecondary} pathLength={100} strokeDasharray="48 52" />
          </svg>
          <div className={styles.ringCenter}>
            <span>{activeScenarioMonth}</span>
            <strong>{showResult ? activeMetricValues[1] : "--"}</strong>
          </div>
        </div>
        <div className={styles.ringLegend}>
          <div>
            <p>{primaryMetricLabel}</p>
            <strong>{showResult ? ringPrimaryValue : "--"}</strong>
            <span>{activeMetricHints[0]}</span>
          </div>
          <div>
            <p>{secondaryMetricLabel}</p>
            <strong>{showResult ? ringSecondaryValue : "--"}</strong>
            <span>{showResult ? activeMetricHints[1] : ui.waitingLabel}</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${styles.scenarioSection} ${styles.revealSection}${visible ? ` ${styles.revealVisible}` : ""}`}
    >
      <SectionTopCurve
        shape="dipDown"
        fillClassName={styles.topCurveScenarioFill}
      />

      <div className={styles.sectionContent}>
        <header className={styles.sectionHead}>
          <h2>{heading}</h2>
          <p>{description}</p>
        </header>

        <div className={styles.scenarioShell}>
          <div className={styles.scenarioShellHead}>
            <div className={styles.scenarioBrand}>
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
            <div className={styles.scenarioShellCopilot}>
              <span className={styles.scenarioShellDot} aria-hidden="true" />
              <p>{ui.copilotLabel}</p>
            </div>
          </div>

          <div className={styles.scenarioFlow}>
            <div className={styles.scenarioQueryRow}>
              <p className={`${styles.scenarioQuestion} ${showLoading ? styles.questionConfirmed : ""}`}>
                {typedQuestion}
                {stage === "typing" && <span className={styles.typingCaret} aria-hidden="true" />}
              </p>
              <span className={styles.scenarioUserBadge} aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <path
                    d="M12 12.2a4.1 4.1 0 1 0-4.1-4.1 4.1 4.1 0 0 0 4.1 4.1Zm0 1.8c-3.05 0-5.9 1.4-5.9 3.55V19h11.8v-1.45C17.9 15.4 15.05 14 12 14Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
            </div>

          <div
            className={`${styles.scenarioResultRow} ${
              showInsights ? styles.scenarioResultVisible : styles.scenarioResultHidden
            }`}
          >
            <div className={styles.scenarioNarrative}>
              <div
                className={`${styles.scenarioCopilotHead} ${
                  showCopilotMeta ? styles.scenarioCopilotHeadVisible : styles.scenarioCopilotHeadMuted
                }`}
              >
                <span className={styles.pulseDot} aria-hidden="true" />
                <p>{ui.copilotResponseLabel}</p>
                <span className={styles.scenarioMetaTag}>
                  {showResult ? ui.metaReadyLabel : ui.metaLoadingLabel}
                </span>
              </div>

              <div className={styles.scenarioAnswer}>
                {showResponseText ? (
                  <>
                    <p>{activeSummary[0]}</p>
                    <p>{activeSummary[1]}</p>
                  </>
                ) : (
                  <div className={styles.answerLoading} aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                )}
              </div>
            </div>

            <article className={styles.scenarioBoard} aria-label={ui.boardAriaLabel}>
              {activeVisualPreset === "forecast"
                ? renderForecastBoard()
                : activeVisualPreset === "gauge"
                  ? renderGaugeBoard()
                  : activeVisualPreset === "ring"
                    ? renderRingBoard()
                    : renderCompareBoard()}
            </article>
          </div>

            <div className={styles.scenarioFooter}>
              <div className={styles.scenarioPrompt}>
                <span>{inputText}</span>
                <button type="button" aria-label={ui.rerunAriaLabel} onClick={() => setRunId((prev) => prev + 1)}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
