"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";

interface BackButtonProps {
  href?: string;
}

export default function BackButton({ href = "/" }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(href);
  };

  return (
    <button type="button" className={styles.backButton} onClick={handleBack}>
      <ArrowLeft size={16} aria-hidden="true" />
      Tillbaka
    </button>
  );
}
