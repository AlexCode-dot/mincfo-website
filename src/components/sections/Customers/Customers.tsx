"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { HOME_PAGE_TEXT } from "@/content/homePageText";
import { useMotion } from "@/components/system/MotionProvider";
import styles from "./Customers.module.scss";

type Testimonial = {
  accent?: boolean;
  avatarFile: string;
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

const TESTIMONIALS: Testimonial[] = HOME_PAGE_TEXT.customers.testimonials.map((item) => ({
  ...item,
}));

const TRUSTED_LOGOS = HOME_PAGE_TEXT.customers.trustedLogos.map((logo) => ({ ...logo }));
const TRUSTED_LOGO_BY_NAME = new Map<string, string>(
  TRUSTED_LOGOS.map((logo) => [logo.name, logo.file]),
);
const TICKER_LOGO_CLASS_BY_NAME: Record<string, string> = {
  Growbit: styles.logoGrowbit,
  Azeea: styles.logoAzeea,
};

export default function Customers() {
  const { isReducedMotion } = useMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [curveProgress, setCurveProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(1);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
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
        const start = viewport * 0.92;
        const end = viewport * 0.46;
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

  useEffect(() => {
    if (!visible || isReducedMotion) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4600);
    return () => clearInterval(id);
  }, [visible, isReducedMotion]);

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
  const tickerLogos = isReducedMotion ? TRUSTED_LOGOS : [...TRUSTED_LOGOS, ...TRUSTED_LOGOS];

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
          <span className={styles.pill}>{HOME_PAGE_TEXT.customers.pill}</span>
          <h2>{HOME_PAGE_TEXT.customers.title}</h2>
          <p>{HOME_PAGE_TEXT.customers.intro}</p>
        </header>

        <div className={styles.cardsShell}>
          {TESTIMONIALS.map((item, index) => {
            let positionClass = styles.hiddenCard;
            if (index === activeIndex) positionClass = styles.centerCard;
            else if (index === prevIndex) positionClass = styles.leftCard;
            else if (index === nextIndex) positionClass = styles.rightCard;
            const companyLogoFile = TRUSTED_LOGO_BY_NAME.get(item.company);

            return (
              <article
                key={`${item.company}-${item.person}`}
                data-card-index={index}
                className={`${styles.card} ${item.accent ? styles.cardAccent : ""} ${positionClass}`}
              >
                <div className={styles.companyBrand}>
                  {companyLogoFile ? (
                    <Image
                      className={`${styles.companyLogo} ${item.company === "Showcase" ? styles.logoSoft : ""}`}
                      src={`/customers/logos/${companyLogoFile}`}
                      alt={`${item.company} logo`}
                      width={220}
                      height={44}
                      loading="lazy"
                    />
                  ) : (
                    <p className={styles.company}>{item.company}</p>
                  )}
                </div>
                <p className={styles.quote}>&quot;{item.quote}&quot;</p>
                <footer className={styles.person}>
                  <span className={styles.avatar}>
                    <Image
                      src={`/customers/testimonials/${item.avatarFile}`}
                      alt={`${item.person} portratt`}
                      width={40}
                      height={40}
                      loading="lazy"
                    />
                  </span>
                  <span>
                    <strong>{item.person}</strong>
                    <small>{item.role}</small>
                  </span>
                </footer>
              </article>
            );
          })}
        </div>

        <div className={styles.controls} aria-label={HOME_PAGE_TEXT.customers.controlsAria}>
          <button type="button" onClick={goPrev} className={styles.controlBtn} aria-label={HOME_PAGE_TEXT.customers.prevAria}>
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" onClick={goNext} className={styles.controlBtn} aria-label={HOME_PAGE_TEXT.customers.nextAria}>
            <span aria-hidden="true">›</span>
          </button>
        </div>

        <div className={styles.trustedTicker} aria-label={HOME_PAGE_TEXT.customers.trustedAria}>
          <p className={styles.trustedLabel}>{HOME_PAGE_TEXT.customers.tickerLabel}</p>
          <div className={styles.tickerViewport}>
            <div className={styles.tickerTrack}>
              {tickerLogos.map((logo, index) => (
                <span key={`${logo.file}-${index}`} className={styles.tickerItem}>
                  <Image
                    className={`${styles.tickerLogo} ${logo.name === "Showcase" ? styles.logoSoft : ""} ${TICKER_LOGO_CLASS_BY_NAME[logo.name] ?? ""}`}
                    src={`/customers/logos/${logo.file}`}
                    alt={`${logo.name} logo`}
                    width={160}
                    height={42}
                    loading="eager"
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
