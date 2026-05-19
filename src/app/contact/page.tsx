import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/layout/SiteFooter/SiteFooter";
import { getSharedText } from "@/content/homePageText";
import { getLocale } from "@/i18n/server";
import BackButton from "./BackButton";
import styles from "./page.module.scss";

const HUBSPOT_MEETINGS_URL = "https://meetings-eu1.hubspot.com/vpernvik/webpagelink";

export async function generateMetadata(): Promise<Metadata> {
  const c = getSharedText(await getLocale()).ui.contact;
  return {
    title: c.metaTitle,
    description: c.metaDescription,
  };
}

export default async function ContactPage() {
  const ui = getSharedText(await getLocale()).ui;
  const c = ui.contact;
  return (
    <div className={styles.page}>
      <div className={styles.topRail}>
        <div className={styles.backWrap}>
          <BackButton label={ui.back} />
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
            <p className={styles.eyebrow}>{c.eyebrow}</p>
            <h1 className={styles.title}>{c.title}</h1>
            <p className={styles.subtitle}>
              {c.subtitle}
            </p>
          </header>

          <section className={styles.card} aria-label={c.calendarAria}>
            <div className={styles.frame}>
              <iframe
                className={styles.embed}
                src={HUBSPOT_MEETINGS_URL}
                title={c.calendarTitle}
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
