"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.scss";

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
const PROPOSED_PATH =
  "M0 146 C52 142 100 134 148 130 C194 128 242 130 286 138 C332 146 378 152 430 146 C474 136 520 112 560 86";
const PROPOSED_AREA =
  "M0 146 C52 142 100 134 148 130 C194 128 242 130 286 138 C332 146 378 152 430 146 C474 136 520 112 560 86 L560 210 L0 210 Z";

type ScenarioOverrides = {
  heading?: string;
  description?: string;
  prompt?: string;
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
};

export default function ScenarioVisualization({
  heading = "Scenario visualization",
  description = "Ett konkret exempel på hur en CEO kan testa tillväxtbeslut och direkt se effekt på runway och EBITDA.",
  prompt = DEFAULT_SCENARIO.prompt,
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
}: ScenarioOverrides) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [runId, setRunId] = useState(0);
  const [stage, setStage] = useState<ScenarioStage>("typing");
  const [typedLength, setTypedLength] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    let revealTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        revealTimer = setTimeout(() => setVisible(true), 140);
        observer.disconnect();
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (revealTimer) clearTimeout(revealTimer);
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
          if (prev >= prompt.length) {
            if (typingInterval) clearInterval(typingInterval);
            return prev;
          }
          return prev + 1;
        });
      }, 24);

      const typingDoneDelay = prompt.length * 24 + 120;
      const resultDelay = typingDoneDelay + 1900;
      timers.push(
        setTimeout(() => {
          if (typingInterval) clearInterval(typingInterval);
          setTypedLength(prompt.length);
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
  }, [prompt, runId]);

  const typedQuestion = prompt.slice(0, typedLength);
  const showResult = stage === "result";
  const showLoading = stage === "loading" || stage === "sending";
  const promptLabel = useMemo(() => {
    if (stage === "typing") return "Användare skriver fråga...";
    if (stage === "sending" || stage === "loading") return "AI analyserar data...";
    return "Scenario klart. Fråga AI om budget, headcount eller nästa åtgärd";
  }, [stage]);
  const showCopilotMeta = stage === "loading" || showResult;
  const showResponseText = showResult;
  const showInsights = stage !== "typing";
  const inputText = useMemo(() => {
    if (stage === "typing") return typedQuestion || " ";
    return promptLabel;
  }, [promptLabel, stage, typedQuestion]);

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${styles.scenarioSection} ${styles.revealSection}${visible ? ` ${styles.revealVisible}` : ""}`}
    >
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
            <p>AI Copilot</p>
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
                <p>MinCFO Copilot</p>
                <span className={styles.scenarioMetaTag}>{showResult ? "Generated in 1.2s" : "Analyserar..."}</span>
              </div>

              <div className={styles.scenarioAnswer}>
                {showResponseText ? (
                  <>
                    <p>{summary[0]}</p>
                    <p>{summary[1]}</p>
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

            <article className={styles.scenarioBoard} aria-label="Scenario dashboard visual">
              <div className={styles.scenarioBoardHeader}>
                <p>Forecast Impact</p>
                <span>Live Scenario</span>
              </div>

              <div className={styles.scenarioKpis}>
                <div className={styles.scenarioKpiCard}>
                  <p>{primaryMetricLabel}</p>
                  <strong>{showResult ? primaryMetricValue : "--"}</strong>
                  <span className={styles.kpiNeutral}>{primaryMetricHint}</span>
                </div>
                <div className={styles.scenarioKpiCard}>
                  <p>{secondaryMetricLabel}</p>
                  <strong>{showResult ? secondaryMetricValue : "--"}</strong>
                  <span className={styles.kpiNegative}>{showResult ? secondaryMetricHint : "Väntar på scenario..."}</span>
                </div>
              </div>

              <div className={styles.scenarioChartCard}>
                <div className={styles.scenarioTop}>
                  <p>Base vs Proposed</p>
                  <span>{chartSubtitle}</span>
                </div>

                <div className={styles.scenarioLegend}>
                  <span className={styles.legendBase}>Base</span>
                  <span className={styles.legendProposed}>Proposed</span>
                  <span className={styles.scenarioChip}>Start: {activeMonth}</span>
                </div>

                <div className={`${styles.linesCard} ${showResult ? styles.linesCardReady : styles.linesCardLoading}`}>
                  {showResult ? (
                    <svg viewBox="0 0 560 210" className={styles.chart} aria-hidden="true">
                      <path d="M0 52H560 M0 94H560 M0 136H560 M0 178H560" className={styles.gridLine} />
                      <path d={BASE_PATH} className={styles.baseLine} />
                      <path d={PROPOSED_PATH} className={styles.proposedLine} />
                      <path d={PROPOSED_AREA} className={styles.proposedArea} />
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
                      className={showResult && month === activeMonth ? styles.monthActive : styles.monthButton}
                    >
                      {month}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </div>

          <div className={styles.scenarioFooter}>
            <div className={styles.scenarioPrompt}>
              <span>{inputText}</span>
              <button type="button" aria-label="Kör scenariot igen" onClick={() => setRunId((prev) => prev + 1)}>
                <ChevronRight size={16} />
              </button>
            </div>
            <p className={styles.scenarioDisclaimer}>MinCFO can make mistakes. Verify important financial data.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
