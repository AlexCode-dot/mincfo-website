"use client";

import { usePathname } from "next/navigation";
import { LOCALES, type Locale } from "./locale";
import { useLocale } from "./LocaleProvider";
import styles from "./LanguageSwitch.module.scss";

const LABELS: Record<Locale, string> = {
  sv: "SV",
  en: "EN",
};

const ARIA: Record<Locale, string> = {
  sv: "Byt till svenska",
  en: "Switch to English",
};

export default function LanguageSwitch() {
  const { locale, setLocale, isPending } = useLocale();
  const pathname = usePathname();

  // The site language switch is irrelevant inside Sanity Studio and would
  // overlap its UI (e.g. the Publish button), so hide it there.
  if (pathname?.startsWith("/studio")) return null;

  return (
    <div
      className={styles.shell}
      data-pending={isPending}
      data-active={locale}
      role="group"
      aria-label="Language / Språk"
    >
      <span className={styles.thumb} aria-hidden="true" />
      {LOCALES.map((option) => {
        const isActive = option === locale;
        return (
          <button
            key={option}
            type="button"
            className={`${styles.option} ${isActive ? styles.active : ""}`}
            aria-pressed={isActive}
            aria-label={ARIA[option]}
            disabled={isActive}
            onClick={() => setLocale(option)}
          >
            {LABELS[option]}
          </button>
        );
      })}
    </div>
  );
}
