"use client";

import "../mincfo-landing.css";
import "../styles/platform.css";
import Nav from "../shared/Nav";
import Footer from "../shared/Footer";
import BrandMark from "../shared/BrandMark";
import PillarVisual from "./PillarVisual";
import platform from "@/content/home/platform.json";

const { hero, aicopilot, ending } = platform;
const { dashboard, planning } = aicopilot;
const customers = platform.customers;

const ArrowRight = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true">
    <path
      stroke="currentColor"
      strokeWidth="1.4"
      fill="none"
      d="M3 6h6m0 0L6.5 3.5M9 6L6.5 8.5"
    />
  </svg>
);

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <path
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      d="M2.5 7.5l3 3 6-6.5"
    />
  </svg>
);

const Chevron = () => (
  <svg
    className="faq-chev"
    width="14"
    height="14"
    viewBox="0 0 14 14"
    aria-hidden="true"
  >
    <path
      stroke="currentColor"
      strokeWidth="1.4"
      fill="none"
      strokeLinecap="round"
      d="M3 5.5l4 4 4-4"
    />
  </svg>
);

/* Planning / forecast mock used as the planning pillar visual. */
const FORECAST_BARS: { h: number; label: string; kind?: "now" | "fore" }[] = [
  { h: 44, label: "Maj" },
  { h: 52, label: "Jun" },
  { h: 60, label: "Jul" },
  { h: 68, label: "Aug", kind: "now" },
  { h: 74, label: "Sep", kind: "fore" },
  { h: 82, label: "Okt", kind: "fore" },
  { h: 88, label: "Nov", kind: "fore" },
  { h: 96, label: "Dec", kind: "fore" },
];

function ForecastVisual() {
  return (
    <div className="pv plat-fc">
      <div className="plat-fc-head">
        <span className="plat-fc-title">{planning.forecastTitle}</span>
        <span className="plat-fc-live">{planning.liveLabel}</span>
      </div>
      <div className="plat-fc-bars" aria-hidden="true">
        {FORECAST_BARS.map((b) => (
          <div className="plat-fc-col" key={b.label}>
            <span
              className={
                "plat-fc-bar" +
                (b.kind === "now"
                  ? " plat-fc-bar--now"
                  : b.kind === "fore"
                  ? " plat-fc-bar--fore"
                  : "")
              }
              style={{ height: `${b.h}%` }}
            />
            <span className="plat-fc-l">{b.label}</span>
          </div>
        ))}
      </div>
      <div className="plat-fc-foot">
        <span className="plat-fc-foot-k">{planning.annualVariance}</span>
        <span className="plat-fc-foot-v">+12,4%</span>
      </div>
    </div>
  );
}

type Pillar = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  visual: "copilot" | "dashboard" | "planning";
};

const PILLARS: Pillar[] = [
  {
    id: "ai-copilot",
    eyebrow: aicopilot.leftPill,
    title: aicopilot.leftTitle,
    body: aicopilot.leftIntro,
    bullets: aicopilot.leftBullets,
    visual: "copilot",
  },
  {
    id: "dashboard",
    eyebrow: dashboard.pill,
    title: dashboard.title,
    body: dashboard.intro,
    bullets: dashboard.kpiBullets,
    visual: "dashboard",
  },
  {
    id: "planering",
    eyebrow: planning.pill,
    title: planning.title,
    body: planning.intro,
    bullets: planning.bullets,
    visual: "planning",
  },
];

/* "Så funkar det" — verbatim platform steps + highlights from shared.json
   (live copy). Step 04 is grounded in the platform.json planning section. */
const STEPS: { n: string; title: string; body: string; highlights: string[] }[] = [
  {
    n: "01",
    title: "Skapa konto",
    body: "Kom igång direkt i plattformen.",
    highlights: [
      "Skapa konto och integrera till redovisningssystem på några minuter",
      "Säker onboarding med verifiering",
      "Direkt tillgång till plattformen",
    ],
  },
  {
    n: "02",
    title: "Koppla Redovisningssystem",
    body:
      "Koppla till befintligt redovisningssystem på några klick. MinCFO sätter automatiskt upp dashboards och rapportstruktur.",
    highlights: [
      "Koppla upp ert redovisningssystem på några klick",
      "Anpassningsbar dashboards och rapportstruktur sätts upp",
      "Data synkas löpande till MinCFO efter aktiverad koppling",
    ],
  },
  {
    n: "03",
    title: "Realtidsinsikter med MinCFO AI",
    body:
      "AI som besvarar frågor om bolagets siffror, realtidsrapportering enligt anpassad struktur och automatiskt uppdaterad kassaflödesprognos.",
    highlights: [
      "Realtidsrapportering av nyckeltal",
      "Kassaflödesoptimering i realtid",
      "Identifiera möjligheter för optimerad ekonomistyrning",
    ],
  },
  {
    n: "04",
    title: "Planera och simulera framåt",
    body:
      "Testa scenarier, förstå risker tidigare och prioritera utifrån faktisk ekonomisk påverkan — i samma flöde som uppföljningen.",
    highlights: [
      "Scenarioarbete för tillväxt, kostnader och hiring",
      "Tidigare signaler på risk och avvikelse",
      "Jämför segment, kunder och perioder",
    ],
  },
];

