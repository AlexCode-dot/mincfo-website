"use client";

import { useState } from "react";
import "../mincfo-landing.css";
import "../styles/auth.css";
import BrandMark from "../shared/BrandMark";
import Nav from "../shared/Nav";
import Footer from "../shared/Footer";

export default function LoginPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mv2-root hl-1 vs-1 type-sumary">
      <Nav />

      <section className="auth-section">
        <div className="container">
          <div className="auth-card">
            <div className="auth-head">
              <span className="auth-brand">
                <BrandMark />
                Säkert konto
              </span>
              <h1 className="auth-title serif-h">Välkommen tillbaka</h1>
              <p className="auth-sub">Logga in för att fortsätta</p>
            </div>

            <div className="auth-providers">
              <button type="button" className="auth-provider">
                <svg
                  className="auth-provider-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.49h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.63z"
                  />
                  <path
                    fill="#34A853"
                    d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"
                  />
                  <path
                    fill="#EA4335"
                    d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
                  />
                </svg>
                Logga in med Google
              </button>
              <button type="button" className="auth-provider">
                <svg
                  className="auth-provider-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  aria-hidden="true"
                >
                  <path fill="#F25022" d="M1 1h7.6v7.6H1z" />
                  <path fill="#7FBA00" d="M9.4 1H17v7.6H9.4z" />
                  <path fill="#00A4EF" d="M1 9.4h7.6V17H1z" />
                  <path fill="#FFB900" d="M9.4 9.4H17V17H9.4z" />
                </svg>
                Logga in med Microsoft
              </button>
            </div>

            <div className="auth-divider">
              <span>Eller</span>
            </div>

            {submitted ? (
              <div className="auth-success" role="status">
                <h2 className="auth-success-title">Det här är en demo</h2>
                <p className="auth-success-text">
                  Inloggning är inte aktiverad än. Kontakta oss så hjälper vi
                  dig in i plattformen.
                </p>
                <button
                  type="button"
                  className="auth-text-link"
                  onClick={() => setSubmitted(false)}
                >
                  Tillbaka
                </button>
              </div>
            ) : (
              <form
                className="auth-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
              >
                <div className="auth-field">
                  <label htmlFor="auth-email">Arbetsmail</label>
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="namn@företag.se"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="auth-field">
                  <div className="auth-field-row">
                    <label htmlFor="auth-password">Lösenord</label>
                    <a className="auth-forgot" href="#forgot">
                      Glömt lösenord?
                    </a>
                  </div>
                  <input
                    id="auth-password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>

                <button className="auth-submit" type="submit">
                  Logga in
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                    <path
                      stroke="currentColor"
                      strokeWidth="1.4"
                      fill="none"
                      d="M3 6h6m0 0L6.5 3.5M9 6L6.5 8.5"
                    />
                  </svg>
                </button>
              </form>
            )}

            <p className="auth-alt">
              Inget konto än? <a href="/#demo">Skapa konto</a>
            </p>
          </div>

          <div className="auth-trust">
            <span>Data inom EU</span>
            <span>GDPR-efterlevnad</span>
            <span>Krypterad inloggning</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
