"use client";

import { useState } from "react";
import type { BlogPost } from "@/sanity/lib/fetchBlogPosts";
import type { Locale } from "@/i18n/locale";
import BlogGridCard from "./BlogGridCard";
import Pagination, { type PaginationLabels } from "./Pagination";
import styles from "./page.module.scss";

const POSTS_PER_PAGE = 3;

interface BlogGridProps {
  posts: BlogPost[];
  heading: string;
  locale: Locale;
  readingTimeLabel: string;
  paginationLabels: PaginationLabels;
}

/**
 * Client-side grid + pagination. The hero/sidebar above stays static; only the
 * grid swaps when the user clicks a page. We deliberately do not scroll —
 * the user keeps their position so the swap feels in-place.
 */
export default function BlogGrid({
  posts,
  heading,
  locale,
  readingTimeLabel,
  paginationLabels,
}: BlogGridProps) {
  const [page, setPage] = useState(1);

  if (posts.length === 0) return null;

  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const start = (page - 1) * POSTS_PER_PAGE;
  const visible = posts.slice(start, start + POSTS_PER_PAGE);

  const handlePageChange = (next: number) => {
    if (next === page || next < 1 || next > totalPages) return;
    setPage(next);
  };

  return (
    <section className={styles.gridSection} aria-label={heading}>
      <header className={styles.gridHeader}>
        <h2 className={styles.gridHeading}>{heading}</h2>
      </header>
      <div className={styles.grid}>
        {visible.map((post) => (
          <BlogGridCard
            key={post.slug}
            post={post}
            locale={locale}
            readingTimeLabel={readingTimeLabel}
          />
        ))}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        labels={paginationLabels}
      />
    </section>
  );
}
