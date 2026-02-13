import Link from "next/link";
import styles from "../solutions.module.scss";

export default function SaasTechPage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <Link className={styles.back} href="/">
          Tillbaka till startsidan
        </Link>
        <h1 className={styles.title}>Lösning för SaaS / Tech</h1>
        <p className={styles.description}>
          Den här sidan är en placeholder för kommande innehåll om hur MinCFO
          hjälper SaaS- och techbolag med runway, tillväxt och kostnadskontroll.
        </p>
        <p className={styles.placeholder}>
          Kommer snart: nyckeltal, forecasting-upplägg och rekommenderade
          arbetsflöden.
        </p>
      </section>
    </main>
  );
}
