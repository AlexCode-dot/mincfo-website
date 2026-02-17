"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { homeContent } from "@/content/homeContent";
import styles from "./Customers.module.scss";

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

export default function Customers() {
  const content = homeContent.customers;
  const testimonials = content.testimonials;
  const trustedLogos = content.trustedLogos;
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
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 4600);
    return () => clearInterval(id);
  }, [visible, reduceMotion, testimonials.length]);

  const prevIndex = (activeIndex - 1 + testimonials.length) % testimonials.length;
  const nextIndex = (activeIndex + 1) % testimonials.length;
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
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };
  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
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
          <span className={styles.pill}>{content.pill}</span>
          <h2>{content.title}</h2>
          <p>{content.description}</p>
        </header>

        <div className={styles.cardsShell}>
          {testimonials.map((item, index) => {
            let positionClass = styles.hiddenCard;
            if (index === activeIndex) positionClass = styles.centerCard;
            else if (index === prevIndex) positionClass = styles.leftCard;
            else if (index === nextIndex) positionClass = styles.rightCard;

            return (
              <article
                key={`${item.company}-${item.person}`}
                data-card-index={index}
                className={`${styles.card} ${item.accent ? styles.cardAccent : ""} ${positionClass}`}
              >
                <p className={styles.company}>{item.company}</p>
                <p className={styles.quote}>&ldquo;{item.quote}&rdquo;</p>
                <footer className={styles.person}>
                  <span className={styles.avatar}>
                    <Image
                      src={`/customers/testimonials/${item.avatarFile}`}
                      alt={`${item.person} ${content.avatarAltSuffix}`}
                      width={40}
                      height={40}
                      className={styles.avatarImage}
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

        <div className={styles.controls} aria-label={content.carouselAriaLabel}>
          <button type="button" onClick={goPrev} className={styles.controlBtn} aria-label={content.previousAriaLabel}>
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" onClick={goNext} className={styles.controlBtn} aria-label={content.nextAriaLabel}>
            <span aria-hidden="true">›</span>
          </button>
        </div>

        <div className={styles.trustedTicker} aria-label={content.trustedAriaLabel}>
          <p className={styles.trustedLabel}>{content.trustedLabel}</p>
          <div className={styles.tickerViewport}>
            <div className={styles.tickerTrack}>
              {trustedLogos.map((logo, index) => (
                <span key={`a-${logo.file}-${index}`} className={styles.tickerItem}>
                  <Image
                    className={styles.tickerLogo}
                    src={`/customers/logos/${logo.file}`}
                    alt={`${logo.name} ${content.logoAltSuffix}`}
                    width={132}
                    height={42}
                    loading="lazy"
                  />
                </span>
              ))}
              {trustedLogos.map((logo, index) => (
                <span key={`b-${logo.file}-${index}`} className={styles.tickerItem}>
                  <Image
                    className={styles.tickerLogo}
                    src={`/customers/logos/${logo.file}`}
                    alt={`${logo.name} ${content.logoAltSuffix}`}
                    width={132}
                    height={42}
                    loading="lazy"
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
