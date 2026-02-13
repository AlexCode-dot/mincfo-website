import Link from "next/link";
import styles from "../solutions.module.scss";

export default function FractionalCfoPage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <Link className={styles.back} href="/">
          Tillbaka till startsidan
        </Link>
        <h1 className={styles.title}>Lösning för Fractional CFO</h1>
        <p className={styles.description}>
          Den här sidan är en placeholder för kommande innehåll om hur MinCFO
          stödjer Fractional CFO-arbete och klientleverans.
        </p>
        <p className={styles.placeholder}>
          Kommer snart: standardiserade arbetssätt, samarbete med klientteam och
          rapportering.
        </p>
      </section>
    </main>
  );
}
