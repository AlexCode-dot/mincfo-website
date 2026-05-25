"use client";

import { useState, type FormEvent } from "react";

const MAX_CV_BYTES = 15 * 1024 * 1024;
const MAX_MOTIVATION = 500;

interface ApplicationFormProps {
  jobSlug: string;
  jobTitle: string;
}

export default function ApplicationForm({ jobSlug, jobTitle }: ApplicationFormProps) {
  const [cvName, setCvName] = useState<string | null>(null);
  const [motivation, setMotivation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const motivationRemaining = MAX_MOTIVATION - motivation.length;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    const cv = fd.get("cv");
    if (!(cv instanceof File) || cv.size === 0) {
      setError("Välj en CV-fil (PDF).");
      setLoading(false);
      return;
    }
    if (cv.size > MAX_CV_BYTES) {
      setError("CV:t får vara max 15 MB.");
      setLoading(false);
      return;
    }

    fd.set("jobSlug", jobSlug);
    fd.set("jobTitle", jobTitle);

    try {
      const res = await fetch("/api/jobs/apply", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || "Något gick fel. Försök igen.");
      } else {
        setSubmitted(true);
        form.reset();
        setCvName(null);
        setMotivation("");
      }
    } catch {
      setError(
        "Kunde inte nå servern. Kontrollera din anslutning och försök igen."
      );
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="car-success">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="24" fill="rgb(79 138 74 / 0.15)" />
          <path
            d="M15 25l6 6 12-12"
            stroke="rgb(79 138 74)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3 className="car-success-title serif-h">Tack för din ansökan!</h3>
        <p className="car-success-text">
          Vi har tagit emot din ansökan och hör av oss så snart vi har gått
          igenom den.
        </p>
      </div>
    );
  }

  return (
    <>
      <header className="car-form-head">
        <p className="eyebrow">Ansökan</p>
        <h2 className="car-form-title serif-h">Skicka in din ansökan</h2>
        <p className="car-form-sub">
          Bifoga ditt CV och berätta i max 500 tecken varför just du ska ha
          rollen. Din ansökan skickas direkt till Victor på MinCFO.
        </p>
      </header>

      <form className="car-form" onSubmit={handleSubmit}>
        <input
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          className="car-honeypot"
          aria-hidden="true"
        />

        <div className="car-form-row">
          <div className="car-field">
            <label className="car-label" htmlFor="apply-name">
              Namn
            </label>
            <input
              className="car-input"
              id="apply-name"
              name="name"
              type="text"
              required
              placeholder="För- och efternamn"
              maxLength={200}
              autoComplete="name"
            />
          </div>
          <div className="car-field">
            <label className="car-label" htmlFor="apply-email">
              E-post
            </label>
            <input
              className="car-input"
              id="apply-email"
              name="email"
              type="email"
              required
              placeholder="din@email.se"
              maxLength={200}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="car-field">
          <label className="car-label" htmlFor="apply-phone">
            Telefon
          </label>
          <input
            className="car-input"
            id="apply-phone"
            name="phone"
            type="tel"
            placeholder="+46 70 123 45 67"
            maxLength={30}
            autoComplete="tel"
          />
        </div>

        <div className="car-field">
          <label className="car-label" htmlFor="apply-motivation">
            Varför ska just du ha rollen?{" "}
            <span className="car-char">{motivationRemaining} tecken kvar</span>
          </label>
          <textarea
            className="car-textarea"
            id="apply-motivation"
            name="motivation"
            required
            rows={5}
            maxLength={MAX_MOTIVATION}
            placeholder="Berätta kort vad du tar med dig och varför du passar."
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
          />
        </div>

        <div className="car-field">
          <label className="car-label" htmlFor="apply-cv">
            CV (PDF, max 15 MB)
          </label>
          <label htmlFor="apply-cv" className="car-file">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{cvName ?? "Välj fil..."}</span>
          </label>
          <input
            id="apply-cv"
            name="cv"
            type="file"
            accept="application/pdf,.pdf"
            required
            className="car-file-native"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setCvName(f ? f.name : null);
            }}
          />
        </div>

        {error && <p className="car-error">{error}</p>}

        <button className="car-submit" type="submit" disabled={loading}>
          {loading ? <span className="car-spinner" /> : "Skicka ansökan"}
        </button>

        <p className="car-fineprint">
          Genom att skicka in samtycker du till att MinCFO hanterar din ansökan
          för rekryteringsändamål.
        </p>
      </form>
    </>
  );
}
