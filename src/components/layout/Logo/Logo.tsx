import Link from "next/link";
import styles from "./Logo.module.scss";

export default function Logo() {
  return (
    <Link className={styles.logo} href="/" aria-label="MinCFO">
      <svg className={styles.mark} viewBox="0 0 50 50" role="img" aria-hidden="true">
        <g fill="currentColor">
          <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
          <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
          <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
          <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
        </g>
      </svg>
      <span className={styles.wordmark}>MinCFO</span>
    </Link>
  );
}
