import Link from "next/link";
import { getSharedText } from "@/content/homePageText";
import { getSolutionSharedContent } from "@/content/solutionSharedContent";
import { getLocale } from "@/i18n/server";
import styles from "./solutions.module.scss";

export default async function LosningarIndexPage() {
  const locale = await getLocale();
  const shared = getSolutionSharedContent(locale);
  const links = getSharedText(locale).navigation.groups.flatMap((group) => group.items);
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <Link className={styles.back} href="/">
          {shared.indexPage.backLabel}
        </Link>
        <h1 className={styles.title}>{shared.indexPage.title}</h1>
        <p className={styles.description}>
          {shared.indexPage.description}
        </p>
        <div className={styles.list}>
          {links.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
