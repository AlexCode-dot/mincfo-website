"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import styles from "./Ending.module.scss";

export default function Ending() {
  return (
    <section className={styles.section} id="kontakt">
      <div className={styles.container}>
        <div className={styles.ctaPanel}>
          <h2>Ta nästa steg mot en smartare ekonomifunktion</h2>
          <p>
            Ta kontroll över ditt bolags ekonomiska framtid med MinCFO. Boka ett
            kostnadsfritt möte och se hur vårt team kan skapa mer fart, struktur
            och trygghet i er tillväxt.
          </p>
          <a href="#hero" className={styles.primaryCta}>
            Boka ett kostnadsfritt möte <ChevronRight aria-hidden="true" className={styles.ctaIcon} />
          </a>
        </div>

        <Link href="/karriar" className={styles.secondaryCta}>
          Se våra lediga tjänster <ChevronRight aria-hidden="true" className={styles.ctaIcon} />
        </Link>
      </div>
    </section>
  );
}
