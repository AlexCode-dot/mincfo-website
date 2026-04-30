import { createBlogOgImage } from "@/app/og/shared";
import { fetchSharedContent } from "@/sanity/lib/fetchHomeContent";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const alt = "Insikter från MinCFO";

export default async function OpenGraphImage() {
  const shared = await fetchSharedContent();
  return createBlogOgImage({
    title: shared.blog.title,
    eyebrow: shared.navigation.blogg ?? "Blogg",
  });
}
