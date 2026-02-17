"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { homeContent } from "@/content/homeContent";
import styles from "./HowItWorks.module.scss";

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

export default function HowItWorks() {
  const content = homeContent.howItWorks;
  const steps = content.steps;
  const sectionRef = useRef<HTMLElement | null>(null);
  const stepsGridRef = useRef<HTMLDivElement | null>(null);
  const stepCircleRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [visible, setVisible] = useState(false);
  const [inView, setInView] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [particleProgress, setParticleProgress] = useState(0);
  const [curveProgress, setCurveProgress] = useState(0);

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
    const updateCurve = () => {
      const section = sectionRef.current;
      if (!section) return;
      const sectionTop = section.offsetTop;
      const viewportBottom = window.scrollY + window.innerHeight;
      const earlyOffset = window.innerHeight * 0.95;
      const triggerStart = sectionTop - earlyOffset;
      const triggerRange = window.innerHeight * 0.72;
      const progress = clamp((viewportBottom - triggerStart) / triggerRange, 0, 1);
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
    if (typeof window === "undefined") return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionAllowed = !reducedMotion.matches;

    if (!inView || !motionAllowed) return;

    const LOOP_MS = 7600;
    const start = performance.now();
    let rafId = 0;
    let previousStep: number | null = null;
    let previousProgress = -1;
    let thresholds: number[] = [];

    const calculateThresholds = () => {
      const grid = stepsGridRef.current;
      if (!grid) return [];
      const gridRect = grid.getBoundingClientRect();
      if (!gridRect.width) return [];

      const travelStart = 0.018;
      const travelEnd = 0.982;
      const travelRange = travelEnd - travelStart;

      return stepCircleRefs.current.map((circle) => {
        if (!circle) return 1;
        const circleRect = circle.getBoundingClientRect();
        const centerRatio =
          (circleRect.left + circleRect.width / 2 - gridRect.left) / gridRect.width;
        return clamp((centerRatio - travelStart) / travelRange, 0, 1);
      });
    };

    const updateThresholds = () => {
      thresholds = calculateThresholds();
    };
    updateThresholds();
    window.addEventListener("resize", updateThresholds);

    const tick = () => {
      const elapsed = (performance.now() - start) % LOOP_MS;
      const progress = elapsed / LOOP_MS;

      if (Math.abs(progress - previousProgress) > 0.0025) {
        previousProgress = progress;
        setParticleProgress(progress);
      }

      let nextStep: number | null = null;
      thresholds.forEach((threshold, index) => {
        if (progress >= threshold) nextStep = index;
      });
      if (nextStep !== previousStep) {
        previousStep = nextStep;
        setActiveStep(nextStep);
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", updateThresholds);
      window.cancelAnimationFrame(rafId);
    };
  }, [inView]);

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
  const motionAllowed =
    typeof window !== "undefined" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const particleEnabled = inView && motionAllowed;
  const renderedParticleProgress = particleEnabled ? particleProgress : 0;
  const renderedActiveStep = particleEnabled ? activeStep : 0;

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className={`${styles.section} ${visible ? styles.visible : ""}`}
    >
      <svg
        className={styles.curveCut}
        viewBox={`0 0 1440 ${CUT_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path className={styles.curveLine} d={cutPath} />
      </svg>

      <div
        className={styles.background}
        aria-hidden="true"
        style={{ clipPath: cutClip, WebkitClipPath: cutClip } as CSSProperties}
      />

      <div className={styles.container}>
        <h2>{content.title}</h2>

        <div
          ref={stepsGridRef}
          className={`${styles.stepsGrid} ${particleEnabled ? styles.timelineRun : ""}`}
          style={{ "--particle-progress": renderedParticleProgress } as CSSProperties}
        >
          <div className={styles.line} aria-hidden="true" />
          <span className={styles.particle} aria-hidden="true" />

          {steps.map((step, index) => (
            <article
              key={step.id}
              className={`${styles.step} ${renderedActiveStep === index ? styles.stepActive : ""}`}
            >
              <div
                ref={(node) => {
                  stepCircleRefs.current[index] = node;
                }}
                className={styles.circle}
              >
                <span>{step.id}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>

        <a href="#hero" className={styles.cta}>
          {content.cta}
          <ChevronRight aria-hidden="true" className={styles.ctaIcon} />
        </a>
      </div>
    </section>
  );
}
