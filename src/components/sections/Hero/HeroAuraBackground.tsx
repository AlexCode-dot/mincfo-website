"use client";

import { useEffect, useRef, useState } from "react";
import { useMotion } from "@/components/system/MotionProvider";
import styles from "./HeroAuraBackground.module.scss";

const UNICORN_SCRIPT_SRC =
  "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js";
const AURA_PROJECT_ID = "bKN5upvoulAmWvInmHza";

declare global {
  interface Window {
    UnicornStudio?: {
      init?: () => void;
    };
  }
}

export default function HeroAuraBackground() {
  const { isReducedMotion } = useMotion();
  const [isAuraReady, setIsAuraReady] = useState(false);
  const auraHostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isReducedMotion) return;

    const revealWhenCanvasReady = () => {
      let rafId: number | null = null;
      let attempts = 0;

      const check = () => {
        const host = auraHostRef.current;
        const canvas = host?.querySelector("canvas");
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
              setIsAuraReady(true);
            });
          });
          return;
        }

        attempts += 1;
        if (attempts < 120) {
          rafId = window.requestAnimationFrame(check);
        }
      };

      setIsAuraReady(false);
      rafId = window.requestAnimationFrame(check);

      return () => {
        if (rafId) window.cancelAnimationFrame(rafId);
      };
    };

    const initAura = () => {
      window.UnicornStudio?.init?.();
      const cleanup = revealWhenCanvasReady();
      return cleanup;
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${UNICORN_SCRIPT_SRC}"]`,
    );

    if (existingScript) {
      if (window.UnicornStudio?.init) {
        const cleanup = initAura();
        return cleanup;
      } else {
        const onLoad = () => {
          initAura();
        };
        existingScript.addEventListener("load", onLoad, { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = UNICORN_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      initAura();
    };
    document.head.appendChild(script);
  }, [isReducedMotion]);

  return (
    <div className={styles.wrapper} aria-hidden="true">
      {!isReducedMotion && (
        <div
          ref={auraHostRef}
          className={`${styles.auraLayer} ${isAuraReady ? styles.auraLayerReady : ""}`}
          data-us-project={AURA_PROJECT_ID}
        />
      )}
    </div>
  );
}
