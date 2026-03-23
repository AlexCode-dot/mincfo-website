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
import {
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { useHomeOffering } from "@/components/home/HomeOfferingProvider";
import { useMotion } from "@/components/system/MotionProvider";
import {
  ShowcaseGradientBarChart,
} from "./HeroOfferingCharts";
import TextType from "./TextType";
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
const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
const formatTranslate3d = (x: number, y: number, scale?: number) => {
  const snappedX = Math.round(x);
  const snappedY = Math.round(y);

  if (Math.abs(snappedX) < 1 && Math.abs(snappedY) < 1 && scale === undefined) {
    return "none";
  }

  if (scale === undefined || Math.abs(scale - 1) < 0.001) {
    return `translate3d(${snappedX}px, ${snappedY}px, 0)`;
  }

  return `translate3d(${snappedX}px, ${snappedY}px, 0) scale(${scale})`;
};

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const getStaggeredProgress = (
  progress: number,
  start: number,
  end: number,
  index: number,
  total: number,
  spread = 0.16,
) => {
  if (total <= 1) return smoothstep(start, end, progress);
  const offset = (index / (total - 1)) * spread;
  return smoothstep(start + offset, end + offset, progress);
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
                        className={`${styles.partnerWorkspaceModePreview} ${styles.partnerWorkspaceModePreviewSystem}`}
                      >
                        <span className={styles.partnerWorkspacePreviewSidebar} />
                        <span className={styles.partnerWorkspacePreviewCanvas} />
                      </div>
                      <strong>{workspace.settings.modes.system}</strong>
                    </article>
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
  const sectionRef = useRef<HTMLElement | null>(null);
  const introStageRef = useRef<HTMLDivElement | null>(null);
  const scrollHintRef = useRef<HTMLDivElement | null>(null);
  const showcaseRef = useRef<HTMLDivElement | null>(null);
  const optionSlotRefs = useRef<Array<HTMLDivElement | null>>([]);
  const copyCardRef = useRef<HTMLElement | null>(null);
  const visualCardRef = useRef<HTMLDivElement | null>(null);
  const charRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const positionedRef = useRef(false);
  const previewLabelReadyRef = useRef(false);
  const lastProgressRef = useRef(-1);
  const showcase = shared.offering.showcase;
  const introLines = showcase.introLines;
  const [isPositioned, setIsPositioned] = useState(false);
  const [previewLabelReady, setPreviewLabelReady] = useState(false);

  useLayoutEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      const introStage = introStageRef.current;
      const scrollHint = scrollHintRef.current;
      const showcaseNode = showcaseRef.current;
      const copyCard = copyCardRef.current;
      const visualCard = visualCardRef.current;
      if (!section || !introStage || !scrollHint || !showcaseNode || !copyCard || !visualCard) return;

      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(rect.height - window.innerHeight, 1);
      const next = Math.round(clamp(-rect.top / scrollable, 0, 1) / 0.01) * 0.01;
      if (next === lastProgressRef.current) return;
      lastProgressRef.current = next;

      const introOpacity = isReducedMotion
        ? 1
        : next <= 0.04
          ? 0
          : next <= 0.16
            ? smoothstep(0.04, 0.16, next)
            : next <= 0.56
              ? 1
              : 1 - smoothstep(0.56, 0.9, next);
      const introShift = isReducedMotion
        ? 0
        : next <= 0.16
          ? 22 - smoothstep(0.04, 0.16, next) * 22
          : next <= 0.56
            ? 0
            : smoothstep(0.56, 0.9, next) * -18;
      const showcaseOpacity = isReducedMotion ? 1 : smoothstep(0.7, 0.92, next);
      const showcaseTranslate = isReducedMotion ? 0 : 48 - showcaseOpacity * 48;
      const controlsReveal = isReducedMotion ? 1 : smoothstep(0.74, 0.94, next);
      const copyReveal = isReducedMotion ? 1 : smoothstep(0.78, 0.98, next);
      const visualReveal = isReducedMotion ? 1 : smoothstep(0.82, 1, next);
      const scrollHintReveal = isReducedMotion ? 0 : smoothstep(0.1, 0.18, next) * (1 - smoothstep(0.54, 0.72, next));

      introStage.style.opacity = `${introOpacity}`;
      introStage.style.transform = `translate3d(0, ${introShift}px, 0)`;
      introStage.setAttribute("aria-hidden", introOpacity <= 0.02 ? "true" : "false");

      scrollHint.style.opacity = `${scrollHintReveal}`;
      showcaseNode.style.opacity = `${showcaseOpacity}`;
      showcaseNode.style.transform = `translate3d(0, ${showcaseTranslate}px, 0)`;
      if (!positionedRef.current) {
        positionedRef.current = true;
        setIsPositioned(true);
      }

      const shouldShowPreviewLabel = isReducedMotion || showcaseOpacity >= 0.96;
      if (previewLabelReadyRef.current !== shouldShowPreviewLabel) {
        previewLabelReadyRef.current = shouldShowPreviewLabel;
        setPreviewLabelReady(shouldShowPreviewLabel);
      }

      optionSlotRefs.current.forEach((node, index) => {
        if (!node) return;
        const optionReveal = isReducedMotion
          ? 1
          : getStaggeredProgress(controlsReveal, 0, 1, index, options.length, 0.22);
        node.style.opacity = `${optionReveal}`;
        node.style.transform = `translate3d(0, ${(1 - optionReveal) * 24}px, 0) scale(${0.96 + optionReveal * 0.04})`;
      });

      copyCard.style.opacity = `${copyReveal}`;
      copyCard.style.transform = formatTranslate3d((1 - copyReveal) * -20, (1 - copyReveal) * 24);
      visualCard.style.opacity = `${visualReveal}`;
      visualCard.style.transform = formatTranslate3d(
        (1 - visualReveal) * 22,
        (1 - visualReveal) * 28,
        0.97 + visualReveal * 0.03,
      );

      charRefs.current.forEach((node) => {
        if (!node) return;
        const lineIndex = Number(node.dataset.lineIndex ?? 0);
        const charIndex = Number(node.dataset.charIndex ?? 0);
        const total = Number(node.dataset.lineLength ?? 1);
        const isSpace = node.dataset.space === "true";
        const lineOffset = lineIndex * 0.03;
        const charIn = getStaggeredProgress(
          next,
          0.04 + lineOffset,
          0.16 + lineOffset,
          charIndex,
          total,
          0.1,
        );
        const charOut = getStaggeredProgress(
          next,
          0.56,
          0.86,
          charIndex,
          total,
          0.08,
        );
        const charOpacity = isReducedMotion ? 1 : isSpace ? 1 : charIn * (1 - charOut);
        const charY = isReducedMotion ? 0 : isSpace ? 0 : (1 - charIn) * 42 - charOut * 24;
        node.style.opacity = `${charOpacity}`;
        node.style.transform = `translate3d(0, ${charY}px, 0)`;
      });
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
  }, [isReducedMotion, options.length]);
  const visual = showcase[offering];
  const metricStats =
    offering === "full-service" || offering === "partner" ? null : showcase[offering].stats;
  const ActiveEyebrowIcon = OFFERING_ICONS[offering];


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

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label={showcase.sectionAriaLabel}
    >
      <div className={styles.stickyFrame}>
        <div
          ref={introStageRef}
          className={`${styles.introStage} ${isPositioned ? styles.stageReady : ""}`}
        >
          <div className={styles.splitTitle} aria-label={introLines.join(" ")} role="heading" aria-level={2}>
            {introLines.map((line, lineIndex) => {
              const lineChars = Array.from(line);

              return (
                <p key={line} className={styles.splitLine}>
                  {lineChars.map((char, index) => (
                    <span
                      key={`${lineIndex}-${char}-${index}`}
                      ref={(node) => {
                        charRefs.current[lineIndex * 64 + index] = node;
                      }}
                      className={styles.charWrap}
                      aria-hidden="true"
                      data-line-index={lineIndex}
                      data-char-index={index}
                      data-line-length={lineChars.length}
                      data-space={char === " " ? "true" : "false"}
                    >
                      <span className={styles.charInner}>{char === " " ? "\u00A0" : char}</span>
                    </span>
                  ))}
                </p>
              );
            })}
          </div>

          <div
            ref={scrollHintRef}
            className={styles.scrollHint}
            aria-hidden="true"
          >
            <span className={styles.scrollMouse}>
              <span className={styles.scrollWheel} />
            </span>
          </div>
        </div>

        <div
          ref={showcaseRef}
          className={`${styles.showcase} ${isPositioned ? styles.stageReady : ""}`}
        >
          <div className={styles.panel}>
            <div className={styles.controlsHeader}>
              <p className={styles.previewLabel}>
                {previewLabelReady ? (
                  <TextType
                    text={showcase.previewLabel}
                    typingSpeed={18}
                    initialDelay={140}
                    cursorCharacter="_"
                    cursorClassName={styles.previewLabelCursor}
                  />
                ) : (
                  <span className={styles.previewLabelGhost} aria-hidden="true">
                    {showcase.previewLabel}
                  </span>
                )}
              </p>
            </div>

            <div className={styles.controls} aria-label={showcase.tabListAriaLabel}>
              {options.map((option, index) => {
                const Icon = OFFERING_ICONS[option.id];
                const active = offering === option.id;

                return (
                  <div
                    key={option.id}
                    ref={(node) => {
                      optionSlotRefs.current[index] = node;
                    }}
                    className={styles.optionSlot}
                  >
                    <button
                      type="button"
                      aria-pressed={active}
                      className={`${styles.option} ${active ? styles.optionActive : ""}`}
                      onClick={() => setOffering(option.id)}
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

            <div className={styles.grid}>
              <article
                ref={copyCardRef}
                className={`${styles.copyCard} ${
                  offering === "partner" ? styles.copyCardPartner : ""
                }`}
              >
                <div key={offering} className={styles.copyContent}>
                  <span className={styles.copyEyebrow}>
                    <ActiveEyebrowIcon size={13} aria-hidden="true" />
                    <span>{visual.eyebrow}</span>
                  </span>
                  <h2>
                    {offering === "partner" ? (
                      <>
                        <span>Ökad proaktivitet</span>
                        <br />
                        <span>och skalbarhet</span>
                      </>
                    ) : (
                      visual.title
                    )}
                  </h2>
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

              <div
                ref={visualCardRef}
                className={styles.visualCard}
                aria-hidden="true"
              >
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
                    onClick={() => setOffering(option.id)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
