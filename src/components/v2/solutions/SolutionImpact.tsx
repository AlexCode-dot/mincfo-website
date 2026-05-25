"use client";

import { useEffect, useRef, useState } from "react";
import BrandMark from "../shared/BrandMark";

type ImpactCard = { value: string; title: string; description: string };

// Parse "30-50%", "3-6 mån" → animatable range; otherwise null (render static)
function parseRange(v: string) {
  const m = v.match(/^\s*(\d+)\s*[-–]\s*(\d+)\s*(.*)$/);
  if (!m) return null;
  const rest = m[3].trim();
  const suffix = rest ? (rest.startsWith("%") ? rest : " " + rest) : "";
  return { from: Number(m[1]), to: Number(m[2]), suffix };
}

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

function StatValue({ value }: { value: string }) {
  const r = parseRange(value);
  if (r) return <CountUpRange from={r.from} to={r.to} suffix={r.suffix} />;
  return <span>{value}</span>;
}

const Check = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Per-industry mock content. Defaults (SaaS/startup flavour: runway, ARR, NRR)
// fit CEO / CFO / SaaS; Konsult & E-handel get sector-relevant variants.
type MockCfg = {
  toasts: { title: string; meta: string }[];
  chartLabel: string;
  doc: { title: string; meta: string; kpis: { label: string; value: string }[] };
};

const DEFAULT_MOCK: MockCfg = {
  toasts: [
    { title: "Bankavstämning klar", meta: "247 transaktioner · 09:32" },
    { title: "Lönekörning klar", meta: "18 anställda · 12:00" },
    { title: "Månadsrapport skickad", meta: "Styrelsen · 14:18" },
  ],
  chartLabel: "Runway-prognos",
  doc: {
    title: "Q3 Styrelsepaket",
    meta: "14 sidor · 14:32",
    kpis: [
      { label: "ARR", value: "12.4M" },
      { label: "Burn", value: "820K" },
      { label: "Runway", value: "14 mån" },
      { label: "NRR", value: "118%" },
    ],
  },
};

const MOCK_CONFIG: Record<string, MockCfg> = {
  // CEO & Founders uses DEFAULT_MOCK (runway / board pack — fits founders).
  "SaaS / Tech": {
    toasts: [
      { title: "MRR uppdaterad", meta: "Automatiskt · 09:32" },
      { title: "Cohort-analys klar", meta: "Churn & retention · 12:00" },
      { title: "Investerarrapport skickad", meta: "Board · 14:18" },
    ],
    chartLabel: "ARR-prognos",
    doc: {
      title: "Q3 Investerarrapport",
      meta: "12 sidor · 14:32",
      kpis: [
        { label: "ARR", value: "12.4M" },
        { label: "NRR", value: "118%" },
        { label: "CAC-payback", value: "11 mån" },
        { label: "Churn", value: "1.8%" },
      ],
    },
  },
  "CFO & Finance Team": {
    toasts: [
      { title: "Månadsstängning klar", meta: "Period · 09:32" },
      { title: "Avstämningar klara", meta: "Bank & reskontra · 12:00" },
      { title: "Rapport till ledning skickad", meta: "Ledningen · 14:18" },
    ],
    chartLabel: "Forecast vs utfall",
    doc: {
      title: "Q3 Ledningsrapport",
      meta: "16 sidor · 14:32",
      kpis: [
        { label: "Stängning", value: "4 dgr" },
        { label: "Rapporttid", value: "-50%" },
        { label: "Forecast-träff", value: "94%" },
        { label: "Likviditet", value: "16 v" },
      ],
    },
  },
  "Konsult & Tjänster": {
    toasts: [
      { title: "Tidrapporter klara", meta: "18 konsulter · 09:32" },
      { title: "Projektfakturering skickad", meta: "12 projekt · 12:00" },
      { title: "Månadsrapport skickad", meta: "Ledningen · 14:18" },
    ],
    chartLabel: "Likviditetsprognos",
    doc: {
      title: "Q3 Ledningsrapport",
      meta: "12 sidor · 14:32",
      kpis: [
        { label: "Beläggning", value: "86%" },
        { label: "Projektmarginal", value: "32%" },
        { label: "Likviditet", value: "14 v" },
        { label: "Projekt", value: "24" },
      ],
    },
  },
  "E-handel": {
    toasts: [
      { title: "Orderavstämning klar", meta: "1 240 ordrar · 09:32" },
      { title: "Lageruppdatering klar", meta: "3 lager · 12:00" },
      { title: "Månadsrapport skickad", meta: "Ledningen · 14:18" },
    ],
    chartLabel: "Lagerprognos",
    doc: {
      title: "Q3 Ledningsrapport",
      meta: "12 sidor · 14:32",
      kpis: [
        { label: "AOV", value: "540 kr" },
        { label: "Bruttomarginal", value: "42%" },
        { label: "Lagerdagar", value: "38" },
        { label: "Cash", value: "18 v" },
      ],
    },
  },
};

