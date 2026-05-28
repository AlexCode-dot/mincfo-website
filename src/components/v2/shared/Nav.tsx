"use client";

import { useEffect, useState } from "react";
import BrandMark from "./BrandMark";
import LoginChooserModal from "./LoginChooserModal";
import SignupModal from "./SignupModal";

const APP_LOGIN_URL =
  process.env.NEXT_PUBLIC_APP_LOGIN_URL ?? "https://app.mincfo.com/login";

export default function Nav() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const handleLogin = () => {
    setLoginOpen(false);
    if (typeof window !== "undefined") {
      window.location.href = APP_LOGIN_URL;
    }
  };

  const handleSignup = () => {
    setLoginOpen(false);
    setSignupOpen(true);
  };

  useEffect(() => {
    const megas = Array.from(
      document.querySelectorAll<HTMLElement>("[data-mega]")
    );
    if (!megas.length) return;
    const cleanups: Array<() => void> = [];

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
      cleanups.push(() => {
        mega.removeEventListener("mouseenter", openSoon);
        mega.removeEventListener("mouseleave", closeSoon);
        panel.removeEventListener("mouseenter", onPanelEnter);
        trigger.removeEventListener("click", onTrigger);
        trigger.removeEventListener("focus", openSoon);
      });
      return inst;
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") instances.forEach((inst) => inst.setOpen(false));
    };
    const onDocClick = (e: MouseEvent) => {
      const inside = megas.some((m) => m.contains(e.target as Node));
      if (!inside) instances.forEach((inst) => inst.setOpen(false));
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onDocClick);
    cleanups.push(() => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onDocClick);
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <>
    <nav className="nav">
      <div className="container nav-inner">
        <a className="brand" href="/">
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
              <div className="mega-grid mega-grid--produkter">
                <div className="mega-intro">
                  <div className="mega-prompt">
                    Hur vill ni jobba med ekonomin?
                  </div>
                  <p className="mega-intro-sub">
                    Två sätt att lägga över ekonomin på MinCFO — välj det
                    som passar er.
                  </p>
                  <div className="mega-intro-foot">
                    <span className="mega-intro-q">
                      Osäker på vad som passar er? Vi går igenom upplägget på
                      30 min.
                    </span>
                    <a className="btn" href="/boka-samtal">
                      Boka demo
                    </a>
                  </div>
                </div>
                <div className="mega-feature-cards">
                  <a
                    className="mega-feature"
                    href="/produkter/helhetslosningen"
                  >
                    <div className="mega-feature-img">
                      <img
                        src="/v2/assets/workspace-photo.png"
                        alt="Ekonomiteam som driver bolagets siffror"
                      />
                    </div>
                    <div className="mega-feature-body">
                      <div className="mega-feature-t">Helhetslösning</div>
                      <div className="mega-feature-tag">
                        Vi blir er ekonomifunktion. Ett team, ett paket — fast
                        pris.
                      </div>
                      <div className="mega-feature-b">
                        Personlig controller + CFO on demand, redovisning och
                        realtidsinsyn — allt ingår.
                      </div>
                      <span className="mega-feature-cta">
                        Läs mer om helhetslösningen
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          aria-hidden="true"
                        >
                          <path
                            stroke="currentColor"
                            strokeWidth="1.4"
                            fill="none"
                            d="M2 5h6m-2.5-2.5L8 5l-2.5 2.5"
                          />
                        </svg>
                      </span>
                    </div>
                  </a>
                  <a className="mega-feature" href="/produkter/plattform">
                    <div className="mega-feature-img mega-feature-dash">
                      <span className="mega-dash-shot">
                        <img
                          src="/v2/assets/pillars/dashboard.webp"
                          alt="MinCFO-plattformens Investor Board med Revenue Quarterly vs LY och KPI:er"
                        />
                      </span>
                      <span className="mega-dash-pl">
                        <img
                          src="/v2/assets/pillars/pl-table.webp"
                          alt="P&L-rapport i MinCFO med avvikelse-kolumner"
                        />
                      </span>
                      <div
                        className="mega-dash-copilot pv pv--copilot pv--copilot-phase-done"
                        aria-hidden="true"
                      >
                        <div className="pv-cfo-head">
                          <span className="pv-logo" aria-hidden="true">
                            <BrandMark />
                          </span>
                          <span className="pv-cfo-title">AI CFO-assistent</span>
                        </div>
                        <div className="pv-cfo-msg pv-cfo-msg--user">
                          <span className="pv-cfo-bubble">
                            Hur ser vår runway ut?
                          </span>
                          <span className="pv-cfo-avatar" aria-hidden="true">
                            A
                          </span>
                        </div>
                        <div className="pv-cfo-thinking">
                          <span className="pv-cfo-spinner" aria-hidden="true" />
                          Tänkte i 9 sekunder
                        </div>
                        <p className="pv-cfo-answer">
                          Baserat på Q1 2026 har ni cirka{" "}
                          <strong>11,4 månader runway</strong> (kassa 1 696 581
                          kr, snittburn −148 700 kr/mån).
                        </p>
                      </div>
                    </div>
                    <div className="mega-feature-body">
                      <div className="mega-feature-t">Plattform</div>
                      <div className="mega-feature-tag">
                        För team som driver ekonomin själva — men vill ha
                        modernt beslutsstöd.
                      </div>
                      <div className="mega-feature-b">
                        Realtidsdashboards, forecast och AI Copilot — kopplat
                        till er faktiska data.
                      </div>
                      <span className="mega-feature-cta">
                        Utforska plattformen
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          aria-hidden="true"
                        >
                          <path
                            stroke="currentColor"
                            strokeWidth="1.4"
                            fill="none"
                            d="M2 5h6m-2.5-2.5L8 5l-2.5 2.5"
                          />
                        </svg>
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <a className="nav-link" href="/#kundcase">
            Kundcase
          </a>
          <a className="nav-link" href="/blogg">
            Blogg
          </a>
          <a className="nav-link" href="/karriar">
            Karriär
          </a>
        </div>
        <div className="nav-end">
          <button
            className="signin"
            type="button"
            onClick={() => setLoginOpen(true)}
          >
            Logga in
          </button>
          <a className="btn" href="/boka-samtal">
            Boka demo
          </a>
        </div>
      </div>
    </nav>
    <LoginChooserModal
      open={loginOpen}
      onClose={() => setLoginOpen(false)}
      onLogin={handleLogin}
      onSignup={handleSignup}
    />
    <SignupModal open={signupOpen} onClose={() => setSignupOpen(false)} />
    </>
  );
}
