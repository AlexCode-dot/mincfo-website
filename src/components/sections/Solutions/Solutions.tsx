"use client";

import { Briefcase, Building2, ChevronRight, Cpu, Handshake, Rocket, ShoppingCart } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./Solutions.module.scss";

const SOLUTIONS = [
  {
    href: "/losningar/ceo-founders",
    title: "CEO & Founders",
    text: "Finansiell klarhet för snabbare vägval med AI Copilot, realtidsdata och scenarioplanering.",
    icon: Rocket,
  },
  {
    href: "/losningar/cfo-finance",
    title: "CFO & Finance Team",
    text: "Mindre manuella loopar och bättre forecast med dashboards, automation och spårbar analys.",
    icon: Briefcase,
  },
  {
    href: "/losningar/fractional-cfo",
    title: "Fractional CFO",
    text: "Leverera board-ready underlag snabbare med ett skalbart arbetssätt och hög leveransprecision.",
    icon: Handshake,
  },
  {
    href: "/losningar/saas-tech",
    title: "SaaS / Tech",
    text: "Koppla produkt, GTM och ekonomi i samma beslutsyta för hållbar tillväxt med kontroll.",
    icon: Cpu,
  },
  {
    href: "/losningar/konsult-tjanster",
    title: "Konsult & Tjänster",
    text: "Styr beläggning, projektmarginal och cash i realtid med tydliga signaler per kund och uppdrag.",
    icon: Building2,
  },
  {
    href: "/losningar/ehandel",
    title: "E-handel",
    text: "Få kontroll på marginal, lager och likviditet när kampanjer och inköp påverkar utfallet dag för dag.",
    icon: ShoppingCart,
  },
];

const CARD_TRACER_PATH =
  "M 0.8 7.2 A 6.4 6.4 0 0 1 7.2 0.8 H 92.8 A 6.4 6.4 0 0 1 99.2 7.2 V 92.8 A 6.4 6.4 0 0 1 92.8 99.2 H 7.2 A 6.4 6.4 0 0 1 0.8 92.8 Z";

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
                    <div className={styles.cardTracer} aria-hidden="true">
                      <svg
                        className={styles.cardTracerSvg}
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                      >
                        <path
                          className={`${styles.stroke} ${styles.strokeAGlow}`}
                          d={CARD_TRACER_PATH}
                          pathLength={1}
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            from="0"
                            to="-1"
                            dur="8s"
                            repeatCount="indefinite"
                          />
                        </path>
                        <path
                          className={`${styles.stroke} ${styles.strokeA}`}
                          d={CARD_TRACER_PATH}
                          pathLength={1}
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            from="0"
                            to="-1"
                            dur="8s"
                            repeatCount="indefinite"
                          />
                        </path>
                        <path
                          className={`${styles.stroke} ${styles.strokeBGlow}`}
                          d={CARD_TRACER_PATH}
                          pathLength={1}
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            from="-0.5"
                            to="-1.5"
                            dur="8s"
                            repeatCount="indefinite"
                          />
                        </path>
                        <path
                          className={`${styles.stroke} ${styles.strokeB}`}
                          d={CARD_TRACER_PATH}
                          pathLength={1}
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            from="-0.5"
                            to="-1.5"
                            dur="8s"
                            repeatCount="indefinite"
                          />
                        </path>
                      </svg>
                    </div>

                    <div className={styles.iconWrap}>
                      <Icon size={20} aria-hidden="true" />
                    </div>

                    <div className={styles.cardBody}>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>

                    <a href={item.href} className={styles.cta} aria-label={`Läs mer om ${item.title}`}>
                      <span>Se lösning</span>
                      <ChevronRight size={18} aria-hidden="true" />
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
