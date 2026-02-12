import styles from "./Logo.module.scss";

export default function Logo() {
  return (
    <a className={styles.logo} href="/" aria-label="MinCFO">
      <span className={styles.dot} />
      <span className={styles.wordmark}>MinCFO</span>
    </a>
  );
}
