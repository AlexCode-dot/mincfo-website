import type { Metadata } from "next";
import "@/components/v2/mincfo-landing.css";
import Nav from "@/components/v2/shared/Nav";
import Footer from "@/components/v2/shared/Footer";
import { getSharedText } from "@/content/homePageText";
import { getLocale } from "@/i18n/server";

const HUBSPOT_MEETINGS_URL =
  "https://meetings-eu1.hubspot.com/vpernvik/webpagelink";

// What the call covers — copy reused from existing site (Nav 30-min line,
// helhetslösningen FAQ "vi går igenom er situation, scope...", MincfoLanding
// "ni ser exakt hur er ekonomifunktion skulle se ut hos oss").
const BOKA_POINTS = [
  "30 min genomgång av upplägget",
  "Vi går igenom er situation och behov",
  "Se hur MinCFO skulle fungera för er",
];

// Same ticker logos as the solution pages.
const TICKER_LOGOS: { name: string; file: string; soft?: boolean }[] = [
  { name: "Growbit", file: "logo-growbit.svg" },
  { name: "Showcase", file: "logo-showcase.avif", soft: true },
  { name: "Lawster", file: "logo-lawster.avif" },
  { name: "Hälsa Hemma", file: "logo-h%C3%A4lsa.avif" },
  { name: "SweBal", file: "logo-swebal.avif" },
  { name: "BAM", file: "logo-bam.avif" },
  { name: "Eloize", file: "logo-eloize.avif" },
  { name: "Runway", file: "logo-runway.webp" },
  { name: "Realforce", file: "logo-realforce.avif" },
  { name: "Rossoneri", file: "logo-rossoneri.avif" },
  { name: "Qsid", file: "logo-qsid.avif" },
];

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <path
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      d="M2.5 7.5l3 3 6-6.5"
    />
  </svg>
);

export async function generateMetadata(): Promise<Metadata> {
  const c = getSharedText(await getLocale()).ui.contact;
  return {
    title: c.metaTitle,
    description: c.metaDescription,
  };
}

export default async function BokaSamtalPage() {
  const c = getSharedText(await getLocale()).ui.contact;

  return (
    <div className="mv2-root hl-1 vs-1 type-sumary">
      <Nav />

      {/* ============ BOOKING (pillar layout: copy left, calendar right) ============ */}
      <section className="section prod-pillars boka-section" id="top">
        <div className="container">
          <article className="pillar pillar--right boka-pillar">
            <div
              className="pillar-art boka-cal-art"
              aria-label={c.calendarAria}
            >
              <iframe
                className="boka-cal-embed"
                src={HUBSPOT_MEETINGS_URL}
                title={c.calendarTitle}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <div className="pillar-body">
              <div className="pillar-eyebrow">{c.eyebrow}</div>
              <h1 className="pillar-title serif-h">{c.title}</h1>
              <p className="pillar-lead">{c.subtitle}</p>

              <ul className="pillar-bullets boka-bullets">
                {BOKA_POINTS.map((p) => (
                  <li key={p}>
                    <Check />
                    {p}
                  </li>
                ))}
              </ul>

              <div className="boka-presenter">
                <span className="boka-presenter-avatar" aria-hidden="true">
                  V
                </span>
                <span className="boka-presenter-meta">
                  <span className="boka-presenter-lead">Du träffar</span>
                  <span className="boka-presenter-name">Victor Pernvik</span>
                  <span className="boka-presenter-role">MinCFO</span>
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ============ TRUST TICKER ============ */}
      <section className="prod-trust boka-trust">
        <div className="container">
          <p className="prod-trust-l">
            Betrodd av 50+ bolag som lagt ut hela sin ekonomi till MinCFO
          </p>
          <div className="kc-ticker">
            <div className="kc-track">
              {[...TICKER_LOGOS, ...TICKER_LOGOS].map((logo, i) => (
                <span
                  className={`kc-logo${logo.soft ? " soft" : ""}`}
                  key={`${logo.file}-${i}`}
                >
                  <img
                    src={`/customers/logos/${logo.file}`}
                    alt={`${logo.name} logotyp`}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
