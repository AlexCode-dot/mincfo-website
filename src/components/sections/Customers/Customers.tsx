"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./Customers.module.scss";

type Testimonial = {
  accent?: boolean;
  company: string;
  quote: string;
  role: string;
  person: string;
};

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

const CUT_HEIGHT = 190;
const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

const TESTIMONIALS: Testimonial[] = [
  {
    company: "Qsid",
    quote:
      "MinCFO har gett oss en ny nivå av ekonomisk insikt. Med automatiserad bokföring och realtidsdata kan vi nu fatta snabbare beslut och lägga mer tid på att utveckla vår verksamhet.",
    person: "Rikard Jonsson",
    role: "VD, Sid Marketing",
  },
  {
    accent: true,
    company: "Showcase",
    quote:
      "Att anlita MinCFO är ett av våra bästa beslut. Vi har fått proaktiv rådgivning som gjort att vi kunnat minska kostnader och frigöra kapital. En komplett lösning för vår ekonomi.",
    person: "Aviv Fahri",
    role: "VD, Showcase",
  },
  {
    company: "SweBal",
    quote:
      "Med MinCFO slipper vi lägga värdefull tid på rapportering, finansiella analyser och administration. Istället kan vi fokusera fullt ut på vår kärnverksamhet och projekteringen av ny fabrik.",
    person: "Joakim Sjöholm",
    role: "VD, Swebal AB",
  },
  {
    accent: true,
    company: "Hälsa Hemma",
    quote:
      "MinCFO är ett viktigt stöd i vår tillväxt. De avlastar det administrativa och levererar snabba, korrekta svar, så att vi kan fokusera på verksamheten.",
    person: "Oskar Nordmark",
    role: "Financial Controller, Hälsa Hemma",
  },
];

const TRUSTED_LOGOS = [
  "Realforce",
  "BAM",
  "SWEBAL",
  "Runway",
  "Lawster",
  "Swedish Algae Factory",
  "Hälsa Hemma",
  "Rossoneri",
];

export default function Customers() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [curveProgress, setCurveProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(1);
  const [reduceMotion, setReduceMotion] = useState(false);

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
      // Start animation earlier so the transition begins before the section fully enters.
      const start = window.innerHeight * 1.35;
      const end = window.innerHeight * 0.74;
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

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!visible || reduceMotion) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4600);
    return () => clearInterval(id);
  }, [visible, reduceMotion]);

  const prevIndex = (activeIndex - 1 + TESTIMONIALS.length) % TESTIMONIALS.length;
  const nextIndex = (activeIndex + 1) % TESTIMONIALS.length;
  const sideY = 6;
  const centerY = lerp(6, 86, curveProgress);
  const cutPath = `M0 ${sideY} C280 ${sideY} 480 ${centerY} 720 ${centerY} C960 ${centerY} 1160 ${sideY} 1440 ${sideY}`;
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
  const cutClip = `polygon(${curvePoints.join(", ")}, 100% 100%, 0% 100%)`;
  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };
  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  return (
    <section
      ref={sectionRef}
      id="customers"
      className={`${styles.section} ${visible ? styles.visible : ""}`}
    >
      <svg
        className={styles.curveCut}
        viewBox={`0 0 1440 ${CUT_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={cutPath} />
      </svg>

      <div
        className={styles.background}
        aria-hidden="true"
        style={{ clipPath: cutClip, WebkitClipPath: cutClip } as CSSProperties}
      />

      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.pill}>Kunder</span>
          <h2>Kundresultat från team som växer med MinCFO</h2>
          <p>
            Kundcase, omdömen och logotyper visar vad vi faktiskt levererar
            i praktiken. Här är ett urval kundröster.
          </p>
        </header>

        <div className={styles.cardsShell}>
          {TESTIMONIALS.map((item, index) => {
            let positionClass = styles.hiddenCard;
            if (index === activeIndex) positionClass = styles.centerCard;
            else if (index === prevIndex) positionClass = styles.leftCard;
            else if (index === nextIndex) positionClass = styles.rightCard;

            return (
              <article
                key={`${item.company}-${item.person}`}
                className={`${styles.card} ${item.accent ? styles.cardAccent : ""} ${positionClass}`}
              >
                <p className={styles.company}>{item.company}</p>
                <p className={styles.quote}>"{item.quote}"</p>
                <footer className={styles.person}>
                  <span className={styles.avatar}>{item.person.slice(0, 1)}</span>
                  <span>
                    <strong>{item.person}</strong>
                    <small>{item.role}</small>
                  </span>
                </footer>
              </article>
            );
          })}
        </div>

        <div className={styles.controls} aria-label="Bläddra kundomdömen">
          <button type="button" onClick={goPrev} className={styles.controlBtn} aria-label="Föregående omdöme">
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" onClick={goNext} className={styles.controlBtn} aria-label="Nästa omdöme">
            <span aria-hidden="true">›</span>
          </button>
        </div>

        <div className={styles.trustedTicker} aria-label="Kunder som litar på oss">
          <p className={styles.trustedLabel}>Betrodd av team som använder MinCFO varje månad</p>
          <div className={styles.tickerViewport}>
            <div className={styles.tickerTrack}>
              {TRUSTED_LOGOS.map((name, index) => (
                <span key={`a-${name}-${index}`} className={styles.tickerItem}>
                  {name}
                </span>
              ))}
              {TRUSTED_LOGOS.map((name, index) => (
                <span key={`b-${name}-${index}`} className={styles.tickerItem}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
