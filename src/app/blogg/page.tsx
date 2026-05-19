import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteFooter from "@/components/layout/SiteFooter/SiteFooter";
import {
  fetchBlogPosts,
  pickHero,
  type BlogPost,
} from "@/sanity/lib/fetchBlogPosts";
import { fetchSharedContent } from "@/sanity/lib/fetchHomeContent";
import { getLocale } from "@/i18n/server";
import type { Locale } from "@/i18n/locale";
import { urlForImage } from "@/sanity/lib/imageUrl";
import BackButton from "./BackButton";
import BlogGrid from "./BlogGrid";
import styles from "./page.module.scss";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://mincfo.com";

const PLACEHOLDER_SRC = "/blog/blog-placeholder-image.png";

export async function generateMetadata(): Promise<Metadata> {
  const shared = await fetchSharedContent(await getLocale());
  const title = shared.blog.title;
  const description = shared.blog.subtitle;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/blogg`,
      types: {
        "application/rss+xml": [
          { url: `${SITE_URL}/blogg/rss.xml`, title },
        ],
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${SITE_URL}/blogg`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const DATE_LOCALE: Record<Locale, string> = { sv: "sv-SE", en: "en-US" };

function dateFmt(locale: Locale, short: boolean) {
  return new Intl.DateTimeFormat(
    DATE_LOCALE[locale],
    short
      ? { month: "short", day: "numeric" }
      : { year: "numeric", month: "long", day: "numeric" },
  );
}

function formatDate(
  value: string | undefined,
  locale: Locale,
  short = false,
): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return dateFmt(locale, short).format(d);
}

function coverUrl(post: BlogPost, width: number, height: number): string | null {
  if (!post.coverImage) return null;
  const builder = urlForImage(post.coverImage);
  if (!builder) return null;
  return builder.width(width).height(height).fit("crop").auto("format").url();
}

function metaLine(
  post: BlogPost,
  locale: Locale,
  readingTimeLabel: string,
  opts: { short?: boolean } = {},
): string {
  const parts = [formatDate(post.publishedAt, locale, opts.short)];
  if (post.readingTime) parts.push(`${post.readingTime} ${readingTimeLabel}`);
  return parts.filter(Boolean).join(" · ");
}

/** MinCFO brand lockup (mark + wordmark) — used as watermark on placeholder covers. */
function BrandLogo({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      <svg
        className={styles.brandLogoMark}
        viewBox="0 0 50 50"
        fill="currentColor"
      >
        <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
        <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
        <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
        <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
      </svg>
      <span className={styles.brandLogoWord}>MinCFO</span>
    </span>
  );
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  const locale = await getLocale();
  const [allPosts, shared] = await Promise.all([
    fetchBlogPosts(locale),
    fetchSharedContent(locale),
  ]);
  const blog = shared.blog;
  const ui = shared.ui;
  const previewLimit = preview ? Math.max(0, Number.parseInt(preview, 10)) : NaN;
  const posts = Number.isFinite(previewLimit) ? allPosts.slice(0, previewLimit) : allPosts;
  const { hero, rest } = pickHero(posts);
  const sidebar = rest.slice(0, 4);
  const gridPosts = rest.slice(4);

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
          <header className={styles.intro}>
            <p className={styles.eyebrow}>{ui.blogEyebrow}</p>
            <h1 className={styles.title}>{blog.title}</h1>
            <p className={styles.subtitle}>{blog.subtitle}</p>
          </header>

          {!hero ? (
            <section className={styles.empty}>
              <h2>{blog.emptyTitle}</h2>
              <p>{blog.emptyBody}</p>
            </section>
          ) : (
            <>
              {/* ── Split hero: featured (large) + sidebar of latest 4 ── */}
              <section
                className={`${styles.hero} ${sidebar.length === 0 ? styles.heroSolo : ""}`}
                aria-label={ui.blogLatestAria}
              >
                <Link
                  href={`/blogg/${hero.slug}`}
                  className={styles.featured}
                  aria-label={hero.title}
                >
                  <div className={styles.cover}>
                    {hero.coverImage ? (
                      <Image
                        src={coverUrl(hero, 1400, 900) ?? ""}
                        alt={hero.coverImage.alt ?? hero.title}
                        fill
                        sizes="(min-width: 980px) 700px, 100vw"
                        priority
                        className={styles.coverImage}
                      />
                    ) : (
                      <>
                        <Image
                          src={PLACEHOLDER_SRC}
                          alt=""
                          fill
                          sizes="(min-width: 980px) 700px, 100vw"
                          priority
                          className={styles.coverImage}
                        />
                        <BrandLogo className={styles.placeholderLogoFeatured} />
                      </>
                    )}
                  </div>
                  <div className={styles.featuredOverlay} />
                  <div className={styles.featuredContent}>
                    {hero.eyebrow && (
                      <span className={styles.featuredBadge}>{hero.eyebrow}</span>
                    )}
                    <h2 className={styles.featuredTitle}>{hero.title}</h2>
                    <span className={styles.featuredMeta}>{metaLine(hero, locale, ui.readingTimeShort)}</span>
                  </div>
                </Link>

                {sidebar.length > 0 && (
                  <aside className={styles.sidebar} aria-label={ui.blogMoreAria}>
                    <h2 className={styles.sidebarHeading}>{blog.sidebarHeading}</h2>
                    <ol className={styles.sidebarList}>
                      {sidebar.map((post) => (
                        <li key={post.slug}>
                          <Link
                            href={`/blogg/${post.slug}`}
                            className={styles.sidebarItem}
                          >
                            <div className={styles.sidebarThumb}>
                              {post.coverImage ? (
                                <Image
                                  src={coverUrl(post, 280, 280) ?? ""}
                                  alt={post.coverImage.alt ?? post.title}
                                  fill
                                  sizes="112px"
                                  className={styles.sidebarThumbImage}
                                />
                              ) : (
                                <Image
                                  src={PLACEHOLDER_SRC}
                                  alt=""
                                  fill
                                  sizes="112px"
                                  className={styles.sidebarThumbImage}
                                />
                              )}
                            </div>
                            <div className={styles.sidebarBody}>
                              <h3 className={styles.sidebarTitle}>{post.title}</h3>
                              <span className={styles.sidebarMeta}>
                                {metaLine(post, locale, ui.readingTimeShort, { short: true })}
                              </span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ol>
                  </aside>
                )}
              </section>

              {/* ── 3-col grid below hero (paginated client-side, hero stays put) ── */}
              <BlogGrid
                posts={gridPosts}
                heading={blog.gridHeading}
                locale={locale}
                readingTimeLabel={ui.readingTimeShort}
                paginationLabels={{
                  nav: ui.paginationAria,
                  prev: ui.paginationPrev,
                  next: ui.paginationNext,
                  page: ui.paginationPage,
                }}
              />
            </>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
