"use client";

import { useEffect, useState } from "react";
import styles from "./FloatingNav.module.scss";

export default function FloatingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <a href="#services" className={styles.link}>
        Tjänster
      </a>
      <a href="#solution" className={styles.link}>
        Lösningen
      </a>
      <a href="#how" className={styles.link}>
        Hur det funkar
      </a>
      <a href="#book" className={styles.cta}>
        Book Demo
      </a>
    </nav>
  );
}
