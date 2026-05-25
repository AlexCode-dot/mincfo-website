"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import "../styles/auth.css";

interface LoginChooserModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSignup: () => void;
}

// Copy mirrors main's shared.navigation.loginChooser (hardcoded — not Sanity-wired in v2).
const T = {
  title: "Välkommen",
  subtitle: "Har du redan ett konto hos oss?",
  loginLabel: "Logga in",
  loginSublabel: "Jag är redan kund",
  signupLabel: "Skapa konto",
  signupSublabel: "Jag är ny här",
  closeAria: "Stäng",
};

export default function LoginChooserModal({
  open,
  onClose,
  onLogin,
  onSignup,
}: LoginChooserModalProps) {
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

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="auth-overlay">
      <div className="auth-backdrop" onClick={onClose} />

      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-chooser-title"
      >
        <button
          className="auth-modal-close"
          onClick={onClose}
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

        <header className="auth-modal-head">
          <span className="auth-modal-brand">
            <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden="true">
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
          <h2 id="login-chooser-title" className="auth-modal-title serif-h">
            {T.title}
          </h2>
          <p className="auth-modal-sub">{T.subtitle}</p>
        </header>

        <div className="auth-choices">
          <button type="button" className="auth-choice" onClick={onLogin}>
            <span className="auth-choice-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path
                  stroke="currentColor"
                  strokeWidth="1.4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 1.5H3a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 3 16.5h4M11 12l4-3-4-3M15 9H6"
                />
              </svg>
            </span>
            <span className="auth-choice-text">
              <span className="auth-choice-label">{T.loginLabel}</span>
              <span className="auth-choice-sub">{T.loginSublabel}</span>
            </span>
            <svg
              className="auth-choice-arrow"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              aria-hidden="true"
            >
              <path
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                d="M3 7h8m-3-3l3 3-3 3"
              />
            </svg>
          </button>

          <button type="button" className="auth-choice" onClick={onSignup}>
            <span className="auth-choice-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path
                  stroke="currentColor"
                  strokeWidth="1.4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 8.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM1.5 16c0-2.8 2.5-4.5 5.5-4.5M13 10v5M15.5 12.5h-5"
                />
              </svg>
            </span>
            <span className="auth-choice-text">
              <span className="auth-choice-label">{T.signupLabel}</span>
              <span className="auth-choice-sub">{T.signupSublabel}</span>
            </span>
            <svg
              className="auth-choice-arrow"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              aria-hidden="true"
            >
              <path
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                d="M3 7h8m-3-3l3 3-3 3"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
