import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SiteFooter from "@/components/layout/SiteFooter/SiteFooter";
import { fetchPublishedJobPosts } from "@/sanity/lib/fetchJobPosts";
import { getSharedText } from "@/content/homePageText";
import { getLocale } from "@/i18n/server";
import BackButton from "./BackButton";
import styles from "./page.module.scss";

export async function generateMetadata(): Promise<Metadata> {
  const careers = getSharedText(await getLocale()).ui.careers;
  return {
    title: careers.metaTitle,
    description: careers.metaDescription,
  };
}

export default async function KarriarPage() {
  const locale = await getLocale();
  const ui = getSharedText(locale).ui;
  const careers = ui.careers;
  const posts = await fetchPublishedJobPosts(locale);

  return (
    <div className={styles.page}>
      <div className={styles.topRail}>
        <div className={styles.backWrap}>
          <BackButton label={ui.back} />
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
        <div className={styles.shell}>
          <header className={styles.hero}>
            <p className={styles.eyebrow}>{careers.eyebrow}</p>
            {posts.length > 0 ? (
              <>
                <h1 className={styles.title}>{careers.openTitle}</h1>
                <p className={styles.subtitle}>
                  {careers.openSubtitle}
                </p>
              </>
            ) : (
              <>
                <h1 className={styles.title}>{careers.closedTitle}</h1>
                <p className={styles.subtitle}>
                  {careers.closedSubtitle}
                </p>
              </>
            )}
          </header>

          {posts.length > 0 ? (
            <section className={styles.jobList} aria-label={careers.listAria}>
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/karriar/${post.slug}`}
                  className={styles.jobCard}
                >
                  <div className={styles.jobCardInner}>
                    <div className={styles.jobCardTop}>
                      {post.eyebrow && (
                        <span className={styles.jobEyebrow}>{post.eyebrow}</span>
                      )}
                      <h2 className={styles.jobTitle}>{post.title}</h2>
                      {post.shortDescription && (
                        <p className={styles.jobDescription}>{post.shortDescription}</p>
                      )}
                    </div>

                    <div className={styles.jobCardBottom}>
                      {(post.location || post.employmentType) && (
                        <ul className={styles.jobMeta}>
                          {post.location && <li>{post.location}</li>}
                          {post.employmentType && <li>{post.employmentType}</li>}
                        </ul>
                      )}
                      <span className={styles.jobCta}>
                        {careers.readMore}
                        <ArrowRight size={15} aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          ) : (
            <section className={styles.card}>
              <div className={styles.frame}>
                <div className={styles.panel}>
                  <h2 className={styles.cardTitle}>{careers.spontaneousTitle}</h2>
                  <p className={styles.cardBody}>
                    {careers.spontaneousBodyPre}
                    <a href="mailto:victor@mincfo.com" className={styles.inlineLink}>
                      victor@mincfo.com
                    </a>
                    {careers.spontaneousBodyPost}
                  </p>

                  <div className={styles.actions}>
                    <a href="mailto:victor@mincfo.com" className={styles.primaryCta}>
                      {careers.spontaneousCta}
                    </a>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
