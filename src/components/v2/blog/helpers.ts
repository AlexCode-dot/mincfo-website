import type { BlogPost } from "@/sanity/lib/fetchBlogPosts";
import type { Locale } from "@/i18n/locale";
import { urlForImage } from "@/sanity/lib/imageUrl";

const DATE_LOCALE: Record<Locale, string> = { sv: "sv-SE", en: "en-US" };

export function formatDate(
  value: string | undefined,
  locale: Locale,
  short = false,
): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(
    DATE_LOCALE[locale],
    short
      ? { month: "short", day: "numeric" }
      : { year: "numeric", month: "long", day: "numeric" },
  ).format(d);
}

export function metaLine(
  post: BlogPost,
  locale: Locale,
  readingTimeLabel: string,
  opts: { short?: boolean } = {},
): string {
  const parts = [formatDate(post.publishedAt, locale, opts.short)];
  if (post.readingTime) parts.push(`${post.readingTime} ${readingTimeLabel}`);
  return parts.filter(Boolean).join(" · ");
}

export function coverUrl(
  post: BlogPost,
  width: number,
  height: number,
): string | null {
  if (!post.coverImage) return null;
  const builder = urlForImage(post.coverImage);
  if (!builder) return null;
  return builder.width(width).height(height).fit("crop").auto("format").url();
}
