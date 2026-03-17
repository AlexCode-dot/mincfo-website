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
const HOME_SHARED_KEYS = new Set(["navigation", "offering", "howItWorks", "security", "footer"]);

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_DOCS_SCOPE = "https://www.googleapis.com/auth/documents";
const GOOGLE_DOCS_API = "https://docs.googleapis.com/v1";

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

const ELEMENT_LABEL_ALIASES = {
  "Logga in / Sign up label": ["Kontakta Oss"],
};

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

function labelForKey(rawKey, fallback) {
  return LABEL_OVERRIDES[rawKey] ?? fallback;
}

function isVisualField(rawKey) {
  return VISUAL_KEYS.has(rawKey);
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
      const doubleQuoted = value.startsWith('"') && value.endsWith('"');
      if (singleQuoted || doubleQuoted) value = value.slice(1, -1);
      process.env[key] = value;
    }
  }
}

function base64UrlEncode(input) {
  const raw = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return raw.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function loadServiceAccount() {
  const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE?.trim();
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON?.trim();

  let raw = "";
  if (keyFile) {
    if (!fs.existsSync(keyFile)) throw new Error(`Hittar inte service account-fil: ${keyFile}`);
    raw = fs.readFileSync(keyFile, "utf8");
  } else if (keyJson) {
    raw = keyJson;
  } else {
    throw new Error("Saknar service account-nyckel. Sätt GOOGLE_SERVICE_ACCOUNT_KEY_FILE eller GOOGLE_SERVICE_ACCOUNT_KEY_JSON.");
  }

  const parsed = JSON.parse(raw);
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("Service account JSON måste innehålla client_email och private_key.");
  }
  return parsed;
}

async function getAccessToken(serviceAccount) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600;

  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: GOOGLE_DOCS_SCOPE,
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
    throw new Error(`Kunde inte hämta access token (${response.status}): ${await response.text()}`);
  }
  const json = await response.json();
  if (!json.access_token) throw new Error("Google token-svar saknar access_token.");
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
    throw new Error(`Google API-fel (${response.status}) ${url}: ${await response.text()}`);
  }
  return response.json();
}

async function getDocument(accessToken, docId) {
  return googleApiFetch(accessToken, `${GOOGLE_DOCS_API}/documents/${encodeURIComponent(docId)}`, {
    method: "GET",
  });
}

function getTextFromParagraph(paragraph) {
  if (!paragraph?.elements) return "";
  return paragraph.elements
    .map((el) => el?.textRun?.content ?? "")
    .join("")
    .replace(/\n/g, "")
    .trim();
}

function getTextFromCell(cell) {
  const chunks = [];
  for (const contentItem of cell?.content ?? []) {
    const paragraph = contentItem?.paragraph;
    if (!paragraph?.elements) continue;
    for (const element of paragraph.elements) {
      if (element?.textRun?.content) chunks.push(element.textRun.content);
    }
  }
  return chunks.join("").replace(/\n/g, "").trim();
}

function extractSectionsFromDocument(doc) {
  const sections = new Map();
  let currentHeading = "";

  for (const item of doc?.body?.content ?? []) {
    if (item?.paragraph) {
      const style = item.paragraph.paragraphStyle?.namedStyleType ?? "";
      if (style === "HEADING_3") {
        const title = getTextFromParagraph(item.paragraph);
        if (title) currentHeading = title;
      }
      continue;
    }

    if (item?.table && currentHeading) {
      const rows = item.table.tableRows ?? [];
      if (!rows.length) continue;
      const headerCells = rows[0].tableCells ?? [];
      const headers = headerCells.map((cell) => getTextFromCell(cell));
      const elementCol = headers.findIndex((h) => /^Element$/i.test(h));
      const valueCol = headers.findIndex((h) => /^Website Text/i.test(h));
      if (elementCol < 0 || valueCol < 0) continue;

      const parsedRows = [];
      for (let i = 1; i < rows.length; i += 1) {
        const cells = rows[i].tableCells ?? [];
        const element = getTextFromCell(cells[elementCol]);
        const value = getTextFromCell(cells[valueCol]);
        if (!element) continue;
        parsedRows.push({ element, value });
      }
      const existingRows = sections.get(currentHeading) ?? [];
      sections.set(currentHeading, existingRows.concat(parsedRows));
    }
  }

  return sections;
}

