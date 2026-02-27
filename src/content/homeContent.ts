export type HomeSolution = {
  href: string;
  title: string;
  text: string;
  icon: "rocket" | "briefcase" | "handshake" | "cpu" | "building" | "cart";
};

export type ServiceStep = {
  title: string;
  body: string;
};

export type ServiceModel = {
  id: "faas" | "platform";
  title: string;
  subtitle: string;
  steps: ServiceStep[];
};

export const HOME_SOLUTIONS: HomeSolution[] = [
  {
    href: "/losningar/ceo-founders",
    title: "CEO & Founders",
    text: "Finansiell klarhet för snabbare vägval med AI Copilot, realtidsdata och scenarioplanering.",
    icon: "rocket",
  },
  {
    href: "/losningar/cfo-finance",
    title: "CFO & Finance Team",
    text: "Mindre manuella loopar och bättre forecast med dashboards, automation och spårbar analys.",
    icon: "briefcase",
  },
  {
    href: "/losningar/fractional-cfo",
    title: "Fractional CFO",
    text: "Leverera board-ready underlag snabbare med ett skalbart arbetssätt och hög leveransprecision.",
    icon: "handshake",
  },
  {
    href: "/losningar/saas-tech",
    title: "SaaS / Tech",
    text: "Koppla produkt, GTM och ekonomi i samma beslutsyta för hållbar tillväxt med kontroll.",
    icon: "cpu",
  },
  {
    href: "/losningar/konsult-tjanster",
    title: "Konsult & Tjänster",
    text: "Styr beläggning, projektmarginal och cash i realtid med tydliga signaler per kund och uppdrag.",
    icon: "building",
  },
  {
    href: "/losningar/ehandel",
    title: "E-handel",
    text: "Få kontroll på marginal, lager och likviditet när kampanjer och inköp påverkar utfallet dag för dag.",
    icon: "cart",
  },
];

export const HOME_SERVICE_MODELS: ServiceModel[] = [
  {
    id: "faas",
    title: "Alternativ 1: Finance as a Service",
    subtitle: "MinCFO-plattformen + att vi driver hela ekonomifunktionen",
    steps: [
      {
        title: "Onboarding & scope",
        body: "Vi sätter mål, struktur och omfattning: redovisning, lön, moms, bokslut, CFO-stöd med mera.",
      },
      {
        title: "Koppla system & behörigheter",
        body: "Ni ger oss åtkomst till bank, Skatteverket och Fortnox eller andra system. MinCFO-plattformen kopplas in som er gemensamma dashboard.",
      },
      {
        title: "Vi sköter ekonomin, ni följer i realtid",
        body: "Vi hanterar hela ekonomiflödet end-to-end. Ni ser rapporter, kassaflöde, nyckeltal och avvikelser i samma vy.",
      },
      {
        title: "AI + proaktiv rådgivning",
        body: "AI:n svarar på frågor om er data, flaggar risker och föreslår åtgärder. Ni har dessutom personlig controller/CFO on demand.",
      },
    ],
  },
  {
    id: "platform",
    title: "Alternativ 2: MinCFO Plattform",
    subtitle: "Samma dashboard, ni gör jobbet själva eller med befintlig byrå",
    steps: [
      {
        title: "Logga in i MinCFO",
        body: "Skapa konto och kom igång direkt i plattformen.",
      },
      {
        title: "Koppla Fortnox",
        body: "Ni kopplar Fortnox på några klick. MinCFO sätter upp dashboards och rapportstruktur.",
      },
      {
        title: "Realtidsinsikter & AI",
        body: "Ni får AI som besvarar frågor om bolagets siffror och realtidsrapportering enligt anpassad struktur.",
      },
      {
        title: "Automatisk kassaflödesprognos",
        body: "Kassaflödesprognosen uppdateras löpande så ni kan planera med bättre framförhållning.",
      },
    ],
  },
];
