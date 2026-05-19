import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "@/sanity/client";
import { sanityFetch } from "@/sanity/lib/live";
import {
  ALL_BLOG_POSTS_QUERY,
  ALL_BLOG_POST_SLUGS_QUERY,
  BLOG_POST_BY_SLUG_QUERY,
} from "./queries";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/locale";

export type BlogCoverImage = SanityImageSource & {
  alt?: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  publishedAt: string;
  published: boolean;
  featured: boolean;
  author?: string;
  authorRole?: string;
  authorImage?: SanityImageSource;
  readingTime?: number;
  eyebrow?: string;
  excerpt?: string;
  coverImage?: BlogCoverImage;
  body?: PortableTextBlock[];
  seoTitle?: string;
  seoDescription?: string;
};

type AnyObject = Record<string, unknown>;

function normalizePost(raw: AnyObject): BlogPost {
  const cover = raw.coverImage as AnyObject | undefined;
  const avatar = raw.authorImage as AnyObject | undefined;
  return {
    id: (raw._id as string) ?? "",
    slug: (raw.slug as string) ?? "",
    title: (raw.title as string) ?? "",
    publishedAt: (raw.publishedAt as string) ?? "",
    published: raw.published !== false,
    featured: raw.featured === true,
    author: (raw.author as string) ?? undefined,
    authorRole: (raw.authorRole as string) ?? undefined,
    authorImage:
      avatar && (avatar.asset as AnyObject | undefined)?._ref
        ? (avatar as SanityImageSource)
        : undefined,
    readingTime:
      typeof raw.readingTime === "number" ? (raw.readingTime as number) : undefined,
    eyebrow: (raw.eyebrow as string) ?? undefined,
    excerpt: (raw.excerpt as string) ?? undefined,
    coverImage:
      cover && (cover.asset as AnyObject | undefined)?._ref
        ? (cover as BlogCoverImage)
        : undefined,
    body: Array.isArray(raw.body) ? (raw.body as PortableTextBlock[]) : undefined,
    seoTitle: (raw.seoTitle as string) ?? undefined,
    seoDescription: (raw.seoDescription as string) ?? undefined,
  };
}

export async function fetchBlogPosts(
  locale: Locale = DEFAULT_LOCALE,
): Promise<BlogPost[]> {
  if (!client) return [];

  try {
    const { data } = await sanityFetch({
      query: ALL_BLOG_POSTS_QUERY,
      params: { locale },
    });
    let list = Array.isArray(data) ? (data as AnyObject[]) : [];

    // Locale fallback: if there are no posts authored for this locale yet,
    // show the default-locale posts so the blog is never empty. Once
    // localized posts are created in Studio they take precedence.
    if (list.length === 0 && locale !== DEFAULT_LOCALE) {
      const { data: fallbackData } = await sanityFetch({
        query: ALL_BLOG_POSTS_QUERY,
        params: { locale: DEFAULT_LOCALE },
      });
      list = Array.isArray(fallbackData) ? (fallbackData as AnyObject[]) : [];
    }

    return list.map(normalizePost).filter((p) => p.slug);
  } catch (error) {
    console.error("Failed to fetch blog posts from Sanity:", error);
    return [];
  }
}

export async function fetchBlogPostBySlug(
  slug: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<BlogPost | null> {
  if (!client) return null;

  try {
    const { data } = await sanityFetch({
      query: BLOG_POST_BY_SLUG_QUERY,
      params: { slug, locale },
    });
    if (!data) return null;
    const post = normalizePost(data as AnyObject);
    if (!post.slug) return null;
    return post;
  } catch (error) {
    console.error(`Failed to fetch blog post ${slug} from Sanity:`, error);
    return null;
  }
}

/**
 * Splits a list of posts (already sorted by publishedAt desc) into:
 * - hero: most recently published post that has `featured: true`,
 *         or just the most recently published post if none are featured.
 * - rest: everything else, in chronological order (newest first).
 */
export function pickHero(posts: BlogPost[]): {
  hero: BlogPost | null;
  rest: BlogPost[];
} {
  if (posts.length === 0) return { hero: null, rest: [] };
  const featured = posts.find((p) => p.featured);
  const hero = featured ?? posts[0];
  const rest = posts.filter((p) => p.id !== hero.id);
  return { hero, rest };
}

export async function fetchBlogPostSlugs(): Promise<string[]> {
  if (!client) return [];

  try {
    const { data } = await sanityFetch({ query: ALL_BLOG_POST_SLUGS_QUERY });
    return Array.isArray(data) ? (data as string[]).filter(Boolean) : [];
  } catch (error) {
    console.error("Failed to fetch blog post slugs from Sanity:", error);
    return [];
  }
}
