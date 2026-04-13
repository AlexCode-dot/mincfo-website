"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, LogIn, UserPlus, X } from "lucide-react";
import styles from "./LoginChooserModal.module.scss";

export interface LoginChooserContent {
  title: string;
  subtitle: string;
  loginLabel: string;
  loginSublabel: string;
  signupLabel: string;
  signupSublabel: string;
  closeAria: string;
}

interface LoginChooserModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSignup: () => void;
  content: LoginChooserContent;
}

export default function LoginChooserModal({
  open,
  onClose,
  onLogin,
  onSignup,
  content: t,
}: LoginChooserModalProps) {
  useEffect(() => {
    if (!open) return;
    const preventScroll = (e: Event) => e.preventDefault();
    document.addEventListener("wheel", preventScroll, { passive: false });
    document.addEventListener("touchmove", preventScroll, { passive: false });
    return () => {
      document.removeEventListener("wheel", preventScroll);
      document.removeEventListener("touchmove", preventScroll);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="login-chooser-title">
        <button
          className={styles.close}
          onClick={onClose}
          aria-label={t.closeAria}
          type="button"
        >
          <X size={18} />
        </button>

        <header className={styles.header}>
          <h2 id="login-chooser-title" className={styles.title}>{t.title}</h2>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </header>

        <div className={styles.choices}>
          <button type="button" className={styles.choice} onClick={onLogin}>
            <span className={styles.choiceIcon}>
              <LogIn size={18} aria-hidden="true" />
            </span>
            <span className={styles.choiceText}>
              <span className={styles.choiceLabel}>{t.loginLabel}</span>
              <span className={styles.choiceSublabel}>{t.loginSublabel}</span>
            </span>
            <ArrowRight size={16} aria-hidden="true" className={styles.choiceArrow} />
          </button>

          <button type="button" className={styles.choice} onClick={onSignup}>
            <span className={styles.choiceIcon}>
              <UserPlus size={18} aria-hidden="true" />
            </span>
            <span className={styles.choiceText}>
              <span className={styles.choiceLabel}>{t.signupLabel}</span>
              <span className={styles.choiceSublabel}>{t.signupSublabel}</span>
            </span>
            <ArrowRight size={16} aria-hidden="true" className={styles.choiceArrow} />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
