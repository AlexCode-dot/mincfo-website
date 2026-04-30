import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://mincfo.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio", "/studio/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
