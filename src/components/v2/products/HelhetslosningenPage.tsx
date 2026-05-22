"use client";

import "../mincfo-landing.css";
import Nav from "../shared/Nav";
import Footer from "../shared/Footer";
import BrandMark from "../shared/BrandMark";
import PillarVisual from "./PillarVisual";

type PillarVisualVariant =
  | "ledger"
  | "dashboard"
  | "copilot"
  | "chat"
  | "payroll";

const TICKER_LOGOS: { name: string; file: string; soft?: boolean }[] = [
  { name: "Growbit", file: "logo-growbit.svg" },
  { name: "Showcase", file: "logo-showcase.avif", soft: true },
  { name: "Lawster", file: "logo-lawster.avif" },
  { name: "Hälsa Hemma", file: "logo-h%C3%A4lsa.avif" },
  { name: "SweBal", file: "logo-swebal.avif" },
  { name: "BAM", file: "logo-bam.avif" },
  { name: "Eloize", file: "logo-eloize.avif" },
  { name: "Runway", file: "logo-runway.webp" },
  { name: "Realforce", file: "logo-realforce.avif" },
  { name: "Rossoneri", file: "logo-rossoneri.avif" },
  { name: "Qsid", file: "logo-qsid.avif" },
];

const PILLARS: {
  id: string;
  eyebrow: string;
  title: string;
  italic?: string;
  body: string;
  bullets: string[];
  visual: PillarVisualVariant;
}[] = [
  {
    id: "fs-redovisning",
    eyebrow: "REDOVISNING",
    title: "Bokföringen,",
    italic: "löpande.",
    body:
      "Vi sköter den löpande bokföringen, periodiseringar och avstämningar i Fortnox. Ni öppnar plattformen och ser läget — utan att jaga underlag eller öppna poster.",
    bullets: [
      "Löpande bokföring och kontering",
      "Leverantörs- och kundreskontra",
      "Bank- och kortavstämningar",
      "Moms och arbetsgivardeklarationer",
    ],
    visual: "ledger",
  },
  {
    id: "fs-rapportering",
    eyebrow: "RAPPORTERING",
    title: "Allt vi gör,",
    italic: "syns i plattformen.",
    body:
      "MinCFO hanterar rapportering och uppföljning i bakgrunden. Ni öppnar plattformen och ser resultat, likviditet, KPI:er och avvikelser i realtid — utan att jaga underlag eller bygga rapporter själva.",
    bullets: [
      "Rapporter och KPI:er uppdateras löpande",
      "Likviditet och utfall i samma vy",
      "Avvikelser flaggas med tydliga nästa steg",
      "Månadsbokslut och kvartalsrapport enligt schema",
    ],
    visual: "dashboard",
  },
  {
    id: "fs-copilot",
    eyebrow: "AI COPILOT",
    title: "Fråga något om",
    italic: "er ekonomi.",
    body:
      "Plattformens AI Copilot svarar på frågor i klartext — med specifika siffror, förklaring och spårbarhet till underliggande transaktioner. Inga rapporter att vänta på.",
    bullets: [
      "Ställ frågor i naturligt språk",
      "Svar grundade i er faktiska data",
      "Spårbarhet till underliggande transaktioner",
      "Flaggar risker och föreslår nästa steg",
    ],
    visual: "copilot",
  },
  {
    id: "fs-controller",
    eyebrow: "CONTROLLER & CFO",
    title: "En partner som tänker",
    italic: "steget före.",
    body:
      "Ni får en personlig controller och en CFO on demand. Vi hör av oss innan ni hör av oss — med insikter, varningar och förslag på nästa drag.",
    bullets: [
      "Personlig controller som äger leveransen",
      "CFO on demand vid beslut, board och investerare",
      "Återkommande genomgångar — inte bara siffror",
      "Proaktiv rådgivning innan problemen växer",
    ],
    visual: "chat",
  },
  {
    id: "fs-lon",
    eyebrow: "LÖN",
    title: "Löner körda,",
    italic: "alla nöjda.",
    body:
      "Vi hanterar lönekörning, semester och sjukfrånvaro. Ert team får rätt lön i rätt tid — utan att ni behöver tänka på det.",
    bullets: [
      "Månatlig lönekörning och utbetalning",
      "Skattedeklaration och AGI",
      "Semester och sjukfrånvaro",
      "Reseräkningar och utlägg",
    ],
    visual: "payroll",
  },
];

