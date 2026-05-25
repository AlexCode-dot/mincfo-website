"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "../mincfo-landing.css";
import "../styles/blog.css";
import Nav from "../shared/Nav";
import Footer from "../shared/Footer";
import type { BlogPost } from "@/sanity/lib/fetchBlogPosts";
import type { Locale } from "@/i18n/locale";
import BlogCard from "./BlogCard";
import { coverUrl, metaLine } from "./helpers";

const POSTS_PER_PAGE = 6;

function pickHero(posts: BlogPost[]): { hero: BlogPost | null; rest: BlogPost[] } {
  if (posts.length === 0) return { hero: null, rest: [] };
  const featured = posts.find((p) => p.featured);
  const hero = featured ?? posts[0];
  const rest = posts.filter((p) => p.id !== hero.id);
  return { hero, rest };
}

export type BlogIndexLabels = {
  eyebrow: string;
  title: string;
  subtitle: string;
  sidebarHeading: string;
  gridHeading: string;
  emptyTitle: string;
  emptyBody: string;
  latestAria: string;
  moreAria: string;
  readingTimeShort: string;
  pagination: { nav: string; prev: string; next: string; page: string };
};

function FeaturePlaceholder() {
  return (
    <span
      className="bl-card-ph"
      aria-hidden="true"
      style={{ color: "rgba(255,255,255,0.16)" }}
    >
      <svg viewBox="0 0 50 50" fill="currentColor" style={{ width: 64, height: 64 }}>
        <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
        <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
        <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
        <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
      </svg>
    </span>
  );
}

export default function BlogIndex({
  posts,
  locale,
  labels,
}: {
  posts: BlogPost[];
  locale: Locale;
  labels: BlogIndexLabels;
}) {
  const [page, setPage] = useState(1);

  const { hero, rest } = pickHero(posts);
  const sidebar = rest.slice(0, 4);
  const gridPosts = rest.slice(4);

  const totalPages = Math.max(1, Math.ceil(gridPosts.length / POSTS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * POSTS_PER_PAGE;
  const visible = gridPosts.slice(start, start + POSTS_PER_PAGE);

  return (
    <div className="mv2-root type-sumary bl-root">
      <Nav />

      <header className="bl-intro">
        <div className="container">
          <div className="bl-intro-inner">
            <span className="eyebrow bl-eyebrow">{labels.eyebrow}</span>
            <h1 className="serif-h bl-title">{labels.title}</h1>
            <p className="bl-sub">{labels.subtitle}</p>
          </div>
        </div>
      </header>

      <main>
        {!hero ? (
          <div className="container bl-empty-wrap">
            <section className="bl-empty">
              <h2>{labels.emptyTitle}</h2>
              <p>{labels.emptyBody}</p>
            </section>
          </div>
        ) : (
          <>
            <section
              className={`container bl-feature-wrap${sidebar.length === 0 ? " bl-solo" : ""}`}
              aria-label={labels.latestAria}
            >
              <Link
                href={`/blogg/${hero.slug}`}
                className="bl-feature"
                aria-label={hero.title}
              >
                <div className="bl-feature-cover">
                  {hero.coverImage ? (
                    <Image
                      src={coverUrl(hero, 1400, 900) ?? ""}
                      alt={hero.coverImage.alt ?? hero.title}
                      fill
                      sizes="(min-width: 920px) 760px, 100vw"
                      priority
                    />
                  ) : (
                    <FeaturePlaceholder />
                  )}
                </div>
                <div className="bl-feature-shade" />
                <div className="bl-feature-body">
                  {hero.eyebrow && <span className="bl-badge">{hero.eyebrow}</span>}
                  <h2 className="bl-feature-title">{hero.title}</h2>
                  <span className="bl-feature-meta">
                    {metaLine(hero, locale, labels.readingTimeShort)}
                  </span>
                </div>
              </Link>

              {sidebar.length > 0 && (
                <aside className="bl-side" aria-label={labels.moreAria}>
                  <h2 className="bl-side-h">{labels.sidebarHeading}</h2>
                  <ol className="bl-side-list">
                    {sidebar.map((post) => (
                      <li key={post.slug}>
                        <Link href={`/blogg/${post.slug}`} className="bl-side-item">
                          <span className="bl-side-thumb">
                            {post.coverImage ? (
                              <Image
                                src={coverUrl(post, 220, 170) ?? ""}
                                alt={post.coverImage.alt ?? post.title}
                                fill
                                sizes="84px"
                              />
                            ) : null}
                          </span>
                          <span className="bl-side-text">
                            <span className="bl-side-title">{post.title}</span>
                            <span className="bl-side-meta">
                              {metaLine(post, locale, labels.readingTimeShort, {
                                short: true,
                              })}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </aside>
              )}
            </section>

            {gridPosts.length > 0 && (
              <section
                className="container bl-grid-wrap"
                aria-label={labels.gridHeading}
              >
                <div className="bl-grid-head">
                  <h2 className="bl-grid-h">{labels.gridHeading}</h2>
                </div>
                <div className="bl-grid">
                  {visible.map((post) => (
                    <BlogCard
                      key={post.slug}
                      post={post}
                      locale={locale}
                      readingTimeLabel={labels.readingTimeShort}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav className="bl-pager" aria-label={labels.pagination.nav}>
                    <button
                      type="button"
                      className="bl-pager-btn"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      aria-label={labels.pagination.prev}
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13">
                        <path
                          stroke="currentColor"
                          strokeWidth="1.4"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 3L4 6.5l4 3.5"
                        />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                      <button
                        type="button"
                        key={n}
                        className={`bl-pager-num${n === safePage ? " is-active" : ""}`}
                        onClick={() => setPage(n)}
                        aria-label={`${labels.pagination.page} ${n}`}
                        aria-current={n === safePage ? "page" : undefined}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="bl-pager-btn"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      aria-label={labels.pagination.next}
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13">
                        <path
                          stroke="currentColor"
                          strokeWidth="1.4"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 3l4 3.5L5 10"
                        />
                      </svg>
                    </button>
                  </nav>
                )}
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