/* FAQ — grounded in the platform.json messaging. */
const FAQS: { q: string; a: string }[] = [
  {
    q: "Behöver vi byta system?",
    a: "Nej. MinCFO kopplas på era befintliga finansiella flöden och system — ni fortsätter jobba i de verktyg ni redan har.",
  },
  {
    q: "Vad kan AI Copiloten svara på?",
    a: "Ställ frågor om resultat, runway och avvikelser och få omedelbara svar, visualiseringar och strategiska råd — helt utan manuellt arbete.",
  },
  {
    q: "Hur uppdaterad är datan?",
    a: "Era viktigaste KPI:er är alltid synkade och klara. Ni ser läget i realtid utan att vänta på nästa manuella rapport.",
  },
  {
    q: "Kan vi dela vyer med team och styrelse?",
    a: "Ja. Dela uppdaterade vyer med team och styrelse med ett klick — alla får samma bild av läget.",
  },
  {
    q: "Vem passar plattformen för?",
    a: "Olika team använder MinCFO på olika sätt — founders, finance-team, SaaS- och tech-bolag, konsulter och e-handlare. Välj den lösning som speglar hur ni vill jobba.",
  },
];

export default function PlatformPage() {
  return (
    <div className="mv2-root hl-1 vs-1 type-sumary">
      <Nav />

      {/* ============ HERO ============ */}
      <section className="prod-hero" id="top">
        <div className="container">
          <div className="prod-hero-inner">
            <span className="eyebrow">{hero.tagline}</span>
            <h1 className="prod-hero-title serif-h">
              {hero.titleLine1}
              <br />
              <em>{hero.titleLine2}</em>
            </h1>
            <p className="prod-hero-sub">{hero.body}</p>
            <div className="prod-hero-cta">
              <a className="btn" href="/#demo">
                {hero.primaryCta}
                <ArrowRight />
              </a>
              <a className="btn btn-outline" href="#how">
                {hero.secondaryCta}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST TICKER ============ */}
      <section className="prod-trust">
        <div className="container">
          <p className="prod-trust-l">{customers.tickerLabel}</p>
          <div className="kc-ticker">
            <div className="kc-track">
              {[...customers.trustedLogos, ...customers.trustedLogos].map(
                (logo, i) => (
                  <span className="kc-logo" key={`${logo.file}-${i}`}>
                    <img
                      src={`/customers/logos/${logo.file}`}
                      alt={`${logo.name} logotyp`}
                    />
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============ PILLARS ============ */}
      <section className="section prod-pillars" id="plattform">
        <div className="container">
          <div className="pillar-stack">
            {PILLARS.map((p, i) => (
              <article
                key={p.id}
                id={p.id}
                className={`pillar pillar--${i % 2 === 0 ? "left" : "right"}`}
              >
                <div className="pillar-art pillar-art--visual">
                  {p.visual === "planning" ? (
                    <ForecastVisual />
                  ) : (
                    <PillarVisual variant={p.visual} />
                  )}
                </div>
                <div className="pillar-body">
                  <div className="pillar-eyebrow plat-pillar-eyebrow">
                    {p.eyebrow}
                  </div>
                  <h3 className="pillar-title serif-h">{p.title}</h3>
                  <p className="pillar-lead">{p.body}</p>
                  <ul className="pillar-bullets">
                    {p.bullets.map((b) => (
                      <li key={b}>
                        <Check />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="workspace" id="how">
        <div className="container">
          <div className="prod-how-head">
            <span className="eyebrow">Så funkar det</span>
            <h2 className="workspace-title">
              Så arbetar ni med MinCFO <em>i praktiken.</em>
            </h2>
          </div>

          <ol className="prod-steps">
            {STEPS.map((s) => (
              <li key={s.n} className="prod-step">
                <span className="prod-step-n">{s.n}</span>
                <div>
                  <div className="prod-step-t">{s.title}</div>
                  <div className="prod-step-b">{s.body}</div>
                  <ul className="plat-step-hl">
                    {s.highlights.map((h) => (
                      <li key={h}>
                        <Check />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="section prod-faq">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Frågor vi får ofta</span>
            <h2 className="serif-h">
              Vanliga frågor om <em>plattformen.</em>
            </h2>
          </div>
          <div className="faq-list">
            {FAQS.map((f) => (
              <details className="faq-item" key={f.q}>
                <summary>
                  <span>{f.q}</span>
                  <Chevron />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="closing prod-closing">
        <div className="container">
          <div className="prod-closing-brand" aria-hidden="true">
            <BrandMark />
          </div>
          <h2>{ending.title}</h2>
          <p className="sub">{ending.body}</p>
          <div className="closing-row">
            <a className="btn" href="/#demo">
              {ending.primaryCta}
              <ArrowRight />
            </a>
            <a className="btn btn-outline" href="#how">
              {hero.secondaryCta}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
