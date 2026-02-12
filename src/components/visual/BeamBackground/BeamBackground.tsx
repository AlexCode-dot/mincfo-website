"use client";

import { useEffect, useRef } from "react";
import styles from "./BeamBackground.module.scss";

// Tweak knobs: dotSpacing, waveAmplitude, waveSpeed, gradientHeight, dotAlpha, startYRatio, particleCount.
const DOT_SPACING = 8;
const WAVE_AMPLITUDE = 28;
const WAVE_SPEED = 0.45;
const GRADIENT_HEIGHT = 0.78;
const DOT_ALPHA = 0.75;
const START_Y_RATIO = 0.22;
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

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function BeamBackground() {
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
        alpha: 0.12 + Math.random() * 0.18,
        size: 0.8 + Math.random() * 1.6,
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
      const waveAmplitude = WAVE_AMPLITUDE;
      const waveSpeed = WAVE_SPEED;

      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(
        0,
        height * (1 - GRADIENT_HEIGHT),
        0,
        height
      );
      gradient.addColorStop(0, "rgba(20, 24, 32, 0)");
      gradient.addColorStop(0.65, "rgba(83, 90, 255, 0.65)");
      gradient.addColorStop(1, "rgba(83, 90, 255, 0.95)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, height * (1 - GRADIENT_HEIGHT), width, height * GRADIENT_HEIGHT);

      ctx.fillStyle = `rgba(120, 130, 255, ${DOT_ALPHA})`;

      for (const dot of dotsRef.current) {
        const wave =
          Math.sin(dot.x * 0.018 + t * waveSpeed + dot.phase) *
          (waveAmplitude * 0.35);
        const wave2 =
          Math.sin(dot.x * 0.006 - t * waveSpeed * 0.6 + dot.phase * 0.6) *
          (waveAmplitude * 0.25);
        const offsetY = wave + wave2;

        const yPos = dot.y + offsetY;
        if (yPos < height * 0.22) continue;

        const fade = clamp((yPos - height * 0.2) / (height * 0.8), 0, 1);
        const radius = clamp(1 + fade * 1.4, 1, 2.2);

        ctx.globalAlpha = DOT_ALPHA * fade;
        ctx.beginPath();
        ctx.arc(dot.x, yPos, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      // floating particles drifting upward from the blended field
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "rgba(170, 195, 255, 0.55)";
      for (const particle of particlesRef.current) {
        const visibility = clamp((particle.y - height * 0.45) / (height * 0.28), 0, 1);
        ctx.globalAlpha = particle.alpha * visibility;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        particle.y -= particle.vy;
        particle.x += particle.drift;
        if (particle.y < height * 0.12) {
          particle.y = height * (0.5 + Math.random() * 0.22);
          particle.x = Math.random() * width;
          particle.alpha = 0.12 + Math.random() * 0.18;
          particle.size = 0.8 + Math.random() * 1.6;
          particle.drift = (Math.random() - 0.5) * 0.16;
        }
      }
      ctx.restore();
      ctx.globalAlpha = 1;

      // faint shimmer noise pass
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = "rgba(160, 170, 255, 0.02)";
      for (let i = 0; i < width; i += spacing * 2) {
        ctx.fillRect(i, height * 0.52, spacing * 0.5, height * 0.48);
      }
      ctx.restore();
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

  return (
    <div className={styles.wrapper} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.vignette} />
    </div>
  );
}
