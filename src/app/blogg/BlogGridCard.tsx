import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "@/sanity/lib/fetchBlogPosts";
import { urlForImage } from "@/sanity/lib/imageUrl";
import styles from "./page.module.scss";

const PLACEHOLDER_SRC = "/blog/blog-placeholder-image.png";

const SV_DATE = new Intl.DateTimeFormat("sv-SE", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

function formatDate(value: string | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return SV_DATE.format(d);
}

function metaLine(post: BlogPost): string {
  const parts = [formatDate(post.publishedAt)];
  if (post.readingTime) parts.push(`${post.readingTime} min`);
  return parts.filter(Boolean).join(" · ");
}

function coverUrl(post: BlogPost, width: number, height: number): string | null {
  if (!post.coverImage) return null;
  const builder = urlForImage(post.coverImage);
  if (!builder) return null;
  return builder.width(width).height(height).fit("crop").auto("format").url();
}

function BrandLogo({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      <svg className={styles.brandLogoMark} viewBox="0 0 50 50" fill="currentColor">
        <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
        <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
        <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
        <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
      </svg>
      <span className={styles.brandLogoWord}>MinCFO</span>
    </span>
  );
}

export default function BlogGridCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blogg/${post.slug}`} className={styles.card}>
      <div className={styles.cardCover}>
        {post.coverImage ? (
          <Image
            src={coverUrl(post, 800, 450) ?? ""}
            alt={post.coverImage.alt ?? post.title}
            fill
            sizes="(min-width: 980px) 360px, (min-width: 700px) 50vw, 100vw"
            className={styles.coverImage}
          />
        ) : (
          <>
            <Image
              src={PLACEHOLDER_SRC}
              alt=""
              fill
              sizes="(min-width: 980px) 360px, (min-width: 700px) 50vw, 100vw"
              className={styles.coverImage}
            />
            <BrandLogo className={styles.placeholderLogoCard} />
          </>
        )}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          {post.eyebrow && <span className={styles.cardEyebrow}>{post.eyebrow}</span>}
          <h3 className={styles.cardTitle}>{post.title}</h3>
          {post.excerpt && <p className={styles.cardExcerpt}>{post.excerpt}</p>}
        </div>
        <div className={styles.cardBottom}>
          <span className={styles.cardMeta}>{metaLine(post)}</span>
          <span className={styles.cardCta} aria-hidden="true">
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
