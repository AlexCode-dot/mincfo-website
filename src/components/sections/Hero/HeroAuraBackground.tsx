"use client";

import { useEffect } from "react";
import styles from "./HeroAuraBackground.module.scss";

const UNICORN_SCRIPT_SRC =
  "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js";
const AURA_PROJECT_ID = "NMlvqnkICwYYJ6lYb064";

declare global {
  interface Window {
    UnicornStudio?: {
      init?: () => void;
      isInitialized?: boolean;
    };
  }
}

export default function HeroAuraBackground() {
  useEffect(() => {
    const initAura = () => {
      if (!window.UnicornStudio?.init) return;
      if (window.UnicornStudio.isInitialized) {
        window.UnicornStudio.init();
        return;
      }
      window.UnicornStudio.init();
      window.UnicornStudio.isInitialized = true;
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
  }, []);

  return (
    <div className={styles.wrapper} aria-hidden="true">
      <div className={styles.auraLayer} data-us-project={AURA_PROJECT_ID} />
      <div className={styles.ambientGradient} />
      <div className={styles.topGlow} />
      <div className={styles.dotMatrix} />
    </div>
  );
}
