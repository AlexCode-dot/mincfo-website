export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings" && _id == "siteSettings"][0]`;

export const VARIANT_QUERY = `*[_type == "homeVariantContent" && mode == $mode][0]`;

export const ALL_VARIANTS_QUERY = `*[_type == "homeVariantContent"]`;
