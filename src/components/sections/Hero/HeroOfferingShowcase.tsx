"use client";

import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  Blocks,
  Building2,
  CircleDot,
  FileText,
  Sparkles,
} from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { useHomeOffering } from "@/components/home/HomeOfferingProvider";
import { useMotion } from "@/components/system/MotionProvider";
import { getHomeRouteForOffering } from "@/lib/homeRoutes";
import {
  ShowcaseGradientBarChart,
} from "./HeroOfferingCharts";
import styles from "./HeroOfferingShowcase.module.scss";

const OFFERING_ICONS = {
  platform: Blocks,
  "full-service": Sparkles,
  partner: Building2,
} as const;
const PARTNER_WORKSPACE_INITIAL_AUTOPLAY_DELAY_MS = 1600;
const PARTNER_WORKSPACE_AUTOPLAY_DELAY_HOME_MS = 3600;
const PARTNER_WORKSPACE_AUTOPLAY_DELAY_OTHER_MS = 2400;
const PARTNER_WORKSPACE_AUTOPLAY_CLICK_DELAY_MS = 680;
export const HERO_OFFERING_TITLE_ID = "hero-offering-title";
const HERO_OFFERING_SHOWCASE_ID = "hero-offering-showcase";
const HERO_OFFERING_RESTORE_KEY = "mincfo:restore-showcase";
const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

