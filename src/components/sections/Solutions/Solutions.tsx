"use client";

import { Briefcase, Building2, ChevronDown, Rocket } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./Solutions.module.scss";

const SOLUTIONS = [
  {
    href: "/losningar/ceo-founders",
    title: "Om ni är VC-backade eller kapitalresande",
    text: "Få tydlig kontroll på runway, burn-rate och tillväxtdrivare utan att bygga ett stort finance-team internt.",
    detail:
      "Placeholder: veckovis cash-rapportering, investor-ready material och scenarioplanering inför nästa runda.",
    icon: Rocket,
  },
  {
    href: "/losningar/cfo-finance",
    title: "Om ni har flera bolag eller marknader",
    text: "Automatisera uppföljning och rapportering för snabbare beslut, färre manuella moment och bättre precision.",
    detail:
      "Placeholder: samlad koncernvy, harmoniserad rapportstruktur och tydliga ansvarsflöden mellan team.",
    icon: Briefcase,
  },
  {
    href: "/losningar/saas-tech",
    title: "Om ni vill skala utan att tappa kontroll",
    text: "Koppla ihop planering, KPI:er och scenarioanalys så att teamet kan agera proaktivt istället för reaktivt.",
    detail:
      "Placeholder: månatliga beslutsunderlag, KPI-uppföljning och operativ rådgivning nära ledningsgruppen.",
    icon: Building2,
  },
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

export default function Solutions() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [curveProgress, setCurveProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible((prev) => prev || entry.isIntersecting);
      },
      { threshold: 0.3, rootMargin: "0px 0px -24% 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateCurve = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight;
      if (rect.top >= viewport) {
        setCurveProgress(0);
      } else {
        const start = viewport * 0.9;
        const end = viewport * 0.42;
        const progress = clamp((start - rect.top) / (start - end), 0, 1);
        setCurveProgress(progress);
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

  const sideY = lerp(1, 90, curveProgress);
  const centerY = lerp(1, 20, curveProgress);
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
      id="losningar"
      className={`${styles.section} ${visible ? styles.visible : ""}`}
    >
      <svg
        className={styles.curveCut}
        viewBox="0 0 1440 190"
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
        <div className={styles.layout}>
          <header className={styles.header}>
            <span className={styles.pill}>Lösningar</span>
            <h2>Hitta rätt ekonomiupplägg för ert bolag</h2>
            <p>
              Olika bolag har olika behov. Välj den inriktning som passar er
              situation och läs hur vi kan stötta.
            </p>
          </header>

          <div className={styles.cardsColumn}>
            <div className={styles.grid}>
              {SOLUTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.href} className={styles.card}>
                    <div className={styles.iconWrap}>
                      <Icon size={20} aria-hidden="true" />
                    </div>

                    <div className={styles.cardBody}>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                      <p className={styles.placeholder}>{item.detail}</p>
                    </div>

                    <a href={item.href} className={styles.cta} aria-label={`Läs mer om ${item.title}`}>
                      <span>Läs mer</span>
                      <ChevronDown size={18} aria-hidden="true" />
                    </a>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
