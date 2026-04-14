import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Clock, CalendarDays, Wallet } from "lucide-react";
import SiteFooter from "@/components/layout/SiteFooter/SiteFooter";
import { fetchJobPostBySlug } from "@/sanity/lib/fetchJobPosts";
import jobPostsJson from "@/content/jobPosts.json";
import BackButton from "../BackButton";
import ApplicationForm from "./ApplicationForm";
import styles from "./page.module.scss";

type PageParams = { slug: string };
type PageProps = { params: Promise<PageParams> };

export function generateStaticParams(): PageParams[] {
  return (jobPostsJson.posts ?? [])
    .filter((p) => p.openForApplications !== false && p.slug)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchJobPostBySlug(slug);
  if (!post) {
    return {
      title: "Jobb | MinCFO",
    };
  }
  return {
    title: `${post.title} | MinCFO`,
    description: post.shortDescription ?? post.tagline ?? undefined,
  };
}

export default async function JobPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await fetchJobPostBySlug(slug);

  if (!post || !post.openForApplications) {
    notFound();
  }

  const meta: { icon: React.ReactNode; label: string }[] = [];
  if (post.location) {
    meta.push({ icon: <MapPin size={15} aria-hidden="true" />, label: post.location });
  }
  if (post.employmentType) {
    meta.push({ icon: <Clock size={15} aria-hidden="true" />, label: post.employmentType });
  }
  if (post.start) {
    meta.push({
      icon: <CalendarDays size={15} aria-hidden="true" />,
      label: `Start: ${post.start}`,
    });
  }
  if (post.compensation) {
    meta.push({
      icon: <Wallet size={15} aria-hidden="true" />,
      label: post.compensation,
    });
  }

  return (
    <div className={styles.page}>
      <div className={styles.topRail}>
        <div className={styles.backWrap}>
          <BackButton href="/karriar" />
        </div>

        <Link href="/" className={styles.logo} aria-label="MinCFO">
          <svg className={styles.mark} viewBox="0 0 50 50" role="img" aria-hidden="true">
            <g fill="currentColor">
              <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
              <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
              <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
              <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
            </g>
          </svg>
          <span className={styles.wordmark}>MinCFO</span>
        </Link>
      </div>

      <main className={styles.main}>
        <article className={styles.shell}>
          <header className={styles.hero}>
            {post.eyebrow && <p className={styles.eyebrow}>{post.eyebrow}</p>}
            <h1 className={styles.title}>{post.title}</h1>
            {post.tagline && <p className={styles.tagline}>{post.tagline}</p>}

            {meta.length > 0 && (
              <ul className={styles.metaList} aria-label="Nyckelinformation">
                {meta.map((m, i) => (
                  <li key={i} className={styles.metaItem}>
                    {m.icon}
                    <span>{m.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </header>

          <section className={styles.body}>
            {post.intro && (
              <div className={styles.intro}>
                {post.intro.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}

            {post.sections.map((section, i) => (
              <section key={i} className={styles.section}>
                <h2 className={styles.sectionHeading}>{section.heading}</h2>
                {section.body && (
                  <div className={styles.sectionBody}>
                    {section.body.split("\n\n").map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                )}
                {section.bullets && section.bullets.length > 0 && (
                  <ul className={styles.sectionBullets}>
                    {section.bullets.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {(post.closingHeading || post.closingBody) && (
              <section className={styles.section}>
                {post.closingHeading && (
                  <h2 className={styles.sectionHeading}>{post.closingHeading}</h2>
                )}
                {post.closingBody && (
                  <div className={styles.sectionBody}>
                    {post.closingBody.split("\n\n").map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                )}
              </section>
            )}
          </section>

          <section id="ansok" className={styles.formSection}>
            <div className={styles.formFrame}>
              <ApplicationForm jobSlug={post.slug} jobTitle={post.title} />
            </div>
          </section>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
