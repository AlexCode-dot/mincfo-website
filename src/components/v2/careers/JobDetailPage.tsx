import "../mincfo-landing.css";
import "../styles/careers.css";
import { notFound } from "next/navigation";
import Nav from "../shared/Nav";
import Footer from "../shared/Footer";
import jobPostsJson from "@/content/jobPosts.json";
import ApplicationForm from "./ApplicationForm";

type JobSection = { heading: string; body?: string; bullets?: string[] };
type JobPost = {
  slug: string;
  title: string;
  eyebrow?: string;
  tagline?: string;
  location?: string;
  employmentType?: string;
  start?: string;
  compensation?: string;
  openForApplications?: boolean;
  intro?: string;
  sections?: JobSection[];
  closingHeading?: string;
  closingBody?: string;
};

const IconPin = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);
const IconClock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const IconCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const IconWallet = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 7a2 2 0 012-2h13a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.6" />
    <path d="M16 12h3M3 9h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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

export default function JobDetailPage({ slug }: { slug: string }) {
  const post = ((jobPostsJson.posts ?? []) as JobPost[]).find(
    (p) => p.slug === slug
  );

  if (!post || post.openForApplications === false) {
    notFound();
  }

  const meta: { icon: React.ReactNode; label: string }[] = [];
  if (post.location) meta.push({ icon: <IconPin />, label: post.location });
  if (post.employmentType) meta.push({ icon: <IconClock />, label: post.employmentType });
  if (post.start) meta.push({ icon: <IconCalendar />, label: `Start: ${post.start}` });
  if (post.compensation) meta.push({ icon: <IconWallet />, label: post.compensation });

  return (
    <div className="mv2-root hl-1 vs-1 type-sumary">
      <Nav />

      <section className="section car-detail" id="top">
        <div className="container">
          <article className="car-detail-shell">
            {/* ---------- hero ---------- */}
            <header className="car-detail-hero">
              {post.eyebrow && <span className="eyebrow">{post.eyebrow}</span>}
              <h1 className="prod-hero-title serif-h">{post.title}</h1>
              {post.tagline && <p className="car-detail-tagline">{post.tagline}</p>}

              {meta.length > 0 && (
                <ul className="car-meta" aria-label="Nyckelinformation">
                  {meta.map((m, i) => (
                    <li key={i}>
                      {m.icon}
                      <span>{m.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </header>

            {/* ---------- body ---------- */}
            <div className="car-body">
              {post.intro && (
                <div className="car-intro">
                  {post.intro.split("\n\n").map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}

              {(post.sections ?? []).map((section, i) => (
                <section key={i}>
                  <h2 className="car-section-h serif-h">{section.heading}</h2>
                  {section.body && (
                    <div className="car-section-body">
                      {section.body.split("\n\n").map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))}
                    </div>
                  )}
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="car-bullets">
                      {section.bullets.map((b, idx) => (
                        <li key={idx}>
                          <Check />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              {(post.closingHeading || post.closingBody) && (
                <section>
                  {post.closingHeading && (
                    <h2 className="car-section-h serif-h">{post.closingHeading}</h2>
                  )}
                  {post.closingBody && (
                    <div className="car-section-body">
                      {post.closingBody.split("\n\n").map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* ---------- application form ---------- */}
            <section id="ansok" className="car-form-section">
              <div className="car-form-frame">
                <ApplicationForm jobSlug={post.slug} jobTitle={post.title} />
              </div>
            </section>

            <div className="car-detail-back" style={{ marginTop: "clamp(40px, 5vw, 64px)" }}>
              <a className="text-link" href="/karriar">
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                  <path stroke="currentColor" strokeWidth="1.4" fill="none" d="M8 5H2m2.5-2.5L2 5l2.5 2.5" />
                </svg>
                Tillbaka till lediga tjänster
              </a>
            </div>
          </article>
        </div>
      </section>

      <Footer />
    </div>
  );
}
