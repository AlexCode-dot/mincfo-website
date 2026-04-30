import { createBlogOgImage } from "@/app/og/shared";
import { fetchBlogPostBySlug } from "@/sanity/lib/fetchBlogPosts";
import { fetchSharedContent } from "@/sanity/lib/fetchHomeContent";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const alt = "MinCFO";

type Props = { params: Promise<{ slug: string }> };

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const [post, shared] = await Promise.all([
    fetchBlogPostBySlug(slug),
    fetchSharedContent(),
  ]);

  return createBlogOgImage({
    title: post?.title ?? shared.blog.title,
    eyebrow: post?.eyebrow ?? shared.navigation.blogg ?? "Blogg",
  });
}
