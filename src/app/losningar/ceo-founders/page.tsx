import FloatingNav from "@/components/layout/FloatingNav/FloatingNav";
import Logo from "@/components/layout/Logo/Logo";
import SiteFooter from "@/components/layout/SiteFooter/SiteFooter";
import {
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  LocateFixed,
  RefreshCw,
  Sparkles,
  Zap,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import AnimatedSectionBreak from "./AnimatedSectionBreak";
import RevealSection from "./RevealSection";
import ScenarioVisualization from "./ScenarioVisualization";
import TestimonialSpotlight from "./TestimonialSpotlight";
import styles from "./page.module.scss";

const CHALLENGES = [
  {
    title: "Ingen samlad nulägesbild",
    body: "ARR, burn, kassaflöde och kostnadsdrivare uppdateras i olika verktyg. Ledningen saknar en gemensam version av läget.",
  },
  {
    title: "Beslut tas för sent",
    body: "Rapporter kommer efter att avvikelsen redan inträffat. Exekvering sker på historik i stället för nästa bästa beslut.",
  },
  {
    title: "Runway-risk upptäcks sent",
    body: "Små förändringar i churn, rekrytering eller GTM-kostnad ger stor effekt över tid men syns ofta för sent.",
  },
  {
    title: "Tillväxt kräver mer admin",
    body: "När bolaget växer ökar antalet manuella sammanställningar. Finance blir flaskhals i stället för beslutsmotor.",
  },
] as const;

const SOLUTIONS = [
  {
    title: "Live dashboard för ledning",
    body: "Runway, burn, ARR, marginal och planavvikelse i en gemensam vy som uppdateras löpande.",
  },
  {
    title: "AI Copilot för ledningsfrågor",
    body: "Ställ frågor i naturligt språk och få svar med siffror, förklaring och dataspårbarhet på sekunder.",
  },
  {
    title: "Scenario-planering i samma flöde",
    body: "Testa effekten av rekrytering, GTM och kostnadsnivå direkt på resultat, kassaflöde och runway.",
  },
  {
    title: "Automatiserad rapportering",
    body: "Styrelse- och investerarpaket byggs från samma datamodell, med CFO-rådgivning för tydliga prioriteringar.",
  },
] as const;

const IMPACT = [
  {
    value: "30-50%",
    title: "Snabbare beslut",
    description: "Kortare tid från fråga till beslut i ledningsmöten genom automatiserad data.",
    icon: "clock" as const,
  },
  {
    value: "60-80%",
    title: "Mindre manuellt jobb",
    description: "Minskad tid i månatlig rapportering och administration via smarta flöden.",
    icon: "trend" as const,
  },
  {
    value: "1-2 kv",
    title: "Proaktivitet",
    description: "Tidigare upptäckt av runway-risk och finansiella hinder för bolaget.",
    icon: "alert" as const,
  },
] as const;

const HERO_TICKER_LOGOS = [
  { src: "/customers/logos/logo-algae.avif", alt: "Swedish Algae Factory" },
  { src: "/customers/logos/logo-bam.avif", alt: "BAM" },
  { src: "/customers/logos/logo-eloize.avif", alt: "Eloize" },
  { src: "/customers/logos/logo-fler.avif", alt: "Fler" },
  { src: "/customers/logos/logo-lawster.avif", alt: "Lawster" },
  { src: "/customers/logos/logo-realforce.avif", alt: "Realforce" },
  { src: "/customers/logos/logo-rossoneri.avif", alt: "Rossoneri" },
  { src: "/customers/logos/logo-runway.webp", alt: "Runway" },
  { src: "/customers/logos/logo-swebal.avif", alt: "Swebal" },
] as const;

export default function CeoFoundersPage() {
  return (
    <>
      <Logo />
      <FloatingNav />

      <main className={styles.page}>
        <RevealSection className={styles.hero}>
          <div className={styles.heroCard}>
            <div className={styles.heroBackdrop} aria-hidden="true" />

            <span className={styles.eyebrow}>Lösning för CEO & Founders</span>
            <h1 className={styles.title}>
              Finansiell klarhet för
              <br />
              CEO & Founders
            </h1>
            <p className={styles.subtitle}>
              MinCFO samlar AI Copilot, dashboards i realtid, forecasting och strategisk rådgivning i
              en beslutsyta. Resultatet är snabbare prioriteringar, tydligare vägval och högre precision
              i varje tillväxtbeslut.
            </p>

            <div className={styles.heroActions}>
              <a href="#kontakt" className={styles.primaryCta}>
                Boka en demo <ChevronRight aria-hidden="true" className={styles.ctaIcon} />
              </a>
              <a href="#utmaning" className={styles.secondaryCta}>
                Se CEO-dilemmat
              </a>
            </div>

            <div className={styles.heroTrust}>
              <p className={styles.heroTrustLabel}>
                Betrodd av tillväxtteam som kräver finansiell precision i hög takt
              </p>
              <div className={styles.heroTickerViewport} aria-label="Betrodda kundlogotyper">
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
            <span className={styles.heroScrollCueLabel}>Läs mer</span>
            <a href="#utmaning" className={styles.heroScrollCue} aria-label="Scrolla till nästa sektion">
              <span className={styles.heroScrollCueInner}>
                <ChevronDown size={18} />
              </span>
            </a>
          </div>
        </RevealSection>

        <RevealSection className={`${styles.section} ${styles.problemSection} ${styles.solutionSection}`} id="utmaning">
          <div className={styles.sectionPart}>
            <header className={styles.sectionHead}>
              <h2>The CEO Dilemma</h2>
              <p>
                Hög tillväxt kräver fart i beslut. Men splittrad data, manuell rapportering och osäker
                prognos gör att viktiga vägval tas för sent.
              </p>
            </header>
            <div className={styles.challengeGrid}>
              {CHALLENGES.map((item) => (
                <article key={item.title} className={styles.challengeCard}>
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
                Hur MinCFO löser det
              </p>
              <h2>Så hjälper MinCFO CEO & Founders</h2>
              <p>
                MinCFO kopplar samman data, analys och exekvering i ett och samma flöde, så att ledningen
                kan agera snabbare med högre precision.
              </p>
            </header>

            <div className={styles.solutionGrid}>
              {SOLUTIONS.map((item) => (
                <article key={item.title} className={styles.solutionCard}>
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
        <AnimatedSectionBreak variant="rise" />

        <ScenarioVisualization />
        <AnimatedSectionBreak variant="dip" />

        <RevealSection className={`${styles.section} ${styles.impactSection}`}>
          <div className={styles.impactIntro}>
            <div>
              <p className={styles.impactTag}>Affärsvärde</p>
              <h2 className={styles.impactHeadline}>
                Mätbara resultat.
                <br />
                Direkt effekt.
              </h2>
            </div>
            <p className={styles.impactLead}>
              Tydlig påverkan i både ledningsarbete och finansiell exekvering. Mindre administration,
              mer strategi.
            </p>
          </div>

          <div className={styles.impactGrid}>
            {IMPACT.map((item, index) => (
              <article
                key={item.title}
                className={`${styles.impactCard} ${index === 0 ? styles.impactCardRealtime : ""}`}
              >
                <div
                  className={`${styles.impactVisual} ${
                    index === 0
                      ? styles.impactVisualRealtime
                      : index === 1
                        ? styles.impactVisualFlow
                        : styles.impactVisualCore
                  }`}
                >
                  {index === 0 ? (
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
                  ) : index === 1 ? (
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
                  ) : (
                    <>
                      <span className={styles.impactVisualHalo} aria-hidden="true" />
                      <span className={styles.impactProactiveOuter} aria-hidden="true" />
                      <span className={styles.impactProactiveDots} aria-hidden="true" />
                      <span className={styles.impactProactiveWave} aria-hidden="true" />
                      <span className={`${styles.impactProactiveWave} ${styles.impactProactiveWaveLate}`} aria-hidden="true" />
                      <span className={styles.impactProactiveInner} aria-hidden="true" />
                      <LocateFixed size={24} className={`${styles.impactIcon} ${styles.impactProactiveIcon}`} />
                    </>
                  )}
                </div>
                <p className={styles.impactMetric}>{item.value}</p>
                <h3>{item.title}</h3>
                <p className={styles.impactDescription}>{item.description}</p>
              </article>
            ))}
          </div>

          <TestimonialSpotlight />
        </RevealSection>
        <RevealSection className={styles.closing} id="kontakt">
          <div className={styles.closingCard}>
            <p className={styles.overline}>
              <Sparkles size={14} />
              Trust & CTA
            </p>
            <h2>
              <span className={styles.closingTitleMain}>Redo för nästa steg?</span>
              <span className={styles.closingTitleAccent}>Bygg med MinCFO.</span>
            </h2>
            <p>
              Vi hjälper CEO & Founders att gå från reaktiv rapportering till proaktiv styrning med
              realtidsdata, AI Copilot, scenario-planering och rådgivning i samma beslutsflöde, så att
              varje prioritering blir tydligare och snabbare att exekvera.
            </p>
            <Link href="/#hero" className={styles.primaryCta}>
              Boka demo <ChevronRight aria-hidden="true" className={styles.ctaIcon} />
            </Link>
          </div>
        </RevealSection>
      </main>

      <SiteFooter />
    </>
  );
}
