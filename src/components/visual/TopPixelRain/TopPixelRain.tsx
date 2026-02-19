"use client";

import { useEffect, useRef } from "react";
import styles from "./TopPixelRain.module.scss";

type Lane = {
  baseX: number;
  x: number;
  headY: number;
  speed: number;
  segmentLength: number;
  gap: number;
  size: number;
  drift: number;
  alpha: number;
  phase: number;
  phaseSpeed: number;
};

const CANVAS_HEIGHT_RATIO = 0.52;
const LANE_STEP = 6;
const LANE_FILL_DESKTOP = 0.76;
const LANE_FILL_MOBILE = 0.64;
const BASE_COLOR = "94, 106, 255";
const HIGHLIGHT_COLOR = "148, 166, 255";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const fract = (value: number) => value - Math.floor(value);

export default function TopPixelRain() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lanesRef = useRef<Lane[]>([]);
  const runningRef = useRef(true);
  const reduceMotionRef = useRef(false);
  const sizeRef = useRef({ width: 0, height: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resetLane = (lane: Lane, height: number, spawnAboveTop = false) => {
      lane.headY = spawnAboveTop
        ? -Math.random() * height * 0.55
        : Math.random() * height * 0.75;
      lane.speed = 0.22 + Math.random() * 0.5;
      lane.segmentLength = 16 + Math.floor(Math.random() * 34);
      lane.gap = 2 + Math.random() * 2.2;
      lane.size = Math.random() > 0.82 ? 2 : 1;
      lane.drift = (Math.random() - 0.5) * 0.05;
      lane.alpha = 0.16 + Math.random() * 0.3;
      lane.phase = Math.random() * Math.PI * 2;
      lane.phaseSpeed = 0.012 + Math.random() * 0.028;
      lane.x = lane.baseX;
    };

    const createLanes = () => {
      const { width, height } = sizeRef.current;
      const isMobile = window.matchMedia("(max-width: 700px)").matches;
      const fillRate = isMobile ? LANE_FILL_MOBILE : LANE_FILL_DESKTOP;
      const laneCount = Math.max(24, Math.floor(width / LANE_STEP));
      const lanes: Lane[] = [];

      for (let i = 0; i < laneCount; i += 1) {
        if (Math.random() > fillRate) continue;

        const baseX = i * LANE_STEP + (Math.random() - 0.5) * 1.4;
        const lane: Lane = {
          baseX,
          x: baseX,
          headY: 0,
          speed: 0.3,
          segmentLength: 22,
          gap: 3,
          size: 1,
          drift: 0,
          alpha: 0.22,
          phase: 0,
          phaseSpeed: 0.02,
        };
        resetLane(lane, height);
        lanes.push(lane);
      }

      lanesRef.current = lanes;
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const height = rect.height * CANVAS_HEIGHT_RATIO;

      sizeRef.current = { width: rect.width, height };
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      createLanes();
    };

    const drawLane = (lane: Lane, width: number, height: number, t: number) => {
      lane.phase += lane.phaseSpeed;

      const headX = lane.baseX + Math.sin(lane.phase * 0.9) * 0.6;
      const headY = lane.headY;
      const progress = clamp(1 - headY / (height * 1.08), 0, 1);

      const headAlpha = clamp(lane.alpha * (0.55 + progress * 0.75), 0.08, 0.52);
      ctx.fillStyle = `rgba(${HIGHLIGHT_COLOR}, ${headAlpha})`;
      ctx.fillRect(headX, headY, lane.size + 1, lane.size + 1);

      for (let step = 0; step < lane.segmentLength; step += 1) {
        const y = headY - step * lane.gap;
        if (y < -6) break;
        if (y > height + 2) continue;

        const verticalAtten = clamp(1 - y / (height * 1.04), 0.22, 1);
        const segmentFade = 1 - step / (lane.segmentLength + 2);
        const flicker = 0.72 + 0.28 * Math.sin(lane.phase + step * 0.4 + t * 0.003);

        const noise = fract(
          Math.sin((step + 1) * 12.9898 + headX * 0.117 + t * 0.0024) *
            43758.5453,
        );
        if (noise > 0.84) continue;

        const alpha = clamp(
          lane.alpha * verticalAtten * segmentFade * flicker,
          0.07,
          0.46,
        );
        const color = noise < 0.09 ? HIGHLIGHT_COLOR : BASE_COLOR;
        const xOffset = Math.sin(step * 0.48 + lane.phase) * 0.16;

        ctx.fillStyle = `rgba(${color}, ${alpha})`;
        ctx.fillRect(headX + xOffset, y, lane.size, lane.size);
      }

      if (reduceMotionRef.current) return;

      lane.headY += lane.speed;
      lane.x += lane.drift;

      if (lane.headY - lane.segmentLength * lane.gap > height + 10) {
        resetLane(lane, height, true);
      }

      if (lane.x < -8 || lane.x > width + 8) {
        lane.baseX = clamp(lane.baseX, 0, width);
        lane.x = lane.baseX;
      }
    };

    const drawFrame = () => {
      const { width, height } = sizeRef.current;
      ctx.clearRect(0, 0, width, height);

      const topShade = ctx.createLinearGradient(0, 0, 0, height);
      topShade.addColorStop(0, "rgba(2, 6, 18, 0.44)");
      topShade.addColorStop(0.18, "rgba(2, 6, 18, 0.2)");
      topShade.addColorStop(0.44, "rgba(2, 6, 18, 0.06)");
      topShade.addColorStop(1, "rgba(2, 6, 18, 0)");
      ctx.fillStyle = topShade;
      ctx.fillRect(0, 0, width, height);

      const glow = ctx.createLinearGradient(0, 0, 0, height);
      glow.addColorStop(0, "rgba(94, 106, 255, 0.16)");
      glow.addColorStop(0.32, "rgba(94, 106, 255, 0.09)");
      glow.addColorStop(1, "rgba(94, 106, 255, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      const t = timeRef.current;
      for (const lane of lanesRef.current) {
        drawLane(lane, width, height, t);
      }
    };

    const loop = () => {
      timeRef.current += 16;
      drawFrame();
      if (!runningRef.current) return;
      rafRef.current = window.requestAnimationFrame(loop);
    };

    const handleVisibility = () => {
      runningRef.current = document.visibilityState === "visible";

      if (!runningRef.current && rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        return;
      }

      if (runningRef.current && !reduceMotionRef.current && !rafRef.current) {
        rafRef.current = window.requestAnimationFrame(loop);
      }
    };

    const observer = new ResizeObserver(() => resize());
    observer.observe(canvas.parentElement ?? canvas);

    resize();

    if (reduceMotionRef.current) {
      drawFrame();
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
    </div>
  );
}
