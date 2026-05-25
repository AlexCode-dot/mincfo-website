import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchBlogPostBySlug } from "@/sanity/lib/fetchBlogPosts";
import { fetchSharedContent } from "@/sanity/lib/fetchHomeContent";
import { getLocale } from "@/i18n/server";
import type { Locale } from "@/i18n/locale";
import { urlForImage } from "@/sanity/lib/imageUrl";
import BlogArticle from "@/components/v2/blog/BlogArticle";

type PageParams = { slug: string };
type PageProps = { params: Promise<PageParams> };

// Locale lives in a per-request cookie (NEXT_LOCALE), so the post page must
// render dynamically. Forcing dynamic also keeps next-sanity's draftMode()
// usage out of the static-rendering path, which throws DYNAMIC_SERVER_USAGE
// in Next 16 when combined with generateStaticParams.
export const dynamic = "force-dynamic";

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

  const coverSrc = post.coverImage
    ? urlForImage(post.coverImage)
        ?.width(1800)
        .height(1010)
        .fit("crop")
        .auto("format")
        .url()
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogArticle
        post={post}
        locale={locale}
        labels={{
          back: ui.back,
          readingTimeFull: ui.readingTimeFull,
          contentSoon: ui.blogContentSoon,
          backToList: shared.blog.backToListLabel,
        }}
      />
    </>
  );
}
