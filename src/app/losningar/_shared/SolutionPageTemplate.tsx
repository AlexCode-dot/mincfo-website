import FloatingNav from "@/components/layout/FloatingNav/FloatingNav";
import Logo from "@/components/layout/Logo/Logo";
import SiteFooter from "@/components/layout/SiteFooter/SiteFooter";
import { HomeOfferingProvider } from "@/components/home/HomeOfferingProvider";
import ContactLink from "@/components/system/ContactLink";
import {
  HOME_OFFERING_MODES,
  HOME_PAGE_TEXT,
  getHomePageText,
  getSharedText,
  type HomeOfferingMode,
  type HomePageText,
  type PreFetchedHomeContent,
} from "@/content/homePageText";
import { getSolutionSharedContent } from "@/content/solutionSharedContent";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/locale";
import {
  CircleDollarSign,
  Clock3,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Landmark,
  Layers3,
  LocateFixed,
  Radar,
  RefreshCw,
  Sparkles,
  Target,
  Zap,
  X,
} from "lucide-react";
import Image from "next/image";
import RevealSection from "../ceo-founders/RevealSection";
import SectionTopCurve from "../ceo-founders/SectionTopCurve";
import styles from "../ceo-founders/page.module.scss";
import type { SolutionPageContent } from "./solutionPageContent";

const HERO_TICKER_LOGOS = HOME_PAGE_TEXT.customers.trustedLogos.map((logo) => ({
  src: `/customers/logos/${logo.file}`,
  alt: logo.name,
}));

const CARD_TRACER_PATH =
  "M 0.8 7.2 A 6.4 6.4 0 0 1 7.2 0.8 H 92.8 A 6.4 6.4 0 0 1 99.2 7.2 V 92.8 A 6.4 6.4 0 0 1 92.8 99.2 H 7.2 A 6.4 6.4 0 0 1 0.8 92.8 Z";

