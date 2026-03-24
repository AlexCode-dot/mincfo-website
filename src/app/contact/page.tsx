import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/layout/SiteFooter/SiteFooter";
import BackButton from "./BackButton";
import styles from "./page.module.scss";

const HUBSPOT_MEETINGS_URL = "https://meetings-eu1.hubspot.com/vpernvik/webpagelink";

export const metadata: Metadata = {
  title: "Boka demo | MinCFO",
  description: "Boka en demo med MinCFO och hitta en tid som passar direkt i kalendern.",
};

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <div className={styles.topRail}>
        <div className={styles.backWrap}>
          <BackButton />
        </div>

        <Link href="/" className={styles.logo} aria-label="MinCFO">
          <svg className={styles.mark} viewBox="0 0 50 50" role="img" aria-hidden="true">
            <g fill="currentColor">
              <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
              <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
              <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
              <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
            </g>
          </svg>
          <span className={styles.wordmark}>MinCFO</span>
        </Link>
      </div>

      <main className={styles.main}>
        <div className={styles.shell}>
          <header className={styles.hero}>
            <p className={styles.eyebrow}>Boka demo</p>
            <h1 className={styles.title}>Hitta en tid som passar</h1>
            <p className={styles.subtitle}>
              Välj en ledig tid direkt i kalendern för att boka en genomgång av MinCFO.
            </p>
          </header>

          <section className={styles.card} aria-label="Bokningskalender">
            <div className={styles.frame}>
              <iframe
                className={styles.embed}
                src={HUBSPOT_MEETINGS_URL}
                title="MinCFO bokningskalender"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