function MetricCardIcon({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  if (value === "Live") {
    return (
      <span className={styles.metricLiveBadge} aria-hidden="true">
        <span className={styles.metricLiveDot} />
      </span>
    );
  }

  if (label === "Fortnox") {
    return (
      <span className={styles.metricFortnoxBadge} aria-hidden="true">
        <Image
          src="/icons/fortnox-icon.png"
          alt=""
          width={16}
          height={16}
          className={styles.metricFortnoxLogo}
        />
      </span>
    );
  }

  return null;
}

function FullServiceVisual({
  content,
}: {
  content: ReturnType<typeof useHomeOffering>["shared"]["offering"]["showcase"]["full-service"]["serviceVisual"];
}) {
  return (
    <div className={styles.serviceGraphCard}>
      <div className={styles.serviceHeroPanel}>
        <div className={styles.serviceHeroHeader}>
          <span className={styles.serviceHeroBadge}>
            <span>{content.badge}</span>
          </span>
        </div>

        <div className={styles.serviceHeroIntro}>
          <p className={styles.serviceHeroEyebrow}>{content.eyebrow}</p>
          <strong className={styles.serviceGraphTitle}>{content.title}</strong>
        </div>

        <div className={styles.serviceOrbitStage}>
          <div className={styles.timelineGraphic}>
            <svg
              viewBox="0 0 100 36"
              preserveAspectRatio="xMidYMid meet"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.serviceOrbitSvg}
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="timeline-line" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F2A65A" />
                  <stop offset="50%" stopColor="#FFD08A" />
                  <stop offset="100%" stopColor="#F2A65A" />
                </linearGradient>

                <filter id="timeline-line-glow" x="-20%" y="-120%" width="140%" height="320%">
                  <feGaussianBlur stdDeviation="0.45" result="blur1" />
                  <feMerge>
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id="timeline-dot-glow" x="-250%" y="-250%" width="500%" height="500%">
                  <feGaussianBlur stdDeviation="0.7" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur2" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <radialGradient id="timeline-bg-glow-wide" cx="50%" cy="24%" r="58%">
                  <stop offset="0%" stopColor="#F2A65A" stopOpacity="0.03" />
                  <stop offset="55%" stopColor="#A5531B" stopOpacity="0.025" />
                  <stop offset="100%" stopColor="#7A3E12" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="timeline-bg-glow-core" cx="50%" cy="24%" r="46%">
                  <stop offset="0%" stopColor="#7A3E12" stopOpacity="0.055" />
                  <stop offset="45%" stopColor="#7A3E12" stopOpacity="0.03" />
                  <stop offset="100%" stopColor="#7A3E12" stopOpacity="0" />
                </radialGradient>
              </defs>

              <ellipse cx="50" cy="12" rx="28" ry="11" fill="url(#timeline-bg-glow-wide)" />
              <ellipse cx="50" cy="12" rx="22" ry="8.8" fill="url(#timeline-bg-glow-core)" />

              <path
                d="M4 16.8 C8 16.8, 10 20, 14 20 C19 20, 24 11.8, 34 11.8 C43 11.8, 47 17.2, 52 17.2 C57 17.2, 61 11.8, 68 11.8 C78 11.8, 83 20, 91 20 C94 20, 96 20, 98 20"
                fill="none"
                stroke="#F6BE72"
                strokeOpacity="0.08"
                strokeWidth="0.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#timeline-line-glow)"
              />

              <path
                d="M4 16.8 C8 16.8, 10 20, 14 20 C19 20, 24 11.8, 34 11.8 C43 11.8, 47 17.2, 52 17.2 C57 17.2, 61 11.8, 68 11.8 C78 11.8, 83 20, 91 20 C94 20, 96 20, 98 20"
                fill="none"
                stroke="url(#timeline-line)"
                strokeWidth="0.62"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <g opacity="0.15">
                <circle cx="14" cy="20" r="3.8" fill="#F2A65A" className={`${styles.timelinePulseAura} ${styles.timelinePulse1}`} />
                <circle cx="34" cy="11.8" r="4.3" fill="#F2A65A" className={`${styles.timelinePulseAura} ${styles.timelinePulse2}`} />
                <circle cx="66" cy="11.8" r="4.3" fill="#F2A65A" className={`${styles.timelinePulseAura} ${styles.timelinePulse3}`} />
                <circle cx="89" cy="20" r="3.8" fill="#F2A65A" className={`${styles.timelinePulseAura} ${styles.timelinePulse4}`} />
              </g>

              <g opacity="0.3">
                <circle cx="14" cy="20" r="2.35" fill="#F2A65A" className={`${styles.timelinePulseHalo} ${styles.timelinePulse1}`} />
                <circle cx="34" cy="11.8" r="2.75" fill="#F2A65A" className={`${styles.timelinePulseHalo} ${styles.timelinePulse2}`} />
                <circle cx="66" cy="11.8" r="2.75" fill="#F2A65A" className={`${styles.timelinePulseHalo} ${styles.timelinePulse3}`} />
                <circle cx="89" cy="20" r="2.35" fill="#F2A65A" className={`${styles.timelinePulseHalo} ${styles.timelinePulse4}`} />
              </g>

              <g opacity="0.54">
                <circle cx="14" cy="20" r="1.9" fill="none" stroke="#FFD08A" strokeWidth="0.38" className={`${styles.timelinePulseRing} ${styles.timelinePulse1}`} />
                <circle cx="34" cy="11.8" r="2.15" fill="none" stroke="#FFD08A" strokeWidth="0.42" className={`${styles.timelinePulseRing} ${styles.timelinePulse2}`} />
                <circle cx="66" cy="11.8" r="2.15" fill="none" stroke="#FFD08A" strokeWidth="0.42" className={`${styles.timelinePulseRing} ${styles.timelinePulse3}`} />
                <circle cx="89" cy="20" r="1.9" fill="none" stroke="#FFD08A" strokeWidth="0.38" className={`${styles.timelinePulseRing} ${styles.timelinePulse4}`} />
              </g>

              <g filter="url(#timeline-dot-glow)">
                <circle cx="14" cy="20" r="1.56" fill="#FFF2CF" className={`${styles.timelinePulseCore} ${styles.timelinePulse1}`} />
                <circle cx="34" cy="11.8" r="1.74" fill="#FFF2CF" className={`${styles.timelinePulseCore} ${styles.timelinePulse2}`} />
                <circle cx="66" cy="11.8" r="1.74" fill="#FFF2CF" className={`${styles.timelinePulseCore} ${styles.timelinePulse3}`} />
                <circle cx="89" cy="20" r="1.56" fill="#FFF2CF" className={`${styles.timelinePulseCore} ${styles.timelinePulse4}`} />
                <circle cx="14" cy="20" r="1.18" fill="#F2A65A" className={`${styles.timelinePulseDot} ${styles.timelinePulse1}`} />
                <circle cx="34" cy="11.8" r="1.34" fill="#F6BE72" className={`${styles.timelinePulseDot} ${styles.timelinePulse2}`} />
                <circle cx="66" cy="11.8" r="1.34" fill="#F6BE72" className={`${styles.timelinePulseDot} ${styles.timelinePulse3}`} />
                <circle cx="89" cy="20" r="1.18" fill="#F2A65A" className={`${styles.timelinePulseDot} ${styles.timelinePulse4}`} />
              </g>

              <g
                fill="#EDEDED"
                fontFamily="Inter, Arial, sans-serif"
                fontSize="3.2"
                fontWeight="530"
                textAnchor="middle"
              >
                <text x="12.5" y="33">{content.steps[0]}</text>
                <text x="37.5" y="33">{content.steps[1]}</text>
                <text x="62.5" y="33">{content.steps[2]}</text>
                <text x="87.5" y="33">{content.steps[3]}</text>
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div className={styles.serviceSummaryCompact}>
        <div className={styles.serviceSummaryCard}>
          <span className={styles.serviceSummaryLabelRow}>
            <span className={styles.serviceSummaryIcon} aria-hidden="true">
              <FileText size={14} />
            </span>
            <span className={styles.serviceSummaryLabel}>{content.summaryReportLabel}</span>
          </span>
          <strong>{content.summaryReportValue}</strong>
        </div>
        <div className={styles.serviceSummaryCard}>
          <span className={styles.serviceSummaryLabelRow}>
            <span className={styles.serviceSummaryIcon} aria-hidden="true">
              <ArrowUpRight size={14} />
            </span>
            <span className={styles.serviceSummaryLabel}>{content.summaryAlertsLabel}</span>
          </span>
          <strong>{content.summaryAlertsValue}</strong>
        </div>
      </div>
    </div>
  );
}

