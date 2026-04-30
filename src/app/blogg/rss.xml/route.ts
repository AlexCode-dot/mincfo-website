import { fetchBlogPosts } from "@/sanity/lib/fetchBlogPosts";
import { fetchSharedContent } from "@/sanity/lib/fetchHomeContent";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://mincfo.com";

function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

export async function GET() {
  const [posts, shared] = await Promise.all([
    fetchBlogPosts(),
    fetchSharedContent(),
  ]);
  const feedTitle = shared.blog.title;
  const feedDescription = shared.blog.subtitle;

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blogg/${post.slug}`;
      const pubDate = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()
        : new Date().toUTCString();

      return `
    <item>
      <title>${escape(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      ${post.author ? `<dc:creator>${cdata(post.author)}</dc:creator>` : ""}
      ${post.eyebrow ? `<category>${escape(post.eyebrow)}</category>` : ""}
      ${post.excerpt ? `<description>${cdata(post.excerpt)}</description>` : ""}
    </item>`.trim();
    })
    .join("\n    ");

  const lastBuildDate =
    posts[0]?.publishedAt
      ? new Date(posts[0].publishedAt).toUTCString()
      : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escape(feedTitle)}</title>
    <link>${SITE_URL}/blogg</link>
    <description>${escape(feedDescription)}</description>
    <language>sv-SE</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/blogg/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
