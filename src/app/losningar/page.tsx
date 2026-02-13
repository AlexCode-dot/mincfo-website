import Link from "next/link";
import styles from "./solutions.module.scss";

const LINKS = [
  { href: "/losningar/ceo-founders", label: "Founders & CEO" },
  { href: "/losningar/cfo-finance", label: "CFO & Finance Team" },
  { href: "/losningar/fractional-cfo", label: "Fractional CFO" },
  { href: "/losningar/saas-tech", label: "SaaS / Tech" },
  { href: "/losningar/konsult-tjanster", label: "Konsult & Tjänster" },
  { href: "/losningar/ehandel", label: "E-handel" },
];

export default function LosningarIndexPage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <Link className={styles.back} href="/">
          Tillbaka till startsidan
        </Link>
        <h1 className={styles.title}>Lösningar</h1>
        <p className={styles.description}>
          Placeholder-sida för kommande lösningssidor. Välj en inriktning nedan.
        </p>
        <div className={styles.list}>
          {LINKS.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
