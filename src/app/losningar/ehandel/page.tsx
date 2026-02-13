import Link from "next/link";
import styles from "../solutions.module.scss";

export default function EhandelPage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <Link className={styles.back} href="/">
          Tillbaka till startsidan
        </Link>
        <h1 className={styles.title}>Lösning för E-handel</h1>
        <p className={styles.description}>
          Den här sidan är en placeholder för kommande innehåll om hur MinCFO
          hjälper e-handelsbolag med lager, marknadsföring och kassacykler.
        </p>
        <p className={styles.placeholder}>
          Kommer snart: lönsamhetsdrivare, rapportering och rekommenderade
          operativa rutiner.
        </p>
      </section>
    </main>
  );
}
