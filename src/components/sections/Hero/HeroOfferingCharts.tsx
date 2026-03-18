"use client";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import styles from "./HeroOfferingShowcase.module.scss";

const liquidityMonths = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"] as const;
// Trailing twelve-month net cashflow profile for a company moving
// from sustained burn into a healthier cash generation trend.
const trailingTwelveMonthCashflowKsek = [-80, -72, -68, -60, -48, -12, 8, -6, 24, 52, 68, 14] as const;
const actualMonthlyCashflowKsek = trailingTwelveMonthCashflowKsek.slice(-7) as readonly number[];
const forecastMonthlyCashflowKsek = [18, 22, 26, 30, 34] as const;
const openingCashBalanceKsek = 300;

const latestActualCashBalanceKsek = openingCashBalanceKsek + actualMonthlyCashflowKsek.reduce((sum, value) => sum + value, 0);

const liquidityChartData = liquidityMonths.map((month, index) => {
  const actualCutoff = actualMonthlyCashflowKsek.length;

  if (index < actualCutoff) {
    const actual = openingCashBalanceKsek + actualMonthlyCashflowKsek
      .slice(0, index + 1)
      .reduce((sum, value) => sum + value, 0);

    return {
      month,
      actual,
      forecast: index === actualCutoff - 1 ? actual : null,
    };
  }

  const forecastOffset = index - actualCutoff + 1;
  const forecast = latestActualCashBalanceKsek + forecastMonthlyCashflowKsek
    .slice(0, forecastOffset)
    .reduce((sum, value) => sum + value, 0);

  return {
    month,
    actual: null,
    forecast,
  };
});

const chartOptions = {
  liquidity: {
    label: "Likviditet framåt",
    subtitle: "Utfall och prognos",
    unit: "tkr",
    data: liquidityChartData,
  },
  runway: {
    label: "Runway framåt",
    subtitle: "Månader kvar",
  },
} as const;

type ChartOptionKey = keyof typeof chartOptions;
type RunwayWindow = 1 | 3 | 6 | 12;
const CHART_AUTOPLAY_SEQUENCE: ChartOptionKey[] = ["liquidity", "runway"];
const CHART_AUTOPLAY_DELAY_MS = 3600;
const CHART_AUTOPLAY_PAUSE_AFTER_MANUAL_MS = 6000;
const CHART_AUTOPLAY_OPEN_DELAY_MS = 280;
const CHART_AUTOPLAY_PREVIEW_STEP_MS = 240;
const CHART_AUTOPLAY_SELECT_DELAY_MS = 420;

const runwayCashflowHistory = trailingTwelveMonthCashflowKsek;
const runwayWindows: RunwayWindow[] = [1, 3, 6, 12];
const runwayCashReserveKsek = latestActualCashBalanceKsek;

const average = (values: readonly number[]) =>
  values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);

const getRunwayLabel = (months: number) => (months >= 36 ? "36+" : `${Math.max(1, Math.round(months))}`);
const formatSignedKsek = (value: number) => `${value > 0 ? "+" : ""}${Math.round(value)}K SEK`;

function LiquidityTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string; value?: number | null }>;
  label?: string;
  unit: string;
}) {
  if (!active || !payload?.length) return null;

  const actual = payload.find((entry) => entry.dataKey === "actual")?.value;
  const forecast = payload.find((entry) => entry.dataKey === "forecast")?.value;

  return (
    <div className={styles.evilTooltip}>
      <span>{label}</span>
      {typeof actual === "number" && (
        <strong>Utfall: {actual} {unit}</strong>
      )}
      {typeof forecast === "number" && (
        <strong>Prognos: {forecast} {unit}</strong>
      )}
    </div>
  );
}

