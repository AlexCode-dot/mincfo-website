"use client";

import { ChevronRight, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { HOME_PAGE_TEXT } from "@/content/homePageText";
import { useMotion } from "@/components/system/MotionProvider";
import styles from "./FloatingNav.module.scss";

const HOMEPAGE_SECTIONS = [
  "hero",
  "produkt",
  "losningar",
  "customers",
  "how-it-works",
  "security",
] as const;
const APP_LOGIN_URL = process.env.NEXT_PUBLIC_APP_LOGIN_URL ?? "https://app.mincfo.com/login";

const SOLUTION_GROUPS = HOME_PAGE_TEXT.navigation.groups;
const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

export default function FloatingNav() {
  const { isReducedMotion } = useMotion();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<(typeof HOMEPAGE_SECTIONS)[number]>("hero");
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  const [showSignupLabel, setShowSignupLabel] = useState(false);
  const [loginOutVisible, setLoginOutVisible] = useState(true);
  const [loginInVisible, setLoginInVisible] = useState(false);
  const [incomingSignupLabel, setIncomingSignupLabel] = useState<boolean | null>(null);
  const [loginIconPulse, setLoginIconPulse] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const activeSignupRef = useRef(showSignupLabel);

  useEffect(() => {
    activeSignupRef.current = showSignupLabel;
  }, [showSignupLabel]);

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
    return () => {
      if (!scrollRafRef.current) return;
      window.cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;

    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const navEntry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;

    if (navEntry?.type === "reload") {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    }

    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, [pathname]);

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
  const demoHref = pathname === "/" ? "#kontakt" : "/#kontakt";
  const loginLabels = HOME_PAGE_TEXT.navigation.kontaktaOss
    .split("/")
    .map((label) => label.trim())
    .filter(Boolean);
  const loginPrimaryLabel = loginLabels[0] ?? HOME_PAGE_TEXT.navigation.kontaktaOss;
  const loginSecondaryLabel = loginLabels[1] ?? "";
  const holdMs = 5200;
  const fadeOutMs = 2000;
  const fadeInMs = 3800;
  const fadeInLeadMs = 320;
  const fadeInStartMs = Math.max(0, fadeOutMs - fadeInLeadMs);
  const pulseDurationMs = fadeInStartMs + fadeInMs;

  useEffect(() => {
    if (!loginSecondaryLabel) {
      setLoginOutVisible(true);
      setLoginInVisible(false);
      setIncomingSignupLabel(null);
      return;
    }

    let holdTimer: number | null = null;
    let fadeInStartTimer: number | null = null;
    let cycleEndTimer: number | null = null;
    let pulseTimer: number | null = null;
    let revealRaf1: number | null = null;
    let revealRaf2: number | null = null;
    let cancelled = false;

    const schedule = () => {
      holdTimer = window.setTimeout(() => {
        const nextIsSignup = !activeSignupRef.current;
        setLoginIconPulse(true);
        if (pulseTimer) window.clearTimeout(pulseTimer);
        pulseTimer = window.setTimeout(() => {
          if (cancelled) return;
          setLoginIconPulse(false);
        }, pulseDurationMs);

        // 1) Fade out current word (2000ms) while shrinking toward center.
        setLoginOutVisible(false);

        // 2) Start fading in the next word when current is almost fully faded out.
        fadeInStartTimer = window.setTimeout(() => {
          if (cancelled) return;
          setIncomingSignupLabel(nextIsSignup);
          // Mount incoming word hidden first, then reveal on next paint to trigger CSS transition.
          setLoginInVisible(false);
          revealRaf1 = window.requestAnimationFrame(() => {
            revealRaf2 = window.requestAnimationFrame(() => {
              if (cancelled) return;
              setLoginInVisible(true);
            });
          });
        }, fadeInStartMs);

        // 3) Commit new word after fade-in completes, reset transition slots.
        cycleEndTimer = window.setTimeout(() => {
          if (cancelled) return;
          setShowSignupLabel(nextIsSignup);
          activeSignupRef.current = nextIsSignup;
          setLoginOutVisible(true);
          setLoginInVisible(false);
          setIncomingSignupLabel(null);
          schedule();
        }, fadeInStartMs + fadeInMs);
      }, holdMs);
    };

    schedule();

    return () => {
      cancelled = true;
      if (holdTimer) window.clearTimeout(holdTimer);
      if (fadeInStartTimer) window.clearTimeout(fadeInStartTimer);
      if (cycleEndTimer) window.clearTimeout(cycleEndTimer);
      if (pulseTimer) window.clearTimeout(pulseTimer);
      if (revealRaf1) window.cancelAnimationFrame(revealRaf1);
      if (revealRaf2) window.cancelAnimationFrame(revealRaf2);
    };
  }, [loginSecondaryLabel, fadeInStartMs, fadeInMs, holdMs, pulseDurationMs]);

  const animateScrollTo = (targetY: number) => {
    if (scrollRafRef.current) {
      window.cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = null;
    }

    const startY = window.scrollY;
    const distance = targetY - startY;
    const distanceAbs = Math.abs(distance);

    if (distanceAbs < 2 || isReducedMotion) {
      window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
      return;
    }

    const duration = distanceAbs < 160
      ? 420
      : clamp(distanceAbs * 0.78, 620, 1350);
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = clamp(elapsed / duration, 0, 1);
      const eased = easeOutCubic(progress);
      window.scrollTo({ top: startY + distance * eased, left: 0, behavior: "auto" });

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
    <div className={styles.navShell}>
      <nav ref={navRef} className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.desktopNav}>
          <a
            href={sectionHref("produkt")}
            className={`${styles.link} ${isActive("produkt") ? styles.linkActive : ""}`}
            onClick={(event) => handleSectionAnchorClick(event, sectionHref("produkt"))}
          >
            {HOME_PAGE_TEXT.navigation.produkt}
          </a>
          <div className={styles.menuWrap}>
            <a
              href={sectionHref("losningar")}
              className={`${styles.link} ${isActive("losningar") || isSolutionsPage ? styles.linkActive : ""}`}
              aria-current={isSolutionsPage ? "page" : undefined}
              onClick={(event) => handleSectionAnchorClick(event, sectionHref("losningar"))}
            >
              {HOME_PAGE_TEXT.navigation.losningar}
            </a>
            <button
              type="button"
              className={`${styles.menuToggle} ${solutionsOpen ? styles.menuToggleOpen : ""}`}
              aria-expanded={solutionsOpen}
              aria-haspopup="true"
              aria-label={HOME_PAGE_TEXT.navigation.openSolutionsAria}
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
            {HOME_PAGE_TEXT.navigation.kundcase}
          </a>
          <a
            href={sectionHref("how-it-works")}
            className={`${styles.link} ${styles.desktopOnly} ${isActive("how-it-works") ? styles.linkActive : ""}`}
            onClick={(event) => handleSectionAnchorClick(event, sectionHref("how-it-works"))}
          >
            {HOME_PAGE_TEXT.navigation.hurDetFunkar}
          </a>
          <a
            href={sectionHref("security")}
            className={`${styles.link} ${styles.desktopOnly} ${isActive("security") ? styles.linkActive : ""}`}
            onClick={(event) => handleSectionAnchorClick(event, sectionHref("security"))}
          >
            {HOME_PAGE_TEXT.navigation.sakerhet}
          </a>
          <a
            href={demoHref}
            className={styles.cta}
            onClick={(event) => handleSectionAnchorClick(event, demoHref)}
          >
            {HOME_PAGE_TEXT.hero.primaryCta}
            <ChevronRight aria-hidden="true" className={styles.ctaIcon} />
          </a>
        </div>

        <button
          type="button"
          className={`${styles.mobileToggle} ${mobileMenuOpen ? styles.mobileToggleOpen : ""}`}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-panel"
          aria-label={HOME_PAGE_TEXT.navigation.openMenuAria}
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
            {HOME_PAGE_TEXT.navigation.produkt}
          </a>
          <a
            href={sectionHref("losningar")}
            onClick={(event) => handleSectionAnchorClick(event, sectionHref("losningar"), closeMobileMenu)}
            className={`${styles.mobileLink} ${isActive("losningar") ? styles.mobileLinkActive : ""}`}
          >
            {HOME_PAGE_TEXT.navigation.losningar}
          </a>
          <a
            href={sectionHref("customers")}
            onClick={(event) => handleSectionAnchorClick(event, sectionHref("customers"), closeMobileMenu)}
            className={`${styles.mobileLink} ${isActive("customers") ? styles.mobileLinkActive : ""}`}
          >
            {HOME_PAGE_TEXT.navigation.kundcase}
          </a>
          <a
            href={sectionHref("how-it-works")}
            onClick={(event) => handleSectionAnchorClick(event, sectionHref("how-it-works"), closeMobileMenu)}
            className={`${styles.mobileLink} ${isActive("how-it-works") ? styles.mobileLinkActive : ""}`}
          >
            {HOME_PAGE_TEXT.navigation.hurDetFunkar}
          </a>
          <a
            href={sectionHref("security")}
            onClick={(event) => handleSectionAnchorClick(event, sectionHref("security"), closeMobileMenu)}
            className={`${styles.mobileLink} ${isActive("security") ? styles.mobileLinkActive : ""}`}
          >
            {HOME_PAGE_TEXT.navigation.sakerhet}
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
            {HOME_PAGE_TEXT.navigation.losningar}
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
            href={demoHref}
            className={styles.mobileCta}
            onClick={(event) => handleSectionAnchorClick(event, demoHref, closeMobileMenu)}
          >
            {HOME_PAGE_TEXT.hero.primaryCta}
          </a>

          <a
            href={APP_LOGIN_URL}
            className={styles.mobileCtaSecondary}
            onClick={closeMobileMenu}
          >
            {HOME_PAGE_TEXT.navigation.kontaktaOss}
          </a>
        </div>
      </nav>

      <a href={APP_LOGIN_URL} className={styles.loginFloat} aria-label={HOME_PAGE_TEXT.navigation.kontaktaOss}>
        <span
          className={`${styles.loginIconWrap} ${loginIconPulse ? styles.loginIconWrapPulse : ""}`}
          style={{ "--login-pulse-duration": `${pulseDurationMs}ms` } as CSSProperties}
          aria-hidden="true"
        >
          <UserRound size={17} />
        </span>
        <span className={styles.loginLabel}>
          {!loginSecondaryLabel ? (
            HOME_PAGE_TEXT.navigation.kontaktaOss
          ) : (
            <span className={styles.loginLabelSwap} aria-hidden="true">
              <span
                className={`${styles.loginWord} ${
                  !showSignupLabel
                    ? `${styles.loginWordOutgoing} ${
                        loginOutVisible ? styles.loginWordOutgoingVisible : styles.loginWordOutgoingHidden
                      }`
                    : styles.loginWordDormant
                }`}
              >
                {loginPrimaryLabel}
              </span>
              <span
                className={`${styles.loginWord} ${
                  showSignupLabel
                    ? `${styles.loginWordOutgoing} ${
                        loginOutVisible ? styles.loginWordOutgoingVisible : styles.loginWordOutgoingHidden
                      }`
                    : styles.loginWordDormant
                }`}
              >
                {loginSecondaryLabel}
              </span>
              {incomingSignupLabel !== null && (
                <span
                  className={`${styles.loginWord} ${styles.loginWordIncoming} ${
                    loginInVisible ? styles.loginWordIncomingVisible : styles.loginWordIncomingHidden
                  }`}
                >
                  {incomingSignupLabel ? loginSecondaryLabel : loginPrimaryLabel}
                </span>
              )}
            </span>
          )}
        </span>
      </a>
    </div>
  );
}
