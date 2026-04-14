import { client } from "@/sanity/client";
import { sanityFetch } from "@/sanity/lib/live";
import { ALL_JOB_POSTS_QUERY } from "./queries";
import jobPostsJson from "@/content/jobPosts.json";

export type JobPostSection = {
  heading: string;
  body?: string;
  bullets?: string[];
};

export type JobPost = {
  slug: string;
  title: string;
  eyebrow?: string;
  tagline?: string;
  shortDescription?: string;
  location?: string;
  employmentType?: string;
  start?: string;
  compensation?: string;
  openForApplications: boolean;
  order: number;
  intro?: string;
  sections: JobPostSection[];
  closingHeading?: string;
  closingBody?: string;
};

type AnyObject = Record<string, unknown>;

function normalizeSection(section: AnyObject | null | undefined): JobPostSection {
  if (!section) return { heading: "" };
  const bullets = Array.isArray(section.bullets)
    ? (section.bullets as unknown[]).filter(
        (b): b is string => typeof b === "string" && b.trim().length > 0,
      )
    : undefined;
  const body =
    typeof section.body === "string" && section.body.trim().length > 0
      ? (section.body as string)
      : undefined;
  return {
    heading: (section.heading as string) ?? "",
    body,
    bullets: bullets && bullets.length > 0 ? bullets : undefined,
  };
}

function normalizePost(raw: AnyObject): JobPost {
  const sectionsRaw = Array.isArray(raw.sections) ? (raw.sections as AnyObject[]) : [];
  const sections = sectionsRaw.map(normalizeSection).filter((s) => s.heading);
  return {
    slug: (raw.slug as string) ?? "",
    title: (raw.title as string) ?? "",
    eyebrow: (raw.eyebrow as string) ?? undefined,
    tagline: (raw.tagline as string) ?? undefined,
    shortDescription: (raw.shortDescription as string) ?? undefined,
    location: (raw.location as string) ?? undefined,
    employmentType: (raw.employmentType as string) ?? undefined,
    start: (raw.start as string) ?? undefined,
    compensation: (raw.compensation as string) ?? undefined,
    openForApplications: raw.openForApplications !== false,
    order: typeof raw.order === "number" ? raw.order : 100,
    intro: (raw.intro as string) ?? undefined,
    sections,
    closingHeading: (raw.closingHeading as string) ?? undefined,
    closingBody: (raw.closingBody as string) ?? undefined,
  };
}

function sortPosts(posts: JobPost[]): JobPost[] {
  return [...posts].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.title.localeCompare(b.title, "sv");
  });
}

function fallbackPosts(): JobPost[] {
  const raw = (jobPostsJson as { posts: AnyObject[] }).posts ?? [];
  return sortPosts(raw.map((p) => normalizePost(p)));
}

export async function fetchJobPosts(): Promise<JobPost[]> {
  if (!client) {
    return fallbackPosts();
  }

  try {
    const { data } = await sanityFetch({ query: ALL_JOB_POSTS_QUERY });
    const list = Array.isArray(data) ? (data as AnyObject[]) : [];
    if (list.length === 0) {
      return fallbackPosts();
    }
    return sortPosts(list.map(normalizePost));
  } catch (error) {
    console.error("Failed to fetch job posts from Sanity, using JSON fallback:", error);
    return fallbackPosts();
  }
}

export async function fetchPublishedJobPosts(): Promise<JobPost[]> {
  const posts = await fetchJobPosts();
  return posts.filter((p) => p.openForApplications && p.slug);
}

export async function fetchJobPostBySlug(slug: string): Promise<JobPost | null> {
  const posts = await fetchJobPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}
