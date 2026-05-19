// Swedish keeps the legacy singleton id; other locales use a suffixed id.
export const siteSettingsId = (locale: string): string =>
  locale === "sv" ? "siteSettings" : `siteSettings.${locale}`;

export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings" && _id == $settingsId][0]`;

// Docs created before i18n have no `locale` field — treat those as Swedish.
export const VARIANT_QUERY = `*[_type == "homeVariantContent" && mode == $mode && coalesce(locale, "sv") == $locale][0]`;

export const ALL_VARIANTS_QUERY = `*[_type == "homeVariantContent"]`;

const BLOG_POST_PROJECTION = `{
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  published,
  featured,
  author,
  authorRole,
  authorImage{
    asset,
    hotspot,
    crop
  },
  readingTime,
  eyebrow,
  excerpt,
  coverImage{
    asset,
    alt,
    hotspot,
    crop
  },
  body,
  seoTitle,
  seoDescription
}`;

export const ALL_BLOG_POSTS_QUERY = `*[_type == "blogPost" && published == true && publishedAt <= now() && coalesce(locale, "sv") == $locale] | order(publishedAt desc) ${BLOG_POST_PROJECTION}`;

// Prefer the post in the active locale; fall back to any locale (Swedish
// legacy docs have no locale). Order puts the locale match first.
export const BLOG_POST_BY_SLUG_QUERY = `*[_type == "blogPost" && slug.current == $slug] | order(select(coalesce(locale, "sv") == $locale => 0, 1)) [0] ${BLOG_POST_PROJECTION}`;

export const ALL_BLOG_POST_SLUGS_QUERY = `*[_type == "blogPost" && published == true && publishedAt <= now()].slug.current`;

export const ALL_JOB_POSTS_QUERY = `*[_type == "jobPost" && coalesce(locale, "sv") == $locale] | order(order asc, title asc){
  _id,
  title,
  "slug": slug.current,
  eyebrow,
  tagline,
  shortDescription,
  location,
  employmentType,
  start,
  compensation,
  openForApplications,
  order,
  intro,
  sections[]{
    heading,
    body,
    bullets
  },
  closingHeading,
  closingBody
}`;
