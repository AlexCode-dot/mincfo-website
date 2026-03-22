import { Check, ChevronDown } from "lucide-react";
import type { CSSProperties, RefObject } from "react";
import { useHomeOffering } from "@/components/home/HomeOfferingProvider";
import styles from "./DashboardSection.module.scss";

type AnalysisMetric = "netIncome" | "ebit" | "ebitda" | "grossProfit";

type DashboardMetric = { id: AnalysisMetric; label: string; seriesK: number[] };

type DashboardSectionProps = {
  dashboardSectionRef: RefObject<HTMLDivElement | null>;
  waveHeight: number;
  dashboardCurvePath: string;
  dashboardCurveClip: string;
  dashboardVisible: boolean;
  analysisUpdating: boolean;
  trendAnimating: boolean;
  trendResetting: boolean;
  trendSeries: Array<[number, number]>;
  trendAreaPath: string;
  trendLinePath: string;
  analysisMetricOpen: boolean;
  trendMetricMenuRef: RefObject<HTMLDivElement | null>;
  activeMetric: DashboardMetric;
  analysisMetric: AnalysisMetric;
  analysisMetrics: DashboardMetric[];
  selectedMetricAmount: number;
  selectedMetricPreviousAmount: number;
  selectedMetricDelta: number;
  selectedMetricPreviousDelta: number;
  analysisCompareLabel: string;
  autoplayPreviewMetric: AnalysisMetric | null;
  autoplayMenuAnimating: boolean;
  onToggleMetricMenu: () => void;
  onSelectMetric: (metric: AnalysisMetric) => void;
  formatSek: (value: number) => string;
  formatPercent: (value: number) => string;
  monthLabels: string[];
  trendAxisTicks: string[];
};

function MiniMincfoBrand() {
  const { content } = useHomeOffering();

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
      <span className={styles.visualWordmark}>{content.footer.brandWord}</span>
    </span>
  );
}

export function DashboardSection({
  dashboardSectionRef,
  waveHeight,
  dashboardCurvePath,
  dashboardCurveClip,
  dashboardVisible,
  analysisUpdating,
  trendAnimating,
  trendResetting,
  trendSeries,
  trendAreaPath,
  trendLinePath,
  analysisMetricOpen,
  trendMetricMenuRef,
  activeMetric,
  analysisMetric,
  analysisMetrics,
  selectedMetricAmount,
  selectedMetricPreviousAmount,
  selectedMetricDelta,
  selectedMetricPreviousDelta,
  analysisCompareLabel,
  autoplayPreviewMetric,
  autoplayMenuAnimating,
  onToggleMetricMenu,
  onSelectMetric,
  formatSek,
  formatPercent,
  monthLabels,
  trendAxisTicks,
}: DashboardSectionProps) {
  const { content } = useHomeOffering();

  return (
    <div
      className={styles.dashboardSection}
      ref={dashboardSectionRef}
    >
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
        <div className={`${styles.right} ${styles.dashboardRight} ${dashboardVisible ? styles.shownDelayed : ""}`}>
          <article className={styles.dashboardPanel} aria-label={content.aicopilot.dashboard.previewAria}>
            <MiniMincfoBrand />

            <div className={styles.statGrid}>
              <div className={styles.statCard}>
                <div className={styles.statLabelRow}>
                  <span>{activeMetric.label} ({content.aicopilot.dashboard.currentLabel})</span>
                </div>
                <div className={styles.statAmount}>
                  <strong>{formatSek(selectedMetricAmount)}</strong>
                  <span>{content.aicopilot.dashboard.currencyLabel}</span>
                </div>
                <div className={`${styles.statDelta} ${selectedMetricDelta < 0 ? styles.down : ""}`}>
                  {formatPercent(selectedMetricDelta)}
                </div>
                <p className={styles.statMeta}>{analysisCompareLabel}</p>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statLabelRow}>
                  <span>{activeMetric.label} ({content.aicopilot.dashboard.previousLabel})</span>
                </div>
                <div className={styles.statAmount}>
                  <strong>{formatSek(selectedMetricPreviousAmount)}</strong>
                  <span>{content.aicopilot.dashboard.currencyLabel}</span>
                </div>
                <div className={`${styles.statDelta} ${selectedMetricPreviousDelta < 0 ? styles.down : ""}`}>
                  {formatPercent(selectedMetricPreviousDelta)}
                </div>
                <p className={styles.statMeta}>{analysisCompareLabel}</p>
              </div>
            </div>

            <div className={`${styles.trendPanel} ${analysisUpdating ? styles.panelUpdating : ""}`}>
              <header className={styles.trendHeader}>
                <p>{content.aicopilot.dashboard.resultTitle}</p>
                <div className={styles.trendHeaderRight} ref={trendMetricMenuRef}>
                  <button
                    type="button"
                    className={styles.metricTrigger}
                    aria-haspopup="menu"
                    aria-expanded={analysisMetricOpen}
                    onClick={onToggleMetricMenu}
                  >
                    {activeMetric.label}
                    <ChevronDown
                      aria-hidden="true"
                      size={14}
                      className={`${styles.metricTriggerIcon} ${analysisMetricOpen ? styles.metricTriggerIconOpen : ""} ${autoplayMenuAnimating ? styles.metricTriggerIconAuto : ""}`}
                    />
                  </button>
                  {analysisMetricOpen && (
                    <div className={styles.metricMenu} role="menu" aria-label={content.aicopilot.dashboard.metricMenuAria}>
                      {analysisMetrics.map((metric) => (
                        <button
                          key={metric.id}
                          type="button"
                          role="menuitemradio"
                          aria-checked={analysisMetric === metric.id}
                          className={`${styles.metricOption} ${analysisMetric === metric.id ? styles.metricOptionActive : ""} ${autoplayPreviewMetric === metric.id ? styles.metricOptionPreview : ""}`}
                          onClick={() => onSelectMetric(metric.id)}
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
                  <div className={styles.trendPlot}>
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
                    </svg>
                    {trendSeries.map(([x, y], index) => (
                      <span
                        key={`${x}-${y}`}
                        className={`${styles.trendPointMarker} ${trendAnimating ? styles.trendPointVisible : ""} ${trendResetting ? styles.trendPointReset : ""}`}
                        style={
                          {
                            "--point-delay": `${index * 170 + 180}ms`,
                            "--point-x": `${(x / 760) * 100}%`,
                            "--point-y": `${(y / 290) * 100}%`,
                          } as CSSProperties
                        }
                        aria-hidden="true"
                      />
                    ))}
                  </div>

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

        <div className={`${styles.left} ${styles.dashboardLeft} ${dashboardVisible ? styles.shown : ""}`}>
          <span className={styles.pill}>{content.aicopilot.dashboard.pill}</span>
          <h2 className={styles.title}>{content.aicopilot.dashboard.title}</h2>
          <p className={styles.text}>{content.aicopilot.dashboard.intro}</p>

          <ul className={styles.list}>
            {content.aicopilot.dashboard.kpiBullets.map((item) => (
              <li key={item}>
                <Check aria-hidden="true" size={14} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
