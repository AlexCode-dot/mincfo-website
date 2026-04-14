"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearContactReturnLocation, readContactReturnLocation } from "@/components/system/contactReturn";
import styles from "./page.module.scss";

interface BackButtonProps {
  href?: string;
}

export default function BackButton({ href }: BackButtonProps = {}) {
  const router = useRouter();

  const handleBack = () => {
    if (href) {
      clearContactReturnLocation();
      if (window.history.length > 1) {
        router.back();
        return;
      }
      router.push(href);
      return;
    }

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
