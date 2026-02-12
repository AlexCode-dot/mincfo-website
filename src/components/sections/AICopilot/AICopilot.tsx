"use client";

import { Check, SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./AICopilot.module.scss";

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

export default function AICopilot() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [curveProgress, setCurveProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateCurve = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const start = window.innerHeight * 1.06;
      const end = window.innerHeight * 0.58;
      const progress = clamp((start - rect.top) / (start - end), 0, 1);
      setCurveProgress(progress);
    };

    updateCurve();
    window.addEventListener("scroll", updateCurve, { passive: true });
    window.addEventListener("resize", updateCurve);
    return () => {
      window.removeEventListener("scroll", updateCurve);
      window.removeEventListener("resize", updateCurve);
    };
  }, []);

  const waveHeight = 190;
  const sideY = lerp(1, 16, curveProgress);
  const centerY = lerp(1, 128, curveProgress);
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

  return (
    <section
      ref={sectionRef}
      id="solution"
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
        <div className={styles.left}>
          <span className={styles.pill}>AI &amp; Automation</span>
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

        <div className={styles.right}>
          <div className={styles.glow} />

          <article className={styles.panel} aria-label="AI Copilot">
            <header className={styles.header}>
              <span className={styles.dot} />
              <p>AI Copilot</p>
            </header>

            <div className={styles.body}>
              <div className={styles.question}>Hur ser vår runway ut baserat på Q3?</div>

              <div className={styles.answer}>
                <p>
                  Med nuvarande burn-rate har ni cirka 11.4 månader runway.
                  Största påverkan är SaaS-kostnader och rekrytering i november.
                </p>
                <div className={styles.chart} aria-hidden="true">
                  <span style={{ "--bar-height": "68%" } as CSSProperties} />
                  <span style={{ "--bar-height": "56%" } as CSSProperties} />
                  <span style={{ "--bar-height": "46%" } as CSSProperties} />
                  <span style={{ "--bar-height": "36%" } as CSSProperties} />
                  <span style={{ "--bar-height": "30%" } as CSSProperties} />
                </div>
              </div>
            </div>

            <footer className={styles.inputRow}>
              <span>Fråga AI om ekonomi, forecast eller nästa åtgärd</span>
              <button type="button" aria-label="Skicka fråga">
                <SendHorizontal aria-hidden="true" size={14} />
              </button>
            </footer>
          </article>
        </div>
      </div>
    </section>
  );
}
