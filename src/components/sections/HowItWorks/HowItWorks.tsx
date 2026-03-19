"use client";

import {
  ArrowRight,
  BrainCircuit,
  Building2,
  CreditCard,
  FolderPlus,
  Plug,
  RefreshCw,
  ReceiptText,
  Sparkles,
  TrendingUp,
  UserRound,
  UsersRound,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FormEvent,
} from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis } from "recharts";
import { useHomeOffering } from "@/components/home/HomeOfferingProvider";
import { useMotion } from "@/components/system/MotionProvider";
import BeamBackgroundMain from "@/components/visual/BeamBackgroundMain/BeamBackgroundMain";
import styles from "./HowItWorks.module.scss";

type OfferKey = "platform" | "faas" | "partner";
type PartnerWorkspaceView = "home" | "users" | "settings";
type PartnerWorkspaceRow = {
  detail: string;
  label: string;
  meta: string;
  status: string;
  tag: string;
};
type PartnerWorkspaceScreen = {
  actionLabel: string;
  columns: string[];
  rows: PartnerWorkspaceRow[];
  subtitle: string;
  title: string;
};
type PartnerWorkspaceContent = ReturnType<typeof useHomeOffering>["content"]["howItWorks"]["ui"]["partnerWorkspace"];

type OfferModel = {
  isPrimary: boolean;
  key: OfferKey;
  tabLabel: string;
  steps: Array<{
    body: string;
    highlights?: string[];
    icon: LucideIcon;
    title: string;
  }>;
};

type GradientBarShapeProps = {
  animateOnMount?: boolean;
  animationIndex?: number;
  dataKey?: string;
  fill?: string;
  height?: number | string;
  width?: number | string;
  x?: number | string;
  y?: number | string;
};

function GradientBarShape(props: GradientBarShapeProps) {
  const {
    animateOnMount = false,
    animationIndex = 0,
    fill,
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    dataKey = "value",
  } = props;

  if (!width || !height) {
    return null;
  }

  const numericX = typeof x === "number" ? x : Number(x ?? 0);
  const numericY = typeof y === "number" ? y : Number(y ?? 0);
  const gradientId = `faas-gradient-bar-${dataKey}-${Math.round(numericX)}-${Math.round(numericY)}`;

  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={String(fill)} stopOpacity="0.9" />
          <stop offset="100%" stopColor={String(fill)} stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        ry={8}
        fill={`url(#${gradientId})`}
        className={animateOnMount ? styles.faasRealtimeBarShape : undefined}
        style={
          animateOnMount
            ? ({ "--faas-bar-delay": `${animationIndex * 55}ms` } as CSSProperties)
            : undefined
        }
      />
    </>
  );
}

const APP_LOGIN_URL = process.env.NEXT_PUBLIC_APP_LOGIN_URL ?? "https://app.mincfo.com/login";
const HOW_IT_WORKS_STEP_SCROLL_FACTOR = 0.72;
const HOW_IT_WORKS_PROGRESS_ACCELERATION = 1.12;
const HOW_IT_WORKS_PROGRESS_ACCELERATION_BY_OFFER: Record<OfferKey, number> = {
  platform: HOW_IT_WORKS_PROGRESS_ACCELERATION,
  faas: 0.88,
  partner: HOW_IT_WORKS_PROGRESS_ACCELERATION,
};
const FAAS_ALERT_ROTATION_INTERVAL_MS = 3200;
const getPartnerWorkspaceToggleState = (rows: PartnerWorkspaceRow[]) =>
  Object.fromEntries(rows.map((row) => [row.label, row.status === "Aktiv"]));
const subscribeHydration = () => () => {};
const getHydratedSnapshot = () => true;
const getHydratedServerSnapshot = () => false;

