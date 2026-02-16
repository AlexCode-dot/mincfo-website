"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./page.module.scss";

export type TestimonialItem = {
  image: string;
  name: string;
  quote: string;
  role: string;
};

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    image: "/customers/testimonials/logo-rikard.avif",
    name: "Rikard Jonsson",
    role: "CEO, B2B SaaS-bolag",
    quote:
      "Innan MinCFO styrde vi ekonomin reaktivt och med för låg precision. Nu ser vi avvikelser tidigare och kan fatta rätt beslut snabbare.",
  },
  {
    image: "/customers/testimonials/logo-oskar.avif",
    name: "Oskar Nordmark",
    role: "Financial Controller, Hälsa Hemma",
    quote:
      "MinCFO gav oss struktur i både rapportering och prioritering. Vi lägger mindre tid på administration och mer tid på beslut som driver verksamheten framåt.",
  },
  {
    image: "/customers/testimonials/logo-aviv.avif",
    name: "Aviv Fahri",
    role: "CEO, Showcase",
    quote:
      "För oss blev skillnaden tydlig direkt. Med realtidsdata och bättre scenarioarbete kan ledningen agera snabbare med högre trygghet i varje vägval.",
  },
];

export default function TestimonialSpotlight({
  testimonials = DEFAULT_TESTIMONIALS,
}: {
  testimonials?: TestimonialItem[];
}) {
  const items = testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS;
  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex];
  const quoteParts = active.quote.split(". ");
  const emphasis = quoteParts.length > 1 ? `${quoteParts.slice(1).join(". ")}` : "";

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 5200);
    return () => clearInterval(intervalId);
  }, [items.length]);

  return (
    <div className={styles.testimonial}>
      <div className={styles.testimonialHead}>
        <span className={styles.testimonialBadge}>Kundröst</span>
      </div>

      <blockquote>
        <span className={styles.quoteMark} aria-hidden="true">
          “
        </span>
        {quoteParts[0]}
        {emphasis && <span className={styles.quoteHighlight}> {emphasis}</span>}
      </blockquote>

      <div className={styles.testimonialFooter}>
        <p className={styles.testimonialMeta}>
          <strong>{active.name}</strong>
          <span>{active.role}</span>
        </p>
        <div className={styles.testimonialAvatars} aria-label="Kundröster">
          {items.map((item, index) => (
            <button
              key={item.name}
              type="button"
              className={`${styles.avatarButton} ${index === activeIndex ? styles.avatarButtonActive : ""}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Visa testimonial från ${item.name}`}
              aria-pressed={index === activeIndex}
            >
              <Image
                src={item.image}
                alt={item.name}
                width={68}
                height={68}
                className={`${styles.avatar} ${index === activeIndex ? styles.avatarActive : styles.avatarMuted}`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
