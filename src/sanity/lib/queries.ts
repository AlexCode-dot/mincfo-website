export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings" && _id == "siteSettings"][0]`;

export const VARIANT_QUERY = `*[_type == "homeVariantContent" && mode == $mode][0]`;

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

export const ALL_BLOG_POSTS_QUERY = `*[_type == "blogPost" && published == true && publishedAt <= now()] | order(publishedAt desc) ${BLOG_POST_PROJECTION}`;

export const BLOG_POST_BY_SLUG_QUERY = `*[_type == "blogPost" && slug.current == $slug][0] ${BLOG_POST_PROJECTION}`;

export const ALL_BLOG_POST_SLUGS_QUERY = `*[_type == "blogPost" && published == true && publishedAt <= now()].slug.current`;

export const ALL_JOB_POSTS_QUERY = `*[_type == "jobPost"] | order(order asc, title asc){
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
