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

/* Planning / forecast mock — a cash-flow chart shown on a photo backdrop,
   mirroring the other pillars. Built in the v2 light card style. */
const FC_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "Maj", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Dec",
];
// 12 points, slight dip then a steady climb. Lower y = higher value.
const FC_PTS: [number, number][] = [
  [12, 88], [38.9, 86], [65.8, 84], [92.7, 74], [119.6, 68], [146.5, 60],
  [173.5, 54], [200.4, 47], [227.3, 40], [254.2, 33], [281.1, 27], [308, 20],
];
const FC_BOUNDARY = 3; // Apr is the last actual month
const BASELINE = 110;
const toLine = (pts: [number, number][]) =>
  pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
const actualPts = FC_PTS.slice(0, FC_BOUNDARY + 1);
const forecastPts = FC_PTS.slice(FC_BOUNDARY);
const areaPath =
  `M${FC_PTS[0][0]},${BASELINE} ` +
  FC_PTS.map(([x, y]) => `L${x},${y}`).join(" ") +
  ` L${FC_PTS[FC_PTS.length - 1][0]},${BASELINE} Z`;

function ForecastVisual() {
  const [bx, by] = FC_PTS[FC_BOUNDARY];
  return (
    <div
      className="plat-fc-photo"
      style={{ backgroundImage: "url(/v2/assets/pillars/ledger.png)" }}
    >
      <span className="plat-fc-tint" aria-hidden="true" />
      <div className="plat-fc-inner">
        <div className="pv plat-fc">
          <div className="plat-fc-status">
            <span className="plat-fc-chip">
              <span className="plat-fc-chip-l">Rapporter</span>
              <span className="plat-fc-chip-v">
                <span className="plat-fc-live-dot" />Live
              </span>
            </span>
            <span className="plat-fc-chip">
              <span className="plat-fc-chip-l">Prognos</span>
              <span className="plat-fc-chip-v">12 månader</span>
            </span>
            <span className="plat-fc-chip">
              <span className="plat-fc-chip-l">Fortnox</span>
              <span className="plat-fc-chip-v">
                <span className="plat-fc-live-dot" />Live
              </span>
            </span>
          </div>

          <div className="plat-fc-head">
            <span className="plat-fc-select">
              Kassaflödesprognos
              <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
                <path stroke="currentColor" strokeWidth="1.4" fill="none"
                  strokeLinecap="round" d="M3 4.5l3 3 3-3" />
              </svg>
            </span>
            <span className="plat-fc-legend">
              <span className="plat-fc-lg">
                <i className="plat-fc-lg-solid" />Utfall
              </span>
              <span className="plat-fc-lg">
                <i className="plat-fc-lg-dash" />Prognos
              </span>
            </span>
          </div>

          <div className="plat-fc-chartwrap">
            <svg
              className="plat-fc-chart"
              viewBox="0 0 320 124"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="platFcArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4C3DFF" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#4C3DFF" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[40, 68, 96].map((y) => (
                <line key={y} x1="12" y1={y} x2="308" y2={y}
                  stroke="rgba(0,0,0,0.06)" strokeWidth="1" strokeDasharray="2 4" />
              ))}
              <line x1={bx} y1="12" x2={bx} y2={BASELINE}
                stroke="rgba(0,0,0,0.10)" strokeWidth="1" strokeDasharray="3 3" />
              <path d={areaPath} fill="url(#platFcArea)" />
              <path d={toLine(actualPts)} fill="none" stroke="#4C3DFF"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d={toLine(forecastPts)} fill="none" stroke="#4C3DFF"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="4 4" opacity="0.85" />
              <circle cx={bx} cy={by} r="4.5" fill="#FFFFFF"
                stroke="#4C3DFF" strokeWidth="2.5" />
            </svg>
            <div className="plat-fc-tip">
              <span>{FC_MONTHS[FC_BOUNDARY]}</span>
              <strong>Utfall: 314 tkr</strong>
            </div>
          </div>

          <div className="plat-fc-months" aria-hidden="true">
            {FC_MONTHS.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
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

/* "Så funkar det" — verbatim platform steps from shared.json (live copy).
   Step 04 is grounded in the platform.json planning section. */
const STEPS: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Skapa konto",
    body:
      "Kom igång direkt i plattformen med säker onboarding och verifiering — på några minuter.",
  },
  {
    n: "02",
    title: "Koppla Redovisningssystem",
    body:
      "Koppla till befintligt redovisningssystem på några klick. MinCFO sätter automatiskt upp dashboards och rapportstruktur.",
  },
  {
    n: "03",
    title: "Realtidsinsikter med MinCFO AI",
    body:
      "AI som besvarar frågor om bolagets siffror, realtidsrapportering enligt anpassad struktur och automatiskt uppdaterad kassaflödesprognos.",
  },
  {
    n: "04",
    title: "Planera och simulera framåt",
    body:
      "Testa scenarier, förstå risker tidigare och prioritera utifrån faktisk ekonomisk påverkan — i samma flöde som uppföljningen.",
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
      <section className="workspace plat-how" id="how">
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
