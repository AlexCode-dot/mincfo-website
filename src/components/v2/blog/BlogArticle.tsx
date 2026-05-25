"use client";

import Image from "next/image";
import Link from "next/link";
import "../mincfo-landing.css";
import "../styles/blog.css";
import Nav from "../shared/Nav";
import Footer from "../shared/Footer";
import type { BlogPost } from "@/sanity/lib/fetchBlogPosts";
import type { Locale } from "@/i18n/locale";
import { urlForImage } from "@/sanity/lib/imageUrl";
import { formatDate } from "./helpers";
import BackLink from "./BackLink";
import PostBody from "./PostBody";

export type BlogArticleLabels = {
  back: string;
  readingTimeFull: string;
  contentSoon: string;
  backToList: string;
};

export default function BlogArticle({
  post,
  locale,
  labels,
}: {
  post: BlogPost;
  locale: Locale;
  labels: BlogArticleLabels;
}) {
  const date = formatDate(post.publishedAt, locale);
  const subline = [
    post.authorRole,
    date,
    post.readingTime ? `${post.readingTime} ${labels.readingTimeFull}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const coverSrc = post.coverImage
    ? urlForImage(post.coverImage)
        ?.width(1800)
        .height(1010)
        .fit("crop")
        .auto("format")
        .url()
    : null;

  const avatarSrc = post.authorImage
    ? urlForImage(post.authorImage)
        ?.width(96)
        .height(96)
        .fit("crop")
        .auto("format")
        .url()
    : null;

  return (
    <div className="mv2-root type-sumary bl-root">
      <Nav />

      <main>
        <article className="container bl-article">
          <div className="bl-art-top">
            <BackLink href="/blogg" label={labels.back} />
          </div>

          <header className="bl-art-head">
            {post.eyebrow && <span className="bl-art-eyebrow">{post.eyebrow}</span>}
            <h1 className="bl-art-title">{post.title}</h1>
            {post.excerpt && <p className="bl-art-excerpt">{post.excerpt}</p>}

            {(post.author || date) && (
              <div className="bl-art-author">
                {avatarSrc ? (
                  <span className="bl-art-avatar">
                    <Image
                      src={avatarSrc}
                      alt={post.author ?? ""}
                      width={44}
                      height={44}
                    />
                  </span>
                ) : post.author ? (
                  <span className="bl-art-avatar" aria-hidden="true">
                    {post.author.slice(0, 1)}
                  </span>
                ) : null}
                <div className="bl-art-author-meta">
                  {post.author && (
                    <span className="bl-art-author-name">{post.author}</span>
                  )}
                  {subline && <span className="bl-art-author-sub">{subline}</span>}
                </div>
              </div>
            )}
          </header>

          {coverSrc && (
            <div className="bl-art-cover">
              <Image
                src={coverSrc}
                alt={post.coverImage?.alt ?? post.title}
                fill
                sizes="(min-width: 800px) 760px, 100vw"
                priority
              />
            </div>
          )}

          <div className="bl-art-body">
            {post.body && post.body.length > 0 ? (
              <PostBody value={post.body} />
            ) : (
              <p className="bl-soon">{labels.contentSoon}</p>
            )}
          </div>

          <footer className="bl-art-foot">
            <Link href="/blogg" className="bl-art-foot-link">
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path
                  stroke="currentColor"
                  strokeWidth="1.4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.5 3L4.5 7l4 4"
                />
              </svg>
              {labels.backToList}
            </Link>
          </footer>
        </article>
      </main>

      <Footer />
    </div>
  );
}
