"use client";

import { useEffect, useState } from "react";
import "../mincfo-landing.css";
import BrandMark from "../shared/BrandMark";
import Nav from "../shared/Nav";
import Footer from "../shared/Footer";

type Preset = "default" | "midday" | "sumary";

const TICKER_LOGOS: {
  name: string;
  file: string;
  soft?: boolean;
}[] = [
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

export default function MincfoLanding() {
  const [preset] = useState<Preset>("sumary");

  useEffect(() => {
    // ----- kundcase coverflow carousel -----
    let kcCleanup = () => {};
    const shell = document.getElementById("kcShell");
    if (shell) {
      const cards = Array.from(
        shell.querySelectorAll<HTMLElement>(".kc-card")
      );
      const dotsWrap = document.getElementById("kcDots")!;
      const prev = document.getElementById("kcPrev")!;
      const next = document.getElementById("kcNext")!;
      let active = 0;
      const n = cards.length;

      cards.forEach((_, i) => {
        const d = document.createElement("button");
        d.className = "dot";
        d.setAttribute("aria-label", "Gå till omdöme " + (i + 1));
        d.addEventListener("click", () => setActive(i));
        dotsWrap.appendChild(d);
      });
      const dots = Array.from(dotsWrap.children) as HTMLElement[];

      function setActive(i: number) {
        active = ((i % n) + n) % n;
        const left = (active - 1 + n) % n;
        const right = (active + 1) % n;
        cards.forEach((c, idx) => {
          c.classList.remove("center", "left", "right", "hidden");
          if (idx === active) c.classList.add("center");
          else if (idx === left) c.classList.add("left");
          else if (idx === right) c.classList.add("right");
          else c.classList.add("hidden");
        });
        dots.forEach((d, idx) => d.classList.toggle("on", idx === active));
      }
      setActive(0);

      const onPrev = () => setActive(active - 1);
      const onNext = () => setActive(active + 1);
      prev.addEventListener("click", onPrev);
      next.addEventListener("click", onNext);

      const cardClicks: Array<() => void> = [];
      cards.forEach((c, i) => {
        const handler = () => {
          if (c.classList.contains("left") || c.classList.contains("right"))
            setActive(i);
        };
        c.addEventListener("click", handler);
        cardClicks.push(() => c.removeEventListener("click", handler));
      });

      let touchX: number | null = null;
      const onTouchStart = (e: TouchEvent) => {
        touchX = e.touches[0].clientX;
      };
      const onTouchEnd = (e: TouchEvent) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 40) setActive(active + (dx < 0 ? 1 : -1));
        touchX = null;
      };
      shell.addEventListener("touchstart", onTouchStart, { passive: true });
      shell.addEventListener("touchend", onTouchEnd);

      let timer = setInterval(() => setActive(active + 1), 5200);
      const stop = () => clearInterval(timer);
      const start = () => {
        timer = setInterval(() => setActive(active + 1), 5200);
      };
      shell.addEventListener("mouseenter", stop);
      shell.addEventListener("mouseleave", start);

      kcCleanup = () => {
        prev.removeEventListener("click", onPrev);
        next.removeEventListener("click", onNext);
        cardClicks.forEach((fn) => fn());
        shell.removeEventListener("touchstart", onTouchStart);
        shell.removeEventListener("touchend", onTouchEnd);
        shell.removeEventListener("mouseenter", stop);
        shell.removeEventListener("mouseleave", start);
        clearInterval(timer);
        dotsWrap.replaceChildren();
      };
    }

    return () => {
      kcCleanup();
    };
  }, []);

  return (
    <div
      className={`mv2-root hl-1 vs-1${
        preset === "default" ? "" : ` type-${preset}`
      }`}
    >
      <Nav />

      {/* ============ HERO ============ */}
      <section className="hero" id="top">
        <div className="hero-grid">
          <div className="hero-text">
            <div className="container">
              <h1 className="hero-title serif-h">
                Lämna över ekonomin.
                <br />
                <em>Behåll kontrollen.</em>
              </h1>
              <div className="hero-row">
                <p className="hero-sub">
                  Låt MinCFO ta fullt ansvar för redovisning, rapportering och
                  uppföljning. Ni får en helt outsourcad ekonomiavdelning där
                  vi kombinerar operativ leverans med proaktiv rådgivning i en
                  och samma plattform.
                </p>
                <a className="btn" href="/boka-samtal">
                  Boka samtal
                </a>
              </div>
            </div>
          </div>

          <div className="hero-stage">
            <div className="container">
              <div className="video-frame">
                <div className="grain"></div>
                <div className="vs-stripe">
                  <span className="vs-play-inline">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 11 11"
                      aria-hidden="true"
                    >
                      <path fill="currentColor" d="M3 1.5l7 4-7 4z" />
                    </svg>
                    Se hur det funkar
                  </span>
                  <span className="vs-meta">
                    <span>01:24</span>
                    <span>Finansiell rapport · 2025</span>
                  </span>
                </div>
                <div className="video-window" id="videoWindow">
                  <iframe
                    className="video-demo-iframe"
                    src="/v2/hero-demo.html"
                    title="MinCFO produktdemo"
                    loading="lazy"
                    allow="autoplay"
                    frameBorder="0"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="section" id="produkt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Vad ni får i helhetslösningen</span>
            <h2 className="serif-h">
              En finance as a service-lösning,{" "}
              <em>inte bara ett verktyg.</em>
            </h2>
            <p>
              MinCFO tar ansvar för det löpande ekonomiarbetet tillsammans med
              er. Ni får rapportering, struktur, uppföljning och proaktiv
              rådgivning. Plattformen blir er gemensamma single source of
              truth där ni följer upp i realtid.
            </p>
          </div>

          <div className="cards-3">
            <article className="feat-card feat-card--rapport">
              <div className="feat-art">
                <img src="/v2/assets/feat-rapportering.png" alt="Rapportering" />
              </div>
              <div className="feat-body">
                <div className="feat-eyebrow">DASHBOARD</div>
                <h3 className="feat-title">
                  Ni ser allt i realtid,{" "}
                  <em>utan att behöva driva arbetet själva.</em>
                </h3>
                <p>
                  MinCFO hanterar rapportering och uppföljning i bakgrunden. Ni
                  får en tydlig dashboard för att följa resultat, likviditet
                  och nyckeltal utan att själva behöva jaga underlag eller
                  bygga rapporter.
                </p>
              </div>
            </article>

            <article className="feat-card feat-card--copilot">
              <div className="feat-art">
                <img src="/v2/assets/feat-copilot.png" alt="AI Copilot" />
              </div>
              <div className="feat-body">
                <div className="feat-eyebrow">AI COPILOT</div>
                <h3 className="feat-title">
                  Personlig controller. <em>Med AI vid sidan.</em>
                </h3>
                <p>
                  MinCFO tar ansvar för det löpande ekonomiarbetet tillsammans
                  med er. Personlig controller/CFO on demand ovanpå plattformen
                  — inte bara en chatbot.
                </p>
              </div>
            </article>

            <article className="feat-card feat-card--forecast">
              <div className="feat-art">
                <img src="/v2/assets/feat-forecast.png" alt="P&L Budget" />
              </div>
              <div className="feat-body">
                <div className="feat-eyebrow">PLANERING &amp; JÄMFÖRELSE</div>
                <h3 className="feat-title">
                  Forecast och scenarier <em>som del av leveransen.</em>
                </h3>
                <p>
                  Ni slipper bygga upp budget- och forecastprocessen internt.
                  MinCFO hjälper er att sätta struktur, följa upp avvikelser
                  och ge rekommendationer kring nästa steg.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ============ WORKSPACE ============ */}
      <section className="workspace">
        <div className="container">
          <div className="workspace-grid">
            <div>
              <span className="eyebrow">Koppla system &amp; behörigheter</span>
              <h2 className="workspace-title">
                Kopplad till <em>Fortnox.</em>
              </h2>
              <p className="workspace-body">
                Ni ger oss åtkomst till bank, Skatteverket och Fortnox/övriga
                system. MinCFO kopplas in som er gemensamma dashboard.
              </p>
              <div style={{ height: 24 }}></div>
              <a className="text-link" href="#integrations">
                Se hur det funkar
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path
                    stroke="currentColor"
                    strokeWidth="1.4"
                    fill="none"
                    d="M2 5h6m-2.5-2.5L8 5l-2.5 2.5"
                  />
                </svg>
              </a>
            </div>

            <div className="workspace-photo">
              <img
                src="/v2/assets/workspace-photo.png"
                alt="Person vid laptop med Fortnox till MinCFO"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============ USE CASES ============ */}
      <section className="section" id="losningar">
        <div className="container">
          <div className="uc-head">
            <span className="eyebrow">Lösningar</span>
            <h2 className="uc-title serif-h">
              För bolag som vill att MinCFO tar hand om ekonomin.
            </h2>
            <p className="uc-intro">
              Ett komplett upplägg för team som vill lämna över det operativa
              arbetet och istället fokusera på tillväxt.
              <br />
              Vi driver hela ekonomiflödet proaktivt medan ni följer läget,
              KPI:er och avvikelser i realtid.
            </p>
          </div>

          <div className="uc-grid">
            <article className="uc-card">
              <div className="uc-photo">
                <img src="/v2/assets/uc-founders.png" alt="CEO & Founders" />
              </div>
              <h3 className="uc-name">CEO &amp; Founders</h3>
              <p className="uc-body">
                För ledningsteam som vill ha kontroll och beslutsunderlag utan
                att bygga upp en egen full finance-funktion internt.
              </p>
            </article>
            <article className="uc-card">
              <div className="uc-photo">
                <img src="/v2/assets/uc-cfo.png" alt="CFO & Finance Team" />
              </div>
              <h3 className="uc-name">CFO &amp; Finance Team</h3>
              <p className="uc-body">
                Lämna över det operativa ansvaret till experter som ser runt
                hörnet. Med vår helhetslösning får ni full kontroll och ett
                proaktivt beslutsstöd.
              </p>
            </article>
            <article className="uc-card">
              <div className="uc-photo">
                <img src="/v2/assets/uc-saas.png" alt="SaaS / Tech" />
              </div>
              <h3 className="uc-name">SaaS / Tech</h3>
              <p className="uc-body">
                För tillväxtbolag som vill ha en partner som driver
                ekonomistyrningen framåt. Vi sköter uppföljning och struktur, så
                att ert team kan lägga all energi på att bygga verksamheten.
              </p>
            </article>
            <article className="uc-card">
              <div className="uc-photo">
                <img src="/v2/assets/uc-ehandel.png" alt="E-handel" />
              </div>
              <h3 className="uc-name">E-handel</h3>
              <p className="uc-body">
                För e-handelsbolag som vill outsourca ekonomin utan att tappa
                greppet om marginalerna. Vi driver den löpande hanteringen
                medan ni följer lager, likviditet och lönsamhet i realtid.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ============ KUNDCASE ============ */}
      <section className="section kundcase" id="kundcase">
        <div className="container">
          <div className="kc-head">
            <span className="eyebrow">Kundcase</span>
            <h2 className="serif-h">
              Bolag som använder MinCFO som sin <em>ekonomifunktion.</em>
            </h2>
            <p className="kc-intro">
              Här är exempel på team som använder MinCFO som helhetslösning för
              att slippa driva finance internt, men ändå ha full insyn i
              resultat, cashflow och avvikelser.
            </p>
          </div>

          <div className="kc-shell" id="kcShell">
            <article className="kc-card" data-i="0">
              <div className="kc-brand">
                <img
                  className="kc-brand-logo"
                  src="/customers/logos/logo-growbit.svg"
                  alt="Growbit"
                />
              </div>
              <p className="kc-quote">
                “Med MinCFO får vi en tydlig bild av intäkter per kund och
                tjänst, kan djupdyka i månatliga kostnader per leverantör och
                prognostisera med hjälp av AI som löpande uppdaterar siffrorna
                baserat på faktiska utfall.”
              </p>
              <footer className="kc-by">
                <span className="kc-avatar-group" aria-hidden="true">
                  <span className="kc-avatar">
                    <img
                      src="/customers/testimonials/Screenshot%202026-03-18%20at%2015.21.41.png"
                      alt=""
                    />
                  </span>
                  <span className="kc-avatar">
                    <img
                      src="/customers/testimonials/Screenshot%202026-03-18%20at%2015.21.51.png"
                      alt=""
                    />
                  </span>
                </span>
                <span className="kc-by-text">
                  <div className="kc-name">
                    Max Norén &amp; Conrad Brown-Bolin
                  </div>
                  <div className="kc-role">Co-founders, Growbit</div>
                </span>
              </footer>
            </article>
            <article className="kc-card" data-i="1">
              <div className="kc-brand">
                <span className="kc-brand-frame-heysid">
                  <img
                    className="kc-brand-logo-heysid"
                    src="/customers/logos/logo-sid.png"
                    alt="Hey Sid"
                  />
                </span>
              </div>
              <p className="kc-quote">
                “Vi outsourcade hela ekonomifunktionen till MinCFO och fick mer
                tid över till kärnverksamheten. Trots att vi inte längre gör
                jobbet själva, är vår förståelse för ekonomin bättre än
                någonsin.”
              </p>
              <footer className="kc-by">
                <span className="kc-avatar">
                  <img
                    src="/customers/testimonials/logo-rikard.avif"
                    alt="Rikard Jonsson"
                  />
                </span>
                <span className="kc-by-text">
                  <div className="kc-name">Rikard Jonsson</div>
                  <div className="kc-role">VD, Hey Sid</div>
                </span>
              </footer>
            </article>
            <article className="kc-card" data-i="2">
              <div className="kc-brand">
                <img
                  className="kc-brand-logo soft"
                  src="/customers/logos/logo-showcase.avif"
                  alt="Showcase"
                />
              </div>
              <p className="kc-quote">
                “MinCFO tar ansvar för uppföljning och leverans, inte bara
                visualisering. De är proaktiva, hittar förbättringsåtgärder och
                kommer med konkreta råd innan vi ens hunnit ställa frågan. Vi har
                fått full kontroll utan att behöva lägga tiden internt.”
              </p>
              <footer className="kc-by">
                <span className="kc-avatar">
                  <img
                    src="/customers/testimonials/logo-aviv.avif"
                    alt="Aviv Fahri"
                  />
                </span>
                <span className="kc-by-text">
                  <div className="kc-name">Aviv Fahri</div>
                  <div className="kc-role">VD, Showcase</div>
                </span>
              </footer>
            </article>
            <article className="kc-card" data-i="3">
              <div className="kc-brand">
                <img
                  className="kc-brand-logo"
                  src="/customers/logos/logo-swebal.avif"
                  alt="SweBal"
                />
              </div>
              <p className="kc-quote">
                “Med MinCFO slipper vi lägga värdefull tid på rapportering,
                finansiella analyser och administration. Istället kan vi
                fokusera fullt ut på vår kärnverksamhet och projekteringen av ny
                fabrik.”
              </p>
              <footer className="kc-by">
                <span className="kc-avatar">
                  <img
                    src="/customers/testimonials/logo-joakim.avif"
                    alt="Joakim Sjöholm"
                  />
                </span>
                <span className="kc-by-text">
                  <div className="kc-name">Joakim Sjöholm</div>
                  <div className="kc-role">VD, Swebal AB</div>
                </span>
              </footer>
            </article>
            <article className="kc-card" data-i="4">
              <div className="kc-brand">
                <img
                  className="kc-brand-logo"
                  src="/customers/logos/logo-lawster.avif"
                  alt="Lawster"
                />
              </div>
              <p className="kc-quote">
                “Jag vet alltid var vi står ekonomiskt. Inga överraskningar,
                inga frågetecken. Det gör det mycket enklare att fatta beslut.”
              </p>
              <footer className="kc-by">
                <span className="kc-avatar">
                  <img
                    src="/customers/testimonials/lawster-vd.png"
                    alt="Joel Wikman"
                  />
                </span>
                <span className="kc-by-text">
                  <div className="kc-name">Joel Wikman</div>
                  <div className="kc-role">VD, Lawster</div>
                </span>
              </footer>
            </article>
            <article className="kc-card" data-i="5">
              <div className="kc-brand">
                <img
                  className="kc-brand-logo"
                  src="/customers/logos/logo-h%C3%A4lsa.avif"
                  alt="Hälsa Hemma"
                />
              </div>
              <p className="kc-quote">
                “MinCFO är ett viktigt stöd i vår tillväxt. Med över 100 löner i
                en snabbrörlig verksamhet behöver vi struktur och pålitlighet –
                vilket vi får varje månad. De avlastar det administrativa och
                levererar snabba, korrekta svar, så att vi kan fokusera på
                verksamheten.”
              </p>
              <footer className="kc-by">
                <span className="kc-avatar">
                  <img
                    src="/customers/testimonials/logo-oskar.avif"
                    alt="Oskar Nordmark"
                  />
                </span>
                <span className="kc-by-text">
                  <div className="kc-name">Oskar Nordmark</div>
                  <div className="kc-role">
                    Financial Controller, Hälsa Hemma
                  </div>
                </span>
              </footer>
            </article>
          </div>

          <div className="kc-ctrls" aria-label="Bläddra omdömen">
            <button className="kc-btn" id="kcPrev" aria-label="Föregående">
              <svg width="14" height="14" viewBox="0 0 14 14">
                <path
                  stroke="currentColor"
                  strokeWidth="1.4"
                  fill="none"
                  d="M9 2L4 7l5 5"
                />
              </svg>
            </button>
            <div className="kc-dots" id="kcDots"></div>
            <button className="kc-btn" id="kcNext" aria-label="Nästa">
              <svg width="14" height="14" viewBox="0 0 14 14">
                <path
                  stroke="currentColor"
                  strokeWidth="1.4"
                  fill="none"
                  d="M5 2l5 5-5 5"
                />
              </svg>
            </button>
          </div>

          <div className="kc-trusted">
            <p className="kc-trusted-l">
              Betrodd av 50+ företag som lagt ut hela sin ekonomi till MinCFO
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
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="final-cta" id="demo">
        <div className="container">
          <div className="final-cta-grid">
            <div>
              <span className="eyebrow">Kom igång</span>
              <h2>Redo att lämna över ekonomin?</h2>
              <p className="sub">
                Boka ett samtal så går vi igenom ert nuläge och tar fram ett
                upplägg som passar er — hur helhetslösningen fungerar och hur
                ni följer läget i plattformen i vardagen.
              </p>

              <div className="cta-lead">
                <a className="cta-lead-btn" href="/boka-samtal">
                  Boka samtal
                  <svg width="13" height="13" viewBox="0 0 12 12" aria-hidden="true">
                    <path
                      stroke="currentColor"
                      strokeWidth="1.4"
                      fill="none"
                      d="M3 6h6m0 0L6.5 3.5M9 6L6.5 8.5"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <form
              className="cta-form"
              id="ctaForm"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="cta-form-head">
                <span className="cta-form-l cta-form-l-pulse">
                  <BrandMark />
                  Testa plattformen själv
                </span>
                <span className="cta-form-meta">14 dagar gratis</span>
              </div>
              <p className="cta-form-sub">
                Skapa konto och prova MinCFO-plattformen gratis i 14 dagar —
                samma vy som våra helhetslösningskunder använder för att följa
                läget.
              </p>

              <div className="cta-field">
                <label htmlFor="cta-company">Företagsnamn</label>
                <input
                  id="cta-company"
                  type="text"
                  placeholder="Företagsnamn"
                  autoComplete="organization"
                  required
                />
              </div>

              <div className="cta-field">
                <label htmlFor="cta-orgnr">Organisationsnummer</label>
                <input
                  id="cta-orgnr"
                  type="text"
                  placeholder="XXXXXX-XXXX"
                  inputMode="numeric"
                  required
                />
              </div>

              <div className="cta-field-row">
                <div className="cta-field">
                  <label htmlFor="cta-name">Kontaktperson</label>
                  <input
                    id="cta-name"
                    type="text"
                    placeholder="Förnamn Efternamn"
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="cta-field">
                  <label htmlFor="cta-email">E-post</label>
                  <input
                    id="cta-email"
                    type="email"
                    placeholder="namn@företag.se"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="cta-field">
                <label htmlFor="cta-phone">Telefon</label>
                <input
                  id="cta-phone"
                  type="tel"
                  placeholder="07X-XXX XX XX"
                  autoComplete="tel"
                  required
                />
              </div>

              <label className="cta-terms" htmlFor="cta-terms-input">
                <input id="cta-terms-input" type="checkbox" required />
                <span>
                  Jag godkänner <a href="#villkor">villkoren</a> och att MinCFO
                  lagrar mina uppgifter för att hantera mitt konto.
                </span>
              </label>

              <button className="cta-form-submit" type="submit">
                Skapa konto
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <path
                    stroke="currentColor"
                    strokeWidth="1.4"
                    fill="none"
                    d="M3 6h6m0 0L6.5 3.5M9 6L6.5 8.5"
                  />
                </svg>
              </button>

              <div className="cta-form-trust">
                <span>14 dagar gratis</span>
                <span>Avsluta när som helst</span>
                <span>Data inom EU</span>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ============ SECURITY ============ */}
      <section className="section security" id="sakerhet">
        <div className="container">
          <div className="security-head">
            <span className="eyebrow">Säkerhet &amp; Compliance</span>
            <h2 className="serif-h">Enterprise-grade säkerhet.</h2>
            <p>
              Vi hanterar känslig finansiell data med högsta krav på säkerhet,
              integritet och efterlevnad.
            </p>
          </div>
          <div className="security-grid">
            <article className="trust-card">
              <div className="trust-badge">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M9 1L2 4v5c0 4 3 7 7 8 4-1 7-4 7-8V4l-7-3z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 9l2.2 2L12 7"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="trust-title">Dataskydd &amp; integritet</h3>
              <p className="trust-body">
                MinCFO hanterar all kunddata konfidentiellt och i enlighet med
                gällande dataskyddslagstiftning. Åtkomst är strikt begränsad
                och loggas kontinuerligt.
              </p>
            </article>
            <article className="trust-card">
              <div className="trust-badge">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle
                    cx="9"
                    cy="9"
                    r="7.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M1.5 9h15M9 1.5c2 2 3 4.5 3 7.5s-1 5.5-3 7.5M9 1.5c-2 2-3 4.5-3 7.5s1 5.5 3 7.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                </svg>
              </div>
              <h3 className="trust-title">Säker infrastruktur</h3>
              <p className="trust-body">
                Systemen är byggda med moderna säkerhetsprinciper och skyddas
                genom kryptering, övervakning och regelbundna
                säkerhetskontroller.
              </p>
            </article>
            <article className="trust-card">
              <div className="trust-badge">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect
                    x="3"
                    y="7.5"
                    width="12"
                    height="9"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M5.5 7.5V5a3.5 3.5 0 0 1 7 0v2.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                </svg>
              </div>
              <h3 className="trust-title">EU &amp; GDPR-efterlevnad</h3>
              <p className="trust-body">
                All behandling av person- och företagsdata sker i enlighet med
                GDPR. Data hanteras inom EU och enligt tydliga
                personuppgiftsbiträdesavtal.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ============ CLOSING ============ */}
      <section className="closing">
        <div className="container">
          <h2>Upptäck kraften i MinCFO.</h2>
          <p className="sub">
            Boka ett samtal och se hur vi tar fullt ägarskap för er ekonomi och
            rapportering, medan ni följer varje nyckeltal och prognos i
            realtid direkt i plattformen.
          </p>
          <div className="closing-row">
            <a className="btn" href="/boka-samtal">
              Boka samtal
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path
                  stroke="currentColor"
                  strokeWidth="1.4"
                  fill="none"
                  d="M3 6h6m0 0L6.5 3.5M9 6L6.5 8.5"
                />
              </svg>
            </a>
            <a className="btn btn-outline" href="#how">
              Se hur det funkar
            </a>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <Footer />
    </div>
  );
}
