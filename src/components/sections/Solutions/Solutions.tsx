"use client";

import { Briefcase, Building2, ChevronRight, Cpu, Handshake, Rocket, ShoppingCart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useHomeOffering } from "@/components/home/HomeOfferingProvider";
import styles from "./Solutions.module.scss";

const ICON_BY_KEY = {
  rocket: Rocket,
  briefcase: Briefcase,
  handshake: Handshake,
  cpu: Cpu,
  building: Building2,
  cart: ShoppingCart,
} as const;

type SolutionIconKey = keyof typeof ICON_BY_KEY;

const CARD_TRACER_PATH =
  "M 0.8 7.2 A 6.4 6.4 0 0 1 7.2 0.8 H 92.8 A 6.4 6.4 0 0 1 99.2 7.2 V 92.8 A 6.4 6.4 0 0 1 92.8 99.2 H 7.2 A 6.4 6.4 0 0 1 0.8 92.8 Z";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

const cubic = (
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number,
) =>
  (1 - t) ** 3 * p0 +
  3 * (1 - t) ** 2 * t * p1 +
  3 * (1 - t) * t ** 2 * p2 +
  t ** 3 * p3;

export default function Solutions() {
  const { content, offering } = useHomeOffering();
  const sectionRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const svgPathRef = useRef<SVGPathElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const curveFrameRef = useRef(0);
  const lastCurveRef = useRef(-1);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);

  useEffect(() => {
    if (offering !== "platform") return;

    const header = headerRef.current;
    const grid = gridRef.current;
    if (!header || !grid) return;

    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        setHeaderVisible(entry.isIntersecting);
      },
      { threshold: 0.01, rootMargin: "0px 0px -6% 0px" },
    );

    const cardsObserver = new IntersectionObserver(
      ([entry]) => {
        setCardsVisible(entry.isIntersecting);
      },
      { threshold: 0.02, rootMargin: "0px 0px -6% 0px" },
    );

    headerObserver.observe(header);
    cardsObserver.observe(grid);
    return () => {
      headerObserver.disconnect();
      cardsObserver.disconnect();
    };
  }, [offering]);

  useEffect(() => {
    if (offering !== "platform") return;

    const applyCurve = (progress: number) => {
      const sideY = lerp(1, 90, progress);
      const centerY = lerp(1, 20, progress);
      const path = svgPathRef.current;
      if (path) {
        path.setAttribute("d", `M0 ${sideY} C280 ${sideY} 480 ${centerY} 720 ${centerY} C960 ${centerY} 1160 ${sideY} 1440 ${sideY}`);
      }
      const points: string[] = [];
      for (let i = 0; i <= 18; i += 1) {
        const t = i / 18;
        const x = cubic(0, 280, 480, 720, t);
        const y = cubic(sideY, sideY, centerY, centerY, t);
        points.push(`${(x / 1440) * 100}% ${y}px`);
      }
      for (let i = 1; i <= 18; i += 1) {
        const t = i / 18;
        const x = cubic(720, 960, 1160, 1440, t);
        const y = cubic(centerY, centerY, sideY, sideY, t);
        points.push(`${(x / 1440) * 100}% ${y}px`);
      }
      const clip = `polygon(${points.join(", ")}, 100% 100%, 0% 100%)`;
      const bg = backgroundRef.current;
      if (bg) {
        bg.style.clipPath = clip;
        (bg.style as unknown as Record<string, string>).WebkitClipPath = clip;
      }
    };

    const updateCurve = () => {
      curveFrameRef.current = 0;
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight;
      let progress: number;
      if (rect.top >= viewport) {
        progress = 0;
      } else {
        const start = viewport * 0.9;
        const end = viewport * 0.42;
        progress = clamp((start - rect.top) / (start - end), 0, 1);
      }
      if (progress !== lastCurveRef.current) {
        lastCurveRef.current = progress;
        applyCurve(progress);
      }
    };

    const scheduleCurve = () => {
      if (curveFrameRef.current) return;
      curveFrameRef.current = window.requestAnimationFrame(updateCurve);
    };

    scheduleCurve();
    window.addEventListener("scroll", scheduleCurve, { passive: true });
    window.addEventListener("resize", scheduleCurve);
    return () => {
      if (curveFrameRef.current) window.cancelAnimationFrame(curveFrameRef.current);
      window.removeEventListener("scroll", scheduleCurve);
      window.removeEventListener("resize", scheduleCurve);
    };
  }, [offering]);

  if (offering !== "platform") {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      id="losningar"
      className={`${styles.section} ${headerVisible ? styles.headerVisible : ""} ${cardsVisible ? styles.cardsVisible : ""}`}
    >
      <svg
        className={styles.curveCut}
        viewBox="0 0 1440 190"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path ref={svgPathRef} d="M0 1 C280 1 480 1 720 1 C960 1 1160 1 1440 1" />
      </svg>

      <div
        ref={backgroundRef}
        className={styles.background}
        aria-hidden="true"
      />

      <div className={styles.container}>
        <div className={styles.layout}>
          <header ref={headerRef} className={styles.header}>
            <span className={styles.pill}>{content.solutions.pill}</span>
            <h2>{content.solutions.title}</h2>
            <p>{content.solutions.intro}</p>
          </header>

          <div className={styles.cardsColumn}>
            <div ref={gridRef} className={styles.grid}>
              {content.solutions.cards.map((item) => {
                const Icon = ICON_BY_KEY[item.icon as SolutionIconKey];
                return (
                  <article key={item.href} className={styles.card}>
                    <div className={styles.cardTracer} aria-hidden="true">
                      <svg
                        className={styles.cardTracerSvg}
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                      >
                        <path
                          className={`${styles.stroke} ${styles.strokeAGlow}`}
                          d={CARD_TRACER_PATH}
                          pathLength={1}
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            from="0"
                            to="-1"
                            dur="8s"
                            repeatCount="indefinite"
                          />
                        </path>
                        <path
                          className={`${styles.stroke} ${styles.strokeA}`}
                          d={CARD_TRACER_PATH}
                          pathLength={1}
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            from="0"
                            to="-1"
                            dur="8s"
                            repeatCount="indefinite"
                          />
                        </path>
                        <path
                          className={`${styles.stroke} ${styles.strokeBGlow}`}
                          d={CARD_TRACER_PATH}
                          pathLength={1}
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            from="-0.5"
                            to="-1.5"
                            dur="8s"
                            repeatCount="indefinite"
                          />
                        </path>
                        <path
                          className={`${styles.stroke} ${styles.strokeB}`}
                          d={CARD_TRACER_PATH}
                          pathLength={1}
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            from="-0.5"
                            to="-1.5"
                            dur="8s"
                            repeatCount="indefinite"
                          />
                        </path>
                      </svg>
                    </div>

                    <div className={styles.iconWrap}>
                      <Icon size={20} aria-hidden="true" />
                    </div>

                    <div className={styles.cardBody}>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>

                    <a href={item.href} className={styles.cta} aria-label={`${content.solutions.cardCta} ${item.title}`}>
                      <span>{content.solutions.cardCta}</span>
                      <ChevronRight size={18} aria-hidden="true" />
                    </a>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
