"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./HowItWorks.module.scss";

const STEPS = [
  {
    id: "01",
    title: "Kostnadsfri konsultation",
    body:
      "Kontakta oss för ett inledande samtal där vi går igenom ditt företags behov och mål. Under konsultationen visar vi hur vår lösning kan stötta din verksamhet och ger en offert baserad på dina specifika krav.",
  },
  {
    id: "02",
    title: "Integrering och förberedelser",
    body:
      "Vi hjälper dig att ge oss åtkomst till ditt ekonomisystem, bankkonton och historiska data. Vi ser också till att alla lagstadgade krav uppfylls.",
  },
  {
    id: "03",
    title: "Implementering och onboarding",
    body:
      "När integrationen är klar påbörjar vi arbetet med att automatisera och effektivisera dina ekonomiprocesser. Du får en dedikerad kontaktperson och utbildning i våra dashboards.",
  },
] as const;

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [inView, setInView] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [particleProgress, setParticleProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible((prev) => prev || entry.isIntersecting);
        setInView(entry.isIntersecting);
      },
      { threshold: 0.24, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    if (!inView) {
      setActiveStep(null);
      return;
    }

    const STEP_POINTS = [0.152, 0.5, 0.848];
    const HIT_THRESHOLD = 0.065;
    const LOOP_MS = 7600;
    const start = performance.now();

    const timer = window.setInterval(() => {
      const elapsed = (performance.now() - start) % LOOP_MS;
      const progress = elapsed / LOOP_MS;
      setParticleProgress(progress);

      let hitIndex: number | null = null;
      let bestDelta = Number.POSITIVE_INFINITY;
      STEP_POINTS.forEach((point, index) => {
        const delta = Math.abs(progress - point);
        if (delta < HIT_THRESHOLD && delta < bestDelta) {
          bestDelta = delta;
          hitIndex = index;
        }
      });
      setActiveStep(hitIndex);
    }, 32);

    return () => window.clearInterval(timer);
  }, [inView]);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className={`${styles.section} ${visible ? styles.visible : ""}`}
    >
      <div className={styles.container}>
        <h2>Så här fungerar det</h2>

        <div className={styles.timeline}>
          <span className={styles.track} aria-hidden="true" />
          <span
            className={styles.particle}
            aria-hidden="true"
            style={{ left: `${particleProgress * 100}%` }}
          />

          {STEPS.map((step, index) => (
            <article
              key={step.id}
              className={`${styles.step} ${activeStep === index ? styles.stepActive : ""}`}
              onMouseEnter={() => setActiveStep(index)}
            >
              <div className={styles.dotShell}>
                <span className={styles.dot}>{step.id}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>

        <a href="#hero" className={styles.cta}>
          Kontakta oss för en offert <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
