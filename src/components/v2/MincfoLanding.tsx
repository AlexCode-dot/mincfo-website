"use client";

import { useEffect, useState } from "react";
import "./mincfo-landing.css";

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

const BrandMark = () => (
  <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
    <path
      fill="currentColor"
      d="M0 0h13.474v15.36C6.032 15.36 0 9.328 0 1.886V0Zm0 16.64h13.474V32C6.032 32 0 25.968 0 18.526V16.64Zm16.596 0H32v1.218a8.702 8.702 0 0 1-17.404 0V16.64Zm0-16.64H32v1.218a8.702 8.702 0 0 1-17.404 0V0Z"
    />
  </svg>
);

export default function MincfoLanding() {
  const [preset] = useState<Preset>("sumary");

  useEffect(() => {
    // ----- mega menus (Produkter, Lösningar) -----
    const megas = Array.from(
      document.querySelectorAll<HTMLElement>("[data-mega]")
    );
    const megaCleanups: Array<() => void> = [];
    if (megas.length) {
      const instances = megas.map((mega) => {
        const trigger = mega.querySelector<HTMLButtonElement>(".nav-trigger")!;
        const panel = mega.querySelector<HTMLElement>(".mega-panel")!;
        let openTimer: ReturnType<typeof setTimeout> | null = null;
        let closeTimer: ReturnType<typeof setTimeout> | null = null;
        const inst = {
          mega,
          setOpen(open: boolean) {
            trigger.setAttribute("aria-expanded", String(open));
            panel.setAttribute("aria-hidden", String(!open));
            panel.classList.toggle("open", open);
            if (open) {
              instances.forEach((other) => {
                if (other.mega !== mega) other.setOpen(false);
              });
            }
          },
        };
        function openSoon() {
          if (closeTimer) clearTimeout(closeTimer);
          if (openTimer) clearTimeout(openTimer);
          openTimer = setTimeout(() => inst.setOpen(true), 80);
        }
        function closeSoon() {
          if (openTimer) clearTimeout(openTimer);
          if (closeTimer) clearTimeout(closeTimer);
          closeTimer = setTimeout(() => inst.setOpen(false), 180);
        }
        const onTrigger = (e: Event) => {
          e.preventDefault();
          inst.setOpen(trigger.getAttribute("aria-expanded") !== "true");
        };
        const onPanelEnter = () => {
          if (closeTimer) clearTimeout(closeTimer);
        };
        mega.addEventListener("mouseenter", openSoon);
        mega.addEventListener("mouseleave", closeSoon);
        panel.addEventListener("mouseenter", onPanelEnter);
        trigger.addEventListener("click", onTrigger);
        trigger.addEventListener("focus", openSoon);
        megaCleanups.push(() => {
          mega.removeEventListener("mouseenter", openSoon);
          mega.removeEventListener("mouseleave", closeSoon);
          panel.removeEventListener("mouseenter", onPanelEnter);
          trigger.removeEventListener("click", onTrigger);
          trigger.removeEventListener("focus", openSoon);
        });
        return inst;
      });
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape")
          instances.forEach((inst) => inst.setOpen(false));
      };
      const onDocClick = (e: MouseEvent) => {
        const inside = megas.some((m) => m.contains(e.target as Node));
        if (!inside) instances.forEach((inst) => inst.setOpen(false));
      };
      document.addEventListener("keydown", onKey);
      document.addEventListener("click", onDocClick);
      megaCleanups.push(() => {
        document.removeEventListener("keydown", onKey);
        document.removeEventListener("click", onDocClick);
      });
    }

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
      megaCleanups.forEach((fn) => fn());
      kcCleanup();
    };
  }, []);

  return (
    <div
      className={`mv2-root hl-1 vs-1${
        preset === "default" ? "" : ` type-${preset}`
      }`}
    >
      {/* ============ NAV ============ */}
      <nav className="nav">
        <div className="container nav-inner">
          <a className="brand" href="#top">
            <BrandMark />
            <span className="brand-word">MinCFO</span>
          </a>
          <div className="nav-links">
            <div className="nav-mega" data-mega>
              <button
                className="nav-link nav-trigger"
                type="button"
                aria-expanded="false"
                aria-controls="megaProdukter"
              >
                Produkter
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path fill="currentColor" d="M5 7L1 3h8z" />
                </svg>
              </button>
              <div
                className="mega-panel"
                id="megaProdukter"
                role="menu"
                aria-hidden="true"
              >
                <div className="mega-grid">
                  <div className="mega-cats">
                    <div className="mega-cat">
                      <div className="mega-cat-l">Helhetslösning</div>
                      <div className="mega-cat-d">
                        Vi sköter er ekonomi end-to-end. Ni följer läget i
                        plattformen.
                      </div>
                      <div className="mega-cat-items">
                        <a className="mega-item" href="#fs-redovisning">
                          <div className="mega-item-t">Redovisning</div>
                          <div className="mega-item-b">
                            Löpande bokföring och avstämningar.
                          </div>
                        </a>
                        <a className="mega-item" href="#fs-controller">
                          <div className="mega-item-t">Controller &amp; CFO</div>
                          <div className="mega-item-b">
                            Personlig rådgivning ovanpå leveransen.
                          </div>
                        </a>
                        <a className="mega-item" href="#fs-rapportering">
                          <div className="mega-item-t">Rapportering</div>
                          <div className="mega-item-b">
                            Månads-, kvartals- och årsbokslut.
                          </div>
                        </a>
                        <a className="mega-item" href="#fs-lon">
                          <div className="mega-item-t">Lön &amp; HR</div>
                          <div className="mega-item-b">
                            Lönekörning, semester och avtal.
                          </div>
                        </a>
                      </div>
                    </div>
                    <div className="mega-cat">
                      <div className="mega-cat-l">Plattform</div>
                      <div className="mega-cat-d">
                        För team som driver ekonomin själva och vill ha modernt
                        beslutsstöd.
                      </div>
                      <div className="mega-cat-items">
                        <a className="mega-item" href="#pl-dashboards">
                          <div className="mega-item-t">Dashboards</div>
                          <div className="mega-item-b">
                            Realtidsvy över KPI:er och resultat.
                          </div>
                        </a>
                        <a className="mega-item" href="#pl-forecast">
                          <div className="mega-item-t">Prognoser</div>
                          <div className="mega-item-b">
                            Budget, forecast och scenarier.
                          </div>
                        </a>
                        <a className="mega-item" href="#pl-copilot">
                          <div className="mega-item-t">AI Copilot</div>
                          <div className="mega-item-b">
                            Ställ frågor om er ekonomi i klartext.
                          </div>
                        </a>
                        <a className="mega-item" href="#pl-integrationer">
                          <div className="mega-item-t">Integrationer</div>
                          <div className="mega-item-b">
                            Fortnox idag — fler på väg.
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                  <a className="mega-feature" href="#kundcase">
                    <div className="mega-feature-img">
                      <img src="/v2/assets/workspace-photo.png" alt="Workspace" />
                    </div>
                    <div className="mega-feature-body">
                      <div className="mega-feature-t">
                        Se hur det funkar i praktiken
                      </div>
                      <div className="mega-feature-b">
                        Boka 30 min och se exakt hur er ekonomifunktion skulle se
                        ut hos oss.
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            <div className="nav-mega" data-mega>
              <button
                className="nav-link nav-trigger"
                type="button"
                aria-expanded="false"
                aria-controls="megaLosningar"
              >
                Lösningar
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path fill="currentColor" d="M5 7L1 3h8z" />
                </svg>
              </button>
              <div
                className="mega-panel"
                id="megaLosningar"
                role="menu"
                aria-hidden="true"
              >
                <div className="mega-grid">
                  <div className="mega-cats">
                    <div className="mega-cat">
                      <div className="mega-cat-l">Efter roll</div>
                      <div className="mega-cat-d">
                        För team som vill växa utan att bygga ekonomi internt.
                      </div>
                      <div className="mega-cat-items">
                        <a className="mega-item" href="#losn-ceo">
                          <div className="mega-item-t">CEO &amp; Founders</div>
                          <div className="mega-item-b">
                            Beslutsunderlag utan en intern finance-funktion.
                          </div>
                        </a>
                        <a className="mega-item" href="#losn-cfo">
                          <div className="mega-item-t">CFO &amp; Finance Team</div>
                          <div className="mega-item-b">
                            Lämna över det operativa. Behåll strategin.
                          </div>
                        </a>
                      </div>
                    </div>
                    <div className="mega-cat">
                      <div className="mega-cat-l">Efter bransch</div>
                      <div className="mega-cat-d">
                        Anpassat upplägg för er affärsmodell.
                      </div>
                      <div className="mega-cat-items">
                        <a className="mega-item" href="#losn-saas">
                          <div className="mega-item-t">SaaS / Tech</div>
                          <div className="mega-item-b">
                            Runway, MRR och scenarier i realtid.
                          </div>
                        </a>
                        <a className="mega-item" href="#losn-konsult">
                          <div className="mega-item-t">Konsult &amp; Tjänster</div>
                          <div className="mega-item-b">
                            Beläggning, marginal och kassaflöde.
                          </div>
                        </a>
                        <a className="mega-item" href="#losn-ehandel">
                          <div className="mega-item-t">E-handel</div>
                          <div className="mega-item-b">
                            Marginaler, lager och likviditet.
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                  <a className="mega-feature" href="#losningar">
                    <div className="mega-feature-img">
                      <img
                        src="/v2/assets/uc-founders.png"
                        alt="Bolag som lämnat över ekonomin"
                      />
                    </div>
                    <div className="mega-feature-body">
                      <div className="mega-feature-t">
                        Bolag som vill växa utan att bygga ekonomi internt
                      </div>
                      <div className="mega-feature-b">
                        Se hur founders, CFOs och e-handlare jobbar med MinCFO
                        som sin ekonomifunktion.
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            <a className="nav-link" href="#kundcase">
              Kundcase
            </a>
            <a className="nav-link" href="#blogg">
              Blogg
            </a>
          </div>
          <div className="nav-end">
            <a className="signin" href="#login">
              Logga in
            </a>
            <a className="btn" href="#demo">
              Boka samtal
            </a>
          </div>
        </div>
      </nav>

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
                  MinCFO driver redovisning, rapporter och uppföljning. Ni får
                  ett realtidsläge på bolaget — och en CFO som tänker steget
                  före.
                </p>
                <a className="btn" href="#demo">
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
                    Se demo
                  </span>
                  <span className="vs-meta">
                    <span>01:24</span>
                    <span>Bolagsöversikt — april</span>
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
            <span className="eyebrow">HELHETSLÖSNINGEN</span>
            <h2 className="serif-h">
              Vi driver ekonomin. <em>Ni styr bolaget.</em>
            </h2>
            <p>
              MinCFO tar fullt ansvar för redovisning, rapportering och
              uppföljning. Ni öppnar plattformen och ser allt löpa i realtid —
              utan att jaga underlag eller bygga rapporter själva.
            </p>
          </div>

          <div className="cards-3">
            <article className="feat-card feat-card--rapport">
              <div className="feat-art">
                <img src="/v2/assets/feat-rapportering.png" alt="Rapportering" />
              </div>
              <div className="feat-body">
                <div className="feat-eyebrow">RAPPORTERING</div>
                <h3 className="feat-title">
                  Rapporterna är klara. <em>Varje månad.</em>
                </h3>
                <p>
                  Vi driver bokslut, avstämningar och uppföljning i bakgrunden.
                  Ni får en tydlig dashboard för resultat, likviditet och
                  nyckeltal — alltid live.
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
                  Fråga vad ni vill om ekonomin och få svar grundade i er
                  faktiska data. Ni har dessutom en controller och CFO on demand
                  — inte bara en chatbot.
                </p>
              </div>
            </article>

            <article className="feat-card feat-card--forecast">
              <div className="feat-art">
                <img src="/v2/assets/feat-forecast.png" alt="P&L Budget" />
              </div>
              <div className="feat-body">
                <div className="feat-eyebrow">FORECAST &amp; SCENARIER</div>
                <h3 className="feat-title">
                  Forecasts vi underhåller. <em>Scenarier ni styr.</em>
                </h3>
                <p>
                  Vi sköter strukturen för budget och forecast. Ni testar
                  antaganden, ser utfallet och får tidiga signaler innan risken
                  hinner bli ett problem.
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
              <span className="eyebrow">Setup</span>
              <h2 className="workspace-title">
                Kopplad till <em>Fortnox.</em>
              </h2>
              <p className="workspace-body">
                Ni ger oss åtkomst en gång — sen sköter vi resten. Ingen
                migrering, ingen dubbelbokföring. Ert team byter aldrig system,
                de slutar bara göra det operativa.
              </p>
              <div style={{ height: 24 }}></div>
              <a className="text-link" href="#integrations">
                Se hur kopplingen funkar
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
            <span className="eyebrow">Vem MinCFO är till för</span>
            <h2 className="uc-title serif-h">
              Bolag som vill växa utan att bygga ekonomi internt.
            </h2>
          </div>

          <div className="uc-grid">
            <article className="uc-card">
              <div className="uc-photo">
                <img src="/v2/assets/uc-founders.png" alt="CEO & Founders" />
              </div>
              <h3 className="uc-name">CEO &amp; Founders</h3>
              <p className="uc-body">
                Beslutsunderlag utan en intern finance-funktion. Ni får
                kontrollen, vi sköter motorn.
              </p>
            </article>
            <article className="uc-card">
              <div className="uc-photo">
                <img src="/v2/assets/uc-cfo.png" alt="CFO & Finance Team" />
              </div>
              <h3 className="uc-name">CFO &amp; Finance Team</h3>
              <p className="uc-body">
                Lämna över det operativa till experter som ser runt hörnet. Ni
                styr strategin.
              </p>
            </article>
            <article className="uc-card">
              <div className="uc-photo">
                <img src="/v2/assets/uc-saas.png" alt="SaaS / Tech" />
              </div>
              <h3 className="uc-name">SaaS / Tech</h3>
              <p className="uc-body">
                Vi driver ekonomistyrningen så att teamet kan lägga energin på
                att bygga produkten.
              </p>
            </article>
            <article className="uc-card">
              <div className="uc-photo">
                <img src="/v2/assets/uc-ehandel.png" alt="E-handel" />
              </div>
              <h3 className="uc-name">E-handel</h3>
              <p className="uc-body">
                Vi sköter det löpande. Ni följer marginaler, lager och
                likviditet i realtid.
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
              Bolagen som lämnat över <em>ekonomin.</em>
            </h2>
            <p className="kc-intro">
              Exempel på team som låter MinCFO sköta hela ekonomifunktionen —
              medan de fokuserar på verksamheten.
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
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="final-cta" id="demo">
        <div className="container">
          <div className="final-cta-grid">
            <div>
              <span className="eyebrow">Kom igång</span>
              <h2>Prova fritt i 14 dagar.</h2>
              <p className="sub">
                Fyll i uppgifterna så landar förfrågan hos oss direkt. Vi kollar
                igenom, kopplar er Fortnox-data och hör av oss med upplägg —
                oftast inom en arbetsdag.
              </p>

              <ol className="cta-steps">
                <li className="cta-step">
                  <span className="cta-step-n">01</span>
                  <div>
                    <div className="cta-step-t">Ni fyller i uppgifterna</div>
                    <div className="cta-step-b">
                      Företag, kontaktperson och hur ni vill bli nådda. Tar två
                      minuter.
                    </div>
                  </div>
                </li>
                <li className="cta-step">
                  <span className="cta-step-n">02</span>
                  <div>
                    <div className="cta-step-t">
                      Vi bjuder in er till plattformen
                    </div>
                    <div className="cta-step-b">
                      Vi kollar igenom, skickar inbjudan via mejl och bokar 30
                      min för upplägg.
                    </div>
                  </div>
                </li>
                <li className="cta-step">
                  <span className="cta-step-n">03</span>
                  <div>
                    <div className="cta-step-t">14 dagars kostnadsfri pilot</div>
                    <div className="cta-step-b">
                      Vi kopplar er Fortnox-data och ni ser exakt hur er
                      ekonomifunktion skulle se ut hos oss — utan åtagande.
                    </div>
                  </div>
                </li>
              </ol>

              <div className="cta-alt">
                Hellre prata först?
                <a href="#book">Boka 30 min →</a>
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
                  Skapa konto
                </span>
                <span className="cta-form-meta">Svar inom 1 arbetsdag</span>
              </div>

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
            <span className="eyebrow">Säkerhet &amp; efterlevnad</span>
            <h2 className="serif-h">Förtroende är icke-förhandlingsbart.</h2>
            <p>
              MinCFO hanterar känslig finansiell data med högsta krav på
              säkerhet, integritet och efterlevnad. Data lagras inom EU. Åtkomst
              loggas. Allt är på ert villkor.
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
              <h3 className="trust-title">Granskade säkerhetskontroller</h3>
              <p className="trust-body">
                Strukturerade kontroller för säkerhet, tillgänglighet och
                konfidentialitet. All åtkomst loggas och följs upp.
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
              <h3 className="trust-title">EU &amp; GDPR</h3>
              <p className="trust-body">
                All databehandling sker inom EU. Personuppgiftsbiträdesavtal som
                standard. Full radering på begäran.
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
              <h3 className="trust-title">Kryptering i vila &amp; transport</h3>
              <p className="trust-body">
                AES-256 i vila och TLS 1.3 i transport. Nycklar roteras
                automatiskt och loggas separat.
              </p>
            </article>
            <article className="trust-card">
              <div className="trust-badge">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M9 1l8 4v6c0 1.5-3 6-8 6S1 12.5 1 11V5l8-4z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="trust-title">ISO 27001-baserade rutiner</h3>
              <p className="trust-body">
                Vårt säkerhetsarbete följer principerna i ISO 27001 —
                riskbedömningar, incidenthantering och kontinuerlig granskning.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ============ CLOSING ============ */}
      <section className="closing">
        <div className="container">
          <h2>Redo att lämna över ekonomin?</h2>
          <p className="sub">
            Ett kort samtal räcker. Vi visar exakt hur er ekonomifunktion skulle
            se ut hos oss — och vad det skulle kosta.
          </p>
          <div className="closing-row">
            <a className="btn" href="#book">
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
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a className="brand" href="#top">
                <BrandMark />
                <span className="brand-word">MinCFO</span>
              </a>
              <p>
                Vi blir er kompletta ekonomifunktion — redovisning,
                rapportering, controlling och CFO-stöd. Ert team driver bolaget,
                vi driver ekonomin.
              </p>
            </div>
            <div className="footer-col">
              <h4>Produkt</h4>
              <ul>
                <li>
                  <a href="#plattform">Plattform</a>
                </li>
                <li>
                  <a href="#fullservice">Helhetslösning</a>
                </li>
                <li>
                  <a href="#partner">För byråer</a>
                </li>
                <li>
                  <a href="#integrations">Integrationer</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Lösningar</h4>
              <ul>
                <li>
                  <a href="#cfo">CFO &amp; Finance</a>
                </li>
                <li>
                  <a href="#founders">CEO &amp; Founders</a>
                </li>
                <li>
                  <a href="#saas">SaaS / Tech</a>
                </li>
                <li>
                  <a href="#ehandel">E-handel</a>
                </li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Bolag</h4>
              <ul>
                <li>
                  <a href="#kundcase">Kundcase</a>
                </li>
                <li>
                  <a href="#blogg">Blogg</a>
                </li>
                <li>
                  <a href="#karriar">Karriär</a>
                </li>
                <li>
                  <a href="#contact">Kontakt</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              © 2026 MinCFO Sverige AB — Västra Hamngatan 11, Göteborg · Stora
              Nygatan 33, Stockholm
            </span>
            <span>
              <a href="#linkedin">LinkedIn</a> · <a href="#terms">Villkor</a> ·{" "}
              <a href="#privacy">Integritet</a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
