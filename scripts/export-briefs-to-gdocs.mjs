import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const HOME_PAGE_TEXT_JSON_PATH = path.join(ROOT, "src", "content", "homePageText.json");
const SOLUTION_PAGES_TEXT_JSON_PATH = path.join(ROOT, "src", "content", "solutionPagesText.json");
const HOME_CONTENT_DIR = path.join(ROOT, "src", "content", "home");
const HOME_SHARED_JSON_PATH = path.join(HOME_CONTENT_DIR, "shared.json");
const HOME_PLATFORM_JSON_PATH = path.join(HOME_CONTENT_DIR, "platform.json");
const HOME_FULL_SERVICE_JSON_PATH = path.join(HOME_CONTENT_DIR, "full-service.json");
const HOME_PARTNER_JSON_PATH = path.join(HOME_CONTENT_DIR, "partner.json");

const DOCS_CONFIG = [
  {
    key: "main",
    name: "Textbrief Startsida (SV)",
    docIdEnv: "GOOGLE_DOC_ID_MAIN",
  },
  {
    key: "solutions",
    name: "Textbrief Lösningssidor (SV)",
    docIdEnv: "GOOGLE_DOC_ID_SOLUTIONS",
  },
];

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_DOCS_SCOPE = "https://www.googleapis.com/auth/documents";
const GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const GOOGLE_DOCS_API = "https://docs.googleapis.com/v1";
const GOOGLE_DRIVE_API = "https://www.googleapis.com/drive/v3";
const WRITE_MIN_INTERVAL_MS = Number(process.env.GDOCS_WRITE_MIN_INTERVAL_MS ?? 1100);
const WRITE_MAX_RETRIES = Number(process.env.GDOCS_WRITE_MAX_RETRIES ?? 6);

let lastWriteAt = 0;

