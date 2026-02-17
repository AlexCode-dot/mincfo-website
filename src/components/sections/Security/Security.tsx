"use client";

import { useEffect, useRef, useState } from "react";
import { Database, Loader2, Lock } from "lucide-react";
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
      <div className={styles.background} aria-hidden="true" />

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
