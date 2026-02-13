"use client";

import { Lock, Play } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import BeamBackground from "@/components/visual/BeamBackground/BeamBackground";
import styles from "./Hero.module.scss";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
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

  return (
    <section ref={sectionRef} id="hero" className={styles.hero}>
      <BeamBackground extendBottom={260} />

      <div className={styles.container}>
        <div className={styles.tag}>
          <span className={styles.ping} />
          Financial Intelligence
        </div>

        <h1 className={styles.title}>
          Den moderna ekonomitjänsten <br />– med AI som analyserar, förutser
          och agerar
        </h1>

        <p className={styles.subtitle}>
          MinCFO kombinerar automation, dashboards i realtid och en AI-copilot
          som låter dig chatta med din data. Få insikter, prognoser och
          proaktiva rekommendationer — utan att lägga tid på manuellt arbete.
        </p>

        <div className={styles.ctaRow}>
          <a className={styles.primaryCta} href="#">Boka ett möte</a>
          <a className={styles.secondaryCta} href="#">Vad vi erbjuder</a>
        </div>

        <div className={styles.cardWrap}>
          <div className={`${styles.card} ${styles.glass}`} ref={cardRef}>
            <div className={styles.cardHeader}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
              <div className={styles.address}>
                <Lock aria-hidden="true" size={12} />
                app.mincfo.com/dashboard
              </div>
            </div>

            <div className={`${styles.cardBody} ${styles.gridBg}`}>
              <div className={styles.centerGlow} />
              <button className={styles.playButton} type="button">
                <span className={styles.playPulse} />
                <Play aria-hidden="true" size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
