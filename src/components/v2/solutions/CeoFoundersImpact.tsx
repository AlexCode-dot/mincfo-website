"use client";

import { useEffect, useRef, useState } from "react";
import BrandMark from "../shared/BrandMark";

type ImpactStat = { from: number; to: number; suffix: string; label: string };

const IMPACTS: ImpactStat[] = [
  { from: 30, to: 50, suffix: "%", label: "Snabbare beslut" },
  { from: 60, to: 80, suffix: "%", label: "Mindre manuellt jobb" },
  { from: 3, to: 6, suffix: " mån", label: "Proaktivitet" },
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

export default function CeoFoundersImpact() {
  return (
    <>
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
                <span className="impact-overlay-value serif-h">30-50%</span>
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
                <span className="impact-overlay-value serif-h">60-80%</span>
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
                    <div className="mock-meta">18 anställda · 12:00</div>
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
                <span className="impact-overlay-value serif-h">3-6 mån</span>
                <div className="mock mock--time mock--corner-tr">
                  <div className="mock-time-head">
                    <span className="mock-time-brand">
                      <BrandMark />
                      <span>MinCFO</span>
                    </span>
                    <span className="mock-time-period">Prognos</span>
                  </div>
                  <div className="mock-tile-label">Runway-prognos</div>
                  <svg
                    className="mock-chart"
                    viewBox="0 0 200 64"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="mockAreaActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0A0A0A" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="mockAreaForecast" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#B7651A" stopOpacity="0.16" />
                        <stop offset="100%" stopColor="#B7651A" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      fill="url(#mockAreaActual)"
                      d="M4,20 C12,17 19,16 26,16 C36,16 42,21 50,21 C60,21 66,15 74,15 C84,15 92,18 98,19 L98,64 L4,64 Z"
                    />
                    <path
                      fill="url(#mockAreaForecast)"
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
                <span className="impact-overlay-value serif-h">Starkare</span>
                <div className="mock mock--doc mock--corner-tr">
                  <div className="mock-time-head">
                    <span className="mock-time-brand">
                      <BrandMark />
                      <span>MinCFO</span>
                    </span>
                    <span className="mock-badge">Klar</span>
                  </div>
                  <div className="mock-doc-title">
                    <div className="mock-title">Q3 Styrelsepaket</div>
                    <div className="mock-meta">14 sidor · 14:32</div>
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
    </>
  );
}
