"use client";

import { useEffect } from "react";
import BrandMark from "./BrandMark";

export default function Nav() {
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
              <div className="mega-grid mega-grid--cats-only">
                <div className="mega-cats">
                  <a
                    className="mega-cat mega-cat--pitch"
                    href="/produkter/helhetslosningen"
                  >
                    <div className="mega-pitch-img">
                      <img
                        src="/v2/assets/workspace-photo.png"
                        alt="Ekonomiteam som driver bolagets siffror"
                      />
                    </div>
                    <div className="mega-cat-l">Helhetslösning</div>
                    <div className="mega-cat-d">
                      Vi blir er ekonomifunktion. Ett team, ett paket — fast
                      pris.
                    </div>
                    <ul className="mega-pitch-bullets">
                      <li>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          aria-hidden="true"
                        >
                          <path
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            d="M2.5 7.5l3 3 6-6.5"
                          />
                        </svg>
                        <span>Personlig controller + CFO on demand</span>
                      </li>
                      <li>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          aria-hidden="true"
                        >
                          <path
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            d="M2.5 7.5l3 3 6-6.5"
                          />
                        </svg>
                        <span>Redovisning, lön och bokslut ingår</span>
                      </li>
                      <li>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          aria-hidden="true"
                        >
                          <path
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            d="M2.5 7.5l3 3 6-6.5"
                          />
                        </svg>
                        <span>Realtidsinsyn i KPI:er och cashflow</span>
                      </li>
                      <li>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          aria-hidden="true"
                        >
                          <path
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            d="M2.5 7.5l3 3 6-6.5"
                          />
                        </svg>
                        <span>Avvikelser flaggas med tydliga nästa steg</span>
                      </li>
                    </ul>
                    <span className="mega-pitch-cta">
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
                  </a>
                  <a
                    className="mega-cat mega-cat--pitch"
                    href="/produkter/plattform"
                  >
                    <div className="mega-pitch-img">
                      <img
                        src="/v2/assets/feat-rapportering.png"
                        alt="Realtidsdashboards i MinCFO-plattformen"
                      />
                    </div>
                    <div className="mega-cat-l">Plattform</div>
                    <div className="mega-cat-d">
                      För team som driver ekonomin själva — men vill ha
                      modernt beslutsstöd.
                    </div>
                    <ul className="mega-pitch-bullets">
                      <li>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          aria-hidden="true"
                        >
                          <path
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            d="M2.5 7.5l3 3 6-6.5"
                          />
                        </svg>
                        <span>Dashboards i realtid för KPI och likviditet</span>
                      </li>
                      <li>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          aria-hidden="true"
                        >
                          <path
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            d="M2.5 7.5l3 3 6-6.5"
                          />
                        </svg>
                        <span>Budget, forecast och scenarier ni styr</span>
                      </li>
                      <li>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          aria-hidden="true"
                        >
                          <path
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            d="M2.5 7.5l3 3 6-6.5"
                          />
                        </svg>
                        <span>AI Copilot grundad i er faktiska data</span>
                      </li>
                      <li>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          aria-hidden="true"
                        >
                          <path
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            d="M2.5 7.5l3 3 6-6.5"
                          />
                        </svg>
                        <span>Fortnox idag — fler integrationer på väg</span>
                      </li>
                    </ul>
                    <span className="mega-pitch-cta">
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
                  </a>
                </div>
                <div className="mega-footer">
                  <div className="mega-footer-q">
                    Osäker på vad som passar er?{" "}
                    <em>Vi går igenom upplägget på 30 min.</em>
                  </div>
                  <div className="mega-footer-links">
                    <a className="btn" href="/#demo">
                      Boka samtal
                    </a>
                  </div>
                </div>
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
                      <a className="mega-item" href="/losningar/ceo-founders">
                        <div className="mega-item-t">CEO &amp; Founders</div>
                        <div className="mega-item-b">
                          Beslutsunderlag utan en intern finance-funktion.
                        </div>
                      </a>
                      <a className="mega-item" href="/losningar/cfo-finance">
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
                      <a className="mega-item" href="/losningar/saas-tech">
                        <div className="mega-item-t">SaaS / Tech</div>
                        <div className="mega-item-b">
                          Runway, MRR och scenarier i realtid.
                        </div>
                      </a>
                      <a className="mega-item" href="/losningar/konsult-tjanster">
                        <div className="mega-item-t">Konsult &amp; Tjänster</div>
                        <div className="mega-item-b">
                          Beläggning, marginal och kassaflöde.
                        </div>
                      </a>
                      <a className="mega-item" href="/losningar/ehandel">
                        <div className="mega-item-t">E-handel</div>
                        <div className="mega-item-b">
                          Marginaler, lager och likviditet.
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
                <a className="mega-feature" href="/#losningar">
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
          <a className="nav-link" href="/#kundcase">
            Kundcase
          </a>
          <a className="nav-link" href="/#blogg">
            Blogg
          </a>
        </div>
        <div className="nav-end">
          <a className="signin" href="#login">
            Logga in
          </a>
          <a className="btn" href="/#demo">
            Boka samtal
          </a>
        </div>
      </div>
    </nav>
  );
}
