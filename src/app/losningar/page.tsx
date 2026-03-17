import Link from "next/link";
import { HOME_PAGE_SHARED_TEXT } from "@/content/homePageText";
import { SOLUTION_SHARED_CONTENT } from "@/content/solutionSharedContent";
import styles from "./solutions.module.scss";

const LINKS = HOME_PAGE_SHARED_TEXT.navigation.groups.flatMap((group) => group.items);

export default function LosningarIndexPage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <Link className={styles.back} href="/">
          {SOLUTION_SHARED_CONTENT.indexPage.backLabel}
        </Link>
        <h1 className={styles.title}>{SOLUTION_SHARED_CONTENT.indexPage.title}</h1>
        <p className={styles.description}>
          {SOLUTION_SHARED_CONTENT.indexPage.description}
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
