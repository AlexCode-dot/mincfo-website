"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearContactReturnLocation, readContactReturnLocation } from "@/components/system/contactReturn";
import styles from "./page.module.scss";

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    const returnTarget = readContactReturnLocation();
    if (returnTarget) {
      window.location.href = returnTarget.path;
      return;
    }

    if (window.history.length > 1) {
      clearContactReturnLocation();
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
