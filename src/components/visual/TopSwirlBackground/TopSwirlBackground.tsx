"use client";

import { useEffect, useState } from "react";
import styles from "./TopSwirlBackground.module.scss";

export default function TopSwirlBackground() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);
  const [videoAvailable, setVideoAvailable] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setPrefersReducedMotion(mediaQuery.matches);

    onChange();
    if ("addEventListener" in mediaQuery) {
      mediaQuery.addEventListener("change", onChange);
    } else {
      mediaQuery.addListener(onChange);
    }

    return () => {
      if ("removeEventListener" in mediaQuery) {
        mediaQuery.removeEventListener("change", onChange);
      } else {
        mediaQuery.removeListener(onChange);
      }
    };
  }, []);

  const showVideo = !prefersReducedMotion && videoAvailable;

  return (
    <div className={styles.wrapper} aria-hidden="true">
      <div className={styles.fallback} />
      {showVideo && (
        <video
          className={styles.video}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setVideoAvailable(false)}
        >
          <source src="/videos/hero-swirl.webm" type="video/webm" />
          <source src="/videos/hero-swirl.mp4" type="video/mp4" />
        </video>
      )}
      <div className={styles.overlay} />
    </div>
  );
}
