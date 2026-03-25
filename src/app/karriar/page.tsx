import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/layout/SiteFooter/SiteFooter";
import BackButton from "./BackButton";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Karriär | MinCFO",
  description: "Läs mer om karriärmöjligheter hos MinCFO. Vi har inga öppna roller just nu, men tar gärna emot spontan kontakt.",
};

export default function KarriarPage() {
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
            <p className={styles.eyebrow}>Karriär</p>
            <h1 className={styles.title}>Vi har inga lediga tjänster ute just nu</h1>
            <p className={styles.subtitle}>
              Just nu rekryterar vi inte aktivt, men vi är alltid intresserade av att komma i kontakt med
              skarpa personer som tror på det vi bygger på MinCFO.
            </p>
          </header>

          <section className={styles.card}>
            <div className={styles.frame}>
              <div className={styles.panel}>
                <h2 className={styles.cardTitle}>Vill du ändå höra av dig?</h2>
                <p className={styles.cardBody}>
                  Om du tror att du skulle kunna passa hos oss får du gärna skicka en kort presentation till{" "}
                  <a href="mailto:victor@mincfo.com" className={styles.inlineLink}>
                    victor@mincfo.com
                  </a>
                  . Berätta gärna vem du är, vad du är bra på och varför MinCFO känns relevant för dig.
                </p>

                <div className={styles.actions}>
                  <a href="mailto:victor@mincfo.com" className={styles.primaryCta}>
                    Skicka spontanansökan
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
