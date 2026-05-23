import "../mincfo-landing.css";
import "../styles/careers.css";
import Nav from "../shared/Nav";
import Footer from "../shared/Footer";
import jobPostsJson from "@/content/jobPosts.json";

type JobPost = {
  slug: string;
  title: string;
  eyebrow?: string;
  shortDescription?: string;
  location?: string;
  employmentType?: string;
  openForApplications?: boolean;
  order?: number;
};

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

const Arrow = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
    <path
      stroke="currentColor"
      strokeWidth="1.4"
      fill="none"
      d="M2 5h6m-2.5-2.5L8 5l-2.5 2.5"
    />
  </svg>
);

export default function CareersListPage() {
  const posts = ((jobPostsJson.posts ?? []) as JobPost[])
    .filter((p) => p.openForApplications !== false && p.slug)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  const hasPosts = posts.length > 0;

  return (
    <div className="mv2-root hl-1 vs-1 type-sumary">
      <Nav />

      {/* ============ HERO ============ */}
      <section className="prod-hero" id="top">
        <div className="container">
          <div className="prod-hero-inner">
            <span className="eyebrow">Karriär</span>
            <h1 className="prod-hero-title serif-h">
              {hasPosts ? (
                <>
                  Bygg framtidens
                  <br />
                  <em>ekonomifunktion.</em>
                </>
              ) : (
                <>
                  Inga öppna roller
                  <br />
                  <em>just nu.</em>
                </>
              )}
            </h1>
            <p className="prod-hero-sub">
              {hasPosts
                ? "Vi är ett entreprenörsdrivet team i centrala Göteborg som bygger en modern ekonomifunktion för tillväxtbolag. Hitta din roll nedan."
                : "Vi har inga utlysta tjänster för tillfället — men vi träffar alltid gärna vassa personer. Skicka en spontanansökan så hör vi av oss."}
            </p>
          </div>
        </div>
      </section>

      {/* ============ TRUST TICKER ============ */}
      <section className="prod-trust">
        <div className="container">
          <p className="prod-trust-l">
            Vi bygger ekonomifunktionen för 50+ snabbväxande bolag
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

      {/* ============ JOB LIST ============ */}
      <section className="section car-list">
        <div className="container">
          {hasPosts ? (
            <div className="car-grid">
              {posts.map((post) => (
                <a
                  className="car-card"
                  href={`/karriar/${post.slug}`}
                  key={post.slug}
                >
                  <div>
                    {post.eyebrow && (
                      <span className="car-card-eyebrow">{post.eyebrow}</span>
                    )}
                    <h2 className="car-card-title serif-h">{post.title}</h2>
                    {post.shortDescription && (
                      <p className="car-card-desc">{post.shortDescription}</p>
                    )}
                  </div>
                  <div className="car-card-foot">
                    {(post.location || post.employmentType) && (
                      <ul className="car-card-meta">
                        {post.location && <li>{post.location}</li>}
                        {post.employmentType && <li>{post.employmentType}</li>}
                      </ul>
                    )}
                    <span className="car-card-cta">
                      Läs mer
                      <Arrow />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="car-spontaneous">
              <h2 className="serif-h">Spontanansökan</h2>
              <p>
                Tror du att du skulle passa hos oss? Skicka ett mail till{" "}
                <a className="inline-link" href="mailto:victor@mincfo.com">
                  victor@mincfo.com
                </a>{" "}
                med ditt CV och några rader om vad du brinner för.
              </p>
              <a className="btn" href="mailto:victor@mincfo.com">
                Skicka spontanansökan
                <Arrow />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="closing prod-closing">
        <div className="container">
          <h2>Osäker på vilken roll som passar?</h2>
          <p className="sub">
            Hör av dig så berättar vi mer om hur det är att jobba på MinCFO och
            vilka vägar in som finns.
          </p>
          <div className="closing-row">
            <a className="btn" href="mailto:victor@mincfo.com">
              Hör av dig
              <Arrow />
            </a>
            <a className="btn btn-outline" href="/">
              Till startsidan
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
