"use client";

import { useRef, useState, type FormEvent } from "react";
import { Paperclip } from "lucide-react";
import type { HOME_PAGE_SHARED_TEXT } from "@/content/homePageText";
import styles from "./ApplicationForm.module.scss";

const MAX_CV_BYTES = 15 * 1024 * 1024;
const MAX_MOTIVATION = 500;

type ApplicationFormText = typeof HOME_PAGE_SHARED_TEXT.ui.applicationForm;

interface ApplicationFormProps {
  jobSlug: string;
  jobTitle: string;
  t: ApplicationFormText;
}

export default function ApplicationForm({ jobSlug, jobTitle, t }: ApplicationFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
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
      setError(t.cvRequired);
      setLoading(false);
      return;
    }
    if (cv.size > MAX_CV_BYTES) {
      setError(t.cvTooLarge);
      setLoading(false);
      return;
    }

    fd.set("jobSlug", jobSlug);
    fd.set("jobTitle", jobTitle);

    try {
      const res = await fetch("/api/jobs/apply", {
        method: "POST",
        body: fd,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || t.genericError);
      } else {
        setSubmitted(true);
        form.reset();
        setCvName(null);
        setMotivation("");
      }
    } catch {
      setError(t.networkError);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className={styles.success}>
        <div className={styles.successIcon}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <circle cx="24" cy="24" r="24" fill="rgb(56 182 120 / 0.15)" />
            <path
              d="M15 25l6 6 12-12"
              stroke="rgb(56 182 120)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className={styles.successTitle}>{t.successTitle}</h3>
        <p className={styles.successText}>
          {t.successText}
        </p>
      </div>
    );
  }

  return (
    <>
    <header className={styles.formHeader}>
      <p className={styles.formEyebrow}>{t.eyebrow}</p>
      <h2 className={styles.formTitle}>{t.title}</h2>
      <p className={styles.formSubtitle}>
        {t.subtitle}
      </p>
    </header>
    <form ref={formRef} className={styles.form} onSubmit={handleSubmit}>
      <input
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className={styles.honeypot}
        aria-hidden="true"
      />

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="apply-name">
            {t.nameLabel}
          </label>
          <input
            className={styles.input}
            id="apply-name"
            name="name"
            type="text"
            required
            placeholder={t.namePlaceholder}
            maxLength={200}
            autoComplete="name"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="apply-email">
            {t.emailLabel}
          </label>
          <input
            className={styles.input}
            id="apply-email"
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
        <label className={styles.label} htmlFor="apply-phone">
          {t.phoneLabel}
        </label>
        <input
          className={styles.input}
          id="apply-phone"
          name="phone"
          type="tel"
          placeholder={t.phonePlaceholder}
          maxLength={30}
          autoComplete="tel"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="apply-motivation">
          {t.motivationLabel}{" "}
          <span className={styles.charCount}>
            {motivationRemaining} {t.charsRemaining}
          </span>
        </label>
        <textarea
          className={styles.textarea}
          id="apply-motivation"
          name="motivation"
          required
          rows={5}
          maxLength={MAX_MOTIVATION}
          placeholder={t.motivationPlaceholder}
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="apply-cv">
          {t.cvLabel}
        </label>
        <label htmlFor="apply-cv" className={styles.fileInput}>
          <Paperclip size={16} aria-hidden="true" />
          <span className={styles.fileLabel}>
            {cvName ?? t.cvChoose}
          </span>
        </label>
        <input
          id="apply-cv"
          name="cv"
          type="file"
          accept="application/pdf,.pdf"
          required
          className={styles.fileNative}
          onChange={(e) => {
            const f = e.target.files?.[0];
            setCvName(f ? f.name : null);
          }}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.submit} type="submit" disabled={loading}>
        {loading ? <span className={styles.spinner} /> : t.submit}
      </button>

      <p className={styles.fineprint}>
        {t.fineprint}
      </p>
    </form>
    </>
  );
}