export default function SolutionPageTemplate({
  content,
  locale = DEFAULT_LOCALE,
}: {
  content: SolutionPageContent;
  locale?: Locale;
}) {
  const impactVisuals = content.impactVisuals ?? ["realtime", "flow", "accuracy", "analysis"];
  const shared = getSolutionSharedContent(locale);
  const prefetchedContent: PreFetchedHomeContent = {
    shared: getSharedText(locale),
    byMode: Object.fromEntries(
      HOME_OFFERING_MODES.map((mode) => [mode, getHomePageText(mode, locale)]),
    ) as Record<HomeOfferingMode, HomePageText>,
  };

  return (
    <HomeOfferingProvider
      allowedOfferings={["platform"]}
      syncWithUrl={false}
      prefetchedContent={prefetchedContent}
    >
      <Logo />
      <FloatingNav />

      <main className={styles.page}>
        <RevealSection className={styles.hero}>
          <div className={styles.heroCard}>
            <div className={styles.heroBackdrop} aria-hidden="true" />

            <span className={styles.eyebrow}>
              <span className={styles.keepCase}>{content.eyebrow}</span>
            </span>
            <h1 className={`${styles.title}${content.heroTitleWide === false ? "" : ` ${styles.titleWide}`}`}>
              {content.heroHeadline}
            </h1>
            <p className={styles.subtitle}>{content.heroSubheadline}</p>

            <div className={styles.heroActions}>
              <ContactLink href="/contact" className={styles.primaryCta} returnPath="/losningar">
                {shared.heroPrimaryCta}{" "}
                <ChevronRight aria-hidden="true" className={styles.ctaIcon} />
              </ContactLink>
              <a href="#utmaning" className={styles.secondaryCta}>
                {shared.heroSecondaryCta}
              </a>
            </div>

            <div className={styles.heroTrust}>
              <p className={styles.heroTrustLabel}>{content.logoStripMicrocopy}</p>
              <div className={styles.heroTickerViewport} aria-label={shared.logoTickerAriaLabel}>
                <div className={styles.heroTickerTrack}>
                  {HERO_TICKER_LOGOS.map((logo, index) => (
                    <span key={`a-${logo.src}-${index}`} className={styles.heroTickerItem}>
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={130}
                        height={36}
                        className={styles.heroTickerLogo}
                      />
                    </span>
                  ))}
                  {HERO_TICKER_LOGOS.map((logo, index) => (
                    <span key={`b-${logo.src}-${index}`} className={styles.heroTickerItem}>
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={130}
                        height={36}
                        className={styles.heroTickerLogo}
                      />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.heroScrollCueWrap}>
            <span className={styles.heroScrollCueLabel}>
              <span className={styles.keepCase}>{shared.scrollLabel}</span>
            </span>
            <a
              href="#utmaning"
              className={styles.heroScrollCue}
              aria-label={shared.scrollCueAriaLabel}
            >
              <span className={styles.heroScrollCueInner}>
                <ChevronDown size={18} />
              </span>
            </a>
          </div>
        </RevealSection>

        <RevealSection className={`${styles.section} ${styles.problemSection} ${styles.solutionSection}`} id="utmaning">
          <SectionTopCurve
            shape="archUp"
            fillClassName={styles.topCurveProblemSectionFill}
          />

          <div className={styles.sectionPart}>
            <header className={styles.sectionHead}>
              <h2>{content.dilemmaTitle}</h2>
              <p>{content.dilemmaSubtitle}</p>
            </header>
            <div className={styles.challengeGrid}>
              {content.dilemmaCards.map((item) => (
                <article key={item.title} className={styles.challengeCard}>
                  <div className={styles.cardTracer} aria-hidden="true">
                    <svg className={styles.cardTracerSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path className={`${styles.stroke} ${styles.strokeAGlow}`} d={CARD_TRACER_PATH} pathLength={1}>
                        <animate attributeName="stroke-dashoffset" from="0" to="-1" dur="8s" repeatCount="indefinite" />
                      </path>
                      <path className={`${styles.stroke} ${styles.strokeA}`} d={CARD_TRACER_PATH} pathLength={1}>
                        <animate attributeName="stroke-dashoffset" from="0" to="-1" dur="8s" repeatCount="indefinite" />
                      </path>
                      <path className={`${styles.stroke} ${styles.strokeBGlow}`} d={CARD_TRACER_PATH} pathLength={1}>
                        <animate
                          attributeName="stroke-dashoffset"
                          from="-0.5"
                          to="-1.5"
                          dur="8s"
                          repeatCount="indefinite"
                        />
                      </path>
                      <path className={`${styles.stroke} ${styles.strokeB}`} d={CARD_TRACER_PATH} pathLength={1}>
                        <animate
                          attributeName="stroke-dashoffset"
                          from="-0.5"
                          to="-1.5"
                          dur="8s"
                          repeatCount="indefinite"
                        />
                      </path>
                    </svg>
                  </div>
                  <span className={styles.iconNegative} aria-hidden="true">
                    <X size={16} />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className={styles.sectionPart}>
            <header className={styles.sectionHead}>
              <p className={styles.overline}>
                <Sparkles size={14} />
                <span className={styles.keepCase}>{shared.helpsOverline}</span>
              </p>
              <h2>{content.helpsTitle}</h2>
              <p>{content.helpsSubtitle}</p>
            </header>

            <div className={styles.solutionGrid}>
              {content.helpsCards.map((item) => (
                <article key={item.title} className={styles.solutionCard}>
                  <div className={styles.cardTracer} aria-hidden="true">
                    <svg className={styles.cardTracerSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path className={`${styles.stroke} ${styles.strokeAGlow}`} d={CARD_TRACER_PATH} pathLength={1}>
                        <animate attributeName="stroke-dashoffset" from="0" to="-1" dur="8s" repeatCount="indefinite" />
                      </path>
                      <path className={`${styles.stroke} ${styles.strokeA}`} d={CARD_TRACER_PATH} pathLength={1}>
                        <animate attributeName="stroke-dashoffset" from="0" to="-1" dur="8s" repeatCount="indefinite" />
                      </path>
                      <path className={`${styles.stroke} ${styles.strokeBGlow}`} d={CARD_TRACER_PATH} pathLength={1}>
                        <animate
                          attributeName="stroke-dashoffset"
                          from="-0.5"
                          to="-1.5"
                          dur="8s"
                          repeatCount="indefinite"
                        />
                      </path>
                      <path className={`${styles.stroke} ${styles.strokeB}`} d={CARD_TRACER_PATH} pathLength={1}>
                        <animate
                          attributeName="stroke-dashoffset"
                          from="-0.5"
                          to="-1.5"
                          dur="8s"
                          repeatCount="indefinite"
                        />
                      </path>
                    </svg>
                  </div>
                  <span className={styles.iconPositive} aria-hidden="true">
                    <Check size={16} />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </RevealSection>

        <RevealSection className={`${styles.section} ${styles.impactSection}`}>
          <SectionTopCurve
            shape="archUp"
            fillClassName={styles.topCurveImpactFill}
          />
          <div className={styles.impactIntro}>
            <div>
              <p className={styles.impactTag}>
                <span className={styles.keepCase}>{shared.impactTag}</span>
              </p>
              <h2 className={styles.impactHeadline}>{content.impactTitle}</h2>
            </div>
            <p className={styles.impactLead}>{content.impactSubtitle}</p>
          </div>

          <div className={`${styles.impactGrid} ${styles.impactGridFour}`}>
            {content.impactCards.map((item, index) => {
              const visualType = impactVisuals[index];
              return (
                <article key={item.title} className={`${styles.impactCard} ${index === 0 ? styles.impactCardRealtime : ""}`}>
                  <div
                    className={`${styles.impactVisual} ${
                      visualType === "realtime" || visualType === "time"
                        ? styles.impactVisualRealtime
                        : visualType === "flow"
                          ? styles.impactVisualFlow
                          : visualType === "cash"
                            ? styles.impactVisualCash
                            : visualType === "radar"
                              ? styles.impactVisualRadar
                              : visualType === "proactive"
                                ? styles.impactVisualCore
                                : visualType === "report"
                                  ? styles.impactVisualReport
                                  : visualType === "accuracy"
                                    ? styles.impactVisualAccuracy
                                    : visualType === "scale"
                                      ? styles.impactVisualScale
                                      : styles.impactVisualAnalysis
                    }`}
                  >
                    {visualType === "realtime" ? (
                      <>
                        <span className={styles.impactVisualHalo} aria-hidden="true" />
                        <span className={styles.impactRealtimeOuterRing} aria-hidden="true" />
                        <span className={styles.impactRealtimeCore} aria-hidden="true" />
                        <Zap size={34} className={`${styles.impactIcon} ${styles.impactRealtimeIcon}`} />
                        <span className={styles.impactRealtimeBadge}>
                          <span className={styles.impactRealtimeBadgeDot} aria-hidden="true" />
                          <span>
                            REAL-
                            <br />
                            TIME
                          </span>
                        </span>
                      </>
                    ) : visualType === "time" ? (
                      <>
                        <span className={styles.impactVisualHalo} aria-hidden="true" />
                        <span className={styles.impactRealtimeOuterRing} aria-hidden="true" />
                        <span className={styles.impactRealtimeCore} aria-hidden="true" />
                        <Clock3 size={32} className={`${styles.impactIcon} ${styles.impactRealtimeIcon}`} />
                        <span className={styles.impactRealtimeBadge}>
                          <span className={styles.impactRealtimeBadgeDot} aria-hidden="true" />
                          <span>TIME</span>
                        </span>
                      </>
                    ) : visualType === "flow" ? (
                      <>
                        <span className={styles.impactVisualHalo} aria-hidden="true" />
                        <span className={styles.impactFlowLinkLeft} aria-hidden="true" />
                        <span className={styles.impactFlowLinkRight} aria-hidden="true" />
                        <span className={`${styles.impactFlowNode} ${styles.impactFlowNodeLeft}`}>
                          <FileText size={14} className={styles.impactFlowNodeIcon} />
                        </span>
                        <span className={styles.impactFlowCore}>
                          <RefreshCw size={30} className={styles.impactFlowIcon} />
                        </span>
                        <span className={`${styles.impactFlowNode} ${styles.impactFlowNodeRight}`}>
                          <Check size={15} className={styles.impactFlowCheckIcon} />
                        </span>
                      </>
                    ) : visualType === "cash" ? (
                      <>
                        <span className={styles.impactVisualHalo} aria-hidden="true" />
                        <span className={styles.impactCashOuter} aria-hidden="true" />
                        <span className={styles.impactCashInner} aria-hidden="true" />
                        <span className={styles.impactCashPulse} aria-hidden="true" />
                        <span className={`${styles.impactCashDot} ${styles.impactCashDotIn}`} aria-hidden="true" />
                        <span className={`${styles.impactCashDot} ${styles.impactCashDotOut}`} aria-hidden="true" />
                        <CircleDollarSign size={24} className={`${styles.impactIcon} ${styles.impactCashIcon}`} />
                      </>
                    ) : visualType === "radar" ? (
                      <>
                        <span className={styles.impactVisualHalo} aria-hidden="true" />
                        <span className={styles.impactProactiveOuter} aria-hidden="true" />
                        <span className={styles.impactProactiveDots} aria-hidden="true" />
                        <span className={styles.impactProactiveWave} aria-hidden="true" />
                        <span className={`${styles.impactProactiveWave} ${styles.impactProactiveWaveLate}`} aria-hidden="true" />
                        <span className={styles.impactProactiveInner} aria-hidden="true" />
                        <Radar size={24} className={`${styles.impactIcon} ${styles.impactProactiveIcon}`} />
                      </>
                    ) : visualType === "proactive" ? (
                      <>
                        <span className={styles.impactVisualHalo} aria-hidden="true" />
                        <span className={styles.impactProactiveOuter} aria-hidden="true" />
                        <span className={styles.impactProactiveDots} aria-hidden="true" />
                        <span className={styles.impactProactiveWave} aria-hidden="true" />
                        <span className={`${styles.impactProactiveWave} ${styles.impactProactiveWaveLate}`} aria-hidden="true" />
                        <span className={styles.impactProactiveInner} aria-hidden="true" />
                        <LocateFixed size={24} className={`${styles.impactIcon} ${styles.impactProactiveIcon}`} />
                      </>
                    ) : visualType === "report" ? (
                      <>
                        <span className={styles.impactVisualHalo} aria-hidden="true" />
                        <span className={styles.impactAnalysisHalo} aria-hidden="true" />
                        <span className={styles.impactReportSheet} aria-hidden="true" />
                        <span className={styles.impactAnalysisBars} aria-hidden="true">
                          <span className={`${styles.impactAnalysisBar} ${styles.impactAnalysisBarOne}`} />
                          <span className={`${styles.impactAnalysisBar} ${styles.impactAnalysisBarTwo}`} />
                          <span className={`${styles.impactAnalysisBar} ${styles.impactAnalysisBarThree}`} />
                        </span>
                        <span className={styles.impactReportCheck} aria-hidden="true">
                          <Check size={12} />
                        </span>
                      </>
                    ) : visualType === "accuracy" ? (
                      <>
                        <span className={styles.impactVisualHalo} aria-hidden="true" />
                        <span className={styles.impactAccuracyOuterRing} aria-hidden="true" />
                        <span className={styles.impactAccuracyInnerRing} aria-hidden="true" />
                        <span className={styles.impactAccuracyCrosshairHorizontal} aria-hidden="true" />
                        <span className={styles.impactAccuracyCrosshairVertical} aria-hidden="true" />
                        <Target size={24} className={`${styles.impactIcon} ${styles.impactAccuracyIcon}`} />
                      </>
                    ) : visualType === "scale" ? (
                      <>
                        <span className={styles.impactVisualHalo} aria-hidden="true" />
                        <span className={styles.impactScaleLinkLeft} aria-hidden="true" />
                        <span className={styles.impactScaleLinkRight} aria-hidden="true" />
                        <span className={`${styles.impactScaleNode} ${styles.impactScaleNodeLeft}`} aria-hidden="true" />
                        <span className={`${styles.impactScaleNode} ${styles.impactScaleNodeRight}`} aria-hidden="true" />
                        <span className={styles.impactScaleCore}>
                          <Layers3 size={24} className={styles.impactScaleIcon} />
                        </span>
                      </>
                    ) : visualType === "governance" ? (
                      <>
                        <span className={styles.impactVisualHalo} aria-hidden="true" />
                        <span className={styles.impactIconCoreRing} aria-hidden="true" />
                        <span className={styles.impactGovernanceOrbit} aria-hidden="true" />
                        <span className={styles.impactGovernancePulse} aria-hidden="true" />
                        <Landmark size={24} className={`${styles.impactIcon} ${styles.impactGovernanceIcon}`} />
                      </>
                    ) : (
                      <>
                        <span className={styles.impactVisualHalo} aria-hidden="true" />
                        <span className={styles.impactAnalysisHalo} aria-hidden="true" />
                        <span className={styles.impactAnalysisBars} aria-hidden="true">
                          <span className={`${styles.impactAnalysisBar} ${styles.impactAnalysisBarOne}`} />
                          <span className={`${styles.impactAnalysisBar} ${styles.impactAnalysisBarTwo}`} />
                          <span className={`${styles.impactAnalysisBar} ${styles.impactAnalysisBarThree}`} />
                        </span>
                        <span className={styles.impactAnalysisNode} aria-hidden="true" />
                      </>
                    )}
                  </div>
                  <p className={styles.impactMetric}>{item.value}</p>
                  <h3>{item.title}</h3>
                  <p className={styles.impactDescription}>{item.description}</p>
                </article>
              );
            })}
          </div>
        </RevealSection>
        <RevealSection className={styles.closing} id="kontakt">
          <div className={styles.closingCard}>
            <p className={styles.overline}>
              <Sparkles size={14} />
              <span className={styles.keepCase}>{shared.closingOverline}</span>
            </p>
            <h2>
              <span className={styles.closingTitleMain}>{content.trustHeadline}</span>
            </h2>
            <p>{content.trustSub}</p>
            <ContactLink href="/contact" className={styles.primaryCta} returnPath="/losningar">
              {shared.closingCta}{" "}
              <ChevronRight aria-hidden="true" className={styles.ctaIcon} />
            </ContactLink>
          </div>
        </RevealSection>
      </main>

      <SiteFooter />
    </HomeOfferingProvider>
  );
}
