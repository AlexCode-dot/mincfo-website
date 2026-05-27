import "../mincfo-landing.css";
import Nav from "../shared/Nav";
import Footer from "../shared/Footer";
import SolutionImpact from "./SolutionImpact";

// Same layout/style as the v2 solution pages (SolutionPage.tsx), but a
// self-contained partner ("För byråer") page. Copy grounded in the live
// partner.json. Does not touch solutionPagesText.json.

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

const PAINS: { title: string; body: string }[] = [
  {
    title: "Varje klient blir ett specialprojekt",
    body: "Dashboards, rapporter och uppföljning byggs från noll för varje ny klient — tid som sällan blir fakturerbar rådgivning.",
  },
  {
    title: "Manuellt arbete äter marginalen",
    body: "Rådata ska bli rådgivningsklart underlag, men för mycket tid går åt till att samla in, städa och formatera siffror.",
  },
  {
    title: "Svårt att vara proaktiv i skala",
    body: "Ju fler klienter, desto mer reaktiv blir leveransen. Att bevaka varje portfölj manuellt håller inte när ni växer.",
  },
];

const HELPS: { title: string; body: string }[] = [
  {
    title: "Ett gemensamt arbetssätt",
    body: "Standardisera dashboards, forecast och analys en gång — och rulla ut samma beprövade upplägg på varje ny klient på minuter.",
  },
  {
    title: "Proaktiva råd automatiskt",
    body: "MinCFO flaggar triggerpoints och föreslår nästa steg, och AI sköter första linjens support — så ni agerar rådgivare istället för att jaga avvikelser.",
  },
  {
    title: "Mer rådgivningstid, mindre admin",
    body: "Gå från rådata till rådgivningsklart underlag snabbare, med mindre manuellt sammanställningsarbete och mer värde per klient.",
  },
];

const IMPACT_CARDS = [
  {
    value: "5×",
    title: "Snabbare onboarding",
    description: "Standardupplägg istället för specialprojekt per klient.",
  },
  {
    value: "30-50%",
    title: "Mindre sammanställning",
    description: "Automatiserad datainsamling och rapportstruktur.",
  },
  {
    value: "1 vy",
    title: "Hela portföljen samlad",
    description: "Alla klienter, avvikelser och nästa steg på ett ställe.",
  },
  {
    value: "24/7",
    title: "AI första linjen",
    description: "Klientfrågor besvaras direkt — dygnet runt.",
  },
];

const Arrow = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
    <path
      stroke="currentColor"
      strokeWidth="1.4"
      fill="none"
      d="M3 6h6m0 0L6.5 3.5M9 6L6.5 8.5"
    />
  </svg>
);

export default function PartnerPage() {
  return (
    <div className="mv2-root hl-1 vs-1 type-sumary">
      <Nav />

      {/* ============ HERO ============ */}
      <section className="prod-hero" id="top">
        <div className="container">
          <div className="prod-hero-inner">
            <span className="eyebrow">För byråer</span>
            <h1 className="prod-hero-title serif-h">
              Skala er byrå
              <br />
              <em>med MinCFO Byråportal.</em>
            </h1>
            <p className="prod-hero-sub">
              Automatiskt genererade proaktiva råd baserade på specifika
              triggerpoints och AI som agerar 1st line support. Genom att samla
              all kundkommunikation och leverans i MinCFO skapar ni ett
              enhetligt och professionellt flöde för hela portföljen.
            </p>
            <div className="prod-hero-cta">
              <a className="btn" href="/boka-samtal">
                Boka samtal
                <Arrow />
              </a>
              <a className="btn btn-outline" href="/produkter/plattform">
                Se hur det funkar
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST TICKER ============ */}
      <section className="prod-trust">
        <div className="container">
          <p className="prod-trust-l">
            Byråer och rådgivare som skalar sin leverans med MinCFO
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

      {/* ============ PAIN POINTS ============ */}
      <section className="section sol-pain">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Utmaningen</span>
            <h2 className="serif-h">När varje klient drar eget arbete</h2>
            <p>
              Byråer som vill växa fastnar ofta i manuellt sammanställningsarbete
              — och rådgivningen får stå tillbaka.
            </p>
          </div>
          <div className="sol-cards-3">
            {PAINS.map((p) => (
              <article className="sol-card sol-card--filled" key={p.title}>
                <span className="sol-icon sol-icon--negative" aria-hidden="true">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </span>
                <h3 className="sol-card-title serif-h">{p.title}</h3>
                <p className="sol-card-body">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW WE HELP ============ */}
      <section className="section sol-helps">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">MinCFOs byråportal</span>
            <h2 className="serif-h">
              Ett systematiskt arbetssätt för flera klienter
            </h2>
            <p>
              Standardisera uppföljningen, leverera bättre beslutsunderlag och
              skala rådgivningen utan att varje klientupplägg blir ett eget
              specialprojekt.
            </p>
          </div>
          <div className="sol-cards-3">
            {HELPS.map((h) => (
              <article className="sol-card sol-card--filled" key={h.title}>
                <span className="sol-icon sol-icon--positive" aria-hidden="true">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <h3 className="sol-card-title serif-h">{h.title}</h3>
                <p className="sol-card-body">{h.body}</p>
              </article>
            ))}
          </div>
          <div className="sol-helps-cta">
            <a className="text-link" href="/produkter/plattform">
              Se plattformen
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
            </a>
          </div>
        </div>
      </section>

      {/* ============ IMPACT ============ */}
      <SolutionImpact
        tag="Affärsvärde"
        headline={{ first: "Mer rådgivning,", second: "mindre specialprojekt" }}
        intro="Vad byråer och rådgivare får ut av att standardisera klientleveransen i MinCFO."
        cards={IMPACT_CARDS}
        solutionKey="Redovisningsbyråer"
      />

      {/* ============ FINAL CTA ============ */}
      <section className="closing prod-closing">
        <div className="container">
          <h2>Redo att skala er byrå?</h2>
          <p className="sub">
            Boka en demo och se hur ni standardiserar uppföljning, levererar
            bättre analys och skapar värde för varje klient — utan att bygga
            varje leverans från grunden.
          </p>
          <div className="closing-row">
            <a className="btn" href="/boka-samtal">
              Boka samtal
              <Arrow />
            </a>
            <a className="btn btn-outline" href="/produkter/plattform">
              Se plattformen
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
