"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { homeContent } from "@/content/homeContent";
import styles from "./Ending.module.scss";

export default function Ending() {
  const content = homeContent.ending;
  return (
    <section className={styles.section} id="kontakt">
      <div className={styles.container}>
        <div className={styles.ctaPanel}>
          <h2>{content.title}</h2>
          <p>{content.description}</p>
          <a href="#hero" className={styles.primaryCta}>
            {content.primaryCta} <ChevronRight aria-hidden="true" className={styles.ctaIcon} />
          </a>
        </div>

        <Link href="/karriar" className={styles.secondaryCta}>
          {content.secondaryCta} <ChevronRight aria-hidden="true" className={styles.ctaIcon} />
        </Link>
      </div>
    </section>
  );
}