const STEPS: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Vi kopplar Fortnox",
    body:
      "Ni ger oss åtkomst en gång. Vi går igenom kontoplan, öppna poster och avstämningar — så vi startar från en sann nollställd punkt.",
  },
  {
    n: "02",
    title: "Vi tar över det löpande",
    body:
      "Bokföring, reskontra, moms och löner flyttar över till oss. Ert team slutar göra det operativa — utan att byta system.",
  },
  {
    n: "03",
    title: "Ni får er controller och CFO",
    body:
      "En personlig controller leder leveransen och en CFO finns med vid beslut, board och investerardialog. Ni har alltid en person att ringa.",
  },
  {
    n: "04",
    title: "Plattformen blir er sanning",
    body:
      "Ni öppnar MinCFO och ser resultat, likviditet och KPI:er live. Vi underhåller forecasts, ni testar scenarier.",
  },
];

const DELIVERABLES: { group: string; items: string[] }[] = [
  {
    group: "Varje vecka",
    items: [
      "Löpande bokföring och leverantörsfakturor",
      "Avstämningar mot bank och kort",
      "Avvikelser flaggas med tydliga nästa steg",
    ],
  },
  {
    group: "Varje månad",
    items: [
      "Månadsbokslut enligt schema",
      "Genomgång med er controller",
      "Lönekörning, AGI och skattedeklaration",
      "Realtidsvy på KPI:er, cashflow och avvikelser",
    ],
  },
  {
    group: "Varje kvartal & år",
    items: [
      "Kvartals- och årsrapporter",
      "Budget och scenarioarbete med CFO",
      "Årsbokslut och förberett revisionsmaterial",
      "Underlag för styrelse och investerare",
    ],
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Behöver vi byta från Fortnox?",
    a: "Nej. Vi jobbar direkt i ert Fortnox och bygger MinCFO ovanpå. Ni behåller all historik och äger datan.",
  },
  {
    q: "Vad händer med vår nuvarande redovisningsbyrå?",
    a: "Vi tar över hela leveransen — bokföring, lön, bokslut och rådgivning. När och hur ni går över anpassar vi efter er situation.",
  },
  {
    q: "Vem är vår kontaktperson?",
    a: "Ni får en personlig controller som äger den löpande leveransen, och en CFO som finns med vid beslut och styrelsearbete.",
  },
  {
    q: "Vad ingår i helhetslösningen?",
    a: "Redovisning, lön, moms, bokslut och CFO-stöd — levererat löpande, med realtidsinsyn i KPI:er, cashflow och avvikelser i plattformen.",
  },
  {
    q: "Hur ser upplägget ut?",
    a: "Vi börjar med ett samtal där vi går igenom er situation, scope och vilka system som ska kopplas in. Därefter sätter vi ett upplägg som matchar er volym och rapporteringsbehov.",
  },
];

