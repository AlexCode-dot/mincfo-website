"use client";

import { ChevronRight, Linkedin } from "lucide-react";
import Link from "next/link";
import { useOptionalHomeOffering } from "@/components/home/HomeOfferingProvider";
import { HOME_PAGE_TEXT } from "@/content/homePageText";
import { useMotion } from "@/components/system/MotionProvider";
import type { MotionPreference } from "@/lib/motion";
import styles from "./SiteFooter.module.scss";

export default function SiteFooter() {
  const homeOffering = useOptionalHomeOffering();
  const { preference, setPreference } = useMotion();
  const showSolutions = homeOffering?.offering !== undefined
    ? homeOffering.offering === "platform"
    : true;
  const motionModes: Array<{ key: MotionPreference; label: string }> = [
    { key: "full", label: HOME_PAGE_TEXT.footer.motionFull },
    { key: "reduced", label: HOME_PAGE_TEXT.footer.motionReduced },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <Link href="/" className={styles.brand} aria-label={HOME_PAGE_TEXT.footer.brandAria}>
              <svg className={styles.mark} viewBox="0 0 50 50" role="img" aria-hidden="true">
                <g fill="currentColor">
                  <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
                  <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
                  <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
                  <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
                </g>
              </svg>
              <span>{HOME_PAGE_TEXT.footer.brandWord}</span>
            </Link>
            <p>
              {HOME_PAGE_TEXT.footer.intro}
            </p>
            <Link href="/karriar" className={styles.careersCta}>
              {HOME_PAGE_TEXT.footer.careersCta} <ChevronRight aria-hidden="true" className={styles.ctaIcon} />
            </Link>
          </div>

          {showSolutions ? (
            <div className={styles.linkCol}>
              <h3>{HOME_PAGE_TEXT.footer.solutionsTitle}</h3>
              <Link href="/losningar/ceo-founders">{HOME_PAGE_TEXT.footer.solutions[0]}</Link>
              <Link href="/losningar/cfo-finance">{HOME_PAGE_TEXT.footer.solutions[1]}</Link>
              <Link href="/losningar/saas-tech">{HOME_PAGE_TEXT.footer.solutions[2]}</Link>
              <Link href="#how-it-works">{HOME_PAGE_TEXT.footer.solutions[3]}</Link>
            </div>
          ) : null}

          <div className={styles.linkCol}>
            <h3>{HOME_PAGE_TEXT.footer.companyTitle}</h3>
            <Link href="#customers">{HOME_PAGE_TEXT.footer.company[0]}</Link>
            <Link href="#security">{HOME_PAGE_TEXT.footer.company[1]}</Link>
            <Link href="/karriar">{HOME_PAGE_TEXT.footer.company[2]}</Link>
            <a href={`mailto:${HOME_PAGE_TEXT.footer.email}`}>{HOME_PAGE_TEXT.footer.email}</a>
          </div>

          <div className={styles.linkCol}>
            <h3>{HOME_PAGE_TEXT.footer.officesTitle}</h3>
            <p>
              {HOME_PAGE_TEXT.footer.office1.split(" / ")[0]}
              <br />
              {HOME_PAGE_TEXT.footer.office1.split(" / ")[1]}
            </p>
            <p>
              {HOME_PAGE_TEXT.footer.office2.split(" / ")[0]}
              <br />
              {HOME_PAGE_TEXT.footer.office2.split(" / ")[1]}
            </p>
          </div>
        </div>

        <div className={styles.bottom}>
          <span className={styles.copy}>{HOME_PAGE_TEXT.footer.copyright}</span>
          <a
            href="https://www.linkedin.com/company/mincfo/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={HOME_PAGE_TEXT.footer.linkedinAria}
            className={styles.centerLink}
          >
            <Linkedin aria-hidden="true" className={styles.linkedinIcon} />
            {HOME_PAGE_TEXT.footer.linkedin}
          </a>
          <div className={styles.motionControl} role="group" aria-label={HOME_PAGE_TEXT.footer.motionAria}>
            <span className={styles.motionLabel}>{HOME_PAGE_TEXT.footer.motionLabel}</span>
            <div className={styles.motionButtons}>
              {motionModes.map((mode) => (
                <button
                  key={mode.key}
                  type="button"
                  className={`${styles.motionBtn} ${preference === mode.key ? styles.motionBtnActive : ""}`}
                  onClick={() => setPreference(mode.key)}
                  aria-pressed={preference === mode.key}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
