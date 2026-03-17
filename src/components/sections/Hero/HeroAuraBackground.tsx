"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "@/components/system/MotionProvider";
import styles from "./HeroAuraBackground.module.scss";

const AURA_VIDEO_SRC = "/videos/beam_full_no_border_remix%20(1).mp4";
const AURA_LOOP_TRIM_END_SECONDS = 1;
const AURA_LOOP_RESTART_AT_SECONDS = 0.04;

export default function HeroAuraBackground() {
  const { isReducedMotion } = useMotion();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const loopEndRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || isReducedMotion) return;

    const updateLoopEnd = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      loopEndRef.current = Math.max(
        video.duration - AURA_LOOP_TRIM_END_SECONDS,
        AURA_LOOP_RESTART_AT_SECONDS,
      );
    };

    const handleTimeUpdate = () => {
      const loopEnd = loopEndRef.current;
      if (!loopEnd) return;
      if (video.currentTime >= loopEnd) {
        video.currentTime = AURA_LOOP_RESTART_AT_SECONDS;
        void video.play().catch(() => {});
      }
    };

    updateLoopEnd();
    video.addEventListener("loadedmetadata", updateLoopEnd);
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("loadedmetadata", updateLoopEnd);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [isReducedMotion]);

  return (
    <div className={styles.wrapper} aria-hidden="true">
      {!isReducedMotion && (
        <video
          ref={videoRef}
          className={styles.auraVideo}
          autoPlay
          muted
          playsInline
          preload="auto"
        >
          <source src={AURA_VIDEO_SRC} type="video/mp4" />
        </video>
      )}
      <div className={styles.ambientGradient} />
      <div className={styles.topGlow} />
      <div className={styles.dotMatrix} />
    </div>
  );
}
