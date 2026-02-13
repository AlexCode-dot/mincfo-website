import Link from "next/link";
import styles from "../solutions.module.scss";

export default function CfoFinancePage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <Link className={styles.back} href="/">
          Tillbaka till startsidan
        </Link>
        <h1 className={styles.title}>Lösning för CFO & Finance Team</h1>
        <p className={styles.description}>
          Den här sidan är en placeholder för kommande innehåll om hur MinCFO
          hjälper finansfunktioner med insikter, planering och uppföljning.
        </p>
        <p className={styles.placeholder}>
          Kommer snart: processer, KPI-fokus, implementation och mätbara
          resultat.
        </p>
      </section>
    </main>
  );
}
