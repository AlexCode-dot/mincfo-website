import type { Metadata } from "next";
import JobDetailPage from "@/components/v2/careers/JobDetailPage";
import jobPostsJson from "@/content/jobPosts.json";

type PageParams = { slug: string };
type PageProps = { params: Promise<PageParams> };

export function generateStaticParams(): PageParams[] {
  return (jobPostsJson.posts ?? [])
    .filter((p) => p.openForApplications !== false && p.slug)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = (jobPostsJson.posts ?? []).find((p) => p.slug === slug);
  if (!post) {
    return { title: "Tjänst hittades inte — MinCFO" };
  }
  return {
    title: `${post.title} | MinCFO`,
    description: post.shortDescription ?? post.tagline ?? undefined,
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <JobDetailPage slug={slug} />;
}
