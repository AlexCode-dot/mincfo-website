export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings" && _id == "siteSettings"][0]`;

export const VARIANT_QUERY = `*[_type == "homeVariantContent" && mode == $mode][0]`;

export const ALL_VARIANTS_QUERY = `*[_type == "homeVariantContent"]`;

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