const SOLUTION_SECTION_ALIASES = {
  "CEO & Founders": [
    "VD:ar och grundare",
    "VDar och grundare",
    "VD och grundare",
  ],
  "CFO & Finance Team": [
    "CFO & Ekonomifunktion",
    "CFO & Ekonomifunktionen",
  ],
};

function normalizeSectionTitle(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " och ")
    .replace(/\band\b/g, "och")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripSolutionPrefix(value) {
  return value.replace(/^losning for\s+/i, "").trim();
}

function buildSolutionHeadingCandidates(page) {
  const labels = new Set();

  if (typeof page?.key === "string" && page.key.trim()) {
    labels.add(page.key.trim());
    const aliases = SOLUTION_SECTION_ALIASES[page.key.trim()];
    if (Array.isArray(aliases)) {
      aliases.forEach((alias) => labels.add(alias));
    }
  }

  if (typeof page?.eyebrow === "string" && page.eyebrow.trim()) {
    labels.add(page.eyebrow.trim());
  }

  if (typeof page?.heroHeadline?.second === "string" && page.heroHeadline.second.trim()) {
    labels.add(page.heroHeadline.second.trim());
  }

  const candidates = new Set();
  for (const label of labels) {
    const normalized = normalizeSectionTitle(label);
    if (!normalized) continue;
    candidates.add(normalized);
    candidates.add(stripSolutionPrefix(normalized));
  }

  return candidates;
}

function resolveSolutionSectionRows(page, solutionsSections, usedHeadings) {
  const candidates = buildSolutionHeadingCandidates(page);

  for (const [heading, rows] of solutionsSections.entries()) {
    if (usedHeadings.has(heading)) continue;
    const normalizedHeading = normalizeSectionTitle(heading);
    if (!normalizedHeading) continue;
    const headingWithoutPrefix = stripSolutionPrefix(normalizedHeading);
    if (candidates.has(normalizedHeading) || candidates.has(headingWithoutPrefix)) {
      usedHeadings.add(heading);
      return rows;
    }
  }

  return null;
}

