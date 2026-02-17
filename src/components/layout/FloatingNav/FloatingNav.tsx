"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { homeContent } from "@/content/homeContent";
import styles from "./FloatingNav.module.scss";

const HOMEPAGE_SECTIONS = [
  "hero",
  "produkt",
  "losningar",
  "customers",
  "security",
  "how-it-works",
] as const;

export default function FloatingNav() {
  const content = homeContent.floatingNav;
  const solutionGroups = content.solutionGroups;
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<(typeof HOMEPAGE_SECTIONS)[number]>("hero");
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);

      const cursor = window.scrollY + window.innerHeight * 0.32;
      let current: (typeof HOMEPAGE_SECTIONS)[number] = "hero";
      for (const id of HOMEPAGE_SECTIONS) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.offsetTop <= cursor) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 981px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      setMobileMenuOpen(false);
      setMobileSolutionsOpen(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const nav = navRef.current;
      if (!nav || nav.contains(event.target as Node)) return;
      setSolutionsOpen(false);
      setMobileMenuOpen(false);
      setMobileSolutionsOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSolutionsOpen(false);
        setMobileMenuOpen(false);
        setMobileSolutionsOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const isActive = (id: (typeof HOMEPAGE_SECTIONS)[number]) =>
    activeSection === id;
  const normalizedPathname = pathname.startsWith("/solutions/")
    ? pathname.replace("/solutions/", "/losningar/")
    : pathname;
  const isSolutionsPage = pathname.startsWith("/losningar") || pathname.startsWith("/solutions");
  const isSolutionItemActive = (href: string) => normalizedPathname === href;

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileSolutionsOpen(false);
  };

  const sectionHref = (id: (typeof HOMEPAGE_SECTIONS)[number]) =>
    pathname === "/" ? `#${id}` : `/#${id}`;

  const heroHref = pathname === "/" ? "#hero" : "/#hero";

  return (
    <nav ref={navRef} className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.desktopNav}>
        <a href={sectionHref("produkt")} className={`${styles.link} ${isActive("produkt") ? styles.linkActive : ""}`}>
          {content.desktop.product}
        </a>
        <div className={styles.menuWrap}>
          <a
            href={sectionHref("losningar")}
            className={`${styles.link} ${isActive("losningar") || isSolutionsPage ? styles.linkActive : ""}`}
            aria-current={isSolutionsPage ? "page" : undefined}
          >
            {content.desktop.solutions}
          </a>
          <button
            type="button"
            className={`${styles.menuToggle} ${solutionsOpen ? styles.menuToggleOpen : ""}`}
            aria-expanded={solutionsOpen}
            aria-haspopup="true"
            aria-label={content.desktop.openSolutionsMenuAriaLabel}
            onClick={() => setSolutionsOpen((previous) => !previous)}
          >
            <span className={`${styles.chevron} ${solutionsOpen ? styles.chevronOpen : ""}`} aria-hidden="true">
              ▾
            </span>
          </button>
          <div className={`${styles.mega} ${solutionsOpen ? styles.megaOpen : ""}`} role="menu">
            {solutionGroups.map((group) => (
              <div key={group.title} className={styles.menuGroup}>
                <p>{group.title}</p>
                <div className={styles.menuItems}>
                  {group.items.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className={`${styles.menuItem} ${isSolutionItemActive(item.href) ? styles.menuItemActive : ""}`}
                      aria-current={isSolutionItemActive(item.href) ? "page" : undefined}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <a
          href={sectionHref("customers")}
          className={`${styles.link} ${styles.desktopOnly} ${isActive("customers") ? styles.linkActive : ""}`}
        >
          {content.desktop.customers}
        </a>
        <a
          href={sectionHref("security")}
          className={`${styles.link} ${styles.desktopOnly} ${isActive("security") ? styles.linkActive : ""}`}
        >
          {content.desktop.security}
        </a>
        <a
          href={sectionHref("how-it-works")}
          className={`${styles.link} ${styles.desktopOnly} ${isActive("how-it-works") ? styles.linkActive : ""}`}
        >
          {content.desktop.howItWorks}
        </a>
        <a href={heroHref} className={styles.cta}>
          {content.desktop.contact}
        </a>
      </div>

      <button
        type="button"
        className={`${styles.mobileToggle} ${mobileMenuOpen ? styles.mobileToggleOpen : ""}`}
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-nav-panel"
        aria-label={content.desktop.openMenuAriaLabel}
        onClick={() => setMobileMenuOpen((previous) => !previous)}
      >
        <span />
        <span />
        <span />
      </button>

      <div
        id="mobile-nav-panel"
        className={`${styles.mobilePanel} ${mobileMenuOpen ? styles.mobilePanelOpen : ""}`}
      >
        <a
          href={sectionHref("produkt")}
          onClick={closeMobileMenu}
          className={`${styles.mobileLink} ${isActive("produkt") ? styles.mobileLinkActive : ""}`}
        >
          {content.desktop.product}
        </a>
        <a
          href={sectionHref("customers")}
          onClick={closeMobileMenu}
          className={`${styles.mobileLink} ${isActive("customers") ? styles.mobileLinkActive : ""}`}
        >
          {content.desktop.customers}
        </a>
        <a
          href={sectionHref("security")}
          onClick={closeMobileMenu}
          className={`${styles.mobileLink} ${isActive("security") ? styles.mobileLinkActive : ""}`}
        >
          {content.desktop.security}
        </a>
        <a
          href={sectionHref("how-it-works")}
          onClick={closeMobileMenu}
          className={`${styles.mobileLink} ${isActive("how-it-works") ? styles.mobileLinkActive : ""}`}
        >
          {content.desktop.howItWorks}
        </a>

        <button
          type="button"
          className={`${styles.mobileSolutionsToggle} ${mobileSolutionsOpen ? styles.mobileSolutionsToggleOpen : ""} ${
            isSolutionsPage ? styles.mobileSolutionsToggleActive : ""
          }`}
          onClick={() => setMobileSolutionsOpen((previous) => !previous)}
          aria-expanded={mobileSolutionsOpen}
          aria-controls="mobile-solutions-list"
        >
          {content.desktop.solutions}
          <span className={`${styles.chevron} ${mobileSolutionsOpen ? styles.chevronOpen : ""}`} aria-hidden="true">
            ▾
          </span>
        </button>

        <div
          id="mobile-solutions-list"
          className={`${styles.mobileSolutions} ${mobileSolutionsOpen ? styles.mobileSolutionsOpen : ""}`}
        >
          {solutionGroups.map((group) => (
            <div key={group.title} className={styles.mobileGroup}>
              <p>{group.title}</p>
              <div className={styles.mobileItems}>
                {group.items.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`${styles.mobileItem} ${isSolutionItemActive(item.href) ? styles.mobileItemActive : ""}`}
                    onClick={closeMobileMenu}
                    aria-current={isSolutionItemActive(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <a href={heroHref} className={styles.mobileCta} onClick={closeMobileMenu}>
          {content.desktop.contact}
        </a>
      </div>
    </nav>
  );
}
