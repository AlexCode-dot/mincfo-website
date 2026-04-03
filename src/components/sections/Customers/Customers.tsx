"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { useHomeOffering } from "@/components/home/HomeOfferingProvider";
import { useMotion } from "@/components/system/MotionProvider";
import styles from "./Customers.module.scss";

type Testimonial = {
  accent?: boolean;
  avatarFile?: string;
  avatarFiles?: string[];
  company: string;
  quote: string;
  role: string;
  person: string;
};

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

const CUT_HEIGHT = 190;
const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

const TICKER_LOGO_CLASS_BY_NAME: Record<string, string> = {
  Growbit: styles.logoGrowbit,
  Azeea: styles.logoAzeea,
};

const getInitials = (value: string) =>
  value
    .split(/\s+/)
    .filter((part) => /^[A-Za-zÀ-ÖØ-öø-ÿ]/.test(part))
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export default function Customers() {
  const { content } = useHomeOffering();
  const { isReducedMotion } = useMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const svgPathRef = useRef<SVGPathElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const curveFrameRef = useRef(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const lastCurveProgressRef = useRef(-1);
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const testimonials = useMemo<Testimonial[]>(
    () => content.customers.testimonials.map((item) => ({ ...item })),
    [content],
  );
  const trustedLogos = useMemo(
    () => content.customers.trustedLogos.map((logo) => ({ ...logo })),
    [content],
  );
  const cardAriaTemplate = content.customers.cardAriaLabelTemplate;
  const trustedLogoByName = useMemo(
    () => new Map<string, string>(trustedLogos.map((logo) => [logo.name, logo.file])),
    [trustedLogos],
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.3, rootMargin: "0px 0px -24% 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const applyCurve = (progress: number) => {
      const sideY = 6;
      const centerY = lerp(6, 86, progress);
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
        const start = viewport * 0.92;
        const end = viewport * 0.46;
        progress = Math.round(clamp((start - rect.top) / (start - end), 0, 1) * 120) / 120;
      }
      if (progress !== lastCurveProgressRef.current) {
        lastCurveProgressRef.current = progress;
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
  }, []);

  useEffect(() => {
    if (!visible || isReducedMotion) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 4600);
    return () => clearInterval(id);
  }, [visible, isReducedMotion, testimonials.length]);

  const prevIndex = (activeIndex - 1 + testimonials.length) % testimonials.length;
  const nextIndex = (activeIndex + 1) % testimonials.length;
  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };
  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };
  const focusCard = (index: number) => {
    setActiveIndex(index);
  };
  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>, index: number) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    focusCard(index);
  };
  const handleCardsTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
  };
  const handleCardsTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    const startY = touchStartYRef.current;
    const touch = event.changedTouches[0];
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (startX === null || startY === null || !touch) return;

    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    if (Math.abs(deltaX) < 36 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

    if (deltaX < 0) {
      goNext();
      return;
    }

    goPrev();
  };
  const tickerLogos = isReducedMotion ? trustedLogos : [...trustedLogos, ...trustedLogos];

  return (
    <section
      ref={sectionRef}
      id="customers"
      className={`${styles.section} ${visible ? styles.visible : ""}`}
    >
      <svg
        className={styles.curveCut}
        viewBox={`0 0 1440 ${CUT_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path ref={svgPathRef} d="M0 6 C280 6 480 6 720 6 C960 6 1160 6 1440 6" />
      </svg>

      <div
        ref={backgroundRef}
        className={styles.background}
        aria-hidden="true"
      />

      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.pill}>{content.customers.pill}</span>
          <h2>{content.customers.title}</h2>
          <p>{content.customers.intro}</p>
        </header>

        <div
          className={styles.cardsShell}
          onTouchStart={handleCardsTouchStart}
          onTouchEnd={handleCardsTouchEnd}
        >
          {testimonials.map((item, index) => {
            let positionClass = styles.hiddenCard;
            if (index === activeIndex) positionClass = styles.centerCard;
            else if (index === prevIndex) positionClass = styles.leftCard;
            else if (index === nextIndex) positionClass = styles.rightCard;
            const companyLogoFile = trustedLogoByName.get(item.company) ?? (item.company === "Hey Sid" ? "logo-sid.png" : undefined);

            return (
              <article
                key={`${item.company}-${item.person}`}
                data-card-index={index}
                className={`${styles.card} ${item.accent ? styles.cardAccent : ""} ${positionClass}`}
                role="button"
                tabIndex={index === activeIndex || index === prevIndex || index === nextIndex ? 0 : -1}
                aria-label={cardAriaTemplate
                  .replace("{person}", item.person)
                  .replace("{company}", item.company)}
                aria-pressed={index === activeIndex}
                onClick={() => focusCard(index)}
                onKeyDown={(event) => handleCardKeyDown(event, index)}
              >
                <div className={styles.companyBrand}>
                  {companyLogoFile ? item.company === "Hey Sid" ? (
                    <span className={styles.companyLogoFrameHeySid}>
                      <Image
                        className={`${styles.companyLogo} ${styles.companyLogoHeySid}`}
                        src={`/customers/logos/${companyLogoFile}`}
                        alt={`${item.company} logo`}
                        width={220}
                        height={44}
                        loading="lazy"
                      />
                    </span>
                  ) : (
                    <Image
                      className={`${styles.companyLogo} ${item.company === "Showcase" ? styles.logoSoft : ""}`}
                      src={`/customers/logos/${companyLogoFile}`}
                      alt={`${item.company} logo`}
                      width={220}
                      height={44}
                      loading="lazy"
                    />
                  ) : (
                    <p className={styles.company}>{item.company}</p>
                  )}
                </div>
                <p className={styles.quote}>&quot;{item.quote}&quot;</p>
                <footer className={styles.person}>
                  {item.avatarFiles?.length ? (
                    <span className={styles.avatarGroup} aria-hidden="true">
                      {item.avatarFiles.slice(0, 2).map((avatarFile) => (
                        <span key={`${item.person}-${avatarFile}`} className={styles.avatarGroupItem}>
                          <Image
                            src={`/customers/testimonials/${avatarFile}`}
                            alt=""
                            width={40}
                            height={40}
                            loading="lazy"
                          />
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className={styles.avatar}>
                      {item.avatarFile ? (
                        <Image
                          src={`/customers/testimonials/${item.avatarFile}`}
                          alt={`${item.person} portratt`}
                          width={40}
                          height={40}
                          loading="lazy"
                        />
                      ) : (
                        <span className={styles.avatarFallback} aria-hidden="true">
                          {getInitials(item.person)}
                        </span>
                      )}
                    </span>
                  )}
                  <span>
                    <strong>{item.person}</strong>
                    <small>{item.role}</small>
                  </span>
                </footer>
              </article>
            );
          })}
        </div>

        <div className={styles.controls} aria-label={content.customers.controlsAria}>
          <button type="button" onClick={goPrev} className={styles.controlBtn} aria-label={content.customers.prevAria}>
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" onClick={goNext} className={styles.controlBtn} aria-label={content.customers.nextAria}>
            <span aria-hidden="true">›</span>
          </button>
        </div>

        <div className={styles.trustedTicker} aria-label={content.customers.trustedAria}>
          <p className={styles.trustedLabel}>{content.customers.tickerLabel}</p>
          <div className={styles.tickerViewport}>
            <div className={styles.tickerTrack}>
              {tickerLogos.map((logo, index) => (
                <span key={`${logo.file}-${index}`} className={styles.tickerItem}>
                  <Image
                    className={`${styles.tickerLogo} ${logo.name === "Showcase" ? styles.logoSoft : ""} ${TICKER_LOGO_CLASS_BY_NAME[logo.name] ?? ""}`}
                    src={`/customers/logos/${logo.file}`}
                    alt={`${logo.name} logo`}
                    width={160}
                    height={42}
                    loading="eager"
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
