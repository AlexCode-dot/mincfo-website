"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.scss";

export default function BackButton() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleBack = () => {
    const returnTo = searchParams.get("returnTo");
    if (returnTo) {
      window.location.href = returnTo;
      return;
    }

    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  return (
    <button type="button" className={styles.backButton} onClick={handleBack}>
      <ArrowLeft size={16} aria-hidden="true" />
      Tillbaka
    </button>
  );
}