function GoogleIcon() {
  return (
    <svg className={styles.accountProviderIcon} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.46a5.53 5.53 0 0 1-2.39 3.63v3.01h3.87c2.27-2.09 3.55-5.18 3.55-8.67Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.87-3.01c-1.07.72-2.45 1.14-4.06 1.14-3.12 0-5.76-2.11-6.7-4.95H1.3v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.28A7.2 7.2 0 0 1 4.92 12c0-.79.14-1.56.38-2.28v-3.1H1.3A12 12 0 0 0 0 12c0 1.94.46 3.78 1.3 5.38l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.78l3.44-3.44C17.95 1.18 15.24 0 12 0A12 12 0 0 0 1.3 6.62l4 3.1c.94-2.84 3.58-4.95 6.7-4.95Z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg className={styles.accountProviderIcon} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="2" width="9" height="9" fill="#F25022" />
      <rect x="13" y="2" width="9" height="9" fill="#7FBA00" />
      <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
      <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const STEP_SWITCH_HYSTERESIS = 0.62;

const getStableDominantStep = (
  rawStep: number,
  previousStep: number,
  maxStep: number,
) => {
  if (maxStep <= 0) return 0;
  if (previousStep < 0) return Math.round(clamp(rawStep, 0, maxStep));

  let nextStep = previousStep;

  while (nextStep < maxStep && rawStep >= nextStep + STEP_SWITCH_HYSTERESIS) {
    nextStep += 1;
  }

  while (nextStep > 0 && rawStep <= nextStep - STEP_SWITCH_HYSTERESIS) {
    nextStep -= 1;
  }

  return clamp(nextStep, 0, maxStep);
};

const PLATFORM_ICONS: LucideIcon[] = [UserRound, Plug, BrainCircuit, Sparkles];
const FAAS_ICONS: LucideIcon[] = [FolderPlus, Plug, Workflow, Sparkles];
const PARTNER_ICONS: LucideIcon[] = [UsersRound, Building2, BrainCircuit];

const PartnerWorkspaceMock = memo(function PartnerWorkspaceMock({
  brandWord,
  content,
  screen,
  userToggles,
  view,
  onNavClick,
  onToggleUser,
}: {
  brandWord: string;
  content: PartnerWorkspaceContent;
  screen: PartnerWorkspaceScreen;
  userToggles: Record<string, boolean>;
  view: PartnerWorkspaceView;
  onNavClick: (nextView: PartnerWorkspaceView) => void;
  onToggleUser: (label: string) => void;
}) {
  return (
    <div className={styles.partnerPortfolioMock}>
      <div className={styles.partnerWorkspaceShell}>
        <aside className={styles.partnerWorkspaceSidebar}>
          <div className={styles.partnerWorkspaceBrand}>
            <svg className={styles.partnerWorkspaceBrandMark} viewBox="0 0 50 50" aria-hidden="true">
              <g fill="currentColor">
                <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
                <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
                <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
                <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
              </g>
            </svg>
            <span>{brandWord}</span>
          </div>

          <div className={styles.partnerWorkspaceNav}>
            <button
              type="button"
              className={`${styles.partnerWorkspaceNavItem} ${
                view === "home" ? styles.partnerWorkspaceNavItemActive : ""
              }`}
              onClick={() => onNavClick("home")}
            >
              {content.nav.home}
            </button>
            <button
              type="button"
              className={`${styles.partnerWorkspaceNavItem} ${
                view === "users" ? styles.partnerWorkspaceNavItemActive : ""
              }`}
              onClick={() => onNavClick("users")}
            >
              {content.nav.users}
            </button>
            <button
              type="button"
              className={`${styles.partnerWorkspaceNavItem} ${
                view === "settings" ? styles.partnerWorkspaceNavItemActive : ""
              }`}
              onClick={() => onNavClick("settings")}
            >
              {content.nav.settings}
            </button>
          </div>
        </aside>

        <div className={styles.partnerWorkspaceMain}>
          <div className={styles.partnerWorkspaceIntro}>
            <strong>{screen.title}</strong>
            <span>{screen.subtitle}</span>
          </div>

          {view === "settings" ? (
            <div key="settings" className={`${styles.partnerSettingsPanel} ${styles.partnerWorkspaceViewPanel}`}>
              <div className={styles.partnerSettingsTabs}>
                <span className={styles.partnerSettingsTab}>{content.settings.tabs.profile}</span>
                <span className={`${styles.partnerSettingsTab} ${styles.partnerSettingsTabActive}`}>
                  {content.settings.tabs.appearance}
                </span>
              </div>

              <div className={styles.partnerSettingsSection}>
                <div className={styles.partnerSettingsSectionCopy}>
                  <strong>{content.settings.appearanceTitle}</strong>
                  <span>{content.settings.appearanceBody}</span>
                </div>

                <div className={styles.partnerSettingsModes}>
                  <article className={styles.partnerSettingsMode}>
                    <div className={`${styles.partnerSettingsModePreview} ${styles.partnerSettingsModePreviewSystem}`}>
                      <span className={styles.partnerSettingsPreviewSidebar} />
                      <span className={styles.partnerSettingsPreviewCanvas} />
                    </div>
                    <strong>{content.settings.modes.system}</strong>
                  </article>
                  <article className={styles.partnerSettingsMode}>
                    <div className={`${styles.partnerSettingsModePreview} ${styles.partnerSettingsModePreviewLight}`}>
                      <span className={styles.partnerSettingsPreviewSidebar} />
                      <span className={styles.partnerSettingsPreviewCanvas} />
                    </div>
                    <strong>{content.settings.modes.light}</strong>
                  </article>
                  <article className={`${styles.partnerSettingsMode} ${styles.partnerSettingsModeActive}`}>
                    <div className={`${styles.partnerSettingsModePreview} ${styles.partnerSettingsModePreviewDark}`}>
                      <span className={styles.partnerSettingsPreviewSidebar} />
                      <span className={styles.partnerSettingsPreviewCanvas} />
                    </div>
                    <strong>{content.settings.modes.dark}</strong>
                  </article>
                </div>
              </div>

              <div className={styles.partnerSettingsSection}>
                <div className={styles.partnerSettingsSectionCopy}>
                  <strong>{content.settings.languageTitle}</strong>
                  <span>{content.settings.languageBody}</span>
                </div>

                <div className={styles.partnerSettingsLanguage}>
                  <span>{content.settings.languageValue}</span>
                  <span>▾</span>
                </div>
              </div>
            </div>
          ) : view === "users" ? (
            <div key="users" className={`${styles.partnerUsersPanel} ${styles.partnerWorkspaceViewPanel}`}>
              <div className={styles.partnerUsersTopbar}>
                <div className={styles.partnerUsersSearch}>{content.users.searchPlaceholder}</div>
                <button type="button" className={styles.partnerUsersInvite}>
                  {content.users.inviteLabel}
                </button>
              </div>

              <div className={styles.partnerUsersTable}>
                <div className={styles.partnerUsersTableHead}>
                  <span>{content.users.tableLabel}</span>
                  <span />
                </div>

                {screen.rows.map((row) => (
                  <article key={`${view}-${row.label}`} className={styles.partnerUsersRow}>
                    <div className={styles.partnerWorkspaceCompany}>
                      <span className={styles.partnerWorkspaceAvatar}>{row.meta}</span>
                      <div className={styles.partnerWorkspaceCompanyMeta}>
                        <strong>{row.label}</strong>
                        <span>{row.detail}</span>
                      </div>
                    </div>

                    <div className={styles.partnerUsersRoleWrap}>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={userToggles[row.label] ?? false}
                        aria-label={`${row.label}: ${row.tag}`}
                        className={`${styles.partnerUsersToggle} ${
                          userToggles[row.label] ? styles.partnerUsersToggleActive : ""
                        }`}
                        onClick={() => onToggleUser(row.label)}
                      >
                        <span className={styles.partnerUsersToggleTrack}>
                          <span className={styles.partnerUsersToggleThumb} />
                        </span>
                      </button>
                      <button type="button" className={styles.partnerUsersRowAction}>
                        ⋯
                      </button>
                    </div>
                  </article>
                ))}

                <div className={styles.partnerWorkspacePagination}>
                  <span className={styles.partnerWorkspacePageGhost}>{content.pagination.previous}</span>
                  <span className={styles.partnerWorkspacePageCurrent}>1</span>
                  <span className={styles.partnerWorkspacePageGhost}>{content.pagination.next}</span>
                </div>
              </div>
            </div>
          ) : (
            <div key="home" className={`${styles.partnerWorkspaceTable} ${styles.partnerWorkspaceViewPanel}`}>
              <div className={styles.partnerWorkspaceTableHead}>
                <span>{screen.columns[0]}</span>
                <span>{screen.columns[1]}</span>
                <span>{screen.columns[2]}</span>
                <span />
              </div>

              {screen.rows.map((row) => (
                <article key={`${view}-${row.label}`} className={styles.partnerWorkspaceRow}>
                  <div className={styles.partnerWorkspaceCompany}>
                    <span className={styles.partnerWorkspaceAvatar}>{row.meta}</span>
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

                  <div className={styles.partnerWorkspaceActionWrap}>
                    <button type="button" className={styles.partnerWorkspaceAction}>
                      {screen.actionLabel}
                    </button>
                  </div>
                </article>
              ))}

              <div className={styles.partnerWorkspacePagination}>
                <span className={styles.partnerWorkspacePageGhost}>{content.pagination.previous}</span>
                <span className={styles.partnerWorkspacePageCurrent}>1</span>
                <span className={styles.partnerWorkspacePageGhost}>{content.pagination.next}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.partnerPortfolioFooter}>
        <div className={styles.partnerPortfolioSummary}>
          <span className={styles.partnerPortfolioSummaryLabel}>{content.summary.label}</span>
          <strong>{content.summary.title}</strong>
        </div>
      </div>
    </div>
  );
});

export default function HowItWorks() {
  const { content, offering } = useHomeOffering();
  const { isReducedMotion } = useMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const lastDominantStepRef = useRef(-1);
  const lastHeaderRevealRef = useRef(-1);
  const lastPanelRevealRef = useRef(-1);
  const lastAppliedStepRef = useRef(-1);
  const [dominantStepIndex, setDominantStepIndex] = useState(0);
  const headerInnerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const stepRowRefs = useRef<Array<HTMLElement | null>>([]);
  const stepTextRefs = useRef<Array<HTMLDivElement | null>>([]);
  const stepVisualRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [signupEmail, setSignupEmail] = useState("");
  const [partnerWorkspaceView, setPartnerWorkspaceView] = useState<PartnerWorkspaceView>("home");
  const isClientReady = useSyncExternalStore(
    subscribeHydration,
    getHydratedSnapshot,
    getHydratedServerSnapshot,
  );

  const offers: Record<OfferKey, OfferModel> = {
    platform: {
      key: "platform",
      isPrimary: true,
      tabLabel: content.howItWorks.offers.platform.tabLabel,
      steps: content.howItWorks.offers.platform.steps.map((step, index) => ({
        ...step,
        icon: PLATFORM_ICONS[index] ?? Sparkles,
      })),
    },
    faas: {
      key: "faas",
      isPrimary: false,
      tabLabel: content.howItWorks.offers.faas.tabLabel,
      steps: content.howItWorks.offers.faas.steps.map((step, index) => ({
        ...step,
        icon: FAAS_ICONS[index] ?? Sparkles,
      })),
    },
    partner: {
      key: "partner",
      isPrimary: false,
      tabLabel: content.howItWorks.offers.partner.tabLabel,
      steps: content.howItWorks.offers.partner.steps.map((step, index) => ({
        ...step,
        icon: PARTNER_ICONS[index] ?? Sparkles,
      })),
    },
  };

  const activeOffer: OfferKey =
    offering === "full-service" ? "faas" : offering === "partner" ? "partner" : "platform";
  const currentOffer = offers[activeOffer];
  const progressAcceleration = HOW_IT_WORKS_PROGRESS_ACCELERATION_BY_OFFER[activeOffer];
  const sectionIntroByOffer = content.howItWorks.sectionIntroByOffer as Record<OfferKey, string>;
  const partnerWorkspaceContent = content.howItWorks.ui.partnerWorkspace;
  const partnerWorkspaceScreens: Record<PartnerWorkspaceView, PartnerWorkspaceScreen> =
    partnerWorkspaceContent;
  const partnerWorkspaceScreen = partnerWorkspaceScreens[partnerWorkspaceView];
  const [partnerWorkspaceUserToggles, setPartnerWorkspaceUserToggles] = useState<Record<string, boolean>>(
    () => getPartnerWorkspaceToggleState(partnerWorkspaceScreens.users.rows),
  );
  const [faasAlertCycle, setFaasAlertCycle] = useState(0);
  const [faasBarsAnimatedOnce, setFaasBarsAnimatedOnce] = useState(false);
  const faasAlertPool = [
    "Personalkostnad ligger 1.7% over budget",
    "Kundinbetalningar ligger 4 dagar efter plan",
    "Bruttomarginalen ar 0.9 procentenheter under manadsplan",
    "Likviditetsprognosen ar uppdaterad efter senaste leverantorsutbetalning",
  ];
  const faasVisibleAlerts = Array.from({ length: 2 }, (_, index) => {
    const alertIndex = (faasAlertCycle * 2 + index) % faasAlertPool.length;
    return {
      id: `${faasAlertCycle}-${alertIndex}`,
      text: faasAlertPool[alertIndex],
    };
  });

  const handlePartnerWorkspaceNavClick = useCallback((nextView: PartnerWorkspaceView) => {
    setPartnerWorkspaceView(nextView);
  }, []);

  const handlePartnerWorkspaceToggle = useCallback((label: string) => {
    setPartnerWorkspaceUserToggles((current) => ({
      ...current,
      [label]: !(current[label] ?? false),
    }));
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        section.classList.toggle(styles.visible, entry.isIntersecting);
      },
      { threshold: 0.22, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    const totalSteps = currentOffer.steps.length;
    lastAppliedStepRef.current = -1;
    lastHeaderRevealRef.current = -1;
    lastPanelRevealRef.current = -1;

    const applyStepState = (dominantStep: number) => {
      stepRowRefs.current.forEach((row, index) => {
        const text = stepTextRefs.current[index];
        const visual = stepVisualRefs.current[index];
        if (!row || !text || !visual) return;

        const isReversed = index % 2 === 1;
        const isActive = isReducedMotion ? index === 0 : index === dominantStep;
        const isBeforeActive = index < dominantStep;
        const stepReveal = isActive ? 1 : 0;
        const spineProgress = isActive ? 1 : 0;
        const rowTranslateY = isActive ? 0 : isBeforeActive ? -28 : 28;
        const rowScale = isActive ? 1 : 0.985;
        const textReveal = isActive ? 1 : 0;
        const visualReveal = isActive ? 1 : 0;
        const textTranslateX = isActive ? 0 : isReversed ? 18 : -18;
        const visualTranslateX = isActive ? 0 : isReversed ? -22 : 22;
        const textTranslateY = isActive ? 0 : isBeforeActive ? -10 : 10;
        const visualTranslateY = isActive ? 0 : isBeforeActive ? -14 : 14;
        const visualScale = isActive ? 1 : 0.985;

        row.hidden = !isActive;
        row.setAttribute("aria-hidden", isActive ? "false" : "true");
        row.style.opacity = `${stepReveal}`;
        row.style.transform = `translate3d(0, ${rowTranslateY}px, 0) scale(${rowScale})`;
        row.style.setProperty("--step-spine-progress", `${spineProgress}`);
        row.classList.toggle(styles.stepRowVisible, isActive);

        text.style.opacity = `${textReveal}`;
        text.style.transform = `translate3d(${textTranslateX}px, ${textTranslateY}px, 0)`;
        visual.style.opacity = `${visualReveal}`;
        visual.style.transform = `translate3d(${visualTranslateX}px, ${visualTranslateY}px, 0) scale(${visualScale})`;
      });
    };

    const updateProgress = () => {
      frame = 0;
      const section = sectionRef.current;
      const headerInner = headerInnerRef.current;
      const panel = panelRef.current;
      if (!section || !headerInner || !panel) return;

      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight;
      if (rect.bottom < -viewport * 0.2 || rect.top > viewport * 1.2) {
        return;
      }
      const scrollable = Math.max(rect.height - window.innerHeight, 1);
      const progress = isReducedMotion ? 1 : clamp(-rect.top / scrollable, 0, 1);
      const acceleratedProgress = isReducedMotion
        ? 1
        : clamp(progress * progressAcceleration, 0, 1);
      const dominantStep = getStableDominantStep(
        acceleratedProgress * Math.max(totalSteps - 1, 1),
        lastDominantStepRef.current,
        totalSteps - 1,
      );
      if (dominantStep !== lastDominantStepRef.current) {
        lastDominantStepRef.current = dominantStep;
        setDominantStepIndex(dominantStep);
      }
      const headerReveal = Math.round((isReducedMotion ? 1 : smoothstep(0.02, 0.16, progress)) * 100) / 100;
      const panelReveal = Math.round((isReducedMotion ? 1 : smoothstep(0.08, 0.24, progress)) * 100) / 100;

      if (headerReveal !== lastHeaderRevealRef.current) {
        lastHeaderRevealRef.current = headerReveal;
        headerInner.style.opacity = `${headerReveal}`;
        headerInner.style.transform = `translate3d(0, ${(1 - headerReveal) * 22}px, 0)`;
      }
      if (panelReveal !== lastPanelRevealRef.current) {
        lastPanelRevealRef.current = panelReveal;
        panel.style.opacity = `${panelReveal}`;
        panel.style.transform = `translate3d(0, ${(1 - panelReveal) * 28}px, 0)`;
      }
      if (dominantStep !== lastAppliedStepRef.current) {
        lastAppliedStepRef.current = dominantStep;
        applyStepState(dominantStep);
      }
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateProgress);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [currentOffer.steps.length, isReducedMotion, activeOffer, progressAcceleration]);

  useEffect(() => {
    if (isReducedMotion) return undefined;

    const interval = window.setInterval(() => {
      setFaasAlertCycle((current) => current + 1);
    }, FAAS_ALERT_ROTATION_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [isReducedMotion]);

  useEffect(() => {
    if (isReducedMotion) return undefined;

    const timeout = window.setTimeout(() => {
      setFaasBarsAnimatedOnce(true);
    }, 1100);

    return () => window.clearTimeout(timeout);
  }, [isReducedMotion]);

  const handleAccountHandoff = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.location.href = APP_LOGIN_URL;
  };

  const totalSteps = currentOffer.steps.length;
  const desktopTrackHeight = `${Math.max(totalSteps * HOW_IT_WORKS_STEP_SCROLL_FACTOR * 100, 100)}vh`;

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className={styles.section}
      data-offer={activeOffer}
      style={{ "--how-it-works-height": desktopTrackHeight } as CSSProperties}
    >
      <div className={styles.background} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.stickyFrame}>
          <header className={styles.header}>
            <div ref={headerInnerRef}>
              <h2>{content.howItWorks.sectionTitle}</h2>
              <p>{sectionIntroByOffer[currentOffer.key]}</p>
            </div>
          </header>

          <div
            ref={panelRef}
            id={`how-panel-${currentOffer.key}`}
            className={`${styles.panel} ${
              currentOffer.isPrimary ? styles.panelPrimary : styles.panelSecondary
            }`}
          >
            <div className={styles.stepsTrack}>
              <div className={styles.stepsSticky}>
                <div className={styles.stepsFlow}>
            {currentOffer.steps.map((step, index) => {
              const Icon = step.icon;
              const stepNum = `0${index + 1}`;
              const isReversed = index % 2 === 1;
              const visualVariant = (index % 3) + 1;
              const isCreateAccountStep = currentOffer.key === "platform" && index === 0;
              const isConnectFortnoxStep = currentOffer.key === "platform" && index === 1;
              const isInsightsStep =
                (currentOffer.key === "platform" && index === 2) ||
                (currentOffer.key === "faas" && index === 3) ||
                (currentOffer.key === "partner" && index === 2);
              const isFaasOnboardingStep = currentOffer.key === "faas" && index === 0;
              const isFaasSystemsStep = currentOffer.key === "faas" && index === 1;
              const isFaasRealtimeStep = currentOffer.key === "faas" && index === 2;
              const isPartnerSystemsStep = currentOffer.key === "partner" && index === 0;
              const isPartnerPortfolioStep = currentOffer.key === "partner" && index === 1;
              const faasRealtimeMonths = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              const faasRealtimeCashflowK = [198, 244, 221, 257, 254, 271, 266, 284, 301, 312, 326, 338];
              const faasRealtimeRunwayMonths = [13.8, 14.1, 14.2, 14.5, 14.7, 14.9, 15.1, 15.3, 15.4, 15.6, 15.8, 16.0];
              const faasRealtimeVariancePct = [3.4, 3.1, 2.8, 2.5, 2.3, 2.1, 1.9, 1.7, 1.8, 1.6, 1.4, 1.3];
              const faasRealtimeLatestActualIndex = 7;
              const faasRealtimeChartData = faasRealtimeMonths.map((month, dataIndex) => ({
                cashflow: faasRealtimeCashflowK[dataIndex],
                isForecast: dataIndex > faasRealtimeLatestActualIndex,
                month,
              }));
              const isCenteredPlatformStep =
                isCreateAccountStep ||
                isInsightsStep ||
                isFaasOnboardingStep ||
                isFaasRealtimeStep ||
                isPartnerPortfolioStep;
              const hasHighlights = Array.isArray(step.highlights) && step.highlights.length > 0;
              const shouldRenderRichVisual = dominantStepIndex === index;

              return (
                <article
                  ref={(node) => {
                    stepRowRefs.current[index] = node;
                  }}
                  key={`${currentOffer.key}-${step.title}`}
                  className={`${styles.stepRow} ${isReversed ? styles.stepRowReverse : ""} ${
                    isCreateAccountStep ? styles.stepRowCreate : ""
                  } ${
                    isInsightsStep ? styles.stepRowInsights : ""
                  } ${isFaasOnboardingStep ? styles.stepRowOnboarding : ""
                  } ${isFaasSystemsStep ? styles.stepRowFaasSystems : ""
                  } ${isFaasRealtimeStep ? styles.stepRowFaasRealtime : ""
                  } ${isPartnerSystemsStep ? styles.stepRowFaasSystems : ""
                  } ${isPartnerPortfolioStep ? styles.stepRowFaasRealtime : ""
                  }`}
                >
                  <span className={styles.stepSpineMarker} aria-hidden="true">
                    {stepNum}
                  </span>

                  <div
                    ref={(node) => {
                      stepTextRefs.current[index] = node;
                    }}
                    className={styles.stepText}
                  >
                    {isCenteredPlatformStep ? (
                      <div className={`${styles.stepCopy} ${styles.stepCopyCreate}`}>
                        <div className={styles.stepCreateLead}>
                          <span className={styles.stepOrb}>{stepNum}</span>
                        </div>
                        <div className={styles.stepTitleRow}>
                          <h4>{step.title}</h4>
                        </div>
                        <p>{step.body}</p>
                        {hasHighlights && (
                          <ul className={styles.stepHighlights}>
                            {step.highlights?.map((item) => (
                              <li key={item} className={styles.stepHighlightItem}>
                                <span className={styles.stepHighlightCheck} aria-hidden="true">
                                  ✓
                                </span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <div className={`${styles.stepMain} ${isConnectFortnoxStep ? styles.stepMainCentered : ""}`}>
                        {isConnectFortnoxStep ? (
                          <div className={`${styles.stepCopy} ${styles.stepCopyCentered}`}>
                            <div className={styles.stepCreateLead}>
                              <span className={styles.stepOrb}>{stepNum}</span>
                            </div>
                            <h4>{step.title}</h4>
                            <p>{step.body}</p>
                            {hasHighlights && (
                              <ul className={styles.stepHighlights}>
                                {step.highlights?.map((item) => (
                                  <li key={item} className={styles.stepHighlightItem}>
                                    <span className={styles.stepHighlightCheck} aria-hidden="true">
                                      ✓
                                    </span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : (
                          <>
                            <span className={styles.stepOrb}>{stepNum}</span>

                            <div className={styles.stepCopy}>
                              <h4>{step.title}</h4>
                              <p>{step.body}</p>
                              {hasHighlights && (
                                <ul className={styles.stepHighlights}>
                                  {step.highlights?.map((item) => (
                                    <li key={item} className={styles.stepHighlightItem}>
                                      <span className={styles.stepHighlightCheck} aria-hidden="true">
                                        ✓
                                      </span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    ref={(node) => {
                      stepVisualRefs.current[index] = node;
                    }}
                    className={`${styles.stepVisual} ${styles[`visualVariant${visualVariant}`]} ${
                      isCreateAccountStep ? styles.stepVisualCreate : ""
                    } ${isConnectFortnoxStep ? styles.stepVisualConnect : ""} ${
                      isInsightsStep ? styles.stepVisualInsights : ""
                    } ${isFaasOnboardingStep ? styles.stepVisualOnboarding : ""
                    } ${isFaasSystemsStep ? styles.stepVisualFaasSystems : ""
                    } ${isFaasRealtimeStep ? styles.stepVisualFaasRealtime : ""
                    } ${isPartnerSystemsStep ? styles.stepVisualFaasSystems : ""
                    } ${isPartnerPortfolioStep ? styles.stepVisualFaasRealtime : ""
                    }`}
                    aria-hidden={!isCreateAccountStep}
                  >
                    <div className={styles.visualSurface}>
                      {shouldRenderRichVisual && isCreateAccountStep ? (
                        <div className={styles.accountMiniScene}>
                          <div className={styles.accountMiniBackdrop} aria-hidden="true">
                            <BeamBackgroundMain
                              className={styles.accountMiniBeam}
                              extendBottom={260}
                            />
                          </div>
                          <div className={styles.accountMiniBrand}>
                            <svg className={styles.accountMiniMark} viewBox="0 0 50 50" aria-hidden="true">
                              <g fill="currentColor">
                                <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
                                <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
                                <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
                                <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
                              </g>
                            </svg>
                                <span>{content.footer.brandWord}</span>
                          </div>

                          <form className={styles.accountMock} onSubmit={handleAccountHandoff}>
                            <div className={styles.accountWelcomeWrap}>
                              <h5 className={styles.accountWelcomeTitle}>{content.howItWorks.ui.account.welcomeTitle}</h5>
                              <p className={styles.accountWelcomeSub}>{content.howItWorks.ui.account.welcomeSubtitle}</p>
                            </div>

                            <div className={styles.accountSsoStack}>
                              <a
                                href={APP_LOGIN_URL}
                                className={`${styles.accountTab} ${styles.accountTabLink}`}
                              >
                                <GoogleIcon />
                                <span>{content.howItWorks.ui.account.continueWithGoogle}</span>
                              </a>
                              <a
                                href={APP_LOGIN_URL}
                                className={`${styles.accountTab} ${styles.accountTabLink}`}
                              >
                                <MicrosoftIcon />
                                <span>{content.howItWorks.ui.account.continueWithMicrosoft}</span>
                              </a>
                            </div>

                            <div className={styles.accountDivider} aria-hidden="true">
                              <span>{content.howItWorks.ui.account.dividerLabel}</span>
                            </div>

                            <div className={styles.accountInputGroup}>
                              {isClientReady ? (
                                <input
                                  id="how-it-works-account-email"
                                  type="email"
                                  inputMode="email"
                                  autoComplete="email"
                                  suppressHydrationWarning
                                  aria-label={content.howItWorks.ui.account.emailInputAriaLabel}
                                  placeholder={content.howItWorks.ui.account.emailInputPlaceholder}
                                  required
                                  value={signupEmail}
                                  onChange={(event) => setSignupEmail(event.target.value)}
                                  className={styles.accountField}
                                />
                              ) : (
                                <span className={styles.accountField} aria-hidden="true" />
                              )}
                            </div>

                            <button type="submit" className={styles.accountButton} suppressHydrationWarning>
                              {content.howItWorks.ui.account.continueLabel}
                            </button>
                          </form>
                        </div>
                      ) : shouldRenderRichVisual && isConnectFortnoxStep ? (
                        <div className={styles.connectMock}>
                          <div className={`${styles.connectNode} ${styles.connectNodeFortnox}`}>
                            <div className={styles.connectBrand}>
                              <Image
                                className={styles.connectFortnoxLogo}
                                src="/icons/fortnox-icon.png"
                                alt={content.howItWorks.ui.faasSystems.fortnoxAlt}
                                width={88}
                                height={88}
                              />
                              <span className={styles.connectBrandWord}>{content.howItWorks.ui.connect.fortnoxWord}</span>
                            </div>
                            <span className={styles.connectNodeMeta}>{content.howItWorks.ui.connect.accountConnected}</span>
                          </div>
                          <div className={styles.connectBridge}>
                            <span className={styles.connectFlow} />
                            <span className={styles.connectDataDot} />
                          </div>
                          <div className={styles.connectNode}>
                            <div className={styles.connectBrand}>
                              <svg
                                className={styles.connectBrandMark}
                                viewBox="0 0 50 50"
                                role="img"
                                aria-hidden="true"
                              >
                                <g fill="currentColor">
                                  <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
                                  <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
                                  <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
                                  <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
                                </g>
                              </svg>
                              <span className={styles.connectBrandWord}>{content.howItWorks.ui.connect.mincfoWord}</span>
                            </div>
                            <span className={styles.connectNodeMeta}>{content.howItWorks.ui.connect.receivingData}</span>
                          </div>
                          <div className={styles.connectStatusWrap}>
                            <div className={styles.connectStatus}>{content.howItWorks.ui.connect.integrationActive}</div>
                            <span className={styles.connectSyncTime}>{content.howItWorks.ui.connect.lastSyncLabel}</span>
                          </div>
                        </div>
                      ) : shouldRenderRichVisual && isInsightsStep ? (
                        <div className={styles.insightsMock}>
                          <div className={styles.insightsHeader}>
                            <span className={styles.insightsDot} />
                            <span className={styles.insightsTitle}>{content.howItWorks.ui.insights.title}</span>
                          </div>

                          <div className={styles.insightsQuestion}>
                            {content.howItWorks.ui.insights.question}
                          </div>

                          <div className={styles.insightsAnswer}>
                            <div className={styles.insightsThinking} aria-hidden="true">
                              <span />
                              <span />
                              <span />
                              <em>{content.howItWorks.ui.insights.thinkingLabel}</em>
                            </div>

                            <div className={styles.insightsResult}>
                              <div className={styles.insightsAnswerHead}>
                                <span>{content.howItWorks.ui.insights.generatedForecastLabel}</span>
                                <span>{content.howItWorks.ui.insights.runwayMonthsLabel}</span>
                              </div>

                              <div className={styles.insightsBars}>
                                <div className={`${styles.insightsBar} ${styles.insightsBarCurrent}`}>
                                  <span className={styles.insightsBarFill} />
                                  <em>{content.howItWorks.ui.insights.barCurrent}</em>
                                </div>
                                <div className={`${styles.insightsBar} ${styles.insightsBarPlan}`}>
                                  <span className={styles.insightsBarFill} />
                                  <em>{content.howItWorks.ui.insights.barPlan}</em>
                                </div>
                                <div className={`${styles.insightsBar} ${styles.insightsBarScenario}`}>
                                  <span className={styles.insightsBarFill} />
                                  <em>{content.howItWorks.ui.insights.barScenario}</em>
                                </div>
                              </div>

                              <div className={styles.insightsSummary}>{content.howItWorks.ui.insights.summary}</div>
                            </div>
                          </div>

                          <div className={styles.insightsInput}>
                            <span className={styles.insightsInputText}>
                              <span className={styles.insightsInputHint}>{content.howItWorks.ui.insights.inputHint}</span>
                              <span className={styles.insightsInputTyped}>
                                {content.howItWorks.ui.insights.inputTyped}
                              </span>
                              <span className={styles.insightsInputCaret} aria-hidden="true" />
                            </span>
                            <button
                              type="button"
                              className={styles.insightsInputSend}
                              aria-label={content.howItWorks.ui.insights.sendAriaLabel}
                            >
                              <ArrowRight aria-hidden="true" size={12} />
                            </button>
                          </div>
                        </div>
                      ) : shouldRenderRichVisual && isPartnerPortfolioStep ? (
                        <PartnerWorkspaceMock
                          brandWord={content.footer.brandWord}
                          content={partnerWorkspaceContent}
                          screen={partnerWorkspaceScreen}
                          userToggles={partnerWorkspaceUserToggles}
                          view={partnerWorkspaceView}
                          onNavClick={handlePartnerWorkspaceNavClick}
                          onToggleUser={handlePartnerWorkspaceToggle}
                        />
                      ) : shouldRenderRichVisual && isFaasRealtimeStep ? (
                        <div className={styles.faasRealtimeMock}>
                          <div className={styles.faasRealtimeHeader}>
                            <span className={styles.faasRealtimeBadge}>
                              <span className={styles.faasRealtimeLogo} aria-hidden="true">
                                <svg className={styles.faasRealtimeLogoMark} viewBox="0 0 50 50" role="img">
                                  <g fill="currentColor">
                                    <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
                                    <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
                                    <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
                                    <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
                                  </g>
                                </svg>
                                <span className={styles.faasRealtimeLogoWord}>{content.footer.brandWord}</span>
                              </span>
                            </span>
                            <span className={styles.faasRealtimeStatus}>
                              <span className={styles.faasRealtimeStatusDot} aria-hidden="true" />
                              <span>Live</span>
                            </span>
                          </div>

                          <div className={styles.faasRealtimeStats}>
                            <div className={styles.faasRealtimeStat}>
                              <span className={styles.faasRealtimeStatLabel}>{content.howItWorks.ui.faasRealtime.cashflowLabel}</span>
                              <strong>+{faasRealtimeCashflowK[faasRealtimeLatestActualIndex]} tkr</strong>
                            </div>
                            <div className={styles.faasRealtimeStat}>
                              <span className={styles.faasRealtimeStatLabel}>{content.howItWorks.ui.faasRealtime.runwayLabel}</span>
                              <strong>
                                {faasRealtimeRunwayMonths[faasRealtimeLatestActualIndex].toFixed(1)} {content.howItWorks.ui.faasRealtime.monthSuffix}
                              </strong>
                            </div>
                            <div className={styles.faasRealtimeStat}>
                              <span className={styles.faasRealtimeStatLabel}>{content.howItWorks.ui.faasRealtime.deviationLabel}</span>
                              <strong>+{faasRealtimeVariancePct[faasRealtimeLatestActualIndex].toFixed(1)}%</strong>
                            </div>
                          </div>

                          <div className={styles.faasRealtimeChart}>
                            <div className={styles.faasRealtimeChartHeader}>
                              <div className={styles.faasRealtimeChartHeading}>
                                <div className={styles.faasRealtimeChartTitleRow}>
                                  <span className={styles.faasRealtimeChartTitle}>Netto kassaflöde</span>
                                  <span className={styles.faasRealtimeTrendBadge}>
                                    <TrendingUp aria-hidden="true" size={12} />
                                    <span>+6.8%</span>
                                  </span>
                                </div>
                                <p className={styles.faasRealtimeChartDescription}>Jan-Aug utfall • Sep-Dec prognos</p>
                              </div>
                            </div>

                            <div className={styles.faasRealtimePlot} aria-hidden="true">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={faasRealtimeChartData}
                                  margin={{ top: 10, right: 8, left: 8, bottom: 8 }}
                                  barCategoryGap="22%"
                                >
                                  <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tickMargin={10}
                                    interval={0}
                                    tick={{ fill: "rgba(163, 186, 223, 0.88)", fontSize: 10 }}
                                    tickFormatter={(value: string) => value.slice(0, 3)}
                                  />
                                  <Bar
                                    dataKey="cashflow"
                                    fill="rgba(58, 103, 255, 0.92)"
                                    shape={(shapeProps) => (
                                      <GradientBarShape
                                        {...shapeProps}
                                        animateOnMount={!isReducedMotion && !faasBarsAnimatedOnce}
                                        animationIndex={shapeProps.index ?? 0}
                                      />
                                    )}
                                  >
                                    {faasRealtimeChartData.map((entry) => (
                                      <Cell
                                        key={entry.month}
                                        fill={entry.isForecast ? "rgba(58, 103, 255, 0.52)" : "rgba(58, 103, 255, 0.92)"}
                                      />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          <div className={styles.faasRealtimeAlerts}>
                            {faasVisibleAlerts.map((alert, alertIndex) => (
                              <div
                                key={alert.id}
                                className={styles.faasRealtimeAlert}
                                style={{ "--faas-alert-delay": `${alertIndex * 320}ms` } as CSSProperties}
                              >
                                <span className={styles.faasRealtimeAlertDot} />
                                <span>{alert.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : shouldRenderRichVisual && isFaasOnboardingStep ? (
                        <div className={styles.faasOnboardingConnect}>
                          <div className={styles.faasNodeClient}>
                            <span className={styles.faasNodeIcon} aria-hidden="true">
                              <UserRound size={14} />
                            </span>
                          </div>

                          <div className={styles.faasOnboardingHub}>
                            <span className={styles.faasHubSpinner} aria-hidden="true">
                              <RefreshCw size={18} strokeWidth={1.9} />
                            </span>
                          </div>

                          <div className={styles.faasNodeMincfo}>
                            <span className={styles.faasNodeMincfoIcon} aria-hidden="true">
                              <svg viewBox="0 0 50 50" role="img" aria-hidden="true">
                                <g fill="currentColor">
                                  <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
                                  <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
                                  <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
                                  <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
                                </g>
                              </svg>
                            </span>
                          </div>

                          <span className={styles.faasLinkLeft} aria-hidden="true">
                            <span className={styles.faasPulseLeft} />
                          </span>
                          <span className={styles.faasLinkRight} aria-hidden="true">
                            <span className={styles.faasPulseRight} />
                          </span>

                          <span className={styles.faasLinkBottom} aria-hidden="true">
                            <span className={styles.faasPulseBottom} />
                          </span>

                          <div className={styles.faasOnboardingBadge}>
                            <span className={styles.faasBadgeDot} />
                            <span>{content.howItWorks.ui.faasOnboarding.badgeLabel}</span>
                          </div>
                        </div>
                      ) : shouldRenderRichVisual && (isFaasSystemsStep || isPartnerSystemsStep) ? (
                        <div className={styles.faasSystemsConnect}>
                          <svg
                            className={styles.faasSystemsMap}
                            viewBox="0 0 620 430"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                          >
                            <g className={`${styles.faasSystemsBranch} ${styles.faasSystemsBranchTopLeft}`}>
                              <path d="M270 170 L270 130 L229 108" />
                            </g>
                            <g className={`${styles.faasSystemsBranch} ${styles.faasSystemsBranchTopCenter}`}>
                              <path d="M310 170 L310 114" />
                            </g>
                            <g className={`${styles.faasSystemsBranch} ${styles.faasSystemsBranchTopRight}`}>
                              <path d="M350 170 L350 130 L391 108" />
                            </g>
                            <g className={`${styles.faasSystemsBranch} ${styles.faasSystemsBranchMidLeft}`}>
                              <path d="M252 214 L170 214 L138 204" />
                            </g>
                            <g className={`${styles.faasSystemsBranch} ${styles.faasSystemsBranchMidRight}`}>
                              <path d="M368 214 L450 214 L482 204" />
                            </g>
                            <g className={`${styles.faasSystemsBranch} ${styles.faasSystemsBranchBottomCenter}`}>
                              <path d="M310 260 L310 324" />
                            </g>

                          </svg>

                          <div className={styles.faasSystemsHub}>
                            <span className={styles.faasSystemsHubLogo} aria-hidden="true">
                              <svg viewBox="0 0 50 50" role="img" aria-hidden="true">
                                <g fill="currentColor">
                                  <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
                                  <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
                                  <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
                                  <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
                                </g>
                              </svg>
                            </span>
                            <span>{content.howItWorks.ui.faasSystems.hubLabel}</span>
                          </div>

                          <div className={`${styles.faasSystemsNode} ${styles.faasSystemsNodeTopLeft}`}>
                            <span className={styles.faasSystemsNodeInner}>
                              <Building2 size={20} />
                            </span>
                            <em>{isPartnerSystemsStep ? content.howItWorks.ui.faasSystems.partnerLabels.topLeft : content.howItWorks.ui.faasSystems.bankLabel}</em>
                          </div>
                          <div className={`${styles.faasSystemsNode} ${styles.faasSystemsNodeTopCenter}`}>
                            <span className={styles.faasSystemsNodeInner}>
                              <Image
                                src="/icons/skatteverket-logo.svg"
                                alt={content.howItWorks.ui.faasSystems.skatteverketAlt}
                                width={26}
                                height={26}
                              />
                            </span>
                            <em>{isPartnerSystemsStep ? content.howItWorks.ui.faasSystems.partnerLabels.topCenter : content.howItWorks.ui.faasSystems.skatteverketLabel}</em>
                          </div>
                          <div
                            className={`${styles.faasSystemsNode} ${styles.faasSystemsNodeTopRight} ${styles.faasSystemsNodeFortnox}`}
                          >
                            <span className={styles.faasSystemsNodeInner}>
                              <Image
                                src="/icons/fortnox-icon.png"
                                alt={content.howItWorks.ui.faasSystems.fortnoxAlt}
                                width={26}
                                height={26}
                              />
                            </span>
                            <em>{isPartnerSystemsStep ? content.howItWorks.ui.faasSystems.partnerLabels.topRight : content.howItWorks.ui.faasSystems.fortnoxLabel}</em>
                          </div>
                          <div className={`${styles.faasSystemsNode} ${styles.faasSystemsNodeMidLeft}`}>
                            <span className={styles.faasSystemsNodeInner}>
                              <ReceiptText size={20} />
                            </span>
                            <em>{isPartnerSystemsStep ? content.howItWorks.ui.faasSystems.partnerLabels.midLeft : content.howItWorks.ui.faasSystems.payrollLabel}</em>
                          </div>
                          <div className={`${styles.faasSystemsNode} ${styles.faasSystemsNodeMidRight}`}>
                            <span className={styles.faasSystemsNodeInner}>
                              <CreditCard size={20} />
                            </span>
                            <em>{isPartnerSystemsStep ? content.howItWorks.ui.faasSystems.partnerLabels.midRight : content.howItWorks.ui.faasSystems.paymentsLabel}</em>
                          </div>
                          <div className={`${styles.faasSystemsNode} ${styles.faasSystemsNodeBottomCenter}`}>
                            <span className={styles.faasSystemsNodeInner} aria-hidden="true">
                              <UsersRound size={20} />
                            </span>
                            <em>{isPartnerSystemsStep ? content.howItWorks.ui.faasSystems.partnerLabels.bottomCenter : content.howItWorks.ui.faasSystems.customerTeamLabel}</em>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.visualCore}>
                          <Icon size={22} />
                        </div>
                      )}
                      <div className={styles.visualBeam} />
                    </div>
                  </div>
                </article>
              );
                })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
