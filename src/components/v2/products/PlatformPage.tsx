"use client";

import "../mincfo-landing.css";
import "../styles/platform.css";
import Nav from "../shared/Nav";
import Footer from "../shared/Footer";
import BrandMark from "../shared/BrandMark";
import PillarVisual from "./PillarVisual";
import platform from "@/content/home/platform.json";

const { hero, aicopilot, solutions, customers, ending } = platform;
const { dashboard, planning } = aicopilot;

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

/* Solution-card icons keyed to the JSON `icon` field. */
const SOL_ICONS: Record<string, React.ReactNode> = {
  rocket: (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M11 3c3.5 1 5.5 4 5 8l-3 3-4-4 2-7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M9 11l-3 1-2 4 4-2 1-3M13 7.5h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  briefcase: (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="6.5" width="14" height="9.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7.5 6.5V5a1.5 1.5 0 011.5-1.5h2A1.5 1.5 0 0112.5 5v1.5M3 10.5h14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  cpu: (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="6" y="6" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 3v2m4-2v2M8 15v2m4-2v2M3 8h2m-2 4h2m10-4h2m-2 4h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  building: (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="4" y="3.5" width="12" height="13" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 7h1.5M7 10h1.5M7 13h1.5M11.5 7H13m-1.5 3H13m-1.5 3H13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  cart: (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 4h2l1.5 9h8l1.5-6H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="16" r="1.1" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="14" cy="16" r="1.1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  handshake: (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 7l3-2 4 2 4-2 3 2v5l-3 2-2-2-2 2-2-2-3 2V7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
};

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
              <a className="btn btn-outline" href="#plattform">
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

      {/* ============ SOLUTIONS ============ */}
      <section className="section" id="losningar">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{solutions.pill}</span>
            <h2 className="serif-h">{solutions.title}</h2>
            <p>{solutions.intro}</p>
          </div>
          <div className="plat-sol-grid">
            {solutions.cards.map((c) => (
              <a className="plat-sol-card" href={c.href} key={c.href}>
                <span className="plat-sol-icon">
                  {SOL_ICONS[c.icon] ?? SOL_ICONS.briefcase}
                </span>
                <div className="plat-sol-title">{c.title}</div>
                <div className="plat-sol-text">{c.text}</div>
                <span className="plat-sol-cta">
                  {solutions.cardCta}
                  <ArrowRight size={11} />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CUSTOMERS ============ */}
      <section className="section" id="kundcase">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{customers.pill}</span>
            <h2 className="serif-h">{customers.title}</h2>
            <p>{customers.intro}</p>
          </div>
          <div className="plat-cust-grid">
            {customers.testimonials.map((t) => (
              <article
                className={`plat-cust-card${
                  t.accent ? " plat-cust-card--accent" : ""
                }`}
                key={`${t.company}-${t.person}`}
              >
                <p className="plat-cust-quote">&ldquo;{t.quote}&rdquo;</p>
                <div className="plat-cust-by">
                  <span className="plat-cust-name">{t.person}</span>
                  <span className="plat-cust-role">{t.role}</span>
                </div>
              </article>
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
            <a className="btn btn-outline" href="#plattform">
              {hero.secondaryCta}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
