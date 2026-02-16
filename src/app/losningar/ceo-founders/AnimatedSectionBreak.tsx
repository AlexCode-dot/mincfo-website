"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./page.module.scss";

type BreakVariant = "rise" | "dip" | "soft";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
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

const VARIANT_SETTINGS: Record<BreakVariant, { sideEnd: number; centerEnd: number }> = {
  dip: { sideEnd: 90, centerEnd: 20 },
  rise: { sideEnd: 6, centerEnd: 86 },
  soft: { sideEnd: 42, centerEnd: 46 },
};

export default function AnimatedSectionBreak({ variant }: { variant: BreakVariant }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [curveProgress, setCurveProgress] = useState(0);
  const { sideEnd, centerEnd } = VARIANT_SETTINGS[variant];

  useEffect(() => {
    const updateCurve = () => {
      const node = rootRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight;
      const start = viewport * 1.08;
      const end = viewport * 0.46;
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

  const sideY = lerp(1, sideEnd, curveProgress);
  const centerY = lerp(1, centerEnd, curveProgress);
  const curvePath = `M0 ${sideY} C280 ${sideY} 480 ${centerY} 720 ${centerY} C960 ${centerY} 1160 ${sideY} 1440 ${sideY}`;
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
  const curveClip = `polygon(${curvePoints.join(", ")}, 100% 100%, 0% 100%)`;

  return (
    <div
      ref={rootRef}
      className={`${styles.animatedBreak} ${styles[`animatedBreak${variant[0].toUpperCase()}${variant.slice(1)}`]}`}
      aria-hidden="true"
    >
      <svg className={styles.animatedBreakCurve} viewBox="0 0 1440 190" preserveAspectRatio="none">
        <path d={curvePath} />
      </svg>
      <div
        className={styles.animatedBreakBackground}
        style={{ clipPath: curveClip, WebkitClipPath: curveClip } as CSSProperties}
      />
    </div>
  );
}
