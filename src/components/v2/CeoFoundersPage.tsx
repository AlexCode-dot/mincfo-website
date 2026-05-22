"use client";

import { useEffect, useRef, useState } from "react";
import "./mincfo-landing.css";
import BrandMark from "./shared/BrandMark";
import Nav from "./shared/Nav";
import Footer from "./shared/Footer";

type ImpactStat = { from: number; to: number; suffix: string; label: string };

const IMPACTS: ImpactStat[] = [
  { from: 30, to: 50, suffix: "%", label: "Snabbare beslut" },
  { from: 60, to: 80, suffix: "%", label: "Mindre manuellt jobb" },
  { from: 1, to: 2, suffix: " kv", label: "Proaktivitet" },
];


function CountUpRange({
  from,
  to,
  suffix,
  durationMs = 1600,
}: {
  from: number;
  to: number;
  suffix: string;
  durationMs?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(from);
  const startedRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(to);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / durationMs);
              const eased = 1 - Math.pow(1 - t, 3);
              setDisplay(Math.round(from + eased * (to - from)));
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        }
      },
      { threshold: 0.4 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [from, to, durationMs]);

  return (
    <span ref={ref}>
      {from}-{display}
      {suffix}
    </span>
  );
}

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

const PAINS: { title: string; body: string }[] = [
  {
    title: "Ingen samlad nulägesbild",
    body: "ARR, burn, kassaflöde och kostnadsdrivare uppdateras i olika verktyg. Ledningen saknar en gemensam version av läget.",
  },
  {
    title: "Beslut tas för sent",
    body: "Rapporter kommer långt efter att avvikelsen inträffat. Exekvering sker på föråldrad data.",
  },
  {
    title: "Runway-risk upptäcks sent",
    body: "Små förändringar i churn, rekrytering eller GTM-kostnad ger stor effekt över tid men syns ofta för sent.",
  },
];

const HELPS: { title: string; body: string }[] = [
  {
    title: "Live dashboard för bättre och snabbare beslut",
    body: "Runway, burn, ARR, marginal och avvikelser i en gemensam vy som uppdateras löpande.",
  },
  {
    title: "AI Copilot för VD:ar och grundare",
    body: "Ställ frågor i naturligt språk och få svar med specifika siffror, förklaring och dataspårbarhet på sekunder.",
  },
  {
    title: "Scenario-planering i samma flöde",
    body: "Testa effekten av rekrytering, GTM och kostnadsnivå direkt på resultat, kassaflöde och runway.",
  },
];

