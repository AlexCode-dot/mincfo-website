import "./mincfo-landing.css";
import Nav from "./shared/Nav";
import Footer from "./shared/Footer";
import solutionData from "@/content/solutionPagesText.json";

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

type Card = { title: string; body: string };
type ImpactCard = { title: string; value: string; description: string };
type SolutionContent = {
  key: string;
  eyebrow: string;
  heroHeadline: { first: string; second: string };
  heroIntro: string;
  logoStripText: string;
  dilemmaTitle: string;
  dilemmaHeadline?: string;
  dilemmaIntro: string;
  dilemmaCards: Card[];
  helpsTitle: string;
  helpsHeadline?: string;
  helpsIntro: string;
  helpsCards: Card[];
  impactHeadline: { first: string; second: string };
  impactIntro: string;
  impactCards: ImpactCard[];
  closingHeadline: string;
  closingText: string;
};

const Arrow = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
    <path
      stroke="currentColor"
      strokeWidth="1.4"
      fill="none"
      d="M3 6h6m0 0L6.5 3.5M9 6L6.5 8.5"
    />
  </svg>
);

export default function SolutionPage({
  solutionKey,
  impact,
}: {
  solutionKey: string;
  impact?: React.ReactNode;
}) {
  const shared = solutionData.shared;
  const content = (solutionData.pages as SolutionContent[]).find(
    (p) => p.key === solutionKey
  );

  if (!content) {
    return (
      <div className="mv2-root hl-1 vs-1 type-sumary">
        <Nav />
        <section className="section">
          <div className="container">
            <h1 className="serif-h">Lösning hittades inte</h1>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  // Keep grids clean at 3 columns
  const pains = content.dilemmaCards.slice(0, 3);
  const helps = content.helpsCards.slice(0, 3);

  return (
    <div className="mv2-root hl-1 vs-1 type-sumary">
      <Nav />

      {/* ============ HERO ============ */}
      <section className="prod-hero" id="top">
        <div className="container">
          <div className="prod-hero-inner">
            <span className="eyebrow">{content.eyebrow}</span>
            <h1 className="prod-hero-title serif-h">
              {content.heroHeadline.second ? (
                <>
                  {content.heroHeadline.first}
                  <br />
                  <em>{content.heroHeadline.second}.</em>
                </>
              ) : (
                <>{content.heroHeadline.first}.</>
              )}
            </h1>
            <p className="prod-hero-sub">{content.heroIntro}</p>
            <div className="prod-hero-cta">
              <a className="btn" href="/#demo">
                {shared.heroPrimaryCta}
                <Arrow />
              </a>
              <a
                className="btn btn-outline"
                href="/produkter/helhetslosningen"
              >
                {shared.heroSecondaryCta}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST TICKER ============ */}
      <section className="prod-trust">
        <div className="container">
          <p className="prod-trust-l">{content.logoStripText}</p>
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
            {content.dilemmaHeadline ? (
              <>
                <span className="eyebrow">{content.dilemmaTitle}</span>
                <h2 className="serif-h">{content.dilemmaHeadline}</h2>
              </>
            ) : (
              <h2 className="serif-h">{content.dilemmaTitle}</h2>
            )}
            <p>{content.dilemmaIntro}</p>
          </div>
          <div className="sol-cards-3">
            {pains.map((p) => (
              <article className="sol-card sol-card--filled" key={p.title}>
                <span className="sol-icon sol-icon--negative" aria-hidden="true">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
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
            {content.helpsHeadline ? (
              <>
                <span className="eyebrow">{content.helpsTitle}</span>
                <h2 className="serif-h">{content.helpsHeadline}</h2>
              </>
            ) : (
              <>
                <span className="eyebrow">{shared.helpsOverline}</span>
                <h2 className="serif-h">{content.helpsTitle}</h2>
              </>
            )}
            <p>{content.helpsIntro}</p>
          </div>
          <div className="sol-cards-3">
            {helps.map((h) => (
              <article className="sol-card sol-card--filled" key={h.title}>
                <span className="sol-icon sol-icon--positive" aria-hidden="true">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
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
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                aria-hidden="true"
              >
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

      {/* ============ IMPACT ============ */}
      {/* Rich per-page impact (photos + mocks) if provided; else clean cards from data */}
      {impact ?? (
        <section className="section impact-clean">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">{shared.impactTag}</span>
              <h2 className="serif-h">
                {content.impactHeadline.first}{" "}
                <em>{content.impactHeadline.second}</em>
              </h2>
              <p>{content.impactIntro}</p>
            </div>
            <div className="impact-cards-grid">
              {content.impactCards.map((c) => (
                <article className="impact-card" key={c.title}>
                  <div className="impact-card-value serif-h">{c.value}</div>
                  <h3 className="impact-card-title serif-h">{c.title}</h3>
                  <p className="impact-card-body">{c.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ FINAL CTA ============ */}
      <section className="closing prod-closing">
        <div className="container">
          <h2>{content.closingHeadline}</h2>
          <p className="sub">{content.closingText}</p>
          <div className="closing-row">
            <a className="btn" href="/#demo">
              {shared.closingCta}
              <Arrow />
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
