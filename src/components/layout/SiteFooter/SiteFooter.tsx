import Link from "next/link";
import { homeContent } from "@/content/homeContent";
import styles from "./SiteFooter.module.scss";

export default function SiteFooter() {
  const content = homeContent.footer;
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <Link href="/" className={styles.brand} aria-label={content.brandAriaLabel}>
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
            <p>{content.description}</p>
          </div>

          <div className={styles.linkCol}>
            <h3>{content.columns.solutions.title}</h3>
            {content.columns.solutions.links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className={styles.linkCol}>
            <h3>{content.columns.company.title}</h3>
            {content.columns.company.links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
            <a href={`mailto:${content.columns.company.email}`}>{content.columns.company.email}</a>
          </div>

          <div className={styles.linkCol}>
            <h3>{content.columns.offices.title}</h3>
            {content.columns.offices.locations.map((location) => (
              <p key={location}>
                {location.split("\n")[0]}
                <br />
                {location.split("\n")[1]}
              </p>
            ))}
          </div>
        </div>

        <div className={styles.bottom}>
          <span>{content.bottom.copyright}</span>
          <a
            href="https://www.linkedin.com/company/mincfo/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={content.bottom.linkedInAriaLabel}
          >
            {content.bottom.linkedInLabel}
          </a>
        </div>
      </div>
    </footer>
  );
}