export function ShowcaseGradientBarChart() {
  const [selectedChart, setSelectedChart] = useState<ChartOptionKey>("liquidity");
  const [activeRunwayWindow, setActiveRunwayWindow] = useState<RunwayWindow>(6);
  const [chartMenuOpen, setChartMenuOpen] = useState(false);
  const [autoplayPreviewChart, setAutoplayPreviewChart] = useState<ChartOptionKey | null>(null);
  const [autoplayMenuAnimating, setAutoplayMenuAnimating] = useState(false);
  const chartMenuRef = useRef<HTMLDivElement | null>(null);
  const autoplayPositionRef = useRef(Math.max(CHART_AUTOPLAY_SEQUENCE.indexOf("liquidity"), 0));
  const autoplayPausedRef = useRef(false);
  const autoplaySequenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoplayStepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoplayResumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chartMenuOpenRef = useRef(false);
  const autoplayMenuAnimatingRef = useRef(false);
  const activeChart = chartOptions[selectedChart];
  const activeLiquidityChart = selectedChart === "liquidity" ? chartOptions.liquidity : null;
  const forecastStart =
    activeLiquidityChart
      ? activeLiquidityChart.data.find((item) => item.forecast !== null && item.actual !== null)
      : null;
  const runwaySlice = runwayCashflowHistory.slice(-activeRunwayWindow);
  const runwayAverageCashflow = average(runwaySlice);
  const runwayMonths = runwayAverageCashflow >= 0
    ? 36
    : runwayCashReserveKsek / Math.abs(runwayAverageCashflow);
  const runwayFillPercent = Math.min((runwayMonths / 36) * 100, 100);
  const runwayValueLabel = formatSignedKsek(runwayAverageCashflow);

  useEffect(() => {
    chartMenuOpenRef.current = chartMenuOpen;
  }, [chartMenuOpen]);

  useEffect(() => {
    autoplayMenuAnimatingRef.current = autoplayMenuAnimating;
  }, [autoplayMenuAnimating]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = chartMenuRef.current;
      if (!menu || menu.contains(event.target as Node)) return;
      if (autoplayStepTimeoutRef.current) {
        clearTimeout(autoplayStepTimeoutRef.current);
        autoplayStepTimeoutRef.current = null;
      }
      setChartMenuOpen(false);
      setAutoplayPreviewChart(null);
      setAutoplayMenuAnimating(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (CHART_AUTOPLAY_SEQUENCE.length < 2) return;

    const clearTimers = () => {
      if (autoplaySequenceTimeoutRef.current) {
        clearTimeout(autoplaySequenceTimeoutRef.current);
        autoplaySequenceTimeoutRef.current = null;
      }
      if (autoplayStepTimeoutRef.current) {
        clearTimeout(autoplayStepTimeoutRef.current);
        autoplayStepTimeoutRef.current = null;
      }
      if (autoplayResumeTimeoutRef.current) {
        clearTimeout(autoplayResumeTimeoutRef.current);
        autoplayResumeTimeoutRef.current = null;
      }
    };

    clearTimers();

    const scheduleNext = () => {
      autoplaySequenceTimeoutRef.current = setTimeout(() => {
        if (
          autoplayPausedRef.current ||
          chartMenuOpenRef.current ||
          autoplayMenuAnimatingRef.current
        ) {
          scheduleNext();
          return;
        }

        const nextIndex = (autoplayPositionRef.current + 1) % CHART_AUTOPLAY_SEQUENCE.length;
        const nextChart = CHART_AUTOPLAY_SEQUENCE[nextIndex];
        const targetPreviewIndex = Math.max(CHART_AUTOPLAY_SEQUENCE.indexOf(nextChart), 0);

        setAutoplayMenuAnimating(true);
        setChartMenuOpen(true);

        let previewIndex = 0;
        const runPreviewStep = () => {
          setAutoplayPreviewChart(CHART_AUTOPLAY_SEQUENCE[previewIndex]);

          if (previewIndex < targetPreviewIndex) {
            previewIndex += 1;
            autoplayStepTimeoutRef.current = setTimeout(runPreviewStep, CHART_AUTOPLAY_PREVIEW_STEP_MS);
            return;
          }

          autoplayStepTimeoutRef.current = setTimeout(() => {
            setSelectedChart(nextChart);
            autoplayPositionRef.current = nextIndex;
            setChartMenuOpen(false);
            setAutoplayPreviewChart(null);
            setAutoplayMenuAnimating(false);
            scheduleNext();
          }, CHART_AUTOPLAY_SELECT_DELAY_MS);
        };

        autoplayStepTimeoutRef.current = setTimeout(runPreviewStep, CHART_AUTOPLAY_OPEN_DELAY_MS);
      }, CHART_AUTOPLAY_DELAY_MS);
    };

    scheduleNext();
    return () => {
      clearTimers();
    };
  }, []);

  const registerUserInteraction = () => {
    autoplayPausedRef.current = true;
    if (autoplayResumeTimeoutRef.current) {
      clearTimeout(autoplayResumeTimeoutRef.current);
    }
    autoplayResumeTimeoutRef.current = setTimeout(() => {
      autoplayPausedRef.current = false;
      autoplayResumeTimeoutRef.current = null;
    }, CHART_AUTOPLAY_PAUSE_AFTER_MANUAL_MS);
  };

  const handleSelectChart = (nextChart: ChartOptionKey) => {
    registerUserInteraction();
    autoplayPositionRef.current = Math.max(CHART_AUTOPLAY_SEQUENCE.indexOf(nextChart), 0);
    if (autoplayStepTimeoutRef.current) {
      clearTimeout(autoplayStepTimeoutRef.current);
      autoplayStepTimeoutRef.current = null;
    }
    setSelectedChart(nextChart);
    setChartMenuOpen(false);
    setAutoplayPreviewChart(null);
    setAutoplayMenuAnimating(false);
  };

  const handleToggleMenu = () => {
    registerUserInteraction();
    if (autoplayStepTimeoutRef.current) {
      clearTimeout(autoplayStepTimeoutRef.current);
      autoplayStepTimeoutRef.current = null;
    }
    setAutoplayPreviewChart(null);
    setAutoplayMenuAnimating(false);
    setChartMenuOpen((previous) => !previous);
  };

  return (
    <div className={styles.evilCard}>
      <div className={styles.evilHeader}>
        <div className={styles.evilTitleStack}>
          <div
            className={styles.evilSelectWrap}
            ref={chartMenuRef}
            onMouseEnter={registerUserInteraction}
            onMouseMove={registerUserInteraction}
            onFocusCapture={registerUserInteraction}
          >
            <button
              type="button"
              className={styles.evilSelect}
              aria-haspopup="menu"
              aria-expanded={chartMenuOpen}
              aria-label="Välj diagram"
              onClick={handleToggleMenu}
            >
              <span>{activeChart.label}</span>
              <ChevronDown
                size={16}
                aria-hidden="true"
                className={`${styles.evilSelectIcon} ${chartMenuOpen ? styles.evilSelectIconOpen : ""} ${autoplayMenuAnimating ? styles.evilSelectIconAuto : ""}`}
              />
            </button>
            {chartMenuOpen && (
              <div className={styles.evilSelectMenu} role="menu" aria-label="Diagramval">
                {(Object.entries(chartOptions) as Array<[ChartOptionKey, (typeof chartOptions)[ChartOptionKey]]>).map(([key, option]) => (
                  <button
                    key={key}
                    type="button"
                    role="menuitemradio"
                    aria-checked={selectedChart === key}
                    className={`${styles.evilSelectOption} ${selectedChart === key ? styles.evilSelectOptionActive : ""} ${autoplayPreviewChart === key ? styles.evilSelectOptionPreview : ""}`}
                    onClick={() => handleSelectChart(key)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {activeLiquidityChart && (
            <span className={styles.evilSubtle}>{activeLiquidityChart.subtitle}</span>
          )}
        </div>

        <div className={styles.evilLegend}>
          {selectedChart === "liquidity" ? (
            <>
              <span className={styles.evilLegendItem}>
                <span className={`${styles.evilLegendDot} ${styles.evilLegendDotActual}`} />
                <span>Utfall</span>
              </span>
              <span className={styles.evilLegendItem}>
                <span className={`${styles.evilLegendDot} ${styles.evilLegendDotForecast}`} />
                <span>Prognos</span>
              </span>
            </>
          ) : (
            <div className={styles.runwayTabs} aria-label="Välj period för runway">
              {runwayWindows.map((window) => {
                const active = activeRunwayWindow === window;

                return (
                  <button
                    key={window}
                    type="button"
                    className={`${styles.runwayTab} ${active ? styles.runwayTabActive : ""}`}
                    aria-pressed={active}
                    onClick={() => setActiveRunwayWindow(window)}
                  >
                    {window}m
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {activeLiquidityChart ? (
        <div className={styles.evilChartWrap}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={activeLiquidityChart.data}
              margin={{ top: 14, right: 4, left: 4, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--chart-grid)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="month"
                interval={0}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={0}
                padding={{ left: 6, right: 6 }}
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              />
              <Tooltip cursor={false} content={<LiquidityTooltip unit={activeLiquidityChart.unit} />} />
              <defs>
                <linearGradient id="liquidity-actual-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0E5BFF" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#0E5BFF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="liquidity-forecast-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2F7BFF" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#2F7BFF" stopOpacity={0} />
                </linearGradient>
              </defs>

              <Area
                dataKey="actual"
                type="monotone"
                connectNulls={false}
                stroke="#0E5BFF"
                strokeWidth={2.6}
                fill="url(#liquidity-actual-fill)"
                fillOpacity={1}
              />
              <Area
                dataKey="forecast"
                type="monotone"
                connectNulls={true}
                stroke="#2F7BFF"
                strokeWidth={2.2}
                strokeDasharray="5 5"
                fill="url(#liquidity-forecast-fill)"
                fillOpacity={1}
              />

              {forecastStart && (
                <>
                  <ReferenceLine
                    x={forecastStart.month}
                    stroke="oklch(0.82 0.03 260 / 0.22)"
                    strokeDasharray="3 5"
                  />
                  <ReferenceDot
                    x={forecastStart.month}
                    y={forecastStart.forecast ?? undefined}
                    r={5.5}
                    fill="#2F7BFF"
                    stroke="#16151d"
                    strokeWidth={2}
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className={styles.runwayPanel}>
          <div className={styles.runwayCashflowBlock}>
            <p className={styles.runwayCashflowValue}>
              <strong className={runwayAverageCashflow >= 0 ? styles.runwayCashflowPositive : styles.runwayCashflowNegative}>
                {runwayValueLabel}
              </strong>
              <span>/mån</span>
            </p>
          </div>

          <div className={styles.runwayDivider}>
            <span>Genomsnittligt kassaflöde</span>
          </div>

          <div className={styles.runwayGauge}>
            <svg viewBox="0 0 300 180" className={styles.runwayGaugeSvg} aria-hidden="true">
              <defs>
                <linearGradient id="runway-gauge-arc" x1="0%" y1="40%" x2="100%" y2="60%">
                  <stop offset="0%" stopColor="#0E5BFF" />
                  <stop offset="100%" stopColor="#2F7BFF" />
                </linearGradient>
                <linearGradient id="runway-gauge-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0E5BFF" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#0E5BFF" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="20" y1="24" x2="280" y2="24" className={styles.runwayGaugeGridLine} />
              <line x1="20" y1="64" x2="280" y2="64" className={styles.runwayGaugeGridLine} />
              <line x1="20" y1="104" x2="280" y2="104" className={styles.runwayGaugeGridLine} />
              <path
                d="M38 144 A112 112 0 0 1 262 144 L262 180 L38 180 Z"
                className={styles.runwayGaugeFill}
              />
              <path
                d="M38 144 A112 112 0 0 1 262 144"
                className={styles.runwayGaugeTrack}
              />
              <g key={`${selectedChart}-${activeRunwayWindow}`}>
                <path
                  d="M38 144 A112 112 0 0 1 262 144"
                  className={styles.runwayGaugeGlow}
                  pathLength="100"
                  strokeDasharray={`${runwayFillPercent} 100`}
                  strokeDashoffset="100"
                />
                <path
                  d="M38 144 A112 112 0 0 1 262 144"
                  className={styles.runwayGaugeArc}
                  pathLength="100"
                  strokeDasharray={`${runwayFillPercent} 100`}
                  strokeDashoffset="100"
                />
              </g>
            </svg>
            <div className={styles.runwayGaugeCenter}>
              <span>månader</span>
              <strong>{getRunwayLabel(runwayMonths)}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
