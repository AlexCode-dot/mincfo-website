"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./FloatingNav.module.scss";

const HOMEPAGE_SECTIONS = [
  "hero",
  "produkt",
  "losningar",
  "customers",
  "security",
  "how-it-works",
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

export default function FloatingNav() {
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

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileSolutionsOpen(false);
  };

  return (
    <nav ref={navRef} className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.desktopNav}>
        <a href="#produkt" className={`${styles.link} ${isActive("produkt") ? styles.linkActive : ""}`}>
          Produkt
        </a>
        <div className={styles.menuWrap}>
          <a href="#losningar" className={`${styles.link} ${isActive("losningar") ? styles.linkActive : ""}`}>
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
                    <a key={item.href} href={item.href} className={styles.menuItem}>
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <a
          href="#customers"
          className={`${styles.link} ${styles.desktopOnly} ${isActive("customers") ? styles.linkActive : ""}`}
        >
          Kundcase
        </a>
        <a
          href="#security"
          className={`${styles.link} ${styles.desktopOnly} ${isActive("security") ? styles.linkActive : ""}`}
        >
          Säkerhet
        </a>
        <a
          href="#how-it-works"
          className={`${styles.link} ${styles.desktopOnly} ${isActive("how-it-works") ? styles.linkActive : ""}`}
        >
          Hur det funkar
        </a>
        <a href="#hero" className={styles.cta}>
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
          href="#produkt"
          onClick={closeMobileMenu}
          className={`${styles.mobileLink} ${isActive("produkt") ? styles.mobileLinkActive : ""}`}
        >
          Produkt
        </a>
        <a
          href="#customers"
          onClick={closeMobileMenu}
          className={`${styles.mobileLink} ${isActive("customers") ? styles.mobileLinkActive : ""}`}
        >
          Kundcase
        </a>
        <a
          href="#security"
          onClick={closeMobileMenu}
          className={`${styles.mobileLink} ${isActive("security") ? styles.mobileLinkActive : ""}`}
        >
          Säkerhet
        </a>
        <a
          href="#how-it-works"
          onClick={closeMobileMenu}
          className={`${styles.mobileLink} ${isActive("how-it-works") ? styles.mobileLinkActive : ""}`}
        >
          Hur det funkar
        </a>

        <button
          type="button"
          className={`${styles.mobileSolutionsToggle} ${mobileSolutionsOpen ? styles.mobileSolutionsToggleOpen : ""}`}
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
                  <a key={item.href} href={item.href} className={styles.mobileItem} onClick={closeMobileMenu}>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <a href="#hero" className={styles.mobileCta} onClick={closeMobileMenu}>
          Kontakta oss
        </a>
      </div>
    </nav>
  );
}
