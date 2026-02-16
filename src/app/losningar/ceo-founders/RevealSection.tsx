"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.scss";

type RevealSectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export default function RevealSection({ children, className, id }: RevealSectionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let revealTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        revealTimer = setTimeout(() => setVisible(true), 140);
        observer.disconnect();
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (revealTimer) clearTimeout(revealTimer);
    };
  }, []);

  const mergedClassName = `${styles.revealSection}${visible ? ` ${styles.revealVisible}` : ""}${
    className ? ` ${className}` : ""
  }`;

  return (
    <section ref={ref} className={mergedClassName} id={id}>
      {children}
    </section>
  );
}
