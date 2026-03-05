"use client";

import { useEffect } from "react";
import { useState } from "react";
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

  useEffect(() => {
    if (isReducedMotion) return;

    const initAura = () => {
      window.UnicornStudio?.init?.();
      setIsAuraReady(true);
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${UNICORN_SCRIPT_SRC}"]`,
    );

    if (existingScript) {
      if (window.UnicornStudio?.init) {
        initAura();
      } else {
        existingScript.addEventListener("load", initAura, { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = UNICORN_SCRIPT_SRC;
    script.async = true;
    script.onload = initAura;
    document.head.appendChild(script);
  }, [isReducedMotion]);

  return (
    <div className={styles.wrapper} aria-hidden="true">
      {!isReducedMotion && (
        <div
          className={`${styles.auraLayer} ${isAuraReady ? styles.auraLayerReady : ""}`}
          data-us-project={AURA_PROJECT_ID}
        />
      )}
    </div>
  );
}
