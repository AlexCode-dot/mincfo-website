"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";

type BackButtonProps = {
  returnTo?: string | null;
};

export default function BackButton({ returnTo }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
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
