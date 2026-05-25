import type { Metadata } from "next";
import { fetchBlogPosts } from "@/sanity/lib/fetchBlogPosts";
import { fetchSharedContent } from "@/sanity/lib/fetchHomeContent";
import { getLocale } from "@/i18n/server";
import BlogIndex from "@/components/v2/blog/BlogIndex";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://mincfo.com";

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
        "application/rss+xml": [{ url: `${SITE_URL}/blogg/rss.xml`, title }],
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
  const posts = Number.isFinite(previewLimit)
    ? allPosts.slice(0, previewLimit)
    : allPosts;

  return (
    <BlogIndex
      posts={posts}
      locale={locale}
      labels={{
        eyebrow: ui.blogEyebrow,
        title: blog.title,
        subtitle: blog.subtitle,
        sidebarHeading: blog.sidebarHeading,
        gridHeading: blog.gridHeading,
        emptyTitle: blog.emptyTitle,
        emptyBody: blog.emptyBody,
        latestAria: ui.blogLatestAria,
        moreAria: ui.blogMoreAria,
        readingTimeShort: ui.readingTimeShort,
        pagination: {
          nav: ui.paginationAria,
          prev: ui.paginationPrev,
          next: ui.paginationNext,
          page: ui.paginationPage,
        },
      }}
    />
  );
}
