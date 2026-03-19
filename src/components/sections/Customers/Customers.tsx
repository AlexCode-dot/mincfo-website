"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
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
  const lastCurveProgressRef = useRef(-1);
  const [visible, setVisible] = useState(false);
  const [curveProgress, setCurveProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const testimonials: Testimonial[] = content.customers.testimonials.map((item) => ({ ...item }));
  const trustedLogos = content.customers.trustedLogos.map((logo) => ({ ...logo }));
  const cardAriaTemplate = content.customers.cardAriaLabelTemplate;
  const trustedLogoByName = new Map<string, string>(
    trustedLogos.map((logo) => [logo.name, logo.file]),
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
    const updateCurve = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight;
      if (rect.top >= viewport) {
        if (lastCurveProgressRef.current !== 0) {
          lastCurveProgressRef.current = 0;
          setCurveProgress(0);
        }
      } else {
        const start = viewport * 0.92;
        const end = viewport * 0.46;
        const progress = Math.round(clamp((start - rect.top) / (start - end), 0, 1) * 120) / 120;
        if (progress !== lastCurveProgressRef.current) {
          lastCurveProgressRef.current = progress;
          setCurveProgress(progress);
        }
      }
    };

    updateCurve();
    window.addEventListener("scroll", updateCurve, { passive: true });
    window.addEventListener("resize", updateCurve);
    return () => {
      window.removeEventListener("scroll", updateCurve);
      window.removeEventListener("resize", updateCurve);
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
  const sideY = 6;
  const centerY = lerp(6, 86, curveProgress);
  const cutPath = `M0 ${sideY} C280 ${sideY} 480 ${centerY} 720 ${centerY} C960 ${centerY} 1160 ${sideY} 1440 ${sideY}`;
  const curvePoints: string[] = [];
  for (let i = 0; i <= 18; i += 1) {
    const t = i / 18;
    const x = cubic(0, 280, 480, 720, t);
    const y = cubic(sideY, sideY, centerY, centerY, t);
    curvePoints.push(`${(x / 1440) * 100}% ${y}px`);
  }
  for (let i = 1; i <= 18; i += 1) {
    const t = i / 18;
    const x = cubic(720, 960, 1160, 1440, t);
    const y = cubic(centerY, centerY, sideY, sideY, t);
    curvePoints.push(`${(x / 1440) * 100}% ${y}px`);
  }
  const cutClip = `polygon(${curvePoints.join(", ")}, 100% 100%, 0% 100%)`;
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
        <path d={cutPath} />
      </svg>

      <div
        className={styles.background}
        aria-hidden="true"
        style={{ clipPath: cutClip, WebkitClipPath: cutClip } as CSSProperties}
      />

      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.pill}>{content.customers.pill}</span>
          <h2>{content.customers.title}</h2>
          <p>{content.customers.intro}</p>
        </header>

        <div className={styles.cardsShell}>
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
