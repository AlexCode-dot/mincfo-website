import { Check, SendHorizontal } from "lucide-react";
import type { CSSProperties } from "react";
import { useHomeOffering } from "@/components/home/HomeOfferingProvider";
import styles from "./CopilotChatSection.module.scss";

type CopilotStage = "idle" | "typing" | "sending" | "loading" | "answer" | "chart";
type CopilotExample = {
  answer: string;
  chartTitle: string;
  chartUnit: string;
  bars: Array<{ height: string; label: string; value: string }>;
  question: string;
  yTicks: string[];
};

type CopilotChatSectionProps = {
  anchorId?: string;
  currentExample: CopilotExample;
  visible: boolean;
  showQuestionBubble: boolean;
  isSending: boolean;
  isLoading: boolean;
  showAnswerText: boolean;
  showChart: boolean;
  isTyping: boolean;
  typedQuestion: string;
  stage: CopilotStage;
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

export function CopilotChatSection({
  anchorId,
  currentExample,
  visible,
  showQuestionBubble,
  isSending,
  isLoading,
  showAnswerText,
  showChart,
  isTyping,
  typedQuestion,
  stage,
}: CopilotChatSectionProps) {
  const { content } = useHomeOffering();

  return (
    <section
      id={anchorId}
      data-home-snap-section="true"
      className={styles.container}
    >
      <div className={`${styles.left} ${styles.aiLeft} ${visible ? styles.shown : ""}`}>
        <span className={styles.pill}>{content.aicopilot.leftPill}</span>
        <h2 className={styles.title}>{content.aicopilot.leftTitle}</h2>
        <p className={styles.text}>{content.aicopilot.leftIntro}</p>

        <ul className={styles.list}>
          {content.aicopilot.leftBullets.map((item) => (
            <li key={item}>
              <Check aria-hidden="true" size={14} />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className={`${styles.right} ${styles.aiRight} ${visible ? styles.shownDelayed : ""}`}>
        <div className={styles.glow} />

        <article className={styles.panel} aria-label={content.aicopilot.panelTitle}>
          <MiniMincfoBrand />

          <header className={styles.header}>
            <span className={styles.dot} />
            <p>{content.aicopilot.panelTitle}</p>
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
                  aria-label={content.aicopilot.loadingAria}
                >
                  <span />
                  <span />
                  <span />
                </div>
              )}
              {showAnswerText && <p>{currentExample.answer}</p>}
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
              {isSending && content.aicopilot.statusSending}
              {isLoading && content.aicopilot.statusAnalyzing}
              {(stage === "idle" || stage === "answer" || stage === "chart") &&
                content.aicopilot.inputPlaceholder}
            </span>
            <button
              type="button"
              aria-label={content.aicopilot.sendAria}
              className={`${isSending ? styles.sending : ""} ${isLoading ? styles.loading : ""}`}
            >
              <SendHorizontal aria-hidden="true" size={14} />
            </button>
          </footer>
        </article>
      </div>
    </section>
  );
}
