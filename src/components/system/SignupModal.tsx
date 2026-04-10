"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import styles from "./SignupModal.module.scss";

export interface SignupContent {
  title: string;
  subtitle: string;
  companyLabel: string;
  companyPlaceholder: string;
  orgNrLabel: string;
  orgNrPlaceholder: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  phoneOptional: string;
  consent: string;
  consentLinkText: string;
  consentLinkHref: string;
  submitLabel: string;
  successTitle: string;
  successText: string;
  successClose: string;
}

interface SignupModalProps {
  open: boolean;
  onClose: () => void;
  content: SignupContent;
}

export default function SignupModal({ open, onClose, content: t }: SignupModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const data = {
      company: (form.elements.namedItem("company") as HTMLInputElement).value,
      orgNr: (form.elements.namedItem("orgNr") as HTMLInputElement).value,
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
    };

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Något gick fel. Försök igen.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError(
        "Kunde inte nå servern. Kontrollera din anslutning och försök igen.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCloseAfterSuccess() {
    setSubmitted(false);
    setError(null);
    onClose();
  }

  // Split consent text around {villkoren} placeholder
  const consentParts = t.consent.split(`{${t.consentLinkText}}`);

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.panel}>
        <svg className={styles.logo} viewBox="0 0 50 50" aria-hidden="true">
          <g fill="currentColor">
            <path d="M0 0H24V24A24 24 0 0 1 0 0Z" />
            <path d="M25 0H50A12.5 12.5 0 0 1 25 0Z" />
            <path d="M0 26H24V50A24 24 0 0 1 0 26Z" />
            <path d="M25 26H50A12.5 12.5 0 0 1 25 26Z" />
          </g>
        </svg>

        <button
          className={styles.close}
          onClick={onClose}
          aria-label="Stäng"
          type="button"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle
                  cx="24"
                  cy="24"
                  r="24"
                  fill="rgb(56 182 120 / 0.15)"
                />
                <path
                  d="M15 25l6 6 12-12"
                  stroke="rgb(56 182 120)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className={styles.successTitle}>{t.successTitle}</h2>
            <p className={styles.successText}>{t.successText}</p>
            <button
              className={styles.successClose}
              onClick={handleCloseAfterSuccess}
              type="button"
            >
              {t.successClose}
            </button>
          </div>
        ) : (
          <>
            <header className={styles.header}>
              <h2 className={styles.title}>{t.title}</h2>
              <p className={styles.subtitle}>{t.subtitle}</p>
            </header>

            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                className={styles.honeypot}
                aria-hidden="true"
              />
              <div className={styles.field}>
                <label className={styles.label} htmlFor="signup-company">
                  {t.companyLabel}
                </label>
                <input
                  className={styles.input}
                  id="signup-company"
                  name="company"
                  type="text"
                  required
                  placeholder={t.companyPlaceholder}
                  maxLength={200}
                  autoComplete="organization"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="signup-orgNr">
                  {t.orgNrLabel}
                </label>
                <input
                  className={styles.input}
                  id="signup-orgNr"
                  name="orgNr"
                  type="text"
                  required
                  placeholder={t.orgNrPlaceholder}
                  pattern="\d{6}-?\d{4}"
                  title="Ange organisationsnummer i formatet XXXXXX-XXXX"
                  autoComplete="off"
                />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="signup-name">
                    {t.nameLabel}
                  </label>
                  <input
                    className={styles.input}
                    id="signup-name"
                    name="name"
                    type="text"
                    required
                    placeholder={t.namePlaceholder}
                    maxLength={200}
                    autoComplete="name"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="signup-email">
                    {t.emailLabel}
                  </label>
                  <input
                    className={styles.input}
                    id="signup-email"
                    name="email"
                    type="email"
                    required
                    placeholder={t.emailPlaceholder}
                    maxLength={200}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="signup-phone">
                  {t.phoneLabel}{" "}
                  <span className={styles.optional}>{t.phoneOptional}</span>
                </label>
                <input
                  className={styles.input}
                  id="signup-phone"
                  name="phone"
                  type="tel"
                  placeholder={t.phonePlaceholder}
                  maxLength={30}
                  autoComplete="tel"
                />
              </div>

              <div className={styles.checkField}>
                <input
                  className={styles.checkbox}
                  id="signup-consent"
                  name="consent"
                  type="checkbox"
                  required
                />
                <label
                  className={styles.checkLabel}
                  htmlFor="signup-consent"
                >
                  {consentParts[0]}
                  <a href={t.consentLinkHref} className={styles.termsLink}>
                    {t.consentLinkText}
                  </a>
                  {consentParts[1]}
                </label>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button
                className={styles.submit}
                type="submit"
                disabled={loading}
              >
                {loading ? <span className={styles.spinner} /> : t.submitLabel}
              </button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
