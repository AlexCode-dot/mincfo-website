import imageUrlBuilder from "@sanity/image-url";
import type { ImageUrlBuilder, SanityImageSource } from "@sanity/image-url";
import { dataset, projectId } from "@/sanity/env";

const builder = projectId
  ? imageUrlBuilder({ projectId, dataset })
  : null;

export function urlForImage(source: SanityImageSource): ImageUrlBuilder | null {
  if (!builder) return null;
  return builder.image(source);
}
