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

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting && entry.intersectionRatio > 0.08);
      },
      { threshold: [0, 0.08, 0.18], rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
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
