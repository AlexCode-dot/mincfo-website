"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Database, Loader2, Lock } from "lucide-react";
import styles from "./Security.module.scss";

const CUT_HEIGHT = 170;
const CUT_SIDE_Y = 78;
const CUT_CENTER_Y = 14;
const CUT_PATH = `M0 ${CUT_SIDE_Y} C280 ${CUT_SIDE_Y} 480 ${CUT_CENTER_Y} 720 ${CUT_CENTER_Y} C960 ${CUT_CENTER_Y} 1160 ${CUT_SIDE_Y} 1440 ${CUT_SIDE_Y}`;
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

const curvePoints: string[] = [];
for (let i = 0; i <= 18; i += 1) {
  const t = i / 18;
  const x = cubic(0, 280, 480, 720, t);
  const y = cubic(CUT_SIDE_Y, CUT_SIDE_Y, CUT_CENTER_Y, CUT_CENTER_Y, t);
  curvePoints.push(`${(x / 1440) * 100}% ${y}px`);
}
for (let i = 1; i <= 18; i += 1) {
  const t = i / 18;
  const x = cubic(720, 960, 1160, 1440, t);
  const y = cubic(CUT_CENTER_Y, CUT_CENTER_Y, CUT_SIDE_Y, CUT_SIDE_Y, t);
  curvePoints.push(`${(x / 1440) * 100}% ${y}px`);
}
const CUT_CLIP = `polygon(${curvePoints.join(", ")}, 100% 100%, 0% 100%)`;

export default function Security() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible((prev) => prev || entry.isIntersecting);
      },
      { threshold: 0.34, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="security"
      className={`${styles.section} ${visible ? styles.visible : ""}`}
    >
      <svg
        className={styles.curveCut}
        viewBox={`0 0 1440 ${CUT_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={CUT_PATH} />
      </svg>

      <div
        className={styles.background}
        aria-hidden="true"
        style={{ clipPath: CUT_CLIP, WebkitClipPath: CUT_CLIP } as CSSProperties}
      />

      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.pill}>Säkerhet &amp; Compliance</span>
          <h2>Enterprise-grade säkerhet</h2>
          <p>
            Vi hanterar känslig finansiell data med högsta krav på säkerhet,
            integritet och efterlevnad.
          </p>
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
            <h3>Dataskydd &amp; integritet</h3>
            <p>
              MinCFO hanterar all kunddata konfidentiellt och i enlighet med
              gällande dataskyddslagstiftning. Åtkomst är strikt begränsad och
              loggas kontinuerligt.
            </p>
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
            <h3>Säker infrastruktur</h3>
            <p>
              Systemen är byggda med moderna säkerhetsprinciper och skyddas
              genom kryptering, övervakning och regelbundna säkerhetskontroller.
            </p>
          </article>

          <article className={styles.card}>
            <div className={`${styles.visual} ${styles.visualCore}`}>
              <span className={styles.visualHalo} aria-hidden="true" />
              <span className={styles.coreRing} aria-hidden="true" />
              <Database className={styles.visualIcon} size={24} aria-hidden="true" />
            </div>
            <h3>EU &amp; GDPR-efterlevnad</h3>
            <p>
              All behandling av person- och företagsdata sker i enlighet med
              GDPR. Data hanteras inom EU och enligt tydliga
              personuppgiftsbiträdesavtal.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
