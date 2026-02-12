"use client";

import { useEffect, useRef } from "react";
import styles from "./CanvasBeam.module.scss";

// Tweak knobs: beamRadius, dotSpacing, sharpness, glowStrength, baseBloom, intensityThreshold.

type RainStreak = {
  x: number;
  y: number;
  length: number;
  speed: number;
  alpha: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const hash = (x: number, y: number, t: number) => {
  const s = Math.sin(x * 12.9898 + y * 78.233 + t * 0.04) * 43758.5453;
  return s - Math.floor(s);
};

export default function CanvasBeam() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const rainRef = useRef<RainStreak[]>([]);
  const reduceMotionRef = useRef(false);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
  const runningRef = useRef(true);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setupRain = () => {
      const { width, height } = sizeRef.current;
      const count = clamp(Math.floor(width / 80), 10, 24);
      rainRef.current = Array.from({ length: count }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        length: 60 + Math.random() * 120,
        speed: 0.2 + Math.random() * 0.4,
        alpha: 0.02 + Math.random() * 0.035,
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
      setupRain();
    };

    const drawGlow = (beamRadius: number, glowStrength: number) => {
      const { width, height } = sizeRef.current;
      const center = width / 2;

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      const coreWidth = beamRadius * 0.4;
      const haloWidth = beamRadius * 1.4;

      const coreGradient = ctx.createLinearGradient(0, 0, 0, height);
      coreGradient.addColorStop(0, `rgba(110, 200, 255, ${0.08 * glowStrength})`);
      coreGradient.addColorStop(0.5, `rgba(110, 200, 255, ${0.2 * glowStrength})`);
      coreGradient.addColorStop(1, `rgba(110, 200, 255, ${0.06 * glowStrength})`);

      const haloGradient = ctx.createLinearGradient(0, 0, 0, height);
      haloGradient.addColorStop(0, `rgba(60, 140, 255, ${0.04 * glowStrength})`);
      haloGradient.addColorStop(0.5, `rgba(60, 140, 255, ${0.12 * glowStrength})`);
      haloGradient.addColorStop(1, `rgba(60, 140, 255, ${0.03 * glowStrength})`);

      ctx.fillStyle = haloGradient;
      ctx.fillRect(center - haloWidth / 2, 0, haloWidth, height);

      ctx.fillStyle = coreGradient;
      ctx.fillRect(center - coreWidth / 2, 0, coreWidth, height);

      ctx.restore();
    };

    const drawBeamDots = (t: number) => {
      const { width, height, dpr } = sizeRef.current;
      const center = width / 2;
      const beamRadius = clamp(width * 0.12, 70, 180);
      const dotSpacing = clamp(6 * dpr, 6, 10);
      const sharpness = 3.2;
      const glowStrength = 1;
      const baseBloom = 0.6;
      const intensityThreshold = 0.12;

      drawGlow(beamRadius, glowStrength);

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      const startX = center - beamRadius;
      const endX = center + beamRadius;

      for (let x = startX; x <= endX; x += dotSpacing) {
        const d = Math.abs(x - center) / beamRadius;
        const profile = Math.exp(-d * d * sharpness);
        if (profile < 0.02) continue;

        for (let y = 0; y <= height; y += dotSpacing) {
          const flow = Math.sin(y * 0.02 + t * 0.9) * 0.2;
          const shimmer = (hash(x, y, t) - 0.5) * 0.25;
          const base = smoothstep(height * 0.55, height * 0.95, y) * baseBloom;
          let intensity = profile + flow + shimmer + base;

          if (hash(x * 1.3, y * 1.7, t * 1.4) > 0.997) {
            intensity += 0.8;
          }

          intensity = clamp(intensity, 0, 1);
          if (intensity < intensityThreshold) continue;

          const radius = clamp(1 + intensity * 1.4, 1, 2.6);
          ctx.fillStyle = `rgba(150, 220, 255, ${intensity * 0.65})`;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    };

    const drawRain = () => {
      const { width, height } = sizeRef.current;
      ctx.save();
      ctx.strokeStyle = "rgba(120, 170, 255, 0.08)";
      ctx.lineWidth = 1;
      for (const streak of rainRef.current) {
        const distanceFromCenter = Math.abs(streak.x - width / 2);
        if (distanceFromCenter < width * 0.1) continue;
        ctx.globalAlpha = streak.alpha;
        ctx.beginPath();
        ctx.moveTo(streak.x, streak.y);
        ctx.lineTo(streak.x, streak.y + streak.length);
        ctx.stroke();
        streak.y += streak.speed;
        if (streak.y > height + streak.length) {
          streak.y = -streak.length;
          streak.x = Math.random() * width;
        }
      }
      ctx.restore();
    };

    const render = (t: number) => {
      const { width, height } = sizeRef.current;
      ctx.clearRect(0, 0, width, height);
      drawBeamDots(t);
      drawRain();
    };

    const loop = () => {
      frameRef.current += 1;
      render(frameRef.current * 0.016);
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
      render(0);
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

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
