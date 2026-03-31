"use client";

import { useEffect, useRef, useState } from "react";
import { Database, Loader2, Lock } from "lucide-react";
import { HOME_PAGE_TEXT } from "@/content/homePageText";
import styles from "./Security.module.scss";

export default function Security() {
  const sectionRef = useRef<HTMLElement | null>(null);
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
        <path d="M0 104 C280 104 480 13 720 13 C960 13 1160 104 1440 104" />
      </svg>
      <div className={styles.background} aria-hidden="true" />

      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.pill}>{HOME_PAGE_TEXT.security.pill}</span>
          <h2>{HOME_PAGE_TEXT.security.title}</h2>
          <p>{HOME_PAGE_TEXT.security.intro}</p>
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
            <h3>{HOME_PAGE_TEXT.security.cards[0].title}</h3>
            <p>{HOME_PAGE_TEXT.security.cards[0].body}</p>
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
            <h3>{HOME_PAGE_TEXT.security.cards[1].title}</h3>
            <p>{HOME_PAGE_TEXT.security.cards[1].body}</p>
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
            <h3>{HOME_PAGE_TEXT.security.cards[2].title}</h3>
            <p>{HOME_PAGE_TEXT.security.cards[2].body}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
