"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import styles from "./FloatingNav.module.scss";

const HOMEPAGE_SECTIONS = [
  "hero",
  "produkt",
  "losningar",
  "customers",
  "how-it-works",
  "security",
] as const;

const SOLUTION_GROUPS = [
  {
    title: "Efter roll",
    items: [
      { href: "/losningar/ceo-founders", label: "Founders & CEO" },
      { href: "/losningar/cfo-finance", label: "CFO & Finance Team" },
      { href: "/losningar/fractional-cfo", label: "Fractional CFO" },
    ],
  },
  {
    title: "Efter bransch",
    items: [
      { href: "/losningar/saas-tech", label: "SaaS / Tech" },
      { href: "/losningar/konsult-tjanster", label: "Konsult & Tjänster" },
      { href: "/losningar/ehandel", label: "E-handel" },
    ],
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

export default function FloatingNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<(typeof HOMEPAGE_SECTIONS)[number]>("hero");
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const scrollRafRef = useRef<number | null>(null);

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
    return () => {
      if (scrollRafRef.current) {
        window.cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
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

  const animateScrollTo = (targetY: number) => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      window.scrollTo(0, targetY);
      return;
    }

    if (scrollRafRef.current) {
      window.cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = null;
    }

    const startY = window.scrollY;
    const distance = targetY - startY;
    if (Math.abs(distance) < 2) {
      window.scrollTo(0, targetY);
      return;
    }

    const duration = Math.abs(distance) < 96
      ? 520
      : clamp(Math.abs(distance) * 1.12, 900, 1600);
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = clamp(elapsed / duration, 0, 1);
      const eased = easeOutCubic(progress);
      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        scrollRafRef.current = window.requestAnimationFrame(tick);
      } else {
        scrollRafRef.current = null;
      }
    };

    scrollRafRef.current = window.requestAnimationFrame(tick);
  };

  const handleSectionAnchorClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
    onDone?: () => void,
  ) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) {
      onDone?.();
      return;
    }

    const hash = href.slice(hashIndex + 1);
    if (!hash) {
      onDone?.();
      return;
    }

    const path = href.slice(0, hashIndex);
    const targetPath = path === "" ? "/" : path;
    if (pathname !== targetPath) {
      onDone?.();
      return;
    }

    const target = document.getElementById(hash);
    if (!target) {
      onDone?.();
      return;
    }

    event.preventDefault();
    const scrollPaddingTop = Number.parseFloat(
      window.getComputedStyle(document.documentElement).scrollPaddingTop,
    ) || 0;
    const targetY = target.getBoundingClientRect().top + window.scrollY - scrollPaddingTop;
    animateScrollTo(Math.max(0, targetY));
    setSolutionsOpen(false);
    onDone?.();
  };

  return (
    <nav ref={navRef} className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.desktopNav}>
        <a
          href={sectionHref("produkt")}
          className={`${styles.link} ${isActive("produkt") ? styles.linkActive : ""}`}
          onClick={(event) => handleSectionAnchorClick(event, sectionHref("produkt"))}
        >
          Produkt
        </a>
        <div className={styles.menuWrap}>
          <a
            href={sectionHref("losningar")}
            className={`${styles.link} ${isActive("losningar") || isSolutionsPage ? styles.linkActive : ""}`}
            aria-current={isSolutionsPage ? "page" : undefined}
            onClick={(event) => handleSectionAnchorClick(event, sectionHref("losningar"))}
          >
            Lösningar
          </a>
          <button
            type="button"
            className={`${styles.menuToggle} ${solutionsOpen ? styles.menuToggleOpen : ""}`}
            aria-expanded={solutionsOpen}
            aria-haspopup="true"
            aria-label="Öppna lösningsmeny"
            onClick={() => setSolutionsOpen((previous) => !previous)}
          >
            <span className={`${styles.chevron} ${solutionsOpen ? styles.chevronOpen : ""}`} aria-hidden="true">
              ▾
            </span>
          </button>
          <div className={`${styles.mega} ${solutionsOpen ? styles.megaOpen : ""}`} role="menu">
            {SOLUTION_GROUPS.map((group) => (
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
          onClick={(event) => handleSectionAnchorClick(event, sectionHref("customers"))}
        >
          Kundcase
        </a>
        <a
          href={sectionHref("how-it-works")}
          className={`${styles.link} ${styles.desktopOnly} ${isActive("how-it-works") ? styles.linkActive : ""}`}
          onClick={(event) => handleSectionAnchorClick(event, sectionHref("how-it-works"))}
        >
          Hur det funkar
        </a>
        <a
          href={sectionHref("security")}
          className={`${styles.link} ${styles.desktopOnly} ${isActive("security") ? styles.linkActive : ""}`}
          onClick={(event) => handleSectionAnchorClick(event, sectionHref("security"))}
        >
          Säkerhet
        </a>
        <a
          href={heroHref}
          className={styles.cta}
          onClick={(event) => handleSectionAnchorClick(event, heroHref)}
        >
          Kontakta oss
        </a>
      </div>

      <button
        type="button"
        className={`${styles.mobileToggle} ${mobileMenuOpen ? styles.mobileToggleOpen : ""}`}
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-nav-panel"
        aria-label="Öppna meny"
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
          onClick={(event) => handleSectionAnchorClick(event, sectionHref("produkt"), closeMobileMenu)}
          className={`${styles.mobileLink} ${isActive("produkt") ? styles.mobileLinkActive : ""}`}
        >
          Produkt
        </a>
        <a
          href={sectionHref("losningar")}
          onClick={(event) => handleSectionAnchorClick(event, sectionHref("losningar"), closeMobileMenu)}
          className={`${styles.mobileLink} ${isActive("losningar") ? styles.mobileLinkActive : ""}`}
        >
          Lösningar
        </a>
        <a
          href={sectionHref("customers")}
          onClick={(event) => handleSectionAnchorClick(event, sectionHref("customers"), closeMobileMenu)}
          className={`${styles.mobileLink} ${isActive("customers") ? styles.mobileLinkActive : ""}`}
        >
          Kundcase
        </a>
        <a
          href={sectionHref("how-it-works")}
          onClick={(event) => handleSectionAnchorClick(event, sectionHref("how-it-works"), closeMobileMenu)}
          className={`${styles.mobileLink} ${isActive("how-it-works") ? styles.mobileLinkActive : ""}`}
        >
          Hur det funkar
        </a>
        <a
          href={sectionHref("security")}
          onClick={(event) => handleSectionAnchorClick(event, sectionHref("security"), closeMobileMenu)}
          className={`${styles.mobileLink} ${isActive("security") ? styles.mobileLinkActive : ""}`}
        >
          Säkerhet
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
          Lösningar
          <span className={`${styles.chevron} ${mobileSolutionsOpen ? styles.chevronOpen : ""}`} aria-hidden="true">
            ▾
          </span>
        </button>

        <div
          id="mobile-solutions-list"
          className={`${styles.mobileSolutions} ${mobileSolutionsOpen ? styles.mobileSolutionsOpen : ""}`}
        >
          {SOLUTION_GROUPS.map((group) => (
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

        <a
          href={heroHref}
          className={styles.mobileCta}
          onClick={(event) => handleSectionAnchorClick(event, heroHref, closeMobileMenu)}
        >
          Kontakta oss
        </a>
      </div>
    </nav>
  );
}
