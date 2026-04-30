"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import styles from "./Pagination.module.scss";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Build the visible range of page numbers. With <=7 pages we show all of them;
 * with more, we collapse the middle to ellipses around the current page.
 */
function buildRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const range: (number | "…")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) range.push("…");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push("…");

  range.push(total);
  return range;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const range = buildRange(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav className={styles.pagination} aria-label="Paginering">
      <button
        type="button"
        onClick={() => hasPrev && onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        className={`${styles.arrow} ${!hasPrev ? styles.arrowDisabled : ""}`}
        aria-label="Föregående sida"
      >
        <ArrowLeft size={16} aria-hidden="true" />
      </button>

      <div className={styles.pages}>
        {range.map((item, i) =>
          item === "…" ? (
            <span key={`ellipsis-${i}`} className={styles.ellipsis} aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              disabled={item === currentPage}
              className={`${styles.page} ${item === currentPage ? styles.pageActive : ""}`}
              aria-current={item === currentPage ? "page" : undefined}
              aria-label={`Sida ${item}`}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => hasNext && onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className={`${styles.arrow} ${!hasNext ? styles.arrowDisabled : ""}`}
        aria-label="Nästa sida"
      >
        <ArrowRight size={16} aria-hidden="true" />
      </button>
    </nav>
  );
}
