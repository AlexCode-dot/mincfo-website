import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/layout/SiteFooter/SiteFooter";
import {
  fetchBlogPostBySlug,
  fetchBlogPostSlugs,
} from "@/sanity/lib/fetchBlogPosts";
import { fetchSharedContent } from "@/sanity/lib/fetchHomeContent";
import { getLocale } from "@/i18n/server";
import type { Locale } from "@/i18n/locale";
import { urlForImage } from "@/sanity/lib/imageUrl";
import BackButton from "../BackButton";
import PostBody from "./PostBody";
import styles from "./page.module.scss";

type PageParams = { slug: string };
type PageProps = { params: Promise<PageParams> };

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://mincfo.com";

const DATE_LOCALE: Record<Locale, string> = { sv: "sv-SE", en: "en-US" };

function formatDate(value: string | undefined, locale: Locale): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export async function generateStaticParams(): Promise<PageParams[]> {
  const slugs = await fetchBlogPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug, await getLocale());
  if (!post) {
    return { title: "Blogg | MinCFO" };
  }
  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt ?? undefined;
  const ogImage = post.coverImage
    ? urlForImage(post.coverImage)?.width(1200).height(630).fit("crop").url()
    : undefined;

  return {
    title: `${title} | MinCFO`,
    description,
    alternates: {
      canonical: `${SITE_URL}/blogg/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `${SITE_URL}/blogg/${slug}`,
      publishedTime: post.publishedAt,
      authors: post.author ? [post.author] : undefined,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const [post, shared] = await Promise.all([
    fetchBlogPostBySlug(slug, locale),
    fetchSharedContent(locale),
  ]);

  if (!post || !post.published) {
    notFound();
  }

  const ui = shared.ui;
  const date = formatDate(post.publishedAt, locale);
  const subline = [post.authorRole, date, post.readingTime ? `${post.readingTime} ${ui.readingTimeFull}` : null]
    .filter(Boolean)
    .join(" · ");

  const coverSrc = post.coverImage
    ? urlForImage(post.coverImage)?.width(1800).height(1010).fit("crop").auto("format").url()
    : null;

  const avatarSrc = post.authorImage
    ? urlForImage(post.authorImage)?.width(96).height(96).fit("crop").auto("format").url()
    : null;

  const articleUrl = `${SITE_URL}/blogg/${post.slug}`;
  const ogImageUrl =
    coverSrc ?? `${SITE_URL}/blogg/${post.slug}/opengraph-image`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? post.seoDescription,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    image: [ogImageUrl],
    author: post.author
      ? {
          "@type": "Person",
          name: post.author,
          ...(post.authorRole ? { jobTitle: post.authorRole } : {}),
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "MinCFO",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
  };

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.topRail}>
        <div className={styles.backWrap}>
          <BackButton href="/blogg" label={ui.back} />
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
            {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}

            {(post.author || date) && (
              <div className={styles.author}>
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt={post.author ?? ""}
                    width={48}
                    height={48}
                    className={styles.authorAvatar}
                  />
                ) : post.author ? (
                  <span className={styles.authorAvatar} aria-hidden="true" data-fallback>
                    {post.author.slice(0, 1)}
                  </span>
                ) : null}
                <div className={styles.authorMeta}>
                  {post.author && <span className={styles.authorName}>{post.author}</span>}
                  {subline && <span className={styles.authorSub}>{subline}</span>}
                </div>
              </div>
            )}
          </header>

          {coverSrc && (
            <div className={styles.cover}>
              <Image
                src={coverSrc}
                alt={post.coverImage?.alt ?? post.title}
                fill
                sizes="(min-width: 980px) 920px, 100vw"
                priority
                className={styles.coverImage}
              />
            </div>
          )}

          <section className={styles.body}>
            {post.body && post.body.length > 0 ? (
              <PostBody value={post.body} />
            ) : (
              <p className={styles.bodyP}>{ui.blogContentSoon}</p>
            )}
          </section>

          <footer className={styles.postFooter}>
            <Link href="/blogg" className={styles.footerBack}>
              ← {shared.blog.backToListLabel}
            </Link>
          </footer>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
