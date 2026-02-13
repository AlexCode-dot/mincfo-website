import Link from "next/link";
import styles from "./SiteFooter.module.scss";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <Link href="/" className={styles.brand} aria-label="MinCFO">
              <svg className={styles.mark} viewBox="0 0 50 50" role="img" aria-hidden="true">
                <g fill="currentColor">
                  <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
                  <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
                  <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
                  <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
                </g>
              </svg>
              <span>MinCFO</span>
            </Link>
            <p>
              Din moderna ekonomifunktion för tillväxtbolag som vill arbeta mer
              datadrivet med ekonomi, rapportering och beslut.
            </p>
          </div>

          <div className={styles.linkCol}>
            <h3>Lösningar</h3>
            <Link href="/losningar/ceo-founders">CEO & Founders</Link>
            <Link href="/losningar/cfo-finance">CFO & Finance</Link>
            <Link href="/losningar/saas-tech">SaaS / Tech</Link>
            <Link href="#how-it-works">Hur det fungerar</Link>
          </div>

          <div className={styles.linkCol}>
            <h3>Bolag</h3>
            <Link href="#customers">Kundcase</Link>
            <Link href="#security">Säkerhet</Link>
            <Link href="/karriar">Karriär</Link>
            <a href="mailto:kontakt@example.com">kontakt@example.com</a>
          </div>

          <div className={styles.linkCol}>
            <h3>Kontor</h3>
            <p>
              Västra Hamngatan 11
              <br />
              411 17 Gothenburg Sweden
            </p>
            <p>
              Stora Nygatan 33
              <br />
              111 27 Stockholm Sweden
            </p>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>Copyright 2026. All rights reserved by MinCFO Sverige AB.</span>
          <a
            href="https://www.linkedin.com/company/mincfo/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="MinCFO på LinkedIn"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
