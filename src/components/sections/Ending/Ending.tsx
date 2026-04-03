"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useHomeOffering } from "@/components/home/HomeOfferingProvider";
import ContactLink from "@/components/system/ContactLink";
import styles from "./Ending.module.scss";

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

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

export default function Ending() {
  const { content } = useHomeOffering();
  const sectionRef = useRef<HTMLElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const svgPathRef = useRef<SVGPathElement | null>(null);
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
      { threshold: 0.28, rootMargin: "0px 0px -16% 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const applyCurve = (progress: number) => {
      const sideY = lerp(1, 13, progress);
      const centerY = lerp(1, 104, progress);
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
      const start = window.innerHeight * 1.1;
      const end = window.innerHeight * 0.46;
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
      className={`${styles.section} ${visible ? styles.visible : ""}`}
      id="kontakt"
    >
      <svg
        className={styles.curveCut}
        viewBox="0 0 1440 190"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path ref={svgPathRef} d="M0 1 C280 1 480 1 720 1 C960 1 1160 1 1440 1" />
      </svg>
      <div
        ref={backgroundRef}
        className={styles.background}
        aria-hidden="true"
      />

      <div className={styles.container}>
        <div className={styles.ctaPanel}>
          <h2>{content.ending.title}</h2>
          <p>{content.ending.body}</p>
          <ContactLink href="/contact" className={styles.primaryCta} returnPath="/" returnSectionId="kontakt">
            {content.ending.primaryCta} <ChevronRight aria-hidden="true" className={styles.ctaIcon} />
          </ContactLink>
        </div>
      </div>
    </section>
  );
}
