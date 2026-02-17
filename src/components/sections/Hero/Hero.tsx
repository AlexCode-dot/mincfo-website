"use client";

import { ChevronRight, Lock, Play } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import BeamBackground from "@/components/visual/BeamBackground/BeamBackground";
import { homeContent } from "@/content/homeContent";
import styles from "./Hero.module.scss";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function Hero() {
  const content = homeContent.hero;
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playRequestedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [useFullVideo, setUseFullVideo] = useState(false);
  const stateRef = useRef({
    progress: 0,
    mouseX: 0,
    mouseY: 0,
    hovering: false,
    reduceMotion: false,
    allowPointer: false,
  });

  useLayoutEffect(() => {
    const state = stateRef.current;
    state.reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    state.allowPointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;

    const update = () => {
      const card = cardRef.current;
      if (!card) return;

      const baseRotateX = 16 - state.progress * 9;
      const baseScale = 1 - state.progress * 0.03;
      const mouseRotateX = state.hovering ? -state.mouseY * 4 : 0;
      const mouseRotateY = state.hovering ? state.mouseX * 6 : 0;

      card.style.transform = `perspective(2000px) rotateX(${baseRotateX + mouseRotateX}deg) rotateY(${mouseRotateY}deg) scale(${baseScale})`;
    };

    const scheduleUpdate = () => {
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        update();
      });
    };

    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const progress = clamp(-rect.top / rect.height, 0, 1);
      state.progress = progress;
      scheduleUpdate();
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    const card = cardRef.current;
    if (card && state.allowPointer && !state.reduceMotion) {
      const handleMove = (event: MouseEvent) => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        state.mouseX = clamp(x * 2 - 1, -1, 1);
        state.mouseY = clamp(y * 2 - 1, -1, 1);
        state.hovering = true;
        scheduleUpdate();
      };

      const handleLeave = () => {
        state.mouseX = 0;
        state.mouseY = 0;
        state.hovering = false;
        scheduleUpdate();
      };

      card.addEventListener("mousemove", handleMove);
      card.addEventListener("mouseleave", handleLeave);

      return () => {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
        card.removeEventListener("mousemove", handleMove);
        card.removeEventListener("mouseleave", handleLeave);
      };
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const handlePlayDemo = async () => {
    const video = videoRef.current;
    if (!video) return;

    playRequestedRef.current = true;

    if (!useFullVideo) {
      setUseFullVideo(true);
      return;
    }

    try {
      // Always start actual playback from the beginning.
      video.currentTime = 0;
      await video.play();
      setIsPlaying(true);
      playRequestedRef.current = false;
    } catch {
      setIsPlaying(false);
    }
  };

  const handleVideoCanPlay = async () => {
    const video = videoRef.current;
    if (!video || !useFullVideo || !playRequestedRef.current || isPlaying) return;

    try {
      video.currentTime = 0;
      await video.play();
      setIsPlaying(true);
      playRequestedRef.current = false;
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <section ref={sectionRef} id="hero" className={styles.hero}>
      <BeamBackground extendBottom={260} />

      <div className={styles.container}>
        <div className={styles.tag}>
          <span className={styles.ping} />
          {content.tag}
        </div>

        <h1 className={styles.title}>
          {content.titleTop} <br />– {content.titleBottom}
        </h1>

        <p className={styles.subtitle}>{content.subtitle}</p>

        <div className={styles.ctaRow}>
          <a className={styles.primaryCta} href="#">
            {content.primaryCta} <ChevronRight aria-hidden="true" className={styles.ctaIcon} />
          </a>
        </div>

        <div className={styles.cardWrap}>
          <div className={`${styles.card} ${styles.glass}`} ref={cardRef}>
            <div className={styles.cardHeader}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
              <div className={styles.address}>
                <Lock aria-hidden="true" size={12} />
                {content.appAddress}
              </div>
            </div>

            <div className={`${styles.cardBody} ${styles.gridBg}`}>
              <div className={styles.centerGlow} />
              {!isPlaying && <div className={styles.previewTopMask} aria-hidden="true" />}
              {!isPlaying && (
                <button
                  className={styles.playButton}
                  type="button"
                  onClick={handlePlayDemo}
                  aria-label={content.playDemoAriaLabel}
                >
                  <span className={styles.playPulse} />
                  <Play aria-hidden="true" size={30} />
                </button>
              )}
              <video
                key={useFullVideo ? "full-video" : "preview-video"}
                ref={videoRef}
                className={`${styles.demoVideo} ${!isPlaying ? styles.previewVideo : ""}`}
                loop={useFullVideo}
                controls={isPlaying}
                playsInline
                preload={useFullVideo ? "metadata" : "auto"}
                aria-label={content.videoAriaLabel}
                onCanPlay={handleVideoCanPlay}
              >
                {useFullVideo ? (
                  <>
                    <source src="/videos/mincfo-demo-video-full.mp4" type="video/mp4" />
                    <source src="/videos/mincfo-demo-video.mov" type="video/quicktime" />
                  </>
                ) : (
                  <source src="/videos/mincfo-demo-video-preview.m4v" type="video/mp4" />
                )}
                {content.videoFallback}
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
