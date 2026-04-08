import { defineLive } from "next-sanity/live";
import { client } from "@/sanity/client";

// When Sanity is not configured, provide no-op stubs
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noopFetch = async () => ({ data: null as any, sourceMap: null, tags: [] as string[] });
const NoopLive = () => null;

const live = client
  ? defineLive({
      client,
      serverToken: process.env.SANITY_API_READ_TOKEN,
      browserToken: process.env.NEXT_PUBLIC_SANITY_BROWSER_TOKEN,
    })
  : {
      sanityFetch: noopFetch as unknown as ReturnType<typeof defineLive>["sanityFetch"],
      SanityLive: NoopLive as unknown as ReturnType<typeof defineLive>["SanityLive"],
    };

export const { sanityFetch, SanityLive } = live;
