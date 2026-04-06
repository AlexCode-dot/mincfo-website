"use client";

import { useEffect, useRef, useState } from "react";
import { Database, Loader2, Lock } from "lucide-react";
import { useOptionalHomeOffering } from "@/components/home/HomeOfferingProvider";
import { HOME_PAGE_TEXT } from "@/content/homePageText";
import styles from "./Security.module.scss";

const cubic = (p0: number, p1: number, p2: number, p3: number, t: number) =>
  (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

export default function Security() {
  const ctx = useOptionalHomeOffering();
  const security = ctx?.shared.security ?? HOME_PAGE_TEXT.security;
  const sectionRef = useRef<HTMLElement | null>(null);
  const svgPathRef = useRef<SVGPathElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const curveFrameRef = useRef(0);
  const lastCurveRef = useRef(-1);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.34, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const applyCurve = (progress: number) => {
      const sideY = lerp(1, 104, progress);
      const centerY = lerp(1, 13, progress);
      const path = svgPathRef.current;
      if (path) {
        path.setAttribute("d", `M0 ${sideY} C280 ${sideY} 480 ${centerY} 720 ${centerY} C960 ${centerY} 1160 ${sideY} 1440 ${sideY}`);
      }
      const points: string[] = [];
      for (let i = 0; i <= 18; i += 1) {
        const t = i / 18;
        const x = cubic(0, 280, 480, 720, t);
        const y = cubic(sideY, sideY, centerY, centerY, t);
        points.push(`${(x / 1440) * 100}% ${y}px`);
      }
      for (let i = 1; i <= 18; i += 1) {
        const t = i / 18;
        const x = cubic(720, 960, 1160, 1440, t);
        const y = cubic(centerY, centerY, sideY, sideY, t);
        points.push(`${(x / 1440) * 100}% ${y}px`);
      }
      const clip = `polygon(${points.join(", ")}, 100% 100%, 0% 100%)`;
      const bg = backgroundRef.current;
      if (bg) {
        bg.style.clipPath = clip;
        (bg.style as unknown as Record<string, string>).WebkitClipPath = clip;
      }
    };

    const updateCurve = () => {
      curveFrameRef.current = 0;
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const start = window.innerHeight * 1.0;
      const end = window.innerHeight * 0.42;
      const progress = clamp((start - rect.top) / (start - end), 0, 1);
      if (progress !== lastCurveRef.current) {
        lastCurveRef.current = progress;
        applyCurve(progress);
      }
    };

    const scheduleCurve = () => {
      if (curveFrameRef.current) return;
      curveFrameRef.current = window.requestAnimationFrame(updateCurve);
    };

    scheduleCurve();
    window.addEventListener("scroll", scheduleCurve, { passive: true });
    window.addEventListener("resize", scheduleCurve);
    return () => {
      if (curveFrameRef.current) window.cancelAnimationFrame(curveFrameRef.current);
      window.removeEventListener("scroll", scheduleCurve);
      window.removeEventListener("resize", scheduleCurve);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="security"
      className={`${styles.section} ${visible ? styles.visible : ""}`}
    >
      <svg
        className={styles.curveCut}
        viewBox="0 0 1440 190"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path ref={svgPathRef} d="M0 1 C280 1 480 1 720 1 C960 1 1160 1 1440 1" />
      </svg>
      <div ref={backgroundRef} className={styles.background} aria-hidden="true" />

      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.pill}>{security.pill}</span>
          <h2>{security.title}</h2>
          <p>{security.intro}</p>
        </header>

        <div className={styles.grid}>
          <article className={styles.card}>
            <div className={`${styles.visual} ${styles.visualShield}`}>
              <span className={styles.visualHalo} aria-hidden="true" />
              <svg
                className={styles.shieldStack}
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  className={styles.shieldOuter}
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                />
                <path
                  className={styles.shieldMid}
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                />
                <path
                  className={styles.shieldMain}
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                />
              </svg>
              <Lock className={styles.visualIcon} size={24} aria-hidden="true" />
            </div>
            <h3>{security.cards[0].title}</h3>
            <p>{security.cards[0].body}</p>
          </article>

          <article className={styles.card}>
            <div className={`${styles.visual} ${styles.visualFlow}`}>
              <span className={styles.visualHalo} aria-hidden="true" />
              <span className={styles.flowNodeLeft} aria-hidden="true">
                <Database className={styles.flowNodeIcon} size={12} />
              </span>
              <span className={styles.flowNodeRight} aria-hidden="true">
                <Database className={styles.flowNodeIcon} size={12} />
              </span>
              <span className={styles.flowLinkLeft} aria-hidden="true" />
              <span className={styles.flowLinkRight} aria-hidden="true" />
              <Loader2
                className={`${styles.visualIcon} ${styles.flowCoreIcon}`}
                size={24}
                aria-hidden="true"
              />
            </div>
            <h3>{security.cards[1].title}</h3>
            <p>{security.cards[1].body}</p>
          </article>

          <article className={styles.card}>
            <div className={`${styles.visual} ${styles.visualCore}`}>
              <span className={styles.visualHalo} aria-hidden="true" />
              <span className={styles.coreRing} aria-hidden="true" />
              <svg
                className={`${styles.visualIcon} ${styles.complianceIcon}`}
                viewBox="0 0 64 64"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  className={styles.complianceDocument}
                  d="M20 14h20l8 8v28H20z"
                />
                <path
                  className={styles.complianceFold}
                  d="M40 14v10h8"
                />
                <path
                  className={styles.complianceLine}
                  d="M26 28h16"
                />
                <path
                  className={styles.complianceLine}
                  d="M26 35h16"
                />
                <path
                  className={styles.complianceLine}
                  d="M26 42h11"
                />
                <circle
                  className={styles.complianceBadge}
                  cx="44"
                  cy="40"
                  r="10"
                />
                <path
                  className={styles.complianceCheck}
                  d="m39.5 40 3.2 3.2 6-7"
                />
              </svg>
            </div>
            <h3>{security.cards[2].title}</h3>
            <p>{security.cards[2].body}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
