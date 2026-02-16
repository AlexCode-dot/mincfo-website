import FloatingNav from "@/components/layout/FloatingNav/FloatingNav";
import Logo from "@/components/layout/Logo/Logo";
import SiteFooter from "@/components/layout/SiteFooter/SiteFooter";
import {
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  RefreshCw,
  Sparkles,
  Target,
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
    title: "Manuella loopar bromsar finance",
    body: "Månadsstängning tar för lång tid när data måste hämtas, valideras och sammanställas manuellt.",
  },
  {
    title: "Forecast tappar tempo",
    body: "Antaganden uppdateras inte löpande, vilket gör att prognoser snabbt blir inaktuella för ledningen.",
  },
  {
    title: "För lite analys, för mycket kontroll",
    body: "Teamet lägger oproportionerligt mycket tid på kontrollmoment i stället för affärsnära analys.",
  },
  {
    title: "Insikter kommer för sent",
    body: "Verksamheten får signaler för sent för att kunna agera operativt i tid och minska avvikelser.",
  },
] as const;

const SOLUTIONS = [
  {
    title: "AI Copilot med spårbar data",
    body: "Copilot förklarar avvikelser och svarar på frågor i naturligt språk med tydlig dataspårbarhet.",
  },
  {
    title: "Realtidsdashboards för P&L och cash",
    body: "Uppdaterad finansiell status i realtid utan exportslingor eller manuella sammanställningar.",
  },
  {
    title: "Kontinuerlig forecasting",
    body: "Forecast uppdateras löpande när nya utfall och drivare kommer in, så teamet alltid styr på färsk data.",
  },
  {
    title: "Automatiserade finance-workflows",
    body: "Rapportpaket, avstämningar och uppföljning standardiseras och körs med högre kvalitet och hastighet.",
  },
] as const;

const IMPACT = [
  {
    value: "25-40%",
    title: "Snabbare stängning till rapport",
    description: "Kortare cykel från periodstängning till ledningsrapport och beslut.",
  },
  {
    value: "40-60%",
    title: "Mindre manuell rapporttid",
    description: "Minskad tid i återkommande rapportproduktion genom mer automation.",
  },
  {
    value: "Högre",
    title: "Forecast-träffsäkerhet",
    description: "Tätare uppdaterade antaganden ger mer robusta prognoser.",
  },
  {
    value: "Mer",
    title: "Affärsnära analyskapacitet",
    description: "Finance får mer tid till beslutstöd och strategisk uppföljning.",
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
    name: "Head of Finance",
    role: "B2B SaaS",
    quote:
      "Månadsstängning tog för lång tid och rapporteringen blev reaktiv. Med MinCFO standardiserade vi flödena och kan agera snabbare i varje period.",
  },
  {
    image: "/customers/testimonials/logo-oskar.avif",
    name: "CFO",
    role: "Growth bolag",
    quote:
      "Forecasting blev betydligt mer träffsäker när antaganden uppdateras löpande. Teamet lägger nu mer tid på analys och mindre på manuell administration.",
  },
  {
    image: "/customers/testimonials/logo-aviv.avif",
    name: "Finance Director",
    role: "Scale-up",
    quote:
      "AI Copilot och realtidsdata gav oss snabbare svar på avvikelser. Vi har fått bättre kontroll utan att tappa operativ hastighet.",
  },
];

export default function CfoFinancePage() {
  return (
    <>
      <Logo />
      <FloatingNav />

      <main className={styles.page}>
        <RevealSection className={styles.hero}>
          <div className={styles.heroCard}>
            <div className={styles.heroBackdrop} aria-hidden="true" />

            <span className={styles.eyebrow}>Lösning för CFO & Finance Team</span>
            <h1 className={`${styles.title} ${styles.titleWide}`}>
              Styr finansfunktionen
              <br />
              proaktivt med MinCFO
            </h1>
            <p className={styles.subtitle}>
              MinCFO kopplar ihop datakällor, automatiserar finansflöden och ger teamet en plattform
              för analys, planering och strategisk uppföljning med AI, realtidsdata och säkrare
              forecasting.
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
                Betrodd av team som vill kombinera finansiell kontroll med operativ hastighet
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
              <h2>The Finance Dilemma</h2>
              <p>
                CFO-team behöver snabb precision i styrningen. Men manuella flöden och inaktuell
                prognos gör att viktiga beslut riskerar att tas för sent.
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
              <h2>Så hjälper MinCFO CFO & Finance Team</h2>
              <p>
                MinCFO samlar data, automation och analys i ett gemensamt finance-flöde så att teamet
                kan leverera snabbare rapportering och bättre beslutsunderlag.
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
          description="Fråga Copilot om senaste kvartalets avvikelser och få direkt förklaring med drivare, drilldown och uppdaterad helårsprognos."
          prompt="Vilka kostnadsdrivare förklarar EBITDA-avvikelsen mot budget i senaste kvartalet?"
          summary={[
            "68% av avvikelsen kommer från personalkostnad och lägre bruttomarginal i två affärsområden.",
            "Om trenden kvarstår blir helårseffekten cirka -3,2 MSEK. Prioritera åtgärder i de två mest avvikande områdena först.",
          ]}
          primaryMetricLabel="Closing cycle"
          primaryMetricValue="-32%"
          primaryMetricHint="Snabbare periodstängning"
          secondaryMetricLabel="Forecast delta"
          secondaryMetricValue="2.8%"
          secondaryMetricHint="Nuvarande prognosavvikelse"
          activeMonth="Q4"
          chartSubtitle="Finance forecast"
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
              Starkare finansiell exekvering med mindre manuell administration och mer strategiskt
              fokus i teamet.
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
                          ? styles.impactVisualAccuracy
                          : styles.impactVisualAnalysis
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
                      <span className={styles.impactAccuracyOuterRing} aria-hidden="true" />
                      <span className={styles.impactAccuracyInnerRing} aria-hidden="true" />
                      <span className={styles.impactAccuracyCrosshairHorizontal} aria-hidden="true" />
                      <span className={styles.impactAccuracyCrosshairVertical} aria-hidden="true" />
                      <Target size={24} className={`${styles.impactIcon} ${styles.impactAccuracyIcon}`} />
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
              <span className={styles.closingTitleMain}>Stärk CFO-funktionen från dag ett.</span>
              <span className={styles.closingTitleAccent}>Bygg med MinCFO.</span>
            </h2>
            <p>
              MinCFO är byggt för team som vill kombinera finansiell kontroll med operativ hastighet,
              utan kompromisser i datakvalitet.
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
