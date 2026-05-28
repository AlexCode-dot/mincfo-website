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
    <div className="mv2-root hl-1 vs-1 type-sumary car-page">
      <Nav />

      {/* ============ HERO (copy left, team photo right) ============ */}
      <section className="section prod-pillars car-hero" id="top">
        <div className="container">
          <article className="pillar pillar--right car-hero-pillar">
            <figure className="pillar-art car-team-art">
              <picture>
                <source srcSet="/v2/assets/careers-team.webp" type="image/webp" />
                <img
                  src="/v2/assets/careers-team.jpg"
                  alt="MinCFO-teamet på kontoret i Stockholm"
                  width={1600}
                  height={1200}
                />
              </picture>
            </figure>
            <div className="pillar-body">
              <div className="pillar-eyebrow">Karriär</div>
              <h1 className="pillar-title serif-h">
                {hasPosts
                  ? "Var med och bygg framtidens ekonomifunktion"
                  : "Vi har inga lediga tjänster ute just nu"}
              </h1>
              <p className="pillar-lead">
                {hasPosts
                  ? "Vi söker drivna människor som vill växa tillsammans med oss och våra kunder. Här är rollerna vi rekryterar till just nu."
                  : "Just nu rekryterar vi inte aktivt, men vi är alltid intresserade av att komma i kontakt med skarpa personer som tror på det vi bygger på MinCFO."}
              </p>
              <div className="car-hero-cta">
                <a
                  className="btn"
                  href={hasPosts ? "#jobs" : "mailto:victor@mincfo.com"}
                >
                  {hasPosts ? "Se våra lediga jobb" : "Skicka spontanansökan"}
                  <Arrow />
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ============ JOB LIST ============ */}
      <section className="section car-list" id="jobs">
        <div className="container">
          {hasPosts && (
            <div className="car-list-head">
              <span className="eyebrow">Lediga tjänster</span>
              <h2 className="car-list-title serif-h">Roller vi rekryterar till nu</h2>
            </div>
          )}
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
              <h2 className="serif-h">Vill du ändå höra av dig?</h2>
              <p>
                Om du tror att du skulle kunna passa hos oss får du gärna skicka
                en kort presentation till{" "}
                <a className="inline-link" href="mailto:victor@mincfo.com">
                  victor@mincfo.com
                </a>
                . Berätta gärna vem du är, vad du är bra på och varför MinCFO
                känns relevant för dig.
              </p>
              <a className="btn" href="mailto:victor@mincfo.com">
                Skicka spontanansökan
                <Arrow />
              </a>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