function normalize(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function toHeading(value) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

const NON_TEXT_KEYS = new Set([
  "href",
  "icon",
  "file",
  "avatarFile",
  "accent",
  "openSolutionsAria",
  "openMenuAria",
  "playAriaLabel",
  "videoAriaLabel",
  "loadingAria",
  "sendAria",
  "previewAria",
  "metricMenuAria",
  "panelAria",
  "controlsAria",
  "prevAria",
  "nextAria",
  "trustedAria",
  "tabListAria",
  "sendAriaLabel",
  "monthAriaPrefix",
  "brandAria",
  "linkedinAria",
  "motionAria",
  "motionLabel",
  "motionNowPrefix",
  "motionFull",
  "motionReduced",
]);

const VISUAL_KEYS = new Set([
  "monthLabelsSv",
  "monthLabelsEn",
  "metricOptions",
  "trendAxisTicks",
  "yTicks",
  "bars",
  "chartTitle",
  "chartUnit",
  "metrics",
  "metricValues",
  "metricHints",
  "activeMonth",
  "legend",
  "trustedLogos",
]);

const LABEL_OVERRIDES = {
  navigation: "Navigering",
  hero: "Hero",
  aicopilot: "Produkt (AI Copilot)",
  solutions: "Lösningar",
  customers: "Kundcase",
  howItWorks: "Så här fungerar det",
  ending: "Avslut / CTA",
  security: "Säkerhet",
  footer: "Footer",
  sectionTitle: "Sektionsrubrik",
  sectionIntro: "Sektionsintro",
  title: "Rubrik",
  subtitle: "Underrubrik",
  intro: "Ingress",
  body: "Brödtext",
  text: "Text",
  tagline: "Tagline",
  question: "Fråga",
  answer: "Svar",
  primaryCta: "Primär knapptext",
  cardCta: "Kort-knapptext",
  kpiBullets: "KPI-punktlista",
  bullets: "Punktlista",
  highlights: "Highlights",
  offers: "Erbjudanden",
  platform: "Plattform",
  faas: "FaaS",
  tabLabel: "Flikrubrik",
  steps: "Steg",
  company: "Bolag",
  person: "Namn",
  role: "Roll",
  quote: "Citat",
  testimonials: "Kundröster",
  trustedLogos: "Betrodda logotyper",
  groups: "Menygrupper",
  items: "Menyval",
  label: "Label",
  name: "Namn",
  monthLabelsSv: "Månadsetiketter (SV)",
  monthLabelsEn: "Månadsetiketter (EN)",
  metricOptions: "Metrikval",
  shared: "Gemensamma texter",
  pages: "Lösningssidor",
  key: "Sida",
  eyebrow: "Överrubrik",
  heroHeadline: "Hero-rubrik",
  heroIntro: "Hero-intro",
  logoStripText: "Logorad text",
  dilemmaTitle: "Utmaning rubrik",
  dilemmaIntro: "Utmaning intro",
  dilemmaCards: "Utmaningskort",
  helpsTitle: "Lösningsrubrik",
  helpsIntro: "Lösningsintro",
  helpsCards: "Lösningskort",
  scenario: "Scenario",
  impactHeadline: "Impact-rubrik",
  impactIntro: "Impact-intro",
  impactCards: "Impact-kort",
  closingHeadline: "Avslutande rubrik",
  closingText: "Avslutande text",
  heroPrimaryCta: "Hero primär knapp",
  heroSecondaryCta: "Hero sekundär knapp",
  scrollLabel: "Scroll-label",
  helpsOverline: "Lösnings-overline",
  impactTag: "Impact-tag",
  closingOverline: "Avslut-overline",
  closingAccent: "Avslut accent",
  closingCta: "Avslut CTA",
  demoCta: "Navbar demo-knapp",
  loginSignupLabel: "Logga in / Sign up label",
  first: "Rad 1",
  second: "Rad 2",
  answer1: "Svar 1",
  answer2: "Svar 2",
};

function labelForKey(rawKey, fallback) {
  return LABEL_OVERRIDES[rawKey] ?? fallback;
}

function isVisualField(rawKey) {
  if (VISUAL_KEYS.has(rawKey)) return true;
  return false;
}

const TABLE_COLUMN_WIDTHS_PT = [190, 370];
const TABLE_HEADER_BG = { red: 0.95, green: 0.95, blue: 0.95 };
const CONTENT_TABLE_HEADERS = [
  "Element",
  "Website Text (edit here)",
];

function rowsFromValue(value, rawKey = "", label = "", context = "", pathParts = []) {
  const rows = [];

  const pushRow = (element, text, notes = "") => {
    rows.push({ element, value: text ?? "", notes });
  };

  const walk = (currentValue, currentRawKey, currentLabel, currentContext, currentPath) => {
    if (NON_TEXT_KEYS.has(currentRawKey)) return;

    const isVisual = isVisualField(currentRawKey, currentPath);
    if (isVisual) {
      // Visual data handled in appendix builder, skip in normal flow.
      return;
    }

    const elementLabel = currentContext ? `${currentContext} · ${currentLabel}` : currentLabel;

    if (currentValue == null) {
      pushRow(elementLabel, "");
      return;
    }

    if (
      typeof currentValue === "string" ||
      typeof currentValue === "number" ||
      typeof currentValue === "boolean"
    ) {
      pushRow(elementLabel, String(currentValue));
      return;
    }

    if (Array.isArray(currentValue)) {
      if (
        currentValue.every(
          (item) =>
            item == null ||
            typeof item === "string" ||
            typeof item === "number" ||
            typeof item === "boolean",
        )
      ) {
        currentValue.forEach((item, index) => {
          pushRow(`${elementLabel} – Punkt ${index + 1}`, item == null ? "" : String(item));
        });
        return;
      }

      currentValue.forEach((item, index) => {
        if (!item || typeof item !== "object") return;
        const itemTitle =
          ("title" in item && typeof item.title === "string" && item.title) ||
          ("name" in item && typeof item.name === "string" && item.name) ||
          `${currentLabel} ${index + 1}`;
        if ("title" in item && typeof item.title === "string") {
          pushRow(`${itemTitle} · Rubrik`, item.title);
        }
        if ("name" in item && typeof item.name === "string") {
          pushRow(`${itemTitle} · Namn`, item.name);
        }
        Object.entries(item).forEach(([childKey, childValue]) => {
          if ((childKey === "title" || childKey === "name") && typeof childValue === "string") return;
          walk(
            childValue,
            childKey,
            labelForKey(childKey, toHeading(childKey)),
            itemTitle,
            [...currentPath, childKey],
          );
        });
      });
      return;
    }

    Object.entries(currentValue).forEach(([childKey, childValue]) => {
      walk(
        childValue,
        childKey,
        labelForKey(childKey, toHeading(childKey)),
        currentLabel,
        [...currentPath, childKey],
      );
    });
  };

  walk(value, rawKey, label, context, pathParts);
  return rows;
}

function visualRowsFromValue(value, rawKey = "", label = "", context = "", pathParts = []) {
  const rows = [];

  const pushRow = (element, text, notes = "Visual data – redigera endast vid behov") => {
    rows.push({ element, value: text ?? "", notes });
  };

  const walk = (currentValue, currentRawKey, currentLabel, currentContext, currentPath) => {
    if (NON_TEXT_KEYS.has(currentRawKey)) return;
    const includeHere = isVisualField(currentRawKey, currentPath);
    const elementLabel = currentContext ? `${currentContext} · ${currentLabel}` : currentLabel;

    if (
      currentValue == null ||
      typeof currentValue === "string" ||
      typeof currentValue === "number" ||
      typeof currentValue === "boolean"
    ) {
      if (includeHere) {
        pushRow(elementLabel, currentValue == null ? "" : String(currentValue));
      }
      return;
    }

    if (Array.isArray(currentValue)) {
      if (!includeHere) {
        currentValue.forEach((item) => {
          if (item && typeof item === "object") {
            Object.entries(item).forEach(([childKey, childValue]) => {
              walk(
                childValue,
                childKey,
                labelForKey(childKey, toHeading(childKey)),
                currentLabel,
                [...currentPath, childKey],
              );
            });
          }
        });
        return;
      }

      if (
        currentValue.every(
          (item) =>
            item == null ||
            typeof item === "string" ||
            typeof item === "number" ||
            typeof item === "boolean",
        )
      ) {
        currentValue.forEach((item, index) => {
          pushRow(`${elementLabel} – Punkt ${index + 1}`, item == null ? "" : String(item));
        });
        return;
      }

      currentValue.forEach((item, index) => {
        if (!item || typeof item !== "object") return;
        const itemTitle =
          ("title" in item && typeof item.title === "string" && item.title) ||
          ("name" in item && typeof item.name === "string" && item.name) ||
          `${currentLabel} ${index + 1}`;
        Object.entries(item).forEach(([childKey, childValue]) => {
          if ((childKey === "title" || childKey === "name") && typeof childValue === "string") return;
          walk(
            childValue,
            childKey,
            labelForKey(childKey, toHeading(childKey)),
            itemTitle,
            [...currentPath, childKey],
          );
        });
      });
      return;
    }

    Object.entries(currentValue).forEach(([childKey, childValue]) => {
      walk(
        childValue,
        childKey,
        labelForKey(childKey, toHeading(childKey)),
        currentLabel,
        [...currentPath, childKey],
      );
    });
  };

  walk(value, rawKey, label, context, pathParts);
  return rows;
}

function loadJsonIfExists(filePath, fallback = {}) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadHomeContentBundle() {
  if (fs.existsSync(HOME_SHARED_JSON_PATH) && fs.existsSync(HOME_PLATFORM_JSON_PATH)) {
    return {
      shared: loadJsonIfExists(HOME_SHARED_JSON_PATH),
      modes: {
        platform: loadJsonIfExists(HOME_PLATFORM_JSON_PATH),
        "full-service": loadJsonIfExists(HOME_FULL_SERVICE_JSON_PATH),
        partner: loadJsonIfExists(HOME_PARTNER_JSON_PATH),
      },
    };
  }

  const legacy = JSON.parse(fs.readFileSync(HOME_PAGE_TEXT_JSON_PATH, "utf8"));
  return {
    shared: {
      navigation: legacy.navigation ?? {},
      offering: legacy.offering ?? {},
      howItWorks: legacy.howItWorks ?? {},
      security: legacy.security ?? {},
      footer: legacy.footer ?? {},
    },
    modes: {
      platform: {
        hero: legacy.hero ?? {},
        aicopilot: legacy.aicopilot ?? {},
        solutions: legacy.solutions ?? {},
        customers: legacy.customers ?? {},
        ending: legacy.ending ?? {},
      },
      "full-service": {},
      partner: {},
    },
  };
}

function buildMainDocumentModel(homeContent) {
  const blocks = [
    { kind: "heading", level: 1, text: "MinCFO Textbrief (SV) - Fullständig" },
    { kind: "heading", level: 2, text: "Instruktioner för redigering" },
    { kind: "paragraph", text: "Kolumnen till höger (Website Text) är den faktiska texten som visas på webbplatsen." },
    { kind: "paragraph", text: "Kolumnen Element är endast en etikett för vad texten tillhör i UI:t och ska normalt inte ändras." },
    { kind: "paragraph", text: "Allt som gäller visuella/UI-nära texter och diagram ligger samlat längst ned under \"Bilaga: Visuella data\"." },
    { kind: "heading", level: 2, text: "Startsida" },
  ];

  const visualSections = [];
  const sharedSections = [
    ["navigation", "Gemensamt - Navigering", homeContent.shared.navigation],
    ["offering", "Gemensamt - Erbjudande", homeContent.shared.offering],
    ["security", "Gemensamt - Säkerhet", homeContent.shared.security],
    ["footer", "Gemensamt - Footer", homeContent.shared.footer],
  ];
  const modeConfigs = [
    { key: "platform", title: "Plattform", content: homeContent.modes.platform ?? {} },
    { key: "full-service", title: "Helhetslösning", content: homeContent.modes["full-service"] ?? {} },
    { key: "partner", title: "För byråer", content: homeContent.modes.partner ?? {} },
  ];

  const collectVisualSection = (sectionKey, title, sectionValue) => {
    const visualRows = [];
    Object.entries(sectionValue ?? {}).forEach(([key, value]) => {
      visualRows.push(
        ...visualRowsFromValue(value, key, labelForKey(key, toHeading(key)), "", [sectionKey, key]),
      );
    });
    if (visualRows.length) {
      visualSections.push({ title, rows: visualRows });
    }
  };

  for (const [sectionKey, title, sectionValue] of sharedSections) {
    const rows = [];
    Object.entries(sectionValue ?? {}).forEach(([key, value]) => {
      rows.push(
        ...rowsFromValue(value, key, labelForKey(key, toHeading(key)), "", [sectionKey, key]),
      );
    });
    blocks.push({
      kind: "section",
      title,
      rows,
    });
    collectVisualSection(sectionKey, title, sectionValue);
  }

  const howItWorksValue = homeContent.shared.howItWorks ?? {};
  const howOverviewRows = [];
  if ("sectionTitle" in howItWorksValue) {
    howOverviewRows.push({
      element: labelForKey("sectionTitle", toHeading("sectionTitle")),
      value: String(howItWorksValue.sectionTitle ?? ""),
    });
  }
  if ("sectionIntro" in howItWorksValue) {
    howOverviewRows.push({
      element: labelForKey("sectionIntro", toHeading("sectionIntro")),
      value: String(howItWorksValue.sectionIntro ?? ""),
    });
  }
  if ("sectionIntroByOffer" in howItWorksValue) {
    howOverviewRows.push(
      ...rowsFromValue(
        howItWorksValue.sectionIntroByOffer,
        "sectionIntroByOffer",
        "Sektionsintro per erbjudande",
        "",
        ["howItWorks", "sectionIntroByOffer"],
      ),
    );
  }
  if (howOverviewRows.length) {
    blocks.push({
      kind: "section",
      title: "Gemensamt - Så här fungerar det - Översikt",
      rows: howOverviewRows,
    });
  }

  const howOffers = howItWorksValue.offers ?? {};
  Object.entries(howOffers).forEach(([offerKey, offerValue]) => {
    if (!offerValue || typeof offerValue !== "object") return;
    const offerLabel = labelForKey(offerKey, toHeading(offerKey));
    const tabRows = [];
    if ("tabLabel" in offerValue) {
      tabRows.push({
        element: labelForKey("tabLabel", toHeading("tabLabel")),
        value: String(offerValue.tabLabel ?? ""),
      });
    }
    if (tabRows.length) {
      blocks.push({
        kind: "section",
        title: `Gemensamt - Så här fungerar det - ${offerLabel}`,
        rows: tabRows,
      });
    }

    if (!Array.isArray(offerValue.steps)) return;
    offerValue.steps.forEach((step, stepIndex) => {
      if (!step || typeof step !== "object") return;
      const stepTitle =
        typeof step.title === "string" && step.title.trim()
          ? step.title
          : `Steg ${stepIndex + 1}`;
      const stepRows = [{
        element: labelForKey("title", toHeading("title")),
        value: stepTitle,
      }];
      Object.entries(step).forEach(([key, value]) => {
        if (key === "title") return;
        stepRows.push(
          ...rowsFromValue(
            value,
            key,
            labelForKey(key, toHeading(key)),
            "",
            ["howItWorks", "offers", offerKey, "steps", String(stepIndex), key],
          ),
        );
      });
      if (!stepRows.length) return;
      blocks.push({
        kind: "section",
        title: `Gemensamt - Så här fungerar det - ${offerLabel} - ${stepTitle}`,
        rows: stepRows,
      });
    });
  });

  const howUi = howItWorksValue.ui ?? {};
  const pushHowVisualSection = (sectionTitle, value, pathSuffix) => {
    const rows = rowsFromValue(
      value ?? {},
      pathSuffix,
      "UI",
      "",
      ["howItWorksVisual", pathSuffix],
    );
    if (rows.length) {
      visualSections.push({ title: sectionTitle, rows });
    }
  };
  pushHowVisualSection("Gemensamt - Så här fungerar det - Plattform / Skapa konto (UI)", howUi.account, "account");
  pushHowVisualSection("Gemensamt - Så här fungerar det - Plattform / Koppla Fortnox (UI)", howUi.connect, "connect");
  pushHowVisualSection("Gemensamt - Så här fungerar det - Plattform / Realtidsinsikter & AI (UI)", howUi.insights, "insights");
  pushHowVisualSection("Gemensamt - Så här fungerar det - FaaS / Onboarding & scope (UI)", howUi.faasOnboarding, "faasOnboarding");
  pushHowVisualSection("Gemensamt - Så här fungerar det - FaaS / Koppla system & behörigheter (UI)", howUi.faasSystems, "faasSystems");
  pushHowVisualSection("Gemensamt - Så här fungerar det - FaaS / Vi sköter ekonomin (UI)", howUi.faasRealtime, "faasRealtime");
  pushHowVisualSection("Gemensamt - Så här fungerar det - Partner / Workspace (UI)", howUi.partnerWorkspace, "partnerWorkspace");

  for (const modeConfig of modeConfigs) {
    const sections = [
      ["hero", `${modeConfig.title} - Hero`, modeConfig.content.hero],
      ["aicopilot", `${modeConfig.title} - Produkt (AI Copilot)`, modeConfig.content.aicopilot],
      ["solutions", `${modeConfig.title} - Lösningar`, modeConfig.content.solutions],
      ["customers", `${modeConfig.title} - Kundcase`, modeConfig.content.customers],
      ["ending", `${modeConfig.title} - Avslut / CTA`, modeConfig.content.ending],
    ];

    for (const [sectionKey, title, sectionValue] of sections) {
      if (!sectionValue) continue;
      const scopedSectionKey = `${modeConfig.key}.${sectionKey}`;

    if (sectionKey === "aicopilot" && sectionValue) {
      const pushAicopilotSection = (sectionTitle, rows) => {
        if (!rows.length) return;
        blocks.push({
          kind: "section",
          title: sectionTitle,
          rows,
        });
      };
      const pushAicopilotVisualSection = (sectionTitle, rows) => {
        if (!rows.length) return;
        visualSections.push({ title: sectionTitle, rows });
      };
      const extractRowsForKeys = (obj, keys, basePath) => {
        const rows = [];
        keys.forEach((key) => {
          if (!(key in (obj ?? {}))) return;
          rows.push(
            ...rowsFromValue(
              obj[key],
              key,
              labelForKey(key, toHeading(key)),
              "",
              [...basePath, key],
            ),
          );
        });
        return rows;
      };
      const extractVisualRowsForKeys = (obj, keys, basePath) => {
        const rows = [];
        keys.forEach((key) => {
          if (!(key in (obj ?? {}))) return;
          rows.push(
            ...visualRowsFromValue(
              obj[key],
              key,
              labelForKey(key, toHeading(key)),
              "",
              [...basePath, key],
            ),
          );
        });
        return rows;
      };

      const overviewRows = extractRowsForKeys(
        sectionValue,
        ["leftPill", "leftTitle", "leftIntro", "leftBullets"],
        [modeConfig.key, "aicopilot"],
      );
      pushAicopilotSection(`${modeConfig.title} - Produkt (AI-Copilot)`, overviewRows);

      const dashboardRows = extractRowsForKeys(
        sectionValue.dashboard ?? {},
        ["pill", "title", "intro", "kpiBullets"],
        [modeConfig.key, "aicopilot", "dashboard"],
      );
      pushAicopilotSection(`${modeConfig.title} - Produkt (Dashboard)`, dashboardRows);

      const planningRows = extractRowsForKeys(
        sectionValue.planning ?? {},
        ["pill", "title", "intro", "bullets"],
        [modeConfig.key, "aicopilot", "planning"],
      );
      pushAicopilotSection(`${modeConfig.title} - Produkt (Planering & Jämförelse)`, planningRows);

      const panelVisualRows = extractRowsForKeys(
        sectionValue,
        ["panelTitle", "statusSending", "statusAnalyzing", "inputPlaceholder"],
        [modeConfig.key, "aicopilot"],
      );
      pushAicopilotVisualSection(`${modeConfig.title} - Produkt (AI-Copilot) - Chattpanel (visual data)`, panelVisualRows);

      const examplesVisualRows = [
        ...extractRowsForKeys(sectionValue, ["examples"], [modeConfig.key, "aicopilot"]),
        ...extractVisualRowsForKeys(sectionValue, ["examples"], [modeConfig.key, "aicopilot"]),
      ];
      pushAicopilotVisualSection(`${modeConfig.title} - Produkt (AI-Copilot) - Exempel (visual data)`, examplesVisualRows);

      const dashboardVisualRows = extractRowsForKeys(
        sectionValue.dashboard ?? {},
        ["resultTitle", "currentLabel", "previousLabel", "currencyLabel", "compareLabel"],
        [modeConfig.key, "aicopilot", "dashboard"],
      );
      dashboardVisualRows.push(
        ...extractVisualRowsForKeys(
          sectionValue.dashboard ?? {},
          ["metricOptions", "trendAxisTicks", "monthLabelsSv"],
          [modeConfig.key, "aicopilot", "dashboard"],
        ),
      );
      pushAicopilotVisualSection(`${modeConfig.title} - Produkt (Dashboard) - Visual data`, dashboardVisualRows);

      const planningVisualRows = extractRowsForKeys(
        sectionValue.planning ?? {},
        [
          "forecastTitle",
          "liveLabel",
          "reconciliationTitle",
          "reconciliationSubtext",
          "actualPrefix",
          "forecastPrefix",
          "vsPrevious",
          "annualVariance",
        ],
        [modeConfig.key, "aicopilot", "planning"],
      );
      planningVisualRows.push(
        ...extractVisualRowsForKeys(
          sectionValue.planning ?? {},
          ["legend", "monthLabelsEn"],
          [modeConfig.key, "aicopilot", "planning"],
        ),
      );
      pushAicopilotVisualSection(`${modeConfig.title} - Produkt (Planering & Jämförelse) - Visual data`, planningVisualRows);
      continue;
    }

    const rows = [];
    Object.entries(sectionValue ?? {}).forEach(([key, value]) => {
      rows.push(
        ...rowsFromValue(value, key, labelForKey(key, toHeading(key)), "", [modeConfig.key, sectionKey, key]),
      );
    });
    blocks.push({
      kind: "section",
      title,
      rows,
    });
      collectVisualSection(scopedSectionKey, title, sectionValue);
    }
  }

  blocks.push({ kind: "pageBreak" });
  blocks.push({ kind: "heading", level: 2, text: "Bilaga: Visuella data" });
  blocks.push({ kind: "paragraph", text: "Redigera inte denna del om du inte blivit ombedd. Innehåller diagram- och visualiseringsdata." });
  for (const section of visualSections) {
    blocks.push({
      kind: "section",
      title: section.title,
      rows: section.rows,
      appendix: true,
    });
  }

  return blocks;
}

function buildSolutionsDocumentModel(solutionsText) {
  const blocks = [
    { kind: "heading", level: 1, text: "MinCFO Textbrief (SV) - Lösningssidor" },
    { kind: "heading", level: 2, text: "Instruktioner för redigering" },
    { kind: "paragraph", text: "Kolumnen till höger (Website Text) är den faktiska texten som visas på webbplatsen." },
    { kind: "paragraph", text: "Kolumnen Element är endast en etikett för vad texten tillhör i UI:t och ska normalt inte ändras." },
    { kind: "paragraph", text: "Allt som gäller visuella/UI-nära texter och diagram ligger samlat längst ned under \"Bilaga: Visuella data\"." },
    { kind: "heading", level: 2, text: "Lösningssidor" },
  ];

  const visualSections = [];

  if (solutionsText.shared) {
    const rows = [];
    const visualRows = [];
    Object.entries(solutionsText.shared).forEach(([key, value]) => {
      rows.push(...rowsFromValue(value, key, labelForKey(key, toHeading(key)), "", ["shared", key]));
      visualRows.push(
        ...visualRowsFromValue(value, key, labelForKey(key, toHeading(key)), "", ["shared", key]),
      );
    });
    blocks.push({
      kind: "section",
      title: "Gemensamma texter",
      rows,
    });
    if (visualRows.length) visualSections.push({ title: "Gemensamma texter", rows: visualRows });
  }

  if (Array.isArray(solutionsText.pages)) {
    solutionsText.pages.forEach((page, index) => {
      if (index > 0) blocks.push({ kind: "pageBreak" });

      const rows = [];
      const visualRows = [];
      Object.entries(page).forEach(([key, value]) => {
        if (key === "key") return;
        rows.push(
          ...rowsFromValue(value, key, labelForKey(key, toHeading(key)), "", [page.key, key]),
        );
        visualRows.push(
          ...visualRowsFromValue(value, key, labelForKey(key, toHeading(key)), "", [page.key, key]),
        );
      });
      blocks.push({
        kind: "section",
        title: page.key,
        rows,
      });
      if (visualRows.length) visualSections.push({ title: page.key, rows: visualRows });
    });
  }

  if (visualSections.length) {
    blocks.push({ kind: "pageBreak" });
    blocks.push({ kind: "heading", level: 2, text: "Bilaga: Visuella data" });
    blocks.push({ kind: "paragraph", text: "Redigera inte denna del om du inte blivit ombedd. Innehåller diagram- och visualiseringsdata." });
    for (const section of visualSections) {
      blocks.push({
        kind: "section",
        title: section.title,
        rows: section.rows,
        appendix: true,
      });
    }
  }

  return blocks;
}

function loadEnvFiles() {
  const candidates = [".env.local", ".env"];

  for (const candidate of candidates) {
    const filePath = path.join(ROOT, candidate);
    if (!fs.existsSync(filePath)) continue;

    const content = normalize(fs.readFileSync(filePath, "utf8"));
    const lines = content.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const noPrefix = trimmed.startsWith("export ") ? trimmed.slice(7).trim() : trimmed;
      const separator = noPrefix.indexOf("=");
      if (separator <= 0) continue;

      const key = noPrefix.slice(0, separator).trim();
      if (!key || process.env[key] !== undefined) continue;

      let value = noPrefix.slice(separator + 1).trim();
      const singleQuoted = value.startsWith("'") && value.endsWith("'");
      const doubleQuoted = value.startsWith("\"") && value.endsWith("\"");
      if (singleQuoted || doubleQuoted) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

function base64UrlEncode(input) {
  const raw = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return raw.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function toPt(value) {
  return {
    magnitude: value,
    unit: "PT",
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function throttleWriteRequest() {
  const now = Date.now();
  const diff = now - lastWriteAt;
  if (diff < WRITE_MIN_INTERVAL_MS) {
    await sleep(WRITE_MIN_INTERVAL_MS - diff);
  }
  lastWriteAt = Date.now();
}

function loadServiceAccount() {
  const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE?.trim();
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON?.trim();

  let raw = "";
  if (keyFile) {
    if (!fs.existsSync(keyFile)) {
      throw new Error(`Hittar inte service account-fil: ${keyFile}`);
    }
    raw = fs.readFileSync(keyFile, "utf8");
  } else if (keyJson) {
    raw = keyJson;
  } else {
    throw new Error(
      "Saknar service account-nyckel. Sätt GOOGLE_SERVICE_ACCOUNT_KEY_FILE eller GOOGLE_SERVICE_ACCOUNT_KEY_JSON.",
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Ogiltig service account JSON: ${message}`);
  }

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("Service account JSON måste innehålla client_email och private_key.");
  }

  return parsed;
}

async function getAccessToken(serviceAccount) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;
  const scope = `${GOOGLE_DOCS_SCOPE} ${GOOGLE_DRIVE_SCOPE}`;

  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope,
      aud: GOOGLE_TOKEN_URL,
      exp,
      iat,
    }),
  );
  const unsignedToken = `${header}.${payload}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const signature = signer.sign(serviceAccount.private_key);
  const assertion = `${unsignedToken}.${base64UrlEncode(signature)}`;

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Kunde inte hämta access token (${response.status}): ${body}`);
  }

  const json = await response.json();
  if (!json.access_token) {
    throw new Error("Google token-svar saknar access_token.");
  }

  return json.access_token;
}

async function googleApiFetch(accessToken, url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    const error = new Error(`Google API-fel (${response.status}) ${url}: ${body}`);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

async function createGoogleDoc(accessToken, title) {
  const payload = {
    name: title,
    mimeType: "application/vnd.google-apps.document",
  };

  const json = await googleApiFetch(
    accessToken,
    `${GOOGLE_DRIVE_API}/files?fields=id,name,webViewLink`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return {
    id: json.id,
    name: json.name,
    webViewLink: json.webViewLink,
  };
}

async function getDocument(accessToken, docId) {
  return googleApiFetch(
    accessToken,
    `${GOOGLE_DOCS_API}/documents/${encodeURIComponent(docId)}`,
    { method: "GET" },
  );
}

async function batchUpdateDocument(accessToken, docId, requests) {
  if (!requests.length) return;

  const url = `${GOOGLE_DOCS_API}/documents/${encodeURIComponent(docId)}:batchUpdate`;

  for (let attempt = 1; attempt <= WRITE_MAX_RETRIES; attempt += 1) {
    try {
      await throttleWriteRequest();
      await googleApiFetch(accessToken, url, {
        method: "POST",
        body: JSON.stringify({ requests }),
      });
      return;
    } catch (error) {
      const status = error?.status ?? null;
      const message = error instanceof Error ? error.message : String(error);
      const retriable = status === 429 || status === 503 || /RESOURCE_EXHAUSTED/i.test(message);
      if (!retriable || attempt === WRITE_MAX_RETRIES) {
        throw error;
      }
      const baseDelay = 1200 * Math.pow(2, attempt - 1);
      const jitter = Math.floor(Math.random() * 400);
      await sleep(baseDelay + jitter);
    }
  }
}

function headingNamedStyle(level) {
  if (level <= 1) return "HEADING_1";
  if (level === 2) return "HEADING_2";
  if (level === 3) return "HEADING_3";
  return "HEADING_4";
}

function sanitizeCellText(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

function getDocEndIndex(document) {
  return document?.body?.content?.at(-1)?.endIndex ?? 1;
}

function getInsertIndexAtDocEnd(document) {
  return Math.max(1, getDocEndIndex(document) - 1);
}

async function appendTextBlock(accessToken, docId, text, kind = "paragraph", level = 1) {
  const doc = await getDocument(accessToken, docId);
  const index = getInsertIndexAtDocEnd(doc);
  const content = `${text}\n`;
  const startIndex = index;
  const endIndex = index + content.length;

  const requests = [
    {
      insertText: {
        location: { index },
        text: content,
      },
    },
  ];

  if (kind === "heading") {
    requests.push({
      updateParagraphStyle: {
        range: { startIndex, endIndex },
        paragraphStyle: { namedStyleType: headingNamedStyle(level) },
        fields: "namedStyleType",
      },
    });
  } else if (kind === "instruction") {
    requests.push({
      updateTextStyle: {
        range: { startIndex, endIndex: Math.max(startIndex, endIndex - 1) },
        textStyle: { italic: true },
        fields: "italic",
      },
    });
  }

  await batchUpdateDocument(accessToken, docId, requests);
}

async function appendPageBreakBlock(accessToken, docId) {
  const doc = await getDocument(accessToken, docId);
  const index = getInsertIndexAtDocEnd(doc);
  await batchUpdateDocument(accessToken, docId, [
    {
      insertPageBreak: {
        location: { index },
      },
    },
  ]);
}

function getTextRangeFromCellContent(cellContent = []) {
  let startIndex = null;
  let endIndex = null;
  for (const structuralElement of cellContent) {
    const paragraph = structuralElement?.paragraph;
    if (!paragraph?.elements) continue;
    for (const element of paragraph.elements) {
      if (!element?.textRun?.content) continue;
      const content = element.textRun.content;
      if (!content.trim()) continue;
      const start = element.startIndex ?? null;
      const end = element.endIndex ?? null;
      if (start == null || end == null || end <= start) continue;
      if (startIndex == null || start < startIndex) startIndex = start;
      const normalizedEnd = content.endsWith("\n") ? end - 1 : end;
      if (endIndex == null || normalizedEnd > endIndex) endIndex = normalizedEnd;
    }
  }
  if (startIndex == null || endIndex == null || endIndex <= startIndex) return null;
  return { startIndex, endIndex };
}

function findTableByStartIndex(document, tableStartIndex) {
  const bodyContent = document?.body?.content ?? [];
  return bodyContent.find((item) => item?.table && item?.startIndex === tableStartIndex)?.table ?? null;
}

function getTableCellInsertIndex(table, rowIndex, columnIndex) {
  const row = table?.tableRows?.[rowIndex];
  const cell = row?.tableCells?.[columnIndex];
  if (!cell) return null;

  for (const structuralElement of cell.content ?? []) {
    const paragraph = structuralElement?.paragraph;
    if (!paragraph?.elements?.length) continue;
    for (const element of paragraph.elements) {
      const start = element?.startIndex;
      const end = element?.endIndex;
      if (typeof start !== "number" || typeof end !== "number") continue;
      // New table cells contain an empty paragraph with just "\n".
      // Insert immediately before the trailing newline to stay inside paragraph bounds.
      const safeIndex = Math.max(start, end - 1);
      return safeIndex;
    }
  }

  if (typeof cell.startIndex === "number") return cell.startIndex + 1;
  return null;
}

async function styleTableHeaderRow(accessToken, docId, tableStartIndex, columnCount) {
  const doc = await getDocument(accessToken, docId);
  const table = findTableByStartIndex(doc, tableStartIndex);
  if (!table?.tableRows?.length) return;

  const headerRow = table.tableRows[0];
  const boldRequests = [];
  for (let column = 0; column < Math.min(columnCount, headerRow.tableCells.length); column += 1) {
    const range = getTextRangeFromCellContent(headerRow.tableCells[column]?.content ?? []);
    if (!range) continue;
    boldRequests.push({
      updateTextStyle: {
        range,
        textStyle: { bold: true },
        fields: "bold",
      },
    });
  }

  for (const chunk of chunkRequests(boldRequests, 100)) {
    await batchUpdateDocument(accessToken, docId, chunk);
  }
}

async function appendTableBlock(accessToken, docId, headers, rowObjects, options = {}) {
  const totalRows = 1 + rowObjects.length;
  const columns = headers.length;
  const doc = await getDocument(accessToken, docId);
  const insertIndex = getInsertIndexAtDocEnd(doc);
  const tableStartIndex = insertIndex + 1;

  const insertTableRequest = {
    insertTable: {
      rows: totalRows,
      columns,
      location: { index: insertIndex },
    },
  };
  await batchUpdateDocument(accessToken, docId, [insertTableRequest]);

  const styleRequests = [];
  styleRequests.push({
    updateTableCellStyle: {
      tableRange: {
        tableCellLocation: {
          tableStartLocation: { index: tableStartIndex },
          rowIndex: 0,
          columnIndex: 0,
        },
        rowSpan: 1,
        columnSpan: columns,
      },
      tableCellStyle: {
        backgroundColor: {
          color: {
            rgbColor: TABLE_HEADER_BG,
          },
        },
      },
      fields: "backgroundColor",
    },
  });

  const widths = options.columnWidths ?? TABLE_COLUMN_WIDTHS_PT;
  widths.forEach((width, index) => {
    if (index >= columns) return;
    styleRequests.push({
      updateTableColumnProperties: {
        tableStartLocation: { index: tableStartIndex },
        columnIndices: [index],
        tableColumnProperties: {
          widthType: "FIXED_WIDTH",
          width: toPt(width),
        },
        fields: "widthType,width",
      },
    });
  });

  for (const chunk of chunkRequests(styleRequests, 100)) {
    await batchUpdateDocument(accessToken, docId, chunk);
  }

  const rows = [
    headers,
    ...rowObjects.map((row) => row.map((cell) => sanitizeCellText(cell))),
  ];

  const docAfterTable = await getDocument(accessToken, docId);
  const tableAfterInsert = findTableByStartIndex(docAfterTable, tableStartIndex);
  if (!tableAfterInsert) {
    throw new Error(`Kunde inte hitta tabell vid index ${tableStartIndex}.`);
  }

  const textTargets = [];
  rows.forEach((cells, rowIndex) => {
    cells.forEach((cell, columnIndex) => {
      const cellIndex = getTableCellInsertIndex(tableAfterInsert, rowIndex, columnIndex);
      if (typeof cellIndex !== "number") return;
      if (!cell || !String(cell).trim()) return;
      textTargets.push({ index: cellIndex, text: cell });
    });
  });

  // Insert in descending index order so prior inserts do not shift the remaining target indices.
  textTargets.sort((a, b) => b.index - a.index);
  const textRequests = textTargets.map((target) => ({
    insertText: {
      location: { index: target.index },
      text: target.text,
    },
  }));

  for (const chunk of chunkRequests(textRequests, 100)) {
    await batchUpdateDocument(accessToken, docId, chunk);
  }

  await styleTableHeaderRow(accessToken, docId, tableStartIndex, columns);
  await appendTextBlock(accessToken, docId, "", "paragraph");
}

function buildSectionRows(section) {
  const rows = (section.rows ?? []).map((row) => [
    row.element ?? "",
    row.value ?? "",
  ]);
  if (!rows.length) {
    rows.push(["(Inga rader)", ""]);
  }
  return rows;
}

async function renderDocumentModel(accessToken, docId, blocks) {
  for (const block of blocks) {
    if (block.kind === "heading") {
      await appendTextBlock(accessToken, docId, block.text ?? "", "heading", block.level ?? 1);
      continue;
    }

    if (block.kind === "paragraph") {
      await appendTextBlock(accessToken, docId, block.text ?? "", "paragraph");
      continue;
    }

    if (block.kind === "pageBreak") {
      await appendPageBreakBlock(accessToken, docId);
      continue;
    }

    if (block.kind === "section") {
      await appendTextBlock(accessToken, docId, block.title ?? "", "heading", 3);
      await appendTableBlock(accessToken, docId, CONTENT_TABLE_HEADERS, buildSectionRows(block), {
        columnWidths: TABLE_COLUMN_WIDTHS_PT,
      });
      continue;
    }
  }
}

async function resolveTargetDocument(accessToken, config) {
  const existingDocId = process.env[config.docIdEnv]?.trim();
  if (existingDocId) {
    return {
      id: existingDocId,
      created: false,
      name: config.name,
      webViewLink: `https://docs.google.com/document/d/${existingDocId}/edit`,
    };
  }

  const created = await createGoogleDoc(accessToken, config.name);
  return {
    id: created.id,
    created: true,
    name: created.name,
    webViewLink: created.webViewLink ?? `https://docs.google.com/document/d/${created.id}/edit`,
  };
}

function chunkRequests(requests, size = 100) {
  const chunks = [];
  for (let i = 0; i < requests.length; i += size) {
    chunks.push(requests.slice(i, i + size));
  }
  return chunks;
}

async function replaceDocumentContent(accessToken, docId, documentModel) {
  const currentDoc = await getDocument(accessToken, docId);
  const endIndex = currentDoc?.body?.content?.at(-1)?.endIndex ?? 1;
  const deleteStart = 1;
  const deleteEnd = endIndex - 1;

  if (deleteEnd > deleteStart) {
    await batchUpdateDocument(accessToken, docId, [
      {
        deleteContentRange: {
          range: {
            startIndex: deleteStart,
            endIndex: deleteEnd,
          },
        },
      },
    ]);
  }
  await renderDocumentModel(accessToken, docId, documentModel);
}

async function main() {
  loadEnvFiles();
  const serviceAccount = loadServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);

  if (!fs.existsSync(HOME_PAGE_TEXT_JSON_PATH)) {
    throw new Error(`Saknar fil: ${path.relative(ROOT, HOME_PAGE_TEXT_JSON_PATH)}`);
  }
  if (!fs.existsSync(SOLUTION_PAGES_TEXT_JSON_PATH)) {
    throw new Error(`Saknar fil: ${path.relative(ROOT, SOLUTION_PAGES_TEXT_JSON_PATH)}`);
  }

  for (const config of DOCS_CONFIG) {
    let documentModel = null;
    if (config.key === "main") {
      const homeContent = loadHomeContentBundle();
      documentModel = buildMainDocumentModel(homeContent);
    } else if (config.key === "solutions") {
      const solutionsText = JSON.parse(fs.readFileSync(SOLUTION_PAGES_TEXT_JSON_PATH, "utf8"));
      documentModel = buildSolutionsDocumentModel(solutionsText);
    } else {
      throw new Error(`Okänd docs-konfiguration: ${config.key}`);
    }
    const target = await resolveTargetDocument(accessToken, config);

    await replaceDocumentContent(accessToken, target.id, documentModel);

    const status = target.created ? "skapad" : "uppdaterad";
    console.log(`${config.name}: ${status}`);
    console.log(`- ${target.webViewLink}`);
    if (target.created) {
      console.log(`- Sätt ${config.docIdEnv}=${target.id} för att återanvända samma dokument nästa gång.`);
    }
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`content:export:gdocs misslyckades: ${message}`);
  process.exit(1);
});
