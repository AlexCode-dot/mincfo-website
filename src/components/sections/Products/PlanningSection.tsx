import { Check } from "lucide-react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import { useHomeOffering } from "@/components/home/HomeOfferingProvider";
import styles from "./PlanningSection.module.scss";

type PlanningSectionProps = {
  className?: string;
  planSectionRef: RefObject<HTMLDivElement | null>;
  waveHeight: number;
  planCurvePath: string;
  planCurveClip: string;
  planVisible: boolean;
  planUpdating: boolean;
  planMonthIndex: number;
  selectedPlanMode: string;
  animatedPlanValue: number;
  animatedSelectedPlanDelta: number;
  animatedPlanTotalDelta: number;
  planForecastAreaPath: string;
  planForecastLinePath: string;
  selectedPlanPointX: number;
  selectedPlanPointY: number;
  formatSek: (value: number) => string;
  formatPercent: (value: number) => string;
  onSelectPlanMonth: (index: number) => void;
  monthLabelsEn: string[];
};

type PlanningCopyProps = {
  className?: string;
  pillClassName?: string;
  title?: ReactNode;
  titleClassName?: string;
  textClassName?: string;
  listClassName?: string;
  listItemClassName?: string;
  planVisible: boolean;
};

type PlanningVisualProps = {
  className?: string;
  planVisible: boolean;
  planUpdating: boolean;
  planMonthIndex: number;
  selectedPlanMode: string;
  animatedPlanValue: number;
  animatedSelectedPlanDelta: number;
  animatedPlanTotalDelta: number;
  planForecastAreaPath: string;
  planForecastLinePath: string;
  selectedPlanPointX: number;
  selectedPlanPointY: number;
  formatSek: (value: number) => string;
  formatPercent: (value: number) => string;
  onSelectPlanMonth: (index: number) => void;
  monthLabelsEn: string[];
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

export function PlanningCopy({
  className,
  pillClassName,
  title,
  titleClassName,
  textClassName,
  listClassName,
  listItemClassName,
  planVisible,
}: PlanningCopyProps) {
  const { content } = useHomeOffering();

  return (
    <div className={`${styles.left} ${styles.planLeft} ${planVisible ? styles.shown : ""} ${className ?? ""}`}>
      <span className={`${styles.pill} ${pillClassName ?? ""}`}>{content.aicopilot.planning.pill}</span>
      <h2 className={`${styles.title} ${titleClassName ?? ""}`}>{title ?? content.aicopilot.planning.title}</h2>
      <p className={`${styles.text} ${textClassName ?? ""}`}>{content.aicopilot.planning.intro}</p>

      <ul className={`${styles.list} ${listClassName ?? ""}`}>
        {content.aicopilot.planning.bullets.map((item, index) => (
          <li
            key={`${content.aicopilot.planning.title}-${index}-${item}`}
            className={listItemClassName}
          >
            <Check aria-hidden="true" size={14} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PlanningVisual({
  className,
  planVisible,
  planUpdating,
  planMonthIndex,
  selectedPlanMode,
  animatedPlanValue,
  animatedSelectedPlanDelta,
  animatedPlanTotalDelta,
  planForecastAreaPath,
  planForecastLinePath,
  selectedPlanPointX,
  selectedPlanPointY,
  formatSek,
  formatPercent,
  onSelectPlanMonth,
  monthLabelsEn,
}: PlanningVisualProps) {
  const { content } = useHomeOffering();

  return (
    <div
      className={`${styles.right} ${styles.planRight} ${planVisible ? styles.shownDelayed : ""} ${planVisible ? styles.planVisible : ""} ${className ?? ""}`}
    >
      <article className={styles.planPanel} aria-label={content.aicopilot.planning.panelAria}>
        <div className={styles.planPanelBody}>
          <div className={styles.planVisualStack}>
            <div className={styles.planForecastShell}>
              <MiniMincfoBrand />

              <header className={styles.planPanelHeader}>
                <p>{content.aicopilot.planning.forecastTitle}</p>
                <span className={styles.liveScenario}>
                  <span className={styles.liveDot} aria-hidden="true" />
                  {content.aicopilot.planning.liveLabel}
                </span>
              </header>
              <div className={styles.planRecon}>
                {(content.aicopilot.planning.reconciliationTitle
                  || content.aicopilot.planning.reconciliationSubtext) && (
                  <div className={styles.planReconHead}>
                    {content.aicopilot.planning.reconciliationTitle && (
                      <p>{content.aicopilot.planning.reconciliationTitle}</p>
                    )}
                    {content.aicopilot.planning.reconciliationSubtext && (
                      <span>{content.aicopilot.planning.reconciliationSubtext}</span>
                    )}
                  </div>
                )}
                <div className={styles.planForecastStats}>
                  <div className={styles.planForecastStat}>
                    <p>{selectedPlanMode} ({monthLabelsEn[planMonthIndex]})</p>
                    <strong>{formatSek(animatedPlanValue * 1000)} kr</strong>
                  </div>
                  <div className={styles.planForecastStat}>
                    <p>{content.aicopilot.planning.vsPrevious}</p>
                    <strong className={animatedSelectedPlanDelta < 0 ? styles.planStatDown : styles.planStatUp}>
                      {formatPercent(animatedSelectedPlanDelta)}
                    </strong>
                  </div>
                  <div className={styles.planForecastStat}>
                    <p>{content.aicopilot.planning.annualVariance}</p>
                    <strong className={animatedPlanTotalDelta < 0 ? styles.planStatDown : styles.planStatUp}>
                      {formatPercent(animatedPlanTotalDelta)}
                    </strong>
                  </div>
                </div>
                <div className={styles.planMonthGrid}>
                  {monthLabelsEn.map((month, index) => (
                    <button
                      key={month}
                      type="button"
                      className={`${styles.planMonth} ${planMonthIndex === index ? styles.planMonthSelected : ""}`}
                      onClick={() => onSelectPlanMonth(index)}
                      aria-pressed={planMonthIndex === index}
                      aria-label={`${content.aicopilot.planning.monthAriaPrefix} ${month}`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
                <div className={`${styles.planForecastChart} ${planUpdating ? styles.panelUpdating : ""}`}>
                  <div className={styles.planForecastPlot}>
                    <svg viewBox="0 0 682 190" preserveAspectRatio="none" aria-hidden="true">
                      <path className={styles.planForecastArea} d={planForecastAreaPath} />
                      <path className={styles.planForecastLine} d={planForecastLinePath} />
                      <line className={styles.planSelectedGuide} x1={selectedPlanPointX} y1="16" x2={selectedPlanPointX} y2="184" />
                    </svg>
                    <span
                      className={styles.planSelectedPointDot}
                      aria-hidden="true"
                      style={
                        {
                          "--plan-selected-x": `${(selectedPlanPointX / 682) * 100}%`,
                          "--plan-selected-y": `${(selectedPlanPointY / 190) * 100}%`,
                        } as CSSProperties
                      }
                    />
                  </div>
                  {content.aicopilot.planning.legend && (
                    <p className={styles.planForecastLegend} aria-hidden="true">
                      {content.aicopilot.planning.legend}
                    </p>
                  )}
                  <div className={styles.planMonthAxis} aria-hidden="true">
                    {monthLabelsEn.map((month) => (
                      <span key={month}>{month}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export function PlanningSection({
  className,
  planSectionRef,
  waveHeight,
  planCurvePath,
  planCurveClip,
  planVisible,
  planUpdating,
  planMonthIndex,
  selectedPlanMode,
  animatedPlanValue,
  animatedSelectedPlanDelta,
  animatedPlanTotalDelta,
  planForecastAreaPath,
  planForecastLinePath,
  selectedPlanPointX,
  selectedPlanPointY,
  formatSek,
  formatPercent,
  onSelectPlanMonth,
  monthLabelsEn,
}: PlanningSectionProps) {
  return (
    <div
      className={`${styles.planSection} ${className ?? ""}`}
      ref={planSectionRef}
    >
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
        <PlanningCopy planVisible={planVisible} />
        <PlanningVisual
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
          onSelectPlanMonth={onSelectPlanMonth}
          monthLabelsEn={monthLabelsEn}
        />
      </div>
    </div>
  );
}