export default function SolutionImpact({
  tag,
  headline,
  intro,
  cards,
  solutionKey,
}: {
  tag: string;
  headline: { first: string; second: string };
  intro: string;
  cards: ImpactCard[];
  solutionKey: string;
}) {
  if (!cards || cards.length < 4) return null;
  const [c0, c1, c2, c3] = cards;
  const m = MOCK_CONFIG[solutionKey] ?? DEFAULT_MOCK;
  const [t0, t1, t2] = m.toasts;

  return (
    <>
      {/* ============ IMPACT BAND ============ */}
      <section className="impact">
        <div className="container">
          <div className="impact-grid">
            {cards.slice(0, 3).map((c) => (
              <div className="impact-stat" key={c.title}>
                <div className="impact-value serif-h">
                  <StatValue value={c.value} />
                </div>
                <div className="impact-label">{c.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ IMPACT DETAILS ============ */}
      <section className="section impact-detail">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{tag}</span>
            <h2 className="serif-h">
              {headline.first} <em>{headline.second}</em>
            </h2>
            <p>{intro}</p>
          </div>
          <div className="impact-detail-grid">
            {/* Card 1 — KPI tile (data-driven from c0) */}
            <article className="impact-detail-card">
              <div
                className="impact-detail-visual impact-detail-visual--photo"
                style={{ backgroundImage: "url(/v2/assets/impact-1.png)" }}
              >
                <span className="impact-overlay-value serif-h">{c0.value}</span>
                <div className="mock mock--time mock--corner-tr">
                  <div className="mock-time-head">
                    <span className="mock-time-brand">
                      <BrandMark />
                      <span>MinCFO</span>
                    </span>
                    <span className="mock-time-period">Live</span>
                  </div>
                  <div className="mock-tile-label">{c0.title}</div>
                  <div className="mock-tile-value">{c0.value}</div>
                </div>
              </div>
              <div className="impact-detail-text">
                <h3 className="impact-detail-title serif-h">{c0.title}</h3>
                <p className="impact-detail-body">{c0.description}</p>
              </div>
            </article>

            {/* Card 2 — operational toasts (universal) */}
            <article className="impact-detail-card">
              <div
                className="impact-detail-visual impact-detail-visual--photo"
                style={{ backgroundImage: "url(/v2/assets/impact-2.png)" }}
              >
                <span className="impact-overlay-value serif-h">{c1.value}</span>
                <div className="mock mock--toast mock--corner-tr mock--stack-3-back">
                  <span className="mock-icon mock-icon--success"><Check /></span>
                  <div>
                    <div className="mock-title">{t0.title}</div>
                    <div className="mock-meta">{t0.meta}</div>
                  </div>
                </div>
                <div className="mock mock--toast mock--corner-tr mock--stack-3-mid">
                  <span className="mock-icon mock-icon--success"><Check /></span>
                  <div>
                    <div className="mock-title">{t1.title}</div>
                    <div className="mock-meta">{t1.meta}</div>
                  </div>
                </div>
                <div className="mock mock--toast mock--corner-tr mock--stack-3-front">
                  <span className="mock-icon mock-icon--success"><Check /></span>
                  <div>
                    <div className="mock-title">{t2.title}</div>
                    <div className="mock-meta">{t2.meta}</div>
                  </div>
                </div>
              </div>
              <div className="impact-detail-text">
                <h3 className="impact-detail-title serif-h">{c1.title}</h3>
                <p className="impact-detail-body">{c1.description}</p>
              </div>
            </article>

            {/* Card 3 — runway forecast chart (universal) */}
            <article className="impact-detail-card">
              <div
                className="impact-detail-visual impact-detail-visual--photo"
                style={{ backgroundImage: "url(/v2/assets/impact-3.png)" }}
              >
                <span className="impact-overlay-value serif-h">{c2.value}</span>
                <div className="mock mock--time mock--corner-tr">
                  <div className="mock-time-head">
                    <span className="mock-time-brand">
                      <BrandMark />
                      <span>MinCFO</span>
                    </span>
                    <span className="mock-time-period">Prognos</span>
                  </div>
                  <div className="mock-tile-label">{m.chartLabel}</div>
                  <svg className="mock-chart" viewBox="0 0 200 64" aria-hidden="true">
                    <defs>
                      <linearGradient id="solAreaActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0A0A0A" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="solAreaForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#B7651A" stopOpacity="0.16" />
                        <stop offset="100%" stopColor="#B7651A" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      fill="url(#solAreaActual)"
                      d="M4,20 C12,17 19,16 26,16 C36,16 42,21 50,21 C60,21 66,15 74,15 C84,15 92,18 98,19 L98,64 L4,64 Z"
                    />
                    <path
                      fill="url(#solAreaForecast)"
                      d="M98,19 C134,24 168,42 196,60 L196,64 L98,64 Z"
                    />
                    <path
                      className="mock-chart-line"
                      d="M4,20 C12,17 19,16 26,16 C36,16 42,21 50,21 C60,21 66,15 74,15 C84,15 92,18 98,19"
                    />
                    <path
                      className="mock-chart-line mock-chart-line--forecast"
                      d="M98,19 C134,24 168,42 196,60"
                    />
                    <circle className="mock-chart-dot" cx="196" cy="60" r="3.2" />
                  </svg>
                </div>
              </div>
              <div className="impact-detail-text">
                <h3 className="impact-detail-title serif-h">{c2.title}</h3>
                <p className="impact-detail-body">{c2.description}</p>
              </div>
            </article>

            {/* Card 4 — board pack doc preview (universal) */}
            <article className="impact-detail-card">
              <div
                className="impact-detail-visual impact-detail-visual--photo"
                style={{ backgroundImage: "url(/v2/assets/impact-4.png)" }}
              >
                <span className="impact-overlay-value serif-h">{c3.value}</span>
                <div className="mock mock--doc mock--corner-tr">
                  <div className="mock-time-head">
                    <span className="mock-time-brand">
                      <BrandMark />
                      <span>MinCFO</span>
                    </span>
                    <span className="mock-badge">Klar</span>
                  </div>
                  <div className="mock-doc-title">
                    <div className="mock-title">{m.doc.title}</div>
                    <div className="mock-meta">{m.doc.meta}</div>
                  </div>
                  <div className="mock-kpi-grid">
                    {m.doc.kpis.map((k) => (
                      <div className="mock-kpi" key={k.label}>
                        <div className="mock-kpi-label">{k.label}</div>
                        <div className="mock-kpi-value">{k.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="impact-detail-text">
                <h3 className="impact-detail-title serif-h">{c3.title}</h3>
                <p className="impact-detail-body">{c3.description}</p>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