function buildBindingsFromValue(value, rawKey, label, path, options = {}) {
  const { includeVisual = false, context = "" } = options;
  const bindings = [];

  const walk = (currentValue, currentRawKey, currentLabel, currentPath, currentContext) => {
    if (NON_TEXT_KEYS.has(currentRawKey)) return;
    const visual = isVisualField(currentRawKey);
    if (!includeVisual && visual) return;
    if (includeVisual && !visual && currentRawKey !== "examples" && currentRawKey !== "dashboard" && currentRawKey !== "planning") {
      // In visual mode we still allow nested export paths that contain visual child keys.
    }

    const elementLabel = currentContext ? `${currentContext} · ${currentLabel}` : currentLabel;

    if (currentValue == null || ["string", "number", "boolean"].includes(typeof currentValue)) {
      bindings.push({ element: elementLabel, path: currentPath });
      return;
    }

    if (Array.isArray(currentValue)) {
      if (currentValue.every((item) => item == null || ["string", "number", "boolean"].includes(typeof item))) {
        currentValue.forEach((_, index) => {
          bindings.push({ element: `${elementLabel} – Punkt ${index + 1}`, path: [...currentPath, index] });
        });
        return;
      }

      currentValue.forEach((item, index) => {
        if (!item || typeof item !== "object") return;
        const itemTitle =
          (typeof item.title === "string" && item.title) ||
          (typeof item.name === "string" && item.name) ||
          `${currentLabel} ${index + 1}`;
        if (typeof item.title === "string") {
          bindings.push({ element: `${itemTitle} · Rubrik`, path: [...currentPath, index, "title"] });
        }
        if (typeof item.name === "string") {
          bindings.push({ element: `${itemTitle} · Namn`, path: [...currentPath, index, "name"] });
        }

        Object.entries(item).forEach(([childKey, childValue]) => {
          if ((childKey === "title" || childKey === "name") && typeof childValue === "string") return;
          walk(
            childValue,
            childKey,
            labelForKey(childKey, toHeading(childKey)),
            [...currentPath, index, childKey],
            itemTitle,
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
        [...currentPath, childKey],
        currentLabel,
      );
    });
  };

  walk(value, rawKey, label, path, context);
  return bindings;
}

function coerceValue(input, currentValue) {
  if (typeof currentValue === "number") {
    const normalized = input.replace(/\s+/g, "").replace(",", ".").replace(/[^0-9.-]/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : currentValue;
  }
  if (typeof currentValue === "boolean") {
    const normalized = input.trim().toLowerCase();
    if (["true", "1", "ja", "yes", "y"].includes(normalized)) return true;
    if (["false", "0", "nej", "no", "n"].includes(normalized)) return false;
    return currentValue;
  }
  if (currentValue == null) return input;
  return input;
}

function setAtPath(obj, pathParts, value) {
  if (!pathParts.length) return;
  let cursor = obj;
  for (let i = 0; i < pathParts.length - 1; i += 1) {
    const part = pathParts[i];
    if (cursor[part] == null) {
      cursor[part] = typeof pathParts[i + 1] === "number" ? [] : {};
    }
    cursor = cursor[part];
  }
  const last = pathParts[pathParts.length - 1];
  const currentValue = cursor[last];
  cursor[last] = coerceValue(value, currentValue);
}

function applyRowsToBindings(targetObj, bindings, rows) {
  const rowBuckets = new Map();
  for (const row of rows) {
    if (!rowBuckets.has(row.element)) rowBuckets.set(row.element, []);
    rowBuckets.get(row.element).push(row.value ?? "");
  }

  const resolveQueue = (element) => {
    const direct = rowBuckets.get(element);
    if (direct?.length) return direct;

    const aliases = ELEMENT_LABEL_ALIASES[element];
    if (!Array.isArray(aliases)) return null;

    for (const alias of aliases) {
      const queue = rowBuckets.get(alias);
      if (queue?.length) return queue;
    }
    return null;
  };

  for (const binding of bindings) {
    const queue = resolveQueue(binding.element);
    if (!queue?.length) continue;
    const nextValue = queue.shift();
    setAtPath(targetObj, binding.path, nextValue);
  }
}

function buildHomeSectionBindings(home) {
  const sectionBindings = new Map();
  const add = (title, rows) => sectionBindings.set(title, rows);

  const sharedSections = [
    ["navigation", "Gemensamt - Navigering"],
    ["offering", "Gemensamt - Erbjudande"],
    ["security", "Gemensamt - Säkerhet"],
    ["footer", "Gemensamt - Footer"],
  ];

  for (const [key, title] of sharedSections) {
    const rows = [];
    for (const [childKey, value] of Object.entries(home[key] ?? {})) {
      rows.push(...buildBindingsFromValue(value, childKey, labelForKey(childKey, toHeading(childKey)), [key, childKey]));
    }
    add(title, rows);
  }

  const hiw = home.howItWorks ?? {};
  add("Gemensamt - Så här fungerar det - Översikt", [
    { element: labelForKey("sectionTitle", toHeading("sectionTitle")), path: ["howItWorks", "sectionTitle"] },
    { element: labelForKey("sectionIntro", toHeading("sectionIntro")), path: ["howItWorks", "sectionIntro"] },
    ...buildBindingsFromValue(
      hiw.sectionIntroByOffer ?? {},
      "sectionIntroByOffer",
      "Sektionsintro per erbjudande",
      ["howItWorks", "sectionIntroByOffer"],
    ),
  ]);

  const offers = hiw.offers ?? {};
  for (const [offerKey, offerValue] of Object.entries(offers)) {
    const offerLabel = labelForKey(offerKey, toHeading(offerKey));
    add(`Gemensamt - Så här fungerar det - ${offerLabel}`, [
      { element: labelForKey("tabLabel", toHeading("tabLabel")), path: ["howItWorks", "offers", offerKey, "tabLabel"] },
    ]);

    if (!Array.isArray(offerValue?.steps)) continue;
    offerValue.steps.forEach((step, idx) => {
      const stepTitle = typeof step?.title === "string" && step.title.trim() ? step.title : `Steg ${idx + 1}`;
      const rows = [{ element: labelForKey("title", toHeading("title")), path: ["howItWorks", "offers", offerKey, "steps", idx, "title"] }];
      Object.entries(step ?? {}).forEach(([k, v]) => {
        if (k === "title") return;
        rows.push(
          ...buildBindingsFromValue(v, k, labelForKey(k, toHeading(k)), ["howItWorks", "offers", offerKey, "steps", idx, k]),
        );
      });
      add(`Gemensamt - Så här fungerar det - ${offerLabel} - ${stepTitle}`, rows);
    });
  }

  const modeConfigs = [
    { key: "platform", title: "Plattform" },
    { key: "full-service", title: "Helhetslösning" },
    { key: "partner", title: "För byråer" },
  ];

  for (const modeConfig of modeConfigs) {
    const mode = home[modeConfig.key] ?? {};
    const simpleModeSections = [
      ["hero", `${modeConfig.title} - Hero`],
      ["solutions", `${modeConfig.title} - Lösningar`],
      ["customers", `${modeConfig.title} - Kundcase`],
      ["ending", `${modeConfig.title} - Avslut / CTA`],
    ];

    for (const [key, title] of simpleModeSections) {
      const rows = [];
      for (const [childKey, value] of Object.entries(mode[key] ?? {})) {
        rows.push(
          ...buildBindingsFromValue(value, childKey, labelForKey(childKey, toHeading(childKey)), [modeConfig.key, key, childKey]),
        );
      }
      add(title, rows);
    }

    const aic = mode.aicopilot ?? {};
    add(
      `${modeConfig.title} - Produkt (AI-Copilot)`,
      ["leftPill", "leftTitle", "leftIntro", "leftBullets"].flatMap((k) =>
        k in aic
          ? buildBindingsFromValue(aic[k], k, labelForKey(k, toHeading(k)), [modeConfig.key, "aicopilot", k])
          : [],
      ),
    );
    add(
      `${modeConfig.title} - Produkt (Dashboard)`,
      ["pill", "title", "intro", "kpiBullets"].flatMap((k) =>
        k in (aic.dashboard ?? {})
          ? buildBindingsFromValue(
              aic.dashboard[k],
              k,
              labelForKey(k, toHeading(k)),
              [modeConfig.key, "aicopilot", "dashboard", k],
            )
          : [],
      ),
    );
    add(
      `${modeConfig.title} - Produkt (Planering & Jämförelse)`,
      ["pill", "title", "intro", "bullets"].flatMap((k) =>
        k in (aic.planning ?? {})
          ? buildBindingsFromValue(
              aic.planning[k],
              k,
              labelForKey(k, toHeading(k)),
              [modeConfig.key, "aicopilot", "planning", k],
            )
          : [],
      ),
    );
  }

  const visualSections = [
    [
      "Gemensamt - Så här fungerar det - Plattform / Skapa konto (UI)",
      ["howItWorks.ui.account", null],
    ],
    [
      "Gemensamt - Så här fungerar det - Plattform / Koppla Fortnox (UI)",
      ["howItWorks.ui.connect", null],
    ],
    [
      "Gemensamt - Så här fungerar det - Plattform / Realtidsinsikter & AI (UI)",
      ["howItWorks.ui.insights", null],
    ],
    ["Gemensamt - Så här fungerar det - FaaS / Onboarding & scope (UI)", ["howItWorks.ui.faasOnboarding", null]],
    ["Gemensamt - Så här fungerar det - FaaS / Koppla system & behörigheter (UI)", ["howItWorks.ui.faasSystems", null]],
    ["Gemensamt - Så här fungerar det - FaaS / Vi sköter ekonomin (UI)", ["howItWorks.ui.faasRealtime", null]],
    ["Gemensamt - Så här fungerar det - Partner / Workspace (UI)", ["howItWorks.ui.partnerWorkspace", null]],
  ];

  for (const modeConfig of modeConfigs) {
    visualSections.push(
      [
        `${modeConfig.title} - Produkt (AI-Copilot) - Chattpanel (visual data)`,
        [`${modeConfig.key}.aicopilot`, ["panelTitle", "statusSending", "statusAnalyzing", "inputPlaceholder"]],
      ],
      [`${modeConfig.title} - Produkt (AI-Copilot) - Exempel (visual data)`, [`${modeConfig.key}.aicopilot`, ["examples"]]],
      [
        `${modeConfig.title} - Produkt (Dashboard) - Visual data`,
        [`${modeConfig.key}.aicopilot.dashboard`, ["resultTitle", "currentLabel", "previousLabel", "currencyLabel", "compareLabel", "metricOptions", "trendAxisTicks", "monthLabelsSv"]],
      ],
      [
        `${modeConfig.title} - Produkt (Planering & Jämförelse) - Visual data`,
        [`${modeConfig.key}.aicopilot.planning`, ["forecastTitle", "liveLabel", "reconciliationTitle", "reconciliationSubtext", "actualPrefix", "forecastPrefix", "vsPrevious", "annualVariance", "legend", "monthLabelsEn"]],
      ],
    );
  }

  const resolvePath = (obj, dotted) => dotted.split(".").reduce((acc, part) => acc?.[part], obj);
  for (const [title, [basePath, keys]] of visualSections) {
    const target = resolvePath(home, basePath);
    if (!target) continue;
    let rows = [];
    if (Array.isArray(keys)) {
      keys.forEach((k) => {
        if (!(k in target)) return;
        rows.push(...buildBindingsFromValue(target[k], k, labelForKey(k, toHeading(k)), [...basePath.split("."), k], { includeVisual: true }));
      });
    } else {
      Object.entries(target).forEach(([k, v]) => {
        rows.push(...buildBindingsFromValue(v, k, labelForKey(k, toHeading(k)), [...basePath.split("."), k], { includeVisual: true }));
      });
    }
    sectionBindings.set(title, rows);
  }

  return sectionBindings;
}

function buildSolutionsSectionBindings(solutions) {
  const sectionBindings = new Map();

  if (solutions.shared) {
    const rows = [];
    Object.entries(solutions.shared).forEach(([k, v]) => {
      rows.push(...buildBindingsFromValue(v, k, labelForKey(k, toHeading(k)), ["shared", k]));
    });
    sectionBindings.set("Gemensamma texter", rows);
  }

  if (Array.isArray(solutions.pages)) {
    solutions.pages.forEach((page, pageIndex) => {
      const rows = [];
      Object.entries(page).forEach(([k, v]) => {
        if (k === "key") return;
        rows.push(...buildBindingsFromValue(v, k, labelForKey(k, toHeading(k)), ["pages", pageIndex, k]));
      });
      sectionBindings.set(page.key, rows);
    });
  }

  return sectionBindings;
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function loadHomePageTextTemplate() {
  if (fs.existsSync(HOME_SHARED_JSON_PATH) && fs.existsSync(HOME_PLATFORM_JSON_PATH)) {
    const shared = JSON.parse(fs.readFileSync(HOME_SHARED_JSON_PATH, "utf8"));
    const platform = JSON.parse(fs.readFileSync(HOME_PLATFORM_JSON_PATH, "utf8"));
    const fullService = fs.existsSync(HOME_FULL_SERVICE_JSON_PATH)
      ? JSON.parse(fs.readFileSync(HOME_FULL_SERVICE_JSON_PATH, "utf8"))
      : {};
    const partner = fs.existsSync(HOME_PARTNER_JSON_PATH)
      ? JSON.parse(fs.readFileSync(HOME_PARTNER_JSON_PATH, "utf8"))
      : {};
    return { ...shared, platform, "full-service": fullService, partner };
  }

  return JSON.parse(fs.readFileSync(HOME_PAGE_TEXT_JSON_PATH, "utf8"));
}

function writeHomePageText(homePageText) {
  const shared = Object.fromEntries(
    Object.entries(homePageText).filter(([key]) => HOME_SHARED_KEYS.has(key)),
  );
  const platform = homePageText.platform ?? {};
  const fullService = homePageText["full-service"] ?? {};
  const partner = homePageText.partner ?? {};
  writeJson(HOME_PAGE_TEXT_JSON_PATH, { ...shared, ...platform });
  fs.mkdirSync(HOME_CONTENT_DIR, { recursive: true });
  writeJson(HOME_SHARED_JSON_PATH, shared);
  writeJson(HOME_PLATFORM_JSON_PATH, platform);
  writeJson(HOME_FULL_SERVICE_JSON_PATH, fullService);
  writeJson(HOME_PARTNER_JSON_PATH, partner);
}

async function main() {
  loadEnvFiles();
  const mainDocId = process.env.GOOGLE_DOC_ID_MAIN?.trim();
  const solutionsDocId = process.env.GOOGLE_DOC_ID_SOLUTIONS?.trim();
  if (!mainDocId || !solutionsDocId) {
    throw new Error("Sätt GOOGLE_DOC_ID_MAIN och GOOGLE_DOC_ID_SOLUTIONS i .env.local");
  }

  const serviceAccount = loadServiceAccount();
  const accessToken = await getAccessToken(serviceAccount);

  const homeTemplate = loadHomePageTextTemplate();
  const solutionsTemplate = JSON.parse(fs.readFileSync(SOLUTION_PAGES_TEXT_JSON_PATH, "utf8"));

  const [homeDoc, solutionsDoc] = await Promise.all([
    getDocument(accessToken, mainDocId),
    getDocument(accessToken, solutionsDocId),
  ]);

  const homeSections = extractSectionsFromDocument(homeDoc);
  const solutionsSections = extractSectionsFromDocument(solutionsDoc);

  const homeBindings = buildHomeSectionBindings(homeTemplate);
  for (const [sectionTitle, bindings] of homeBindings.entries()) {
    const rows = homeSections.get(sectionTitle);
    if (!rows?.length) continue;
    applyRowsToBindings(homeTemplate, bindings, rows);
  }

  const solutionsBindings = buildSolutionsSectionBindings(solutionsTemplate);
  const usedSolutionHeadings = new Set();

  const sharedBindings = solutionsBindings.get("Gemensamma texter");
  if (sharedBindings) {
    const sharedRows = solutionsSections.get("Gemensamma texter");
    if (!sharedRows?.length) {
      console.warn('Varning: Sektionen "Gemensamma texter" hittades inte i lösningsdokumentet.');
    } else {
      usedSolutionHeadings.add("Gemensamma texter");
      applyRowsToBindings(solutionsTemplate, sharedBindings, sharedRows);
    }
  }

  if (Array.isArray(solutionsTemplate.pages)) {
    solutionsTemplate.pages.forEach((page, pageIndex) => {
      const sectionTitle = page?.key;
      if (typeof sectionTitle !== "string") return;

      const bindings = solutionsBindings.get(sectionTitle);
      if (!bindings?.length) return;

      const rows = resolveSolutionSectionRows(page, solutionsSections, usedSolutionHeadings);
      if (!rows?.length) {
        console.warn(
          `Varning: Kunde inte matcha lösningssektion för "${sectionTitle}" (index ${pageIndex}).`,
        );
        return;
      }
      applyRowsToBindings(solutionsTemplate, bindings, rows);
    });
  }

  writeHomePageText(homeTemplate);
  writeJson(SOLUTION_PAGES_TEXT_JSON_PATH, solutionsTemplate);

  console.log("Google Docs import klar:");
  console.log(`- ${path.relative(ROOT, HOME_PAGE_TEXT_JSON_PATH)}`);
  console.log(`- ${path.relative(ROOT, HOME_SHARED_JSON_PATH)}`);
  console.log(`- ${path.relative(ROOT, HOME_PLATFORM_JSON_PATH)}`);
  console.log(`- ${path.relative(ROOT, HOME_FULL_SERVICE_JSON_PATH)}`);
  console.log(`- ${path.relative(ROOT, HOME_PARTNER_JSON_PATH)}`);
  console.log(`- ${path.relative(ROOT, SOLUTION_PAGES_TEXT_JSON_PATH)}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`content:import:gdocs misslyckades: ${message}`);
  process.exit(1);
});
