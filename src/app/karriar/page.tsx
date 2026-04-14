import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SiteFooter from "@/components/layout/SiteFooter/SiteFooter";
import { fetchPublishedJobPosts } from "@/sanity/lib/fetchJobPosts";
import BackButton from "./BackButton";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Karriär | MinCFO",
  description:
    "Bli en del av MinCFO. Se våra lediga tjänster och praktikplatser och skicka in din ansökan direkt på sajten.",
};

export default async function KarriarPage() {
  const posts = await fetchPublishedJobPosts();

  return (
    <div className={styles.page}>
      <div className={styles.topRail}>
        <div className={styles.backWrap}>
          <BackButton />
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
            <p className={styles.eyebrow}>Karriär</p>
            {posts.length > 0 ? (
              <>
                <h1 className={styles.title}>Var med och bygg framtidens ekonomifunktion</h1>
                <p className={styles.subtitle}>
                  Vi söker drivna människor som vill växa tillsammans med oss och våra kunder.
                  Här är rollerna vi rekryterar till just nu.
                </p>
              </>
            ) : (
              <>
                <h1 className={styles.title}>Vi har inga lediga tjänster ute just nu</h1>
                <p className={styles.subtitle}>
                  Just nu rekryterar vi inte aktivt, men vi är alltid intresserade av att komma i
                  kontakt med skarpa personer som tror på det vi bygger på MinCFO.
                </p>
              </>
            )}
          </header>

          {posts.length > 0 ? (
            <section className={styles.jobList} aria-label="Lediga tjänster">
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
                        Läs mer
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
                  <h2 className={styles.cardTitle}>Vill du ändå höra av dig?</h2>
                  <p className={styles.cardBody}>
                    Om du tror att du skulle kunna passa hos oss får du gärna skicka en kort
                    presentation till{" "}
                    <a href="mailto:victor@mincfo.com" className={styles.inlineLink}>
                      victor@mincfo.com
                    </a>
                    . Berätta gärna vem du är, vad du är bra på och varför MinCFO känns relevant
                    för dig.
                  </p>

                  <div className={styles.actions}>
                    <a href="mailto:victor@mincfo.com" className={styles.primaryCta}>
                      Skicka spontanansökan
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
