import Link from "next/link";
import { solutionsIndexContent } from "./_shared/solutionPageContent";
import styles from "./solutions.module.scss";

export default function LosningarIndexPage() {
  const content = solutionsIndexContent;
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <Link className={styles.back} href="/">
          {content.backToHome}
        </Link>
        <h1 className={styles.title}>{content.title}</h1>
        <p className={styles.description}>{content.description}</p>
        <div className={styles.list}>
          {content.links.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
