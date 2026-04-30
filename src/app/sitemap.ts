import type { MetadataRoute } from "next";
import { fetchBlogPosts } from "@/sanity/lib/fetchBlogPosts";
import { fetchPublishedJobPosts } from "@/sanity/lib/fetchJobPosts";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://mincfo.com";

const STATIC_PATHS: { path: string; changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"]; priority?: number }[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/plattform", changeFrequency: "weekly", priority: 0.9 },
  { path: "/full-service", changeFrequency: "weekly", priority: 0.9 },
  { path: "/partner", changeFrequency: "weekly", priority: 0.9 },
  { path: "/losningar/ceo-founders", changeFrequency: "monthly", priority: 0.8 },
  { path: "/losningar/cfo-finance", changeFrequency: "monthly", priority: 0.8 },
  { path: "/losningar/saas-tech", changeFrequency: "monthly", priority: 0.8 },
  { path: "/losningar/konsult-tjanster", changeFrequency: "monthly", priority: 0.8 },
  { path: "/losningar/ehandel", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blogg", changeFrequency: "weekly", priority: 0.8 },
  { path: "/karriar", changeFrequency: "weekly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((entry) => ({
    url: `${SITE_URL}${entry.path}`,
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  const [blogPosts, jobs] = await Promise.all([
    fetchBlogPosts().catch(() => []),
    fetchPublishedJobPosts().catch(() => []),
  ]);

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}/blogg/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const jobEntries: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${SITE_URL}/karriar/${job.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...blogEntries, ...jobEntries];
}
