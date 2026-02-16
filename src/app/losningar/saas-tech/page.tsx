import FloatingNav from "@/components/layout/FloatingNav/FloatingNav";
import Logo from "@/components/layout/Logo/Logo";
import SiteFooter from "@/components/layout/SiteFooter/SiteFooter";
import {
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  Radar,
  RefreshCw,
  Sparkles,
  Zap,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import AnimatedSectionBreak from "../ceo-founders/AnimatedSectionBreak";
import RevealSection from "../ceo-founders/RevealSection";
import ScenarioVisualization from "../ceo-founders/ScenarioVisualization";
import TestimonialSpotlight, { type TestimonialItem } from "../ceo-founders/TestimonialSpotlight";
import styles from "../ceo-founders/page.module.scss";

const CHALLENGES = [
  {
    title: "KPI:er och ekonomi lever i olika system",
    body: "ARR/MRR följs separat från resultat och cash, vilket skapar motstridiga signaler och sänker beslutshastigheten.",
  },
  {
    title: "Tillväxt styrs utan full kostnadsbild",
    body: "Produkt- och GTM-initiativ prioriteras utan tydlig koppling till marginal, CAC payback och burn.",
  },
  {
    title: "Churn-effekter syns för sent",
    body: "Förändringar i churn och expansion upptäcks ofta först när den finansiella effekten redan hunnit slå igenom.",
  },
  {
    title: "Scenarioarbete blir ad hoc",
    body: "Pricing, headcount och GTM-planer jämförs manuellt, vilket gör uppföljning långsam och svår att förankra.",
  },
] as const;

const SOLUTIONS = [
  {
    title: "AI Copilot förklarar samband",
    body: "Copilot kopplar ihop tillväxt, churn, marginal och likviditet så att teamet snabbare förstår vad som driver utfallet.",
  },
  {
    title: "Gemensam beslutsvy i realtid",
    body: "SaaS-KPI:er och finansiella nyckeltal samlas i samma dashboard för tydlig, löpande styrning.",
  },
  {
    title: "Forecasting på 12-18 månader",
    body: "Churn, nyförsäljning och expansion modelleras kontinuerligt så att plan och verklighet hålls synkade.",
  },
  {
    title: "Automatiserade workflows",
    body: "Återkommande uppföljning, rapportering och kontrollmoment körs med mindre manuellt arbete och högre kvalitet.",
  },
] as const;

const IMPACT = [
  {
    value: "Snabbare",
    title: "Beslut mellan produkt, GTM och finance",
    description: "Tydligare koppling mellan operativa initiativ och finansiell effekt i realtid.",
  },
  {
    value: "Bättre",
    title: "Prioritering av initiativ",
    description: "Fokus på åtgärder som förbättrar enhetsekonomi, payback och långsiktig tillväxtkvalitet.",
  },
  {
    value: "Färre",
    title: "Överraskningar i cash-utveckling",
    description: "Kontinuerlig scenario-uppföljning gör risker synliga tidigare och minskar sena korrigeringar.",
  },
  {
    value: "Starkare",
    title: "Beslutsunderlag mot styrelse och investerare",
    description: "Konsekventa KPI:er och tydliga scenarier stärker dialogen om tempo, risk och kapitalbehov.",
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

const TESTIMONIALS: TestimonialItem[] = [
  {
    image: "/customers/testimonials/logo-rikard.avif",
    name: "VP Finance",
    role: "B2B SaaS",
    quote:
      "Vi fick äntligen ARR, churn och cash i samma styrbild. Det gav oss snabbare prioriteringar mellan produkt, sälj och kostnadsnivå.",
  },
  {
    image: "/customers/testimonials/logo-oskar.avif",
    name: "COO",
    role: "Tech scale-up",
    quote:
      "När vi kunde simulera headcount och GTM i samma scenarioflöde blev besluten både snabbare och mer förankrade i ledningsgruppen.",
  },
  {
    image: "/customers/testimonials/logo-aviv.avif",
    name: "CEO",
    role: "SaaS-bolag",
    quote:
      "MinCFO gav oss bättre kontroll över payback och runway utan att tappa tillväxttempo. Vi agerar på signaler tidigare än tidigare.",
  },
];

export default function SaasTechPage() {
  return (
    <>
      <Logo />
      <FloatingNav />

      <main className={styles.page}>
        <RevealSection className={styles.hero}>
          <div className={styles.heroCard}>
            <div className={styles.heroBackdrop} aria-hidden="true" />

            <span className={styles.eyebrow}>Lösning för SaaS / Tech</span>
            <h1 className={`${styles.title} ${styles.titleWide}`}>
              Koppla produkttillväxt till ekonomi i realtid
            </h1>
            <p className={styles.subtitle}>
              MinCFO förenar SaaS-metrics, finansiell data och AI-driven analys i en plattform så
              ni kan styra tillväxt med kontroll på marginal, churn och burn.
            </p>

            <div className={styles.heroActions}>
              <a href="#kontakt" className={styles.primaryCta}>
                Boka en demo <ChevronRight aria-hidden="true" className={styles.ctaIcon} />
              </a>
              <a href="#utmaning" className={styles.secondaryCta}>
                Se hur MinCFO löser det
              </a>
            </div>

            <div className={styles.heroTrust}>
              <p className={styles.heroTrustLabel}>
                Betrodd av SaaS- och techteam som vill skala med bättre ekonomisk precision
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
              <h2>The SaaS Dilemma</h2>
              <p>När SaaS-metrics och ekonomi inte möts i samma beslutsyta.</p>
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
              <h2>Så hjälper MinCFO SaaS / Tech</h2>
              <p>
                MinCFO samlar KPI:er, forecasting, automation och CFO-rådgivning i ett gemensamt
                flöde för snabbare och mer förankrade tillväxtbeslut.
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

        <ScenarioVisualization
          heading="Scenario visualization"
          description="Fråga: Vad händer med ARR, CAC payback och runway om churn minskar och säljkapaciteten ökar?"
          prompt="Vad händer med ARR, CAC payback och runway om churn minskar 1,5 procentenheter och säljkapaciteten ökar?"
          summary={[
            "ARR ökar snabbare från Q3 när retention förbättras och nyförsäljningen skalar med högre effektivitet.",
            "CAC payback förbättras med cirka två månader och runway stärks med omkring 1,3 månader jämfört med nuvarande plan.",
          ]}
          primaryMetricLabel="CAC payback"
          primaryMetricValue="9.4 mån"
          primaryMetricHint="Scenario"
          secondaryMetricLabel="Runway delta"
          secondaryMetricValue="+1.3 mån"
          secondaryMetricHint="Mot nuvarande plan"
          activeMonth="Q3"
          chartSubtitle="SaaS growth forecast"
        />
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
              Starkare styrning mellan produkt, GTM och finance med färre manuella loopar och bättre
              precision i tillväxtbeslut.
            </p>
          </div>

          <div className={`${styles.impactGrid} ${styles.impactGridFour}`}>
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
                        : index === 2
                          ? styles.impactVisualRadar
                          : styles.impactVisualReport
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
                  ) : index === 2 ? (
                    <>
                      <span className={styles.impactVisualHalo} aria-hidden="true" />
                      <span className={styles.impactProactiveOuter} aria-hidden="true" />
                      <span className={styles.impactProactiveDots} aria-hidden="true" />
                      <span className={styles.impactProactiveWave} aria-hidden="true" />
                      <span
                        className={`${styles.impactProactiveWave} ${styles.impactProactiveWaveLate}`}
                        aria-hidden="true"
                      />
                      <span className={styles.impactProactiveInner} aria-hidden="true" />
                      <Radar size={24} className={`${styles.impactIcon} ${styles.impactProactiveIcon}`} />
                    </>
                  ) : (
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
                  )}
                </div>
                <p className={styles.impactMetric}>{item.value}</p>
                <h3>{item.title}</h3>
                <p className={styles.impactDescription}>{item.description}</p>
              </article>
            ))}
          </div>

          <TestimonialSpotlight testimonials={TESTIMONIALS} />
        </RevealSection>
        <RevealSection className={styles.closing} id="kontakt">
          <div className={styles.closingCard}>
            <p className={styles.overline}>
              <Sparkles size={14} />
              Trust & CTA
            </p>
            <h2>
              <span className={styles.closingTitleMain}>Skala snabbare med ekonomisk precision.</span>
              <span className={styles.closingTitleAccent}>Bygg med MinCFO.</span>
            </h2>
            <p>
              MinCFO passar SaaS- och techbolag som vill kombinera hög tillväxt med finansiell
              disciplin på enterprise-nivå.
            </p>
            <Link href="/#hero" className={styles.primaryCta}>
              Boka demo
              <ChevronRight aria-hidden="true" className={styles.ctaIcon} />
            </Link>
          </div>
        </RevealSection>
      </main>

      <SiteFooter />
    </>
  );
}
