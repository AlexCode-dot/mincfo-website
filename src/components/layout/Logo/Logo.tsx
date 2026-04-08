"use client";

import HomeOfferingSwitch from "@/components/home/HomeOfferingSwitch";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type MouseEvent } from "react";
import { useOptionalHomeOffering } from "@/components/home/HomeOfferingProvider";
import { HOME_PAGE_TEXT } from "@/content/homePageText";
import styles from "./Logo.module.scss";

type LogoProps = {
  showOfferingSwitch?: boolean;
};

export default function Logo({ showOfferingSwitch = false }: LogoProps) {
  const ctx = useOptionalHomeOffering();
  const footer = ctx?.shared.footer ?? HOME_PAGE_TEXT.footer;
  const pathname = usePathname();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      pathname !== "/" ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    const hero = document.getElementById("hero");
    if (!hero) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    const scrollPaddingTop = Number.parseFloat(
      window.getComputedStyle(document.documentElement).scrollPaddingTop,
    ) || 0;
    const targetY = hero.getBoundingClientRect().top + window.scrollY - scrollPaddingTop;
    window.scrollTo({ top: Math.max(0, targetY), left: 0, behavior: "smooth" });
  };

  return (
    <div className={styles.cluster}>
      <Link
        className={styles.logo}
        href="/"
        aria-label={footer.brandAria}
        onClick={handleClick}
      >
        <svg className={styles.mark} viewBox="0 0 50 50" role="img" aria-hidden="true">
          <g fill="currentColor">
            <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
            <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
            <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
            <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
          </g>
        </svg>
        <span className={styles.wordmark}>{footer.brandWord}</span>
      </Link>
      {showOfferingSwitch ? (
        <HomeOfferingSwitch variant="inline" className={styles.offeringSwitch} />
      ) : null}
    </div>
  );
}