function AgencyWorkspaceVisual() {
  const { content } = useHomeOffering();
  const [activePage, setActivePage] = useState<"home" | "users" | "settings">("home");
  const [hoveredPage, setHoveredPage] = useState<"home" | "users" | "settings" | null>(null);
  const workspace = content.howItWorks.ui.partnerWorkspace;
  const [userToggles, setUserToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      workspace.users.rows.map((row) => [row.label, row.status === "Aktiv"]),
    ),
  );
  const activeCopy = workspace[activePage];
  const userRows = workspace.users.rows;
  const homeRows = workspace.home.rows;
  const loopTimeoutRef = useRef<number | null>(null);
  const clickTimeoutRef = useRef<number | null>(null);
  const autoResumeAtRef = useRef(0);
  const initialAutoplayRef = useRef(true);

  const handlePageChange = (nextPage: "home" | "users" | "settings") => {
    autoResumeAtRef.current = Date.now() + 5000;
    setHoveredPage(nextPage);
    setActivePage(nextPage);
  };

  useLayoutEffect(() => {
    if (loopTimeoutRef.current !== null) {
      window.clearTimeout(loopTimeoutRef.current);
    }
    if (clickTimeoutRef.current !== null) {
      window.clearTimeout(clickTimeoutRef.current);
    }

    const now = Date.now();
    const pauseRemaining = Math.max(0, autoResumeAtRef.current - now);

    const nextPage = activePage === "home"
      ? "users"
      : activePage === "users"
        ? "settings"
        : "home";
    const baseDelay = initialAutoplayRef.current
      ? PARTNER_WORKSPACE_INITIAL_AUTOPLAY_DELAY_MS
      : activePage === "home"
        ? PARTNER_WORKSPACE_AUTOPLAY_DELAY_HOME_MS
        : PARTNER_WORKSPACE_AUTOPLAY_DELAY_OTHER_MS;
    const delay = pauseRemaining + baseDelay;

    loopTimeoutRef.current = window.setTimeout(() => {
      clickTimeoutRef.current = window.setTimeout(() => {
        initialAutoplayRef.current = false;
        setHoveredPage(nextPage);
        setActivePage(nextPage);
      }, PARTNER_WORKSPACE_AUTOPLAY_CLICK_DELAY_MS);
    }, delay);

    return () => {
      if (loopTimeoutRef.current !== null) {
        window.clearTimeout(loopTimeoutRef.current);
        loopTimeoutRef.current = null;
      }
      if (clickTimeoutRef.current !== null) {
        window.clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
    };
  }, [activePage]);

  return (
    <div className={styles.partnerWorkspaceShowcase}>
      <div className={styles.partnerWorkspaceCanvas}>
        <div className={styles.partnerWorkspaceShell}>
          <aside className={styles.partnerWorkspaceSidebar}>
            <div className={styles.partnerWorkspaceBrand}>
              <svg
                viewBox="0 0 50 50"
                aria-hidden="true"
                className={styles.partnerWorkspaceBrandMark}
              >
                <g fill="currentColor">
                  <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
                  <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
                  <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
                  <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
                </g>
              </svg>
              <span>MinCFO</span>
            </div>

            <nav className={styles.partnerWorkspaceNav} aria-label={workspace.navAriaLabel}>
              <button
                type="button"
                className={`${styles.partnerWorkspaceNavItem} ${
                  activePage === "home" ? styles.partnerWorkspaceNavItemActive : ""
                } ${hoveredPage === "home" ? styles.partnerWorkspaceNavItemHover : ""}`}
                onMouseEnter={() => setHoveredPage("home")}
                onMouseLeave={() => setHoveredPage(null)}
                onClick={() => handlePageChange("home")}
              >
                {workspace.nav.home}
              </button>
              <button
                type="button"
                className={`${styles.partnerWorkspaceNavItem} ${
                  activePage === "users" ? styles.partnerWorkspaceNavItemActive : ""
                } ${hoveredPage === "users" ? styles.partnerWorkspaceNavItemHover : ""}`}
                onMouseEnter={() => setHoveredPage("users")}
                onMouseLeave={() => setHoveredPage(null)}
                onClick={() => handlePageChange("users")}
              >
                {workspace.nav.users}
              </button>
              <button
                type="button"
                className={`${styles.partnerWorkspaceNavItem} ${
                  activePage === "settings" ? styles.partnerWorkspaceNavItemActive : ""
                } ${hoveredPage === "settings" ? styles.partnerWorkspaceNavItemHover : ""}`}
                onMouseEnter={() => setHoveredPage("settings")}
                onMouseLeave={() => setHoveredPage(null)}
                onClick={() => handlePageChange("settings")}
              >
                {workspace.nav.settings}
              </button>
            </nav>
          </aside>

          <div className={styles.partnerWorkspaceMain}>
            <div className={styles.partnerWorkspaceIntro}>
              <strong>{activeCopy.title}</strong>
              <span>{activeCopy.subtitle}</span>
            </div>

            {activePage === "home" && (
              <div className={styles.partnerWorkspaceTable}>
                <div className={styles.partnerWorkspaceTableHead}>
                  <span>{activeCopy.columns[0]}</span>
                  <span>{activeCopy.columns[1]}</span>
                  <span>{activeCopy.columns[2]}</span>
                </div>

                {homeRows.map((row) => (
                  <div key={row.label} className={styles.partnerWorkspaceRow}>
                    <div className={styles.partnerWorkspaceCompany}>
                      <div className={styles.partnerWorkspaceAvatar}>{row.meta}</div>
                      <div className={styles.partnerWorkspaceCompanyMeta}>
                        <strong>{row.label}</strong>
                        <span>{row.detail}</span>
                      </div>
                    </div>

                    <div className={styles.partnerWorkspaceCell}>
                      <span className={styles.partnerWorkspaceSource}>{row.tag}</span>
                    </div>

                    <div className={styles.partnerWorkspaceCell}>
                      <span className={styles.partnerWorkspaceSuccess}>{row.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activePage === "users" && (
              <>
                <div className={styles.partnerWorkspaceUsersTopbar}>
                  <span className={styles.partnerWorkspaceUsersSearch}>{workspace.users.searchPlaceholder}</span>
                  <button type="button" className={styles.partnerWorkspaceUsersInvite}>
                    {workspace.users.inviteLabel}
                  </button>
                </div>

                <div className={styles.partnerWorkspacePanel}>
                <div className={styles.partnerWorkspacePanelHead}>
                  <span>{workspace.users.tableLabel}</span>
                  <span />
                </div>

                {userRows.map((row) => (
                  <div key={row.label} className={styles.partnerWorkspacePanelRow}>
                    <div className={styles.partnerWorkspaceUser}>
                      <div className={styles.partnerWorkspaceUserAvatar}>{row.meta}</div>
                      <div className={styles.partnerWorkspaceUserMeta}>
                        <strong>{row.label}</strong>
                        <span>{row.detail}</span>
                      </div>
                    </div>

                    <div className={styles.partnerWorkspaceUsersRoleWrap}>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={userToggles[row.label] ?? false}
                        aria-label={`${row.label}: ${row.tag}`}
                        className={`${styles.partnerWorkspaceUsersToggle} ${
                          userToggles[row.label] ? styles.partnerWorkspaceUsersToggleActive : ""
                        }`}
                        onClick={() =>
                          setUserToggles((current) => ({
                            ...current,
                            [row.label]: !current[row.label],
                          }))
                        }
                      >
                        <span className={styles.partnerWorkspaceUsersToggleTrack}>
                          <span className={styles.partnerWorkspaceUsersToggleThumb} />
                        </span>
                      </button>
                      <button type="button" className={styles.partnerWorkspaceUsersRowAction}>
                        ...
                      </button>
                    </div>
                  </div>
                ))}
                </div>
              </>
            )}

            {activePage === "settings" && (
              <>
                <div className={styles.partnerWorkspaceSettingsTabs}>
                  <span className={styles.partnerWorkspaceSettingsTab}>{workspace.settings.tabs.profile}</span>
                  <span
                    className={`${styles.partnerWorkspaceSettingsTab} ${styles.partnerWorkspaceSettingsTabActive}`}
                  >
                    {workspace.settings.tabs.appearance}
                  </span>
                </div>

                <div className={styles.partnerWorkspaceSettings}>
                <div className={styles.partnerWorkspaceSettingsSection}>
                  <div className={styles.partnerWorkspaceSettingMeta}>
                    <span>{workspace.settings.appearanceTitle}</span>
                    <strong>{workspace.settings.appearanceBody}</strong>
                  </div>

                  <div className={styles.partnerWorkspaceModes}>
                    <article className={styles.partnerWorkspaceMode}>
                      <div
                        className={`${styles.partnerWorkspaceModePreview} ${styles.partnerWorkspaceModePreviewLight}`}
                      >
                        <span className={styles.partnerWorkspacePreviewSidebar} />
                        <span className={styles.partnerWorkspacePreviewCanvas} />
                      </div>
                      <strong>{workspace.settings.modes.light}</strong>
                    </article>
                    <article className={`${styles.partnerWorkspaceMode} ${styles.partnerWorkspaceModeActive}`}>
                      <div
                        className={`${styles.partnerWorkspaceModePreview} ${styles.partnerWorkspaceModePreviewDark}`}
                      >
                        <span className={styles.partnerWorkspacePreviewSidebar} />
                        <span className={styles.partnerWorkspacePreviewCanvas} />
                      </div>
                      <strong>{workspace.settings.modes.dark}</strong>
                    </article>
                  </div>
                </div>

                <div className={styles.partnerWorkspaceSettingsSection}>
                  <div className={styles.partnerWorkspaceSettingsInlineHeader}>
                    <span className={styles.partnerWorkspaceSettingsInlineLabel}>
                      {workspace.settings.languageTitle}
                    </span>

                    <div className={styles.partnerWorkspaceLanguage}>
                      <span className={styles.partnerWorkspaceLanguageValue}>
                        <span className={styles.partnerWorkspaceLanguageFlag} aria-hidden="true">
                          <span className={styles.partnerWorkspaceLanguageFlagVertical} />
                          <span className={styles.partnerWorkspaceLanguageFlagHorizontal} />
                        </span>
                        <span>{workspace.settings.languageValue} (SE)</span>
                      </span>
                      <span>▾</span>
                    </div>
                  </div>
                </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={styles.partnerWorkspaceSummary}>
        <span className={styles.partnerWorkspaceSummaryLabel}>{workspace.summary.label}</span>
        <strong>
          {workspace.summary.title}
        </strong>
      </div>
    </div>
  );
}

export default function HeroOfferingShowcase() {
  const { offering, options, setOffering, shared } = useHomeOffering();
  const { isReducedMotion } = useMotion();
  const pathname = usePathname();
  const handoffStageRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const showcaseRef = useRef<HTMLDivElement | null>(null);
  const showcaseGridRef = useRef<HTMLDivElement | null>(null);
  const showcase = shared.offering.showcase;
  const introLines = showcase.introLines;
  const visual = showcase[offering];
  const metricStats =
    offering === "full-service" || offering === "partner" ? null : showcase[offering].stats;
  const ActiveEyebrowIcon = OFFERING_ICONS[offering];
  const [introVisible, setIntroVisible] = useState(isReducedMotion);
  const [titleOpacity, setTitleOpacity] = useState(1);
  const [titleScale, setTitleScale] = useState(1);
  const [showcaseProgress, setShowcaseProgress] = useState(isReducedMotion ? 1 : 0);
  const [showcaseFocus, setShowcaseFocus] = useState(isReducedMotion ? 1 : 0);
  const [showcaseExitProgress, setShowcaseExitProgress] = useState(isReducedMotion ? 0 : 0);

  useEffect(() => {
    if (typeof window === "undefined" || !pathname) return;

    const restoreTarget = window.sessionStorage.getItem(HERO_OFFERING_RESTORE_KEY);
    if (restoreTarget !== pathname) return;

    const scrollToShowcase = () => {
      const showcaseNode = showcaseRef.current;
      if (!showcaseNode) return;
      const scrollPaddingTop = Number.parseFloat(
        window.getComputedStyle(document.documentElement).scrollPaddingTop,
      ) || 0;
      const targetY = showcaseNode.getBoundingClientRect().top + window.scrollY - scrollPaddingTop;
      window.scrollTo({ top: Math.max(0, targetY), left: 0, behavior: "auto" });
      window.sessionStorage.removeItem(HERO_OFFERING_RESTORE_KEY);
    };

    const firstFrame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(scrollToShowcase);
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
    };
  }, [pathname]);

  useEffect(() => {
    if (isReducedMotion) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const handoffStage = handoffStageRef.current;
      const titleNode = titleRef.current;
      const showcaseNode = showcaseRef.current;
      const showcaseGridNode = showcaseGridRef.current;
      if (!handoffStage) return;

      const viewportHeight = window.innerHeight;
      const useCompactViewport = window.innerWidth <= 720 || viewportHeight <= 820;
      let nextOpacity = 1;
      let nextScale = 1;
      let nextIntroVisible = false;

      if (titleNode) {
        const titleRect = titleNode.getBoundingClientRect();
        const titleCenter = titleRect.top + (titleRect.height / 2);
        const revealStart = viewportHeight * 0.58;
        const revealEnd = viewportHeight * 0.14;
        const fadeProgress = clamp(
          (viewportHeight * 0.56 - titleCenter) / (viewportHeight * 0.48),
          0,
          1,
        );
        nextOpacity = 1 - smoothstep(0, 1, fadeProgress);
        nextScale = 1 - (smoothstep(0, 1, fadeProgress) * 0.08);
        nextIntroVisible = titleRect.top <= revealStart && titleRect.bottom >= revealEnd;
      }

      if (showcaseNode) {
        const startCenter = viewportHeight * 1.06;
        const endCenter = viewportHeight * 0.72;
        const progressRange = Math.max(startCenter - endCenter, 1);
        const focusCenter = viewportHeight * 0.78;
        const focusRange = viewportHeight * 0.22;
        const focusPlateau = viewportHeight * 0.12;
        const showcaseRect = (showcaseGridNode ?? showcaseNode).getBoundingClientRect();
        const showcaseAnchor = showcaseRect.top + Math.min(showcaseRect.height * 0.34, 180);
        const nextProgress = clamp((startCenter - showcaseAnchor) / progressRange, 0, 1);
        const focusDistance = Math.abs(showcaseAnchor - focusCenter);
        const nextFocus = clamp(
          1 - Math.max(focusDistance - focusPlateau, 0) / focusRange,
          0,
          1,
        );
        const showcaseCenter = showcaseRect.top + (showcaseRect.height / 2);
        const exitStart = viewportHeight * (useCompactViewport ? 0.32 : 0.52);
        const exitRange = viewportHeight * (useCompactViewport ? 0.56 : 0.42);
        const exitProgress = clamp(
          (exitStart - showcaseCenter) / exitRange,
          0,
          1,
        );

        setShowcaseProgress(nextProgress);
        setShowcaseFocus(nextFocus);
        setShowcaseExitProgress(smoothstep(0, 1, exitProgress));
      }

      setIntroVisible(nextIntroVisible);
      setTitleOpacity(nextOpacity);
      setTitleScale(nextScale);
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [isReducedMotion]);


  const handleCurrentPageCtaClick = (event: MouseEvent<HTMLAnchorElement>) => {
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

    const target = document.getElementById("produkt");
    if (!target) {
      return;
    }

    event.preventDefault();
    setOffering(offering);

    const scrollPaddingTop = Number.parseFloat(
      window.getComputedStyle(document.documentElement).scrollPaddingTop,
    ) || 0;
    const targetY = target.getBoundingClientRect().top + window.scrollY - scrollPaddingTop;
    window.scrollTo({ top: Math.max(0, targetY), left: 0, behavior: "smooth" });
  };

  const handleOfferingChange = (nextOffering: (typeof options)[number]["id"]) => {
    const targetRoute = getHomeRouteForOffering(nextOffering);

    if (typeof window !== "undefined" && pathname && pathname !== targetRoute) {
      window.sessionStorage.setItem(HERO_OFFERING_RESTORE_KEY, targetRoute);
    }

    setOffering(nextOffering);
  };

  return (
    <section className={styles.section} aria-label={showcase.sectionAriaLabel}>
      <div ref={handoffStageRef} className={styles.handoffStage}>
        <div className={styles.introStage}>
        <div
          ref={titleRef}
          id={HERO_OFFERING_TITLE_ID}
          className={`${styles.splitTitle} ${introVisible ? styles.splitTitleVisible : ""}`}
          style={{
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
          }}
          aria-label={introLines.join(" ")}
          role="heading"
          aria-level={2}
        >
          {introLines.map((line, lineIndex) => {
            const words = line.split(" ");
            let charOffset = 0;

            return (
              <p key={line} className={styles.splitLine}>
                {words.map((word, wordIndex) => {
                  const chars = Array.from(word);
                  const startOffset = charOffset;
                  charOffset += chars.length + 1;

                  return (
                    <span key={`${lineIndex}-${word}-${wordIndex}`} className={styles.wordGroup} aria-hidden="true">
                      {chars.map((char, charIndex) => {
                        const delay = lineIndex * 70 + (startOffset + charIndex) * 18;
                        return (
                          <span
                            key={`${lineIndex}-${wordIndex}-${char}-${charIndex}`}
                            className={styles.charWrap}
                            style={{ "--char-delay": `${delay}ms` } as CSSProperties}
                          >
                            <span className={styles.charInner}>{char}</span>
                          </span>
                        );
                      })}
                    </span>
                  );
                })}
              </p>
            );
          })}
        </div>
        </div>
      </div>

      <div
        ref={showcaseRef}
        id={HERO_OFFERING_SHOWCASE_ID}
        className={styles.showcase}
        style={{
          "--showcase-progress": showcaseProgress.toFixed(3),
          "--showcase-focus": showcaseFocus.toFixed(3),
          "--showcase-exit-progress": showcaseExitProgress.toFixed(3),
        } as CSSProperties}
      >
        <div className={styles.panel}>
          <div className={styles.controlsHeader}>
            <p className={styles.previewLabel}>
              <span>{showcase.previewLabel}</span>
            </p>
          </div>

          <div className={styles.controls} aria-label={showcase.tabListAriaLabel}>
            {options.map((option) => {
              const Icon = OFFERING_ICONS[option.id];
              const active = offering === option.id;

              return (
                <div key={option.id} className={styles.optionSlot}>
                  <button
                    type="button"
                    aria-pressed={active}
                    className={`${styles.option} ${active ? styles.optionActive : ""}`}
                    onClick={() => handleOfferingChange(option.id)}
                  >
                    <span className={styles.optionIcon}>
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <span>{option.label}</span>
                  </button>
                </div>
              );
            })}
          </div>

            <div ref={showcaseGridRef} className={styles.grid}>
              <article
                className={`${styles.copyCard} ${
                  offering === "partner" ? styles.copyCardPartner : ""
                }`}
              >
                <div key={offering} className={styles.copyContent}>
                  <span className={styles.copyEyebrow}>
                    <ActiveEyebrowIcon size={13} aria-hidden="true" />
                    <span>{visual.eyebrow}</span>
                  </span>
                  <h2>{visual.title}</h2>
                  <p className={styles.copyBody}>{visual.body}</p>

                  <div className={styles.copyBullets}>
                    {options
                      .find((option) => option.id === offering)
                      ?.bullets.map((bullet) => (
                        <div key={bullet} className={styles.bullet}>
                          <CircleDot size={14} aria-hidden="true" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                  </div>

                  <a
                    href={visual.ctaHref}
                    className={`${styles.inlineCta} ${styles.inlineCtaCurrentPage}`}
                    onClick={handleCurrentPageCtaClick}
                  >
                    <span>
                      {showcase.currentPageCtaLabel}
                    </span>
                    <ArrowDown size={19} aria-hidden="true" />
                  </a>
                </div>
              </article>

              <div className={styles.visualCard} aria-hidden="true">
                <div key={offering} className={styles.visualContent}>
                  <div className={styles.visualChrome}>
                    <span />
                    <span />
                    <span />
                    <div className={styles.visualBrand}>
                      <svg viewBox="0 0 50 50" aria-hidden="true">
                        <g fill="currentColor">
                          <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
                          <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
                          <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
                          <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
                        </g>
                      </svg>
                      <span>MinCFO</span>
                    </div>
                  </div>

                  <div
                    className={`${styles.visualBody} ${
                      offering === "platform" ? styles.visualBodyPlatform : ""
                    } ${
                      offering === "full-service" ? styles.visualBodyFullService : ""
                    }`}
                  >
                    {metricStats && (
                      <div className={styles.metricGrid}>
                        {metricStats.map((item) => (
                          <div key={item.label} className={styles.metricCard}>
                            <span>{item.label}</span>
                            <strong className={styles.metricValueRow}>
                              <MetricCardIcon label={item.label} value={item.value} />
                              <span>{item.value}</span>
                            </strong>
                          </div>
                        ))}
                      </div>
                    )}

                    {offering === "platform" && (
                      <ShowcaseGradientBarChart />
                    )}
                    {offering === "full-service" && (
                      <FullServiceVisual content={showcase["full-service"].serviceVisual} />
                    )}
                    {offering === "partner" && (
                      <AgencyWorkspaceVisual />
                    )}
                  </div>
                </div>
              </div>
            </div>

          <div className={styles.showcasePager} aria-label={showcase.pagerAriaLabel}>
            {options.map((option) => {
              const isActive = option.id === offering;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`${styles.pagerDot} ${isActive ? styles.pagerDotActive : ""}`}
                  aria-label={`Visa ${option.label}`}
                  aria-pressed={isActive}
                  onClick={() => handleOfferingChange(option.id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
