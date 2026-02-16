"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import styles from "./BeamBackground.module.scss";

// Tweak knobs: dotSpacing, waveAmplitude, waveSpeed, gradientHeight, dotAlpha, startYRatio, particleCount.
const DOT_SPACING = 7;
const WAVE_AMPLITUDE = 38;
const WAVE_SPEED = 0.62;
const GRADIENT_HEIGHT = 0.9;
const DOT_ALPHA = 0.8;
const START_Y_RATIO = 0.06;
const PARTICLE_COUNT = 220;

type Dot = {
  x: number;
  y: number;
  phase: number;
};

type Particle = {
  x: number;
  y: number;
  vy: number;
  alpha: number;
  size: number;
  drift: number;
};

type BeamBackgroundProps = {
  className?: string;
  extendBottom?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
const fract = (value: number) => value - Math.floor(value);

export default function BeamBackground({
  className,
  extendBottom = 0,
}: BeamBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const reduceMotionRef = useRef(false);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
  const runningRef = useRef(true);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setupDots = () => {
      const { width, height, dpr } = sizeRef.current;
      const spacing = clamp(DOT_SPACING * dpr, 6, 12);
      const dots: Dot[] = [];

      const startY = height * START_Y_RATIO;
      for (let y = startY; y <= height + spacing; y += spacing) {
        for (let x = -spacing; x <= width + spacing; x += spacing) {
          dots.push({ x, y, phase: Math.random() * Math.PI * 2 });
        }
      }

      dotsRef.current = dots;
    };

    const setupParticles = () => {
      const { width, height } = sizeRef.current;
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }).map(() => ({
        x: Math.random() * width,
        y: height * (0.55 + Math.random() * 0.4),
        vy: 0.08 + Math.random() * 0.22,
        alpha: 0.08 + Math.random() * 0.1,
        size: 0.5 + Math.random() * 0.9,
        drift: (Math.random() - 0.5) * 0.16,
      }));
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = { width: rect.width, height: rect.height, dpr };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      setupDots();
      setupParticles();
    };

    const drawDots = (t: number) => {
      const { width, height, dpr } = sizeRef.current;
      const spacing = clamp(DOT_SPACING * dpr, 6, 12);
      const activeHeight = Math.max(height - extendBottom, height * 0.62);
      const tailZone = Math.max(extendBottom + 40, height * 0.14);
      const tailStart = activeHeight - Math.max(28, extendBottom * 0.12);

      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(
        0,
        activeHeight * (1 - GRADIENT_HEIGHT),
        0,
        height
      );
      gradient.addColorStop(0, "rgba(20, 24, 32, 0)");
      gradient.addColorStop(0.56, "rgba(83, 90, 255, 0.44)");
      gradient.addColorStop(0.82, "rgba(83, 90, 255, 0.12)");
      gradient.addColorStop(1, "rgba(83, 90, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, height * (1 - GRADIENT_HEIGHT), width, height * GRADIENT_HEIGHT);

      ctx.fillStyle = `rgba(120, 130, 255, ${DOT_ALPHA})`;

      for (const dot of dotsRef.current) {
        const wave =
          Math.sin(dot.x * 0.018 + t * WAVE_SPEED + dot.phase) *
          (WAVE_AMPLITUDE * 0.35);
        const wave2 =
          Math.sin(dot.x * 0.006 - t * WAVE_SPEED * 0.6 + dot.phase * 0.6) *
          (WAVE_AMPLITUDE * 0.25);
        const yPos = dot.y + wave + wave2;
        if (yPos < activeHeight * 0.08) continue;

        const fade = clamp((yPos - activeHeight * 0.06) / (activeHeight * 0.94), 0, 1);
        const edgeFalloff = clamp((height - yPos) / tailZone, 0, 1);
        if (edgeFalloff < 0.05) continue;
        const tailProgress = clamp((yPos - tailStart) / (height - tailStart), 0, 1);
        const tailAtten = 1 - tailProgress;
        const lowerProgress = clamp((yPos - height * 0.62) / (height * 0.38), 0, 1);
        const lowerAtten = 1 - lowerProgress;
        const density = clamp((tailAtten ** 1.12) * (lowerAtten ** 0.78), 0.32, 1);
        const noise = fract(Math.sin(dot.x * 12.9898 + dot.y * 78.233) * 43758.5453);
        if (noise > density) continue;
        const radius = clamp(
          (1 + fade * 1.4) *
          (0.42 + edgeFalloff * 0.28) *
          (0.5 + tailAtten * 0.5) *
          (0.58 + lowerAtten * 0.34),
          0.44,
          2.2,
        );

        ctx.globalAlpha = DOT_ALPHA * fade * edgeFalloff * tailAtten * (0.62 + lowerAtten * 0.38);
        ctx.beginPath();
        ctx.arc(dot.x, yPos, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "rgba(162, 181, 255, 0.58)";
      for (const particle of particlesRef.current) {
        const visibility = clamp(
          (particle.y - activeHeight * 0.45) / (activeHeight * 0.28),
          0,
          1,
        );
        const edgeFalloff = clamp((height - particle.y) / tailZone, 0, 1);
        if (edgeFalloff < 0.06) continue;
        const tailProgress = clamp(
          (particle.y - tailStart) / (height - tailStart),
          0,
          1,
        );
        const tailAtten = 1 - tailProgress;
        const lowerProgress = clamp(
          (particle.y - height * 0.62) / (height * 0.38),
          0,
          1,
        );
        const lowerAtten = 1 - lowerProgress;
        const density = clamp((tailAtten ** 1.06) * (lowerAtten ** 0.72), 0.34, 1);
        const noise = fract(
          Math.sin(particle.x * 12.9898 + particle.y * 78.233) * 43758.5453,
        );
        if (noise > density) continue;
        const renderedSize =
          particle.size *
          (0.42 + edgeFalloff * 0.28) *
          (0.52 + tailAtten * 0.4) *
          (0.64 + lowerAtten * 0.3);
        ctx.globalAlpha =
          particle.alpha * visibility * edgeFalloff * tailAtten * (0.62 + lowerAtten * 0.38);
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, renderedSize, 0, Math.PI * 2);
        ctx.fill();
        particle.y -= particle.vy;
        particle.x += particle.drift;
        if (particle.y < activeHeight * 0.12) {
          particle.y = activeHeight * (0.5 + Math.random() * 0.22);
          particle.x = Math.random() * width;
          particle.alpha = 0.08 + Math.random() * 0.1;
          particle.size = 0.5 + Math.random() * 0.9;
          particle.drift = (Math.random() - 0.5) * 0.16;
        }
      }
      ctx.restore();
      ctx.globalAlpha = 1;

      // Keep the transition clean: no extra post-process blur/mask band.
    };

    const render = () => {
      timeRef.current += 0.016;
      drawDots(timeRef.current);
    };

    const loop = () => {
      render();
      if (!runningRef.current) return;
      rafRef.current = window.requestAnimationFrame(loop);
    };

    const handleVisibility = () => {
      runningRef.current = document.visibilityState === "visible";
      if (!runningRef.current && rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (runningRef.current && !reduceMotionRef.current) {
        rafRef.current = window.requestAnimationFrame(loop);
      }
    };

    const observer = new ResizeObserver(() => resize());
    observer.observe(canvas.parentElement ?? canvas);
    resize();

    if (reduceMotionRef.current) {
      render();
    } else {
      rafRef.current = window.requestAnimationFrame(loop);
    }

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const wrapperStyle: CSSProperties =
    extendBottom > 0 ? { bottom: `-${extendBottom}px` } : {};

  return (
    <div
      className={[styles.wrapper, className].filter(Boolean).join(" ")}
      style={wrapperStyle}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.vignette} />
    </div>
  );
}