export default function HelhetslosningenPage() {
  return (
    <div className="mv2-root hl-1 vs-1 type-sumary">
      <Nav />

      {/* ============ HERO ============ */}
      <section className="prod-hero" id="top">
        <div className="container">
          <div className="prod-hero-inner">
            <span className="eyebrow">Helhetslösningen</span>
            <h1 className="prod-hero-title serif-h">
              Vi blir er ekonomifunktion.
              <br />
              <em>Ni driver bolaget.</em>
            </h1>
            <p className="prod-hero-sub">
              Redovisning, rapportering, lön och CFO-stöd — levererat av ett
              team som äger leveransen och en plattform som visar läget i
              realtid. Ert team slutar göra det operativa.
            </p>
            <div className="prod-hero-cta">
              <a className="btn" href="/#demo">
                Boka samtal
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <path
                    stroke="currentColor"
                    strokeWidth="1.4"
                    fill="none"
                    d="M3 6h6m0 0L6.5 3.5M9 6L6.5 8.5"
                  />
                </svg>
              </a>
              <a className="btn btn-outline" href="#how">
                Se hur det funkar
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST TICKER ============ */}
      <section className="prod-trust">
        <div className="container">
          <p className="prod-trust-l">
            Betrodd av 50+ bolag som lagt ut hela sin ekonomi till MinCFO
          </p>
          <div className="kc-ticker">
            <div className="kc-track">
              {[...TICKER_LOGOS, ...TICKER_LOGOS].map((logo, i) => (
                <span
                  className={`kc-logo${logo.soft ? " soft" : ""}`}
                  key={`${logo.file}-${i}`}
                >
                  <img
                    src={`/customers/logos/${logo.file}`}
                    alt={`${logo.name} logotyp`}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ PILLARS ============ */}
      <section className="section prod-pillars">
        <div className="container">
          <div className="pillar-stack">
            {PILLARS.map((p, i) => (
              <article
                key={p.id}
                id={p.id}
                className={`pillar pillar--${i % 2 === 0 ? "left" : "right"}`}
              >
                <div className="pillar-art pillar-art--visual">
                  <PillarVisual variant={p.visual} />
                </div>
                <div className="pillar-body">
                  <div className="pillar-eyebrow">{p.eyebrow}</div>
                  <h3 className="pillar-title serif-h">
                    {p.title}{" "}
                    {p.italic ? <em>{p.italic}</em> : null}
                  </h3>
                  <p className="pillar-lead">{p.body}</p>
                  <ul className="pillar-bullets">
                    {p.bullets.map((b) => (
                      <li key={b}>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          aria-hidden="true"
                        >
                          <path
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            d="M2.5 7.5l3 3 6-6.5"
                          />
                        </svg>
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
              Från Fortnox-koppling till{" "}
              <em>realtidsläge.</em>
            </h2>
            <p className="workspace-body">
              Vi sätter upplägget tillsammans med er. Ni byter inte system —
              ni slutar bara göra det operativa.
            </p>
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

      {/* ============ DELIVERABLES ============ */}
      <section className="section prod-deliverables">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Vad ni får levererat</span>
            <h2 className="serif-h">
              Vad vi levererar.{" "}
              <em>Varje månad.</em>
            </h2>
            <p>
              Det löpande ekonomiarbetet — strukturerat, granskat och
              levererat enligt schema.
            </p>
          </div>
          <div className="deliverables-grid">
            {DELIVERABLES.map((d) => (
              <article className="deliverable-card" key={d.group}>
                <h3 className="deliverable-title">{d.group}</h3>
                <ul className="deliverable-list">
                  {d.items.map((it) => (
                    <li key={it}>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        aria-hidden="true"
                      >
                        <path
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                          d="M2.5 7.5l3 3 6-6.5"
                        />
                      </svg>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="section prod-faq">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Frågor vi får ofta</span>
            <h2 className="serif-h">
              Vanliga frågor om{" "}
              <em>helhetslösningen.</em>
            </h2>
          </div>
          <div className="faq-list">
            {FAQS.map((f) => (
              <details className="faq-item" key={f.q}>
                <summary>
                  <span>{f.q}</span>
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
          <h2>Redo att lämna över ekonomin?</h2>
          <p className="sub">
            Boka ett samtal så går vi igenom er situation och visar hur en
            ekonomifunktion hos oss skulle se ut för er.
          </p>
          <div className="closing-row">
            <a className="btn" href="/#demo">
              Boka samtal
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path
                  stroke="currentColor"
                  strokeWidth="1.4"
                  fill="none"
                  d="M3 6h6m0 0L6.5 3.5M9 6L6.5 8.5"
                />
              </svg>
            </a>
            <a className="btn btn-outline" href="#how">
              Se hur det funkar
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
