import BrandMark from "./BrandMark";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a className="brand" href="/">
              <BrandMark />
              <span className="brand-word">MinCFO</span>
            </a>
            <p>
              Vi blir er kompletta ekonomifunktion — redovisning, rapportering,
              controlling och CFO-stöd. Ert team driver bolaget, vi driver
              ekonomin.
            </p>
          </div>
          <div className="footer-col">
            <h4>Produkt</h4>
            <ul>
              <li>
                <a href="/#plattform">Plattform</a>
              </li>
              <li>
                <a href="/produkter/helhetslosningen">Helhetslösning</a>
              </li>
              <li>
                <a href="/#partner">För byråer</a>
              </li>
              <li>
                <a href="/#integrations">Integrationer</a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Lösningar</h4>
            <ul>
              <li>
                <a href="/#cfo">CFO &amp; Finance</a>
              </li>
              <li>
                <a href="/#founders">CEO &amp; Founders</a>
              </li>
              <li>
                <a href="/#saas">SaaS / Tech</a>
              </li>
              <li>
                <a href="/#ehandel">E-handel</a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Bolag</h4>
            <ul>
              <li>
                <a href="/#kundcase">Kundcase</a>
              </li>
              <li>
                <a href="/#blogg">Blogg</a>
              </li>
              <li>
                <a href="/#karriar">Karriär</a>
              </li>
              <li>
                <a href="/#contact">Kontakt</a>
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
  );
}
