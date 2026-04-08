"use client";

import { ChevronRight, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import HomeOfferingSwitch from "@/components/home/HomeOfferingSwitch";
import { useHomeOffering } from "@/components/home/HomeOfferingProvider";
import ContactLink from "@/components/system/ContactLink";
import { useMotion } from "@/components/system/MotionProvider";
import { getOfferingFromPathname } from "@/lib/homeRoutes";
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
const SECTION_SCROLL_ADJUSTMENTS: Partial<Record<(typeof HOMEPAGE_SECTIONS)[number], number>> = {
  produkt: 140,
};

const getPageTop = (element: HTMLElement) =>
  element.getBoundingClientRect().top + window.scrollY;

export default function FloatingNav() {
  const { content, offering } = useHomeOffering();
  const { isReducedMotion } = useMotion();
  const pathname = usePathname();
  const solutionGroups = content.navigation.groups;
  const showSolutions = offering === "platform";
  const currentPath = pathname || "/";
  const isHomeOfferingRoute = getOfferingFromPathname(currentPath) !== null;
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
    let frame = 0;
    let lastScrolled = false;
    let lastSection: (typeof HOMEPAGE_SECTIONS)[number] = "hero";

    const update = () => {
      frame = 0;
      const nextScrolled = window.scrollY > 12;
      if (nextScrolled !== lastScrolled) {
        lastScrolled = nextScrolled;
        setScrolled(nextScrolled);
      }

      const cursor = window.scrollY + window.innerHeight * 0.32;
      let current: (typeof HOMEPAGE_SECTIONS)[number] = "hero";
      for (const id of HOMEPAGE_SECTIONS) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (getPageTop(el) <= cursor) {
          current = id;
        }
      }
      if (current !== lastSection) {
        lastSection = current;
        setActiveSection(current);
      }
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
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
    return () => {
      if (!scrollRafRef.current) return;
      window.cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isHomeOfferingRoute) return;

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
  }, [isHomeOfferingRoute]);

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
    isHomeOfferingRoute
      ? (currentPath === "/" ? `#${id}` : `${currentPath}#${id}`)
      : `/#${id}`;
  const demoHref = "/contact";
  const legacyLoginLabel = (content.navigation as unknown as { kontaktaOss?: string }).kontaktaOss;
  const loginSignupLabel =
    content.navigation.loginSignupLabel ??
    legacyLoginLabel ??
    "Logga in / Sign up";
  const navDemoCta =
    content.navigation.demoCta ?? content.hero.primaryCta;
  const loginLabels = loginSignupLabel
    .split("/")
    .map((label) => label.trim())
    .filter(Boolean);
  const loginPrimaryLabel = loginLabels[0] ?? loginSignupLabel;
  const loginSecondaryLabel = loginLabels[1] ?? "";
  const holdMs = 5200;
  const fadeOutMs = 2000;
  const fadeInMs = 3800;
  const fadeInLeadMs = 320;
  const fadeInStartMs = Math.max(0, fadeOutMs - fadeInLeadMs);
  const pulseDurationMs = fadeInStartMs + fadeInMs;

  useEffect(() => {
    if (!loginSecondaryLabel) {
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

        setLoginOutVisible(false);

        fadeInStartTimer = window.setTimeout(() => {
          if (cancelled) return;
          setIncomingSignupLabel(nextIsSignup);
          setLoginInVisible(false);
          revealRaf1 = window.requestAnimationFrame(() => {
            revealRaf2 = window.requestAnimationFrame(() => {
              if (cancelled) return;
              setLoginInVisible(true);
            });
          });
        }, fadeInStartMs);

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
      setLoginIconPulse(false);
    };
  }, [fadeInStartMs, fadeInMs, holdMs, loginSecondaryLabel, pulseDurationMs]);

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

    const target =
      document.getElementById(hash)
      ?? (hash === "produkt" ? document.getElementById("produkt-copilot") : null);
    if (!target) {
      onDone?.();
      return;
    }

    event.preventDefault();
    const scrollPaddingTop = Number.parseFloat(
      window.getComputedStyle(document.documentElement).scrollPaddingTop,
    ) || 0;
    const extraOffset = SECTION_SCROLL_ADJUSTMENTS[hash as (typeof HOMEPAGE_SECTIONS)[number]] ?? 0;
    const targetY =
      target.getBoundingClientRect().top + window.scrollY - scrollPaddingTop + extraOffset;
    if (scrollRafRef.current) {
      window.cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = null;
    }
    window.scrollTo({
      top: Math.max(0, targetY),
      left: 0,
      behavior: isReducedMotion ? "auto" : "smooth",
    });
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
            {content.navigation.produkt}
          </a>
          {showSolutions ? (
            <div className={styles.menuWrap}>
              <a
                href={sectionHref("losningar")}
                className={`${styles.link} ${isActive("losningar") || isSolutionsPage ? styles.linkActive : ""}`}
                aria-current={isSolutionsPage ? "page" : undefined}
                onClick={(event) => handleSectionAnchorClick(event, sectionHref("losningar"))}
              >
                {content.navigation.losningar}
              </a>
              <button
                type="button"
                className={`${styles.menuToggle} ${solutionsOpen ? styles.menuToggleOpen : ""}`}
                aria-expanded={solutionsOpen}
                aria-haspopup="true"
                aria-label={content.navigation.openSolutionsAria}
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
          ) : null}
          <a
            href={sectionHref("customers")}
            className={`${styles.link} ${styles.desktopOnly} ${isActive("customers") ? styles.linkActive : ""}`}
            onClick={(event) => handleSectionAnchorClick(event, sectionHref("customers"))}
          >
            {content.navigation.kundcase}
          </a>
          <a
            href={sectionHref("how-it-works")}
            className={`${styles.link} ${styles.desktopOnly} ${isActive("how-it-works") ? styles.linkActive : ""}`}
            onClick={(event) => handleSectionAnchorClick(event, sectionHref("how-it-works"))}
          >
            {content.navigation.hurDetFunkar}
          </a>
          <a
            href={sectionHref("security")}
            className={`${styles.link} ${styles.desktopOnly} ${isActive("security") ? styles.linkActive : ""}`}
            onClick={(event) => handleSectionAnchorClick(event, sectionHref("security"))}
          >
            {content.navigation.sakerhet}
          </a>
          <ContactLink
            href={demoHref}
            returnPath={currentPath}
            returnSectionId={isHomeOfferingRoute ? activeSection : undefined}
            className={styles.cta}
            onClick={(event) => handleSectionAnchorClick(event, demoHref)}
          >
            {navDemoCta}
            <ChevronRight aria-hidden="true" className={styles.ctaIcon} />
          </ContactLink>
        </div>

        <button
          type="button"
          className={`${styles.mobileToggle} ${mobileMenuOpen ? styles.mobileToggleOpen : ""}`}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-panel"
          aria-label={content.navigation.openMenuAria}
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
          <HomeOfferingSwitch compact className={styles.mobileOfferingSwitch} />
          <a
            href={sectionHref("produkt")}
            onClick={(event) => handleSectionAnchorClick(event, sectionHref("produkt"), closeMobileMenu)}
            className={`${styles.mobileLink} ${isActive("produkt") ? styles.mobileLinkActive : ""}`}
          >
            {content.navigation.produkt}
          </a>
          {showSolutions ? (
            <a
              href={sectionHref("losningar")}
              onClick={(event) => handleSectionAnchorClick(event, sectionHref("losningar"), closeMobileMenu)}
              className={`${styles.mobileLink} ${isActive("losningar") ? styles.mobileLinkActive : ""}`}
            >
              {content.navigation.losningar}
            </a>
          ) : null}
          <a
            href={sectionHref("customers")}
            onClick={(event) => handleSectionAnchorClick(event, sectionHref("customers"), closeMobileMenu)}
            className={`${styles.mobileLink} ${isActive("customers") ? styles.mobileLinkActive : ""}`}
          >
            {content.navigation.kundcase}
          </a>
          <a
            href={sectionHref("how-it-works")}
            onClick={(event) => handleSectionAnchorClick(event, sectionHref("how-it-works"), closeMobileMenu)}
            className={`${styles.mobileLink} ${isActive("how-it-works") ? styles.mobileLinkActive : ""}`}
          >
            {content.navigation.hurDetFunkar}
          </a>
          <a
            href={sectionHref("security")}
            onClick={(event) => handleSectionAnchorClick(event, sectionHref("security"), closeMobileMenu)}
            className={`${styles.mobileLink} ${isActive("security") ? styles.mobileLinkActive : ""}`}
          >
            {content.navigation.sakerhet}
          </a>

          {showSolutions ? (
            <>
              <button
                type="button"
                className={`${styles.mobileSolutionsToggle} ${mobileSolutionsOpen ? styles.mobileSolutionsToggleOpen : ""} ${
                  isSolutionsPage ? styles.mobileSolutionsToggleActive : ""
                }`}
                onClick={() => setMobileSolutionsOpen((previous) => !previous)}
                aria-expanded={mobileSolutionsOpen}
                aria-controls="mobile-solutions-list"
              >
                {content.navigation.losningar}
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
            </>
          ) : null}

          <ContactLink
            href={demoHref}
            returnPath={currentPath}
            returnSectionId={isHomeOfferingRoute ? activeSection : undefined}
            className={styles.mobileCta}
            onClick={(event) => handleSectionAnchorClick(event, demoHref, closeMobileMenu)}
          >
            {navDemoCta}
          </ContactLink>

          <a
            href={APP_LOGIN_URL}
            className={styles.mobileCtaSecondary}
            onClick={closeMobileMenu}
          >
            {loginSignupLabel}
          </a>
        </div>
      </nav>
      <a href={APP_LOGIN_URL} className={styles.loginFloat} aria-label={loginSignupLabel}>
        <span
          className={`${styles.loginIconWrap} ${loginSecondaryLabel && loginIconPulse ? styles.loginIconWrapPulse : ""}`}
          style={{ "--login-pulse-duration": `${pulseDurationMs}ms` } as CSSProperties}
          aria-hidden="true"
        >
          <UserRound size={17} />
        </span>
        <span className={styles.loginLabel}>
          {!loginSecondaryLabel ? (
            loginSignupLabel
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
              {incomingSignupLabel !== null ? (
                <span
                  className={`${styles.loginWord} ${styles.loginWordIncoming} ${
                    loginInVisible ? styles.loginWordIncomingVisible : styles.loginWordIncomingHidden
                  }`}
                >
                  {incomingSignupLabel ? loginSecondaryLabel : loginPrimaryLabel}
                </span>
              ) : null}
            </span>
          )}
        </span>
      </a>
    </div>
  );
}
