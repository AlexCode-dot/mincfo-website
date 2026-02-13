import Link from "next/link";
import styles from "../solutions.module.scss";

export default function CeoFoundersPage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <Link className={styles.back} href="/">
          Tillbaka till startsidan
        </Link>
        <h1 className={styles.title}>Lösning för Founders & CEO</h1>
        <p className={styles.description}>
          Den här sidan är en placeholder för kommande innehåll om hur MinCFO
          stöttar grundare och ledning.
        </p>
        <p className={styles.placeholder}>
          Kommer snart: utmaningar, arbetsflöden, resultat och relevant
          kundcase.
        </p>
      </section>
    </main>
  );
}