export default function CeoFoundersPage() {
  return (
    <div className="mv2-root hl-1 vs-1 type-sumary">
      <Nav />

      {/* ============ HERO ============ */}
      <section className="prod-hero" id="top">
        <div className="container">
          <div className="prod-hero-inner">
            <span className="eyebrow">Lösning för VD:ar och grundare</span>
            <h1 className="prod-hero-title serif-h">
              Finansiell klarhet för
              <br />
              <em>VD:ar och grundare.</em>
            </h1>
            <p className="prod-hero-sub">
              MinCFO samlar AI Copilot, dashboards i realtid, forecasting och
              strategisk rådgivning i en beslutsyta. Resultatet är snabbare
              prioriteringar, tydligare vägval och högre precision i varje
              tillväxtbeslut.
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
              <a className="btn btn-outline" href="/produkter/helhetslosningen">
                Se helhetslösningen
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST TICKER ============ */}
      <section className="prod-trust">
        <div className="container">
          <p className="prod-trust-l">
            Betrodd av tillväxtteam som kräver finansiell precision i hög takt
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

      {/* ============ PAIN POINTS ============ */}
      <section className="section sol-pain">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">The CEO &amp; Founder Dilemma</span>
            <h2 className="serif-h">
              Tillväxt kräver fart.{" "}
              <em>Splittrad data bromsar.</em>
            </h2>
            <p>
              Hög tillväxt kräver fart i beslut. Men splittrad data, manuell
              rapportering och osäker prognos gör att viktiga vägval tas för
              sent.
            </p>
          </div>
          <div className="sol-cards-3">
            {PAINS.map((p) => (
              <article className="sol-card sol-card--filled" key={p.title}>
                <span className="sol-icon sol-icon--negative" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </span>
                <h3 className="sol-card-title serif-h">{p.title}</h3>
                <p className="sol-card-body">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW WE HELP ============ */}
      <section className="section sol-helps">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Så hjälper MinCFO VD:ar och grundare</span>
            <h2 className="serif-h">
              Data, analys och exekvering{" "}
              <em>i samma flöde.</em>
            </h2>
            <p>
              MinCFO kopplar samman data, analys och exekvering i ett och samma
              flöde, så att du kan agera snabbare med högre precision.
            </p>
          </div>
          <div className="sol-cards-3">
            {HELPS.map((h) => (
              <article className="sol-card sol-card--filled" key={h.title}>
                <span className="sol-icon sol-icon--positive" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <h3 className="sol-card-title serif-h">{h.title}</h3>
                <p className="sol-card-body">{h.body}</p>
              </article>
            ))}
          </div>
          <div className="sol-helps-cta">
            <a className="text-link" href="/produkter/helhetslosningen">
              Se helhetslösningen
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                <path
                  stroke="currentColor"
                  strokeWidth="1.4"
                  fill="none"
                  d="M2 5h6m-2.5-2.5L8 5l-2.5 2.5"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ============ IMPACT BAND ============ */}
      <section className="impact">
        <div className="container">
          <div className="impact-grid">
            {IMPACTS.map((stat) => (
              <div className="impact-stat" key={stat.label}>
                <div className="impact-value serif-h">
                  <CountUpRange
                    from={stat.from}
                    to={stat.to}
                    suffix={stat.suffix}
                  />
                </div>
                <div className="impact-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ IMPACT DETAILS ============ */}
      <section className="section impact-detail">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Affärsvärde</span>
            <h2 className="serif-h">
              Mätbara resultat. <em>Direkt effekt.</em>
            </h2>
            <p>
              Tydlig påverkan i både ledningsarbete och finansiell exekvering.
              Mindre administration och mer tid för värdeskapande analys.
            </p>
          </div>
          <div className="impact-detail-grid">
            {/* Card 1 — Snabbare beslut */}
            <article className="impact-detail-card">
              <div
                className="impact-detail-visual impact-detail-visual--photo"
                style={{ backgroundImage: "url(/v2/assets/impact-1.png)" }}
              >
                <span className="impact-overlay-value serif-h">
                  30-50%
                </span>
                <div className="mock mock--time mock--corner-tr">
                  <div className="mock-time-head">
                    <span className="mock-time-brand">
                      <BrandMark />
                      <span>MinCFO</span>
                    </span>
                    <span className="mock-time-period">Q4 · 2026</span>
                  </div>
                  <div className="mock-tile-label">Tid till beslut</div>
                  <div className="mock-tile-value">30-50%</div>
                  <div className="mock-time-meta">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <polyline points="19 12 12 19 5 12" />
                    </svg>
                    <span>snabbare än internt</span>
                  </div>
                </div>
              </div>
              <div className="impact-detail-text">
                <h3 className="impact-detail-title serif-h">Snabbare beslut</h3>
                <p className="impact-detail-body">
                  Kortare tid från fråga till beslut i ledningsmöten genom
                  automatiserad data.
                </p>
              </div>
            </article>

            {/* Card 2 — Mindre manuellt jobb */}
            <article className="impact-detail-card">
              <div
                className="impact-detail-visual impact-detail-visual--photo"
                style={{ backgroundImage: "url(/v2/assets/impact-2.png)" }}
              >
                <span className="impact-overlay-value serif-h">
                  60-80%
                </span>
                <div className="mock mock--toast mock--corner-tr mock--stack-3-back">
                  <span className="mock-icon mock-icon--success">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <div>
                    <div className="mock-title">Bankavstämning klar</div>
                    <div className="mock-meta">247 transaktioner · 09:32</div>
                  </div>
                </div>
                <div className="mock mock--toast mock--corner-tr mock--stack-3-mid">
                  <span className="mock-icon mock-icon--success">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <div>
                    <div className="mock-title">Lönekörning klar</div>
                    <div className="mock-meta">42 anställda · 12:00</div>
                  </div>
                </div>
                <div className="mock mock--toast mock--corner-tr mock--stack-3-front">
                  <span className="mock-icon mock-icon--success">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <div>
                    <div className="mock-title">Månadsrapport skickad</div>
                    <div className="mock-meta">Styrelsen · 14:18</div>
                  </div>
                </div>
              </div>
              <div className="impact-detail-text">
                <h3 className="impact-detail-title serif-h">Mindre manuellt jobb</h3>
                <p className="impact-detail-body">
                  Minskad tid i månatlig rapportering och administration via
                  smarta flöden.
                </p>
              </div>
            </article>

            {/* Card 3 — Proaktivitet */}
            <article className="impact-detail-card">
              <div
                className="impact-detail-visual impact-detail-visual--photo"
                style={{ backgroundImage: "url(/v2/assets/impact-3.png)" }}
              >
                <span className="impact-overlay-value serif-h">
                  1-2 kv
                </span>
                <div className="mock mock--time mock--corner-tr">
                  <div className="mock-time-head">
                    <span className="mock-time-brand">
                      <BrandMark />
                      <span>MinCFO</span>
                    </span>
                    <span className="mock-time-period">Prognos</span>
                  </div>
                  <div className="mock-tile-label">Runway-prognos</div>
                  <div className="mock-tile-value">
                    8.2<span className="mock-tile-unit">mån i Q4</span>
                  </div>
                  <svg
                    className="mock-chart"
                    viewBox="0 0 200 72"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    {/* gridlines */}
                    <line x1="0" y1="24" x2="200" y2="24" className="mock-chart-grid" />
                    <line x1="0" y1="48" x2="200" y2="48" className="mock-chart-grid" />
                    {/* actual area + line */}
                    <path
                      className="mock-chart-area"
                      d="M6,15 L53,23 L100,34 L100,72 L6,72 Z"
                    />
                    <path
                      className="mock-chart-line"
                      d="M6,15 L53,23 L100,34"
                    />
                    {/* forecast area + dashed line (trending into risk) */}
                    <path
                      className="mock-chart-area mock-chart-area--alert"
                      d="M100,34 L147,47 L194,59 L194,72 L100,72 Z"
                    />
                    <path
                      className="mock-chart-line mock-chart-line--forecast"
                      d="M100,34 L147,47 L194,59"
                    />
                    <circle className="mock-chart-dot" cx="194" cy="59" r="3.5" />
                  </svg>
                  <div className="mock-chart-axis">
                    <span>Q1</span>
                    <span>Q2</span>
                    <span>Q3</span>
                    <span>Q4</span>
                  </div>
                </div>
              </div>
              <div className="impact-detail-text">
                <h3 className="impact-detail-title serif-h">Proaktivitet</h3>
                <p className="impact-detail-body">
                  Tidigare upptäckt av runway-risk och finansiella hinder för
                  bolaget.
                </p>
              </div>
            </article>

            {/* Card 4 — Styrelseunderlag */}
            <article className="impact-detail-card">
              <div
                className="impact-detail-visual impact-detail-visual--photo"
                style={{ backgroundImage: "url(/v2/assets/impact-4.png)" }}
              >
                <span className="impact-overlay-value serif-h">
                  Starkare
                </span>
                <div className="mock mock--doc mock--corner-tr">
                  <div className="mock-doc-head">
                    <div>
                      <div className="mock-title">Q3 Styrelsepaket</div>
                      <div className="mock-meta">14 sidor · 14:32</div>
                    </div>
                    <span className="mock-badge">Klar</span>
                  </div>
                  <div className="mock-kpi-grid">
                    <div className="mock-kpi">
                      <div className="mock-kpi-label">ARR</div>
                      <div className="mock-kpi-value">12.4M</div>
                    </div>
                    <div className="mock-kpi">
                      <div className="mock-kpi-label">Burn</div>
                      <div className="mock-kpi-value">820K</div>
                    </div>
                    <div className="mock-kpi">
                      <div className="mock-kpi-label">Runway</div>
                      <div className="mock-kpi-value">14 mån</div>
                    </div>
                    <div className="mock-kpi">
                      <div className="mock-kpi-label">NRR</div>
                      <div className="mock-kpi-value">118%</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="impact-detail-text">
                <h3 className="impact-detail-title serif-h">Styrelseunderlag</h3>
                <p className="impact-detail-body">
                  Klarare KPI-berättelse för styrelse och investerare.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIAL ============ */}
      <section className="section prod-quote-section">
        <div className="container">
          <figure className="prod-quote">
            <blockquote className="prod-quote-text serif-h">
              “Med MinCFO får vi en tydlig bild av intäkter per kund och tjänst,
              kan djupdyka i månatliga kostnader per leverantör och
              prognostisera med hjälp av AI som löpande uppdaterar siffrorna
              baserat på faktiska utfall.”
            </blockquote>
            <figcaption className="prod-quote-by">
              <span className="prod-quote-avatar prod-quote-avatar--group">
                <img
                  src="/customers/testimonials/Screenshot%202026-03-18%20at%2015.21.41.png"
                  alt="Max Norén"
                />
                <img
                  src="/customers/testimonials/Screenshot%202026-03-18%20at%2015.21.51.png"
                  alt="Conrad Brown-Bolin"
                />
              </span>
              <span>
                <div className="prod-quote-name">
                  Max Norén &amp; Conrad Brown-Bolin
                </div>
                <div className="prod-quote-role">Co-founders, Growbit</div>
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="closing prod-closing">
        <div className="container">
          <h2>Redo för nästa steg?</h2>
          <p className="sub">
            Vi hjälper VD:ar och grundare att gå från reaktiv rapportering till
            proaktiv styrning med realtidsdata, AI Copilot, scenario-planering
            och rådgivning i ett och samma interface — så att varje
            prioritering blir tydligare och kan exekveras på snabbare.
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
            <a className="btn btn-outline" href="/produkter/helhetslosningen">
              Se helhetslösningen
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
