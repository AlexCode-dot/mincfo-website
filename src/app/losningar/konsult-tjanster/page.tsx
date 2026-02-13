import Link from "next/link";
import styles from "../solutions.module.scss";

export default function KonsultTjansterPage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <Link className={styles.back} href="/">
          Tillbaka till startsidan
        </Link>
        <h1 className={styles.title}>Lösning för Konsult & Tjänster</h1>
        <p className={styles.description}>
          Den här sidan är en placeholder för kommande innehåll om hur MinCFO
          stödjer konsult- och tjänstebolag med planering, marginalstyrning och
          uppföljning.
        </p>
        <p className={styles.placeholder}>
          Kommer snart: beläggningsinsikter, projektlönsamhet och kassaflödesflöden.
        </p>
      </section>
    </main>
  );
}
