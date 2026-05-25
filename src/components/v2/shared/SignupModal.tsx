"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import "../styles/auth.css";

interface SignupModalProps {
  open: boolean;
  onClose: () => void;
}

// Copy mirrors main's shared.signup (hardcoded — not Sanity-wired in v2).
const T = {
  title: "Skapa konto",
  subtitle:
    "Fyll i dina uppgifter så skapar vi ett konto åt dig. Vi skickar en inbjudan till din e-post så snart vi kan.",
  companyLabel: "Företagsnamn",
  companyPlaceholder: "Företagsnamn",
  orgNrLabel: "Organisationsnummer",
  orgNrPlaceholder: "XXXXXX-XXXX",
  nameLabel: "Kontaktperson",
  namePlaceholder: "Förnamn Efternamn",
  emailLabel: "E-post",
  emailPlaceholder: "namn@företag.se",
  phoneLabel: "Telefon",
  phonePlaceholder: "07X-XXX XX XX",
  consentBefore: "Jag godkänner ",
  consentLinkText: "villkoren",
  consentLinkHref: "/terms",
  consentAfter:
    " och att MinCFO lagrar mina uppgifter för att hantera mitt konto.",
  submitLabel: "Skapa konto",
  successTitle: "Tack!",
  successText: "Vi skickar en inbjudan till din e-post så snart vi kan.",
  successClose: "Stäng",
  closeAria: "Stäng",
};

export default function SignupModal({ open, onClose }: SignupModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
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
        "Kunde inte nå servern. Kontrollera din anslutning och försök igen."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setSubmitted(false);
    setError(null);
    onClose();
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="auth-overlay">
      <div className="auth-backdrop" onClick={handleClose} />

      <div
        className="auth-modal auth-modal--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="signup-modal-title"
      >
        <button
          className="auth-modal-close"
          onClick={handleClose}
          aria-label={T.closeAria}
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              d="M4 4l8 8M12 4l-8 8"
            />
          </svg>
        </button>

        {submitted ? (
          <div className="auth-success" role="status">
            <span className="auth-success-badge" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 22 22">
                <path
                  stroke="currentColor"
                  strokeWidth="1.6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 11.5l3.2 3L16 8"
                />
              </svg>
            </span>
            <h2 className="auth-success-title serif-h">{T.successTitle}</h2>
            <p className="auth-success-text">{T.successText}</p>
            <button type="button" className="auth-submit" onClick={handleClose}>
              {T.successClose}
            </button>
          </div>
        ) : (
          <>
            <header className="auth-modal-head">
              <span className="auth-modal-brand">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 18 18"
                  aria-hidden="true"
                >
                  <path
                    d="M9 1L2 4v5c0 4 3 7 7 8 4-1 7-4 7-8V4l-7-3z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    fill="none"
                    strokeLinejoin="round"
                  />
                </svg>
                Säkert konto
              </span>
              <h2 id="signup-modal-title" className="auth-modal-title serif-h">
                {T.title}
              </h2>
              <p className="auth-modal-sub">{T.subtitle}</p>
            </header>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-field">
                <label htmlFor="signup-company">{T.companyLabel}</label>
                <input
                  id="signup-company"
                  name="company"
                  type="text"
                  placeholder={T.companyPlaceholder}
                  autoComplete="organization"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="signup-orgnr">{T.orgNrLabel}</label>
                <input
                  id="signup-orgnr"
                  name="orgNr"
                  type="text"
                  placeholder={T.orgNrPlaceholder}
                  inputMode="numeric"
                  required
                />
              </div>

              <div className="auth-field-row">
                <div className="auth-field">
                  <label htmlFor="signup-name">{T.nameLabel}</label>
                  <input
                    id="signup-name"
                    name="name"
                    type="text"
                    placeholder={T.namePlaceholder}
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="signup-email">{T.emailLabel}</label>
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder={T.emailPlaceholder}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="signup-phone">{T.phoneLabel}</label>
                <input
                  id="signup-phone"
                  name="phone"
                  type="tel"
                  placeholder={T.phonePlaceholder}
                  autoComplete="tel"
                  required
                />
              </div>

              <label className="auth-terms" htmlFor="signup-terms">
                <input id="signup-terms" type="checkbox" required />
                <span>
                  {T.consentBefore}
                  <a href={T.consentLinkHref}>{T.consentLinkText}</a>
                  {T.consentAfter}
                </span>
              </label>

              {error && <p className="auth-error">{error}</p>}

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? "Skickar…" : T.submitLabel}
                {!loading && (
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                    <path
                      stroke="currentColor"
                      strokeWidth="1.4"
                      fill="none"
                      d="M3 6h6m0 0L6.5 3.5M9 6L6.5 8.5"
                    />
                  </svg>
                )}
              </button>

              <div className="auth-fine">
                <span>14 dagar gratis</span>
                <span>Avsluta när som helst</span>
                <span>Data inom EU</span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
