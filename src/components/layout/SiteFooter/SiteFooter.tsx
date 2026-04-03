"use client";

import { ChevronRight, Linkedin } from "lucide-react";
import Link from "next/link";
import { useOptionalHomeOffering } from "@/components/home/HomeOfferingProvider";
import ContactLink from "@/components/system/ContactLink";
import { HOME_PAGE_TEXT } from "@/content/homePageText";
import styles from "./SiteFooter.module.scss";

export default function SiteFooter() {
  const homeOffering = useOptionalHomeOffering();
  const footer = homeOffering?.shared.footer ?? HOME_PAGE_TEXT.footer;
  const showSolutions = homeOffering?.offering !== undefined
    ? homeOffering.offering === "platform"
    : true;

  return (
    <footer id="footer" className={styles.footer}>
      <div className={styles.container}>
        <div className={`${styles.grid} ${!showSolutions ? styles.gridCompact : ""}`}>
          <div className={styles.brandCol}>
            <Link href="/" className={styles.brand} aria-label={footer.brandAria}>
              <svg className={styles.mark} viewBox="0 0 50 50" role="img" aria-hidden="true">
                <g fill="currentColor">
                  <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
                  <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
                  <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
                  <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
                </g>
              </svg>
              <span>{footer.brandWord}</span>
            </Link>
            <p>
              {footer.intro}
            </p>
            <ContactLink href="/karriar" className={styles.careersCta} returnPath="/" returnSectionId="footer">
              {footer.careersCta} <ChevronRight aria-hidden="true" className={styles.ctaIcon} />
            </ContactLink>
          </div>

          {showSolutions ? (
            <div className={styles.linkCol}>
              <h3>{footer.solutionsTitle}</h3>
              <Link href="/losningar/ceo-founders">{footer.solutions[0]}</Link>
              <Link href="/losningar/cfo-finance">{footer.solutions[1]}</Link>
              <Link href="/losningar/saas-tech">{footer.solutions[2]}</Link>
              <Link href="#how-it-works">{footer.solutions[3]}</Link>
            </div>
          ) : null}

          <div className={styles.linkCol}>
            <h3>{footer.companyTitle}</h3>
            <Link href="#product">{footer.company[0]}</Link>
            <Link href="#customers">{footer.company[1]}</Link>
            <ContactLink href="/karriar" returnPath="/" returnSectionId="footer">
              {footer.company[2]}
            </ContactLink>
            <Link href="/partner">{footer.company[3]}</Link>
          </div>

          <div className={styles.linkCol}>
            <h3>{footer.officesTitle}</h3>
            <p>
              {footer.office1.split(" / ")[0]}
              <br />
              {footer.office1.split(" / ")[1]}
            </p>
            <p>
              {footer.office2.split(" / ")[0]}
              <br />
              {footer.office2.split(" / ")[1]}
            </p>
          </div>
        </div>

        <div className={styles.bottom}>
          <span className={styles.copy}>{footer.copyright}</span>
          <a
            href="https://www.linkedin.com/company/mincfocom/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={footer.linkedinAria}
            className={styles.endLink}
          >
            <Linkedin aria-hidden="true" className={styles.linkedinIcon} />
            {footer.linkedin}
          </a>
        </div>
      </div>
    </footer>
  );
}
