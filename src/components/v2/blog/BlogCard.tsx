import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/sanity/lib/fetchBlogPosts";
import type { Locale } from "@/i18n/locale";
import { coverUrl, metaLine } from "./helpers";

function PlaceholderMark() {
  return (
    <span className="bl-card-ph" aria-hidden="true">
      <svg viewBox="0 0 50 50" fill="currentColor">
        <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
        <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
        <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
        <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
      </svg>
    </span>
  );
}

export default function BlogCard({
  post,
  locale,
  readingTimeLabel,
}: {
  post: BlogPost;
  locale: Locale;
  readingTimeLabel: string;
}) {
  return (
    <Link href={`/blogg/${post.slug}`} className="bl-card">
      <div className="bl-card-cover">
        {post.coverImage ? (
          <Image
            src={coverUrl(post, 800, 500) ?? ""}
            alt={post.coverImage.alt ?? post.title}
            fill
            sizes="(min-width: 880px) 400px, (min-width: 560px) 50vw, 100vw"
          />
        ) : (
          <PlaceholderMark />
        )}
      </div>
      <div className="bl-card-body">
        {post.eyebrow && <span className="bl-card-eyebrow">{post.eyebrow}</span>}
        <h3 className="bl-card-title">{post.title}</h3>
        {post.excerpt && <p className="bl-card-excerpt">{post.excerpt}</p>}
        <div className="bl-card-foot">
          <span className="bl-card-meta">
            {metaLine(post, locale, readingTimeLabel)}
          </span>
          <span className="bl-card-arrow" aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 13 13">
              <path
                stroke="currentColor"
                strokeWidth="1.4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 6.5h6.5m-3-3l3 3-3 3"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
