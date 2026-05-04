import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env.local (same pattern as seed-sanity.mjs) ──
const envPath = resolve(__dirname, "../.env.local");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex);
    const value = trimmed.slice(eqIndex + 1);
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  // .env.local not found, rely on existing env vars
}

if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_WRITE_TOKEN) {
  console.error(
    "Missing env vars. Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN.",
  );
  process.exit(1);
}

// ── Create Sanity client ──
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// ── Load source JSON files ──
const sharedJson = JSON.parse(
  readFileSync(resolve(__dirname, "../src/content/home/shared.json"), "utf-8"),
);
const platformJson = JSON.parse(
  readFileSync(resolve(__dirname, "../src/content/home/platform.json"), "utf-8"),
);
const fullServiceJson = JSON.parse(
  readFileSync(resolve(__dirname, "../src/content/home/full-service.json"), "utf-8"),
);
const partnerJson = JSON.parse(
  readFileSync(resolve(__dirname, "../src/content/home/partner.json"), "utf-8"),
);
const solutionPagesJson = JSON.parse(
  readFileSync(resolve(__dirname, "../src/content/solutionPagesText.json"), "utf-8"),
);

// ── Counters ──
let matchCount = 0;
let missingCount = 0;
let mismatchCount = 0;
let totalCount = 0;

// ── Internal Sanity fields to skip ──
const SKIP_FIELDS = new Set(["_id", "_type", "_rev", "_createdAt", "_updatedAt", "_key"]);

// ── Helpers ──

function isNullish(val) {
  return val === null || val === undefined;
}

/**
 * Strip _key from objects and arrays (recursively) for comparison purposes.
 */
function stripKeys(val) {
  if (Array.isArray(val)) {
    return val.map(stripKeys);
  }
  if (val !== null && typeof val === "object") {
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      if (k === "_key") continue;
      out[k] = stripKeys(v);
    }
    return out;
  }
  return val;
}

/**
 * Deep equality check (after stripping _key).
 */
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, i) => deepEqual(item, b[i]));
  }
  if (typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a).filter((k) => !SKIP_FIELDS.has(k));
    const keysB = Object.keys(b).filter((k) => !SKIP_FIELDS.has(k));
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

function truncate(str, len = 80) {
  const s = typeof str === "string" ? str : JSON.stringify(str);
  return s.length > len ? s.slice(0, len) + "..." : s;
}

/**
 * Compare a single field. Logs result and updates counters.
 */
function compareField(docLabel, fieldPath, sanityVal, expectedVal) {
  totalCount++;
  const label = `  ${docLabel} > ${fieldPath}`;

  if (isNullish(sanityVal) && !isNullish(expectedVal)) {
    missingCount++;
    console.log(`\u2717 MISSING  ${label}`);
    console.log(`           expected: ${truncate(expectedVal)}`);
    return;
  }

  const a = stripKeys(sanityVal);
  const b = stripKeys(expectedVal);

  if (deepEqual(a, b)) {
    matchCount++;
    console.log(`\u2713 ${label}`);
  } else {
    mismatchCount++;
    console.log(`\u2717 MISMATCH ${label}`);
    console.log(`           sanity:   ${truncate(a)}`);
    console.log(`           expected: ${truncate(b)}`);
  }
}

/**
 * Compare array fields element-by-element, checking specific sub-fields.
 */
function compareArrayField(docLabel, fieldPath, sanityArr, expectedArr, subFields) {
  if (isNullish(sanityArr) && !isNullish(expectedArr)) {
    totalCount++;
    missingCount++;
    console.log(`\u2717 MISSING  ${docLabel} > ${fieldPath}`);
    console.log(`           expected: array with ${expectedArr.length} items`);
    return;
  }

  if (!Array.isArray(sanityArr) || !Array.isArray(expectedArr)) {
    compareField(docLabel, fieldPath, sanityArr, expectedArr);
    return;
  }

  if (sanityArr.length !== expectedArr.length) {
    totalCount++;
    mismatchCount++;
    console.log(
      `\u2717 MISMATCH ${docLabel} > ${fieldPath} (length: sanity=${sanityArr.length}, expected=${expectedArr.length})`,
    );
    return;
  }

  for (let i = 0; i < expectedArr.length; i++) {
    if (subFields) {
      for (const sf of subFields) {
        compareField(
          docLabel,
          `${fieldPath}[${i}].${sf}`,
          sanityArr[i]?.[sf],
          expectedArr[i]?.[sf],
        );
      }
    } else {
      compareField(docLabel, `${fieldPath}[${i}]`, sanityArr[i], expectedArr[i]);
    }
  }
}

// ── Fetch all Sanity documents ──

const docIds = [
  "siteSettings",
  "homeVariant-platform",
  "homeVariant-full-service",
  "homeVariant-partner",
  "solution-ceo-founders",
  "solution-cfo-finance",
  "solution-saas-tech",
  "solution-konsult-tjanster",
  "solution-ehandel",
];

async function validate() {
  console.log("Fetching Sanity documents...\n");

  const docs = {};
  for (const id of docIds) {
    const doc = await client.getDocument(id);
    docs[id] = doc ?? null;
    if (!doc) {
      console.log(`WARNING: Document "${id}" not found in Sanity.\n`);
    }
  }

  // ════════════════════════════════════════════
  // siteSettings
  // ════════════════════════════════════════════
  const ss = docs["siteSettings"];
  const ssLabel = "siteSettings";

  if (!ss) {
    console.log("SKIPPING siteSettings — document not found.\n");
  } else {
    console.log("── siteSettings ──");

    // Simple fields
    compareField(ssLabel, "siteTitle", ss.siteTitle, sharedJson.siteMeta.title);
    compareField(ssLabel, "siteDescription", ss.siteDescription, sharedJson.siteMeta.description);
    compareField(ssLabel, "navDemoCta", ss.navDemoCta, sharedJson.navigation.demoCta);
    compareField(ssLabel, "navLoginLabel", ss.navLoginLabel, sharedJson.navigation.loginSignupLabel);
    compareField(ssLabel, "offeringEyebrow", ss.offeringEyebrow, sharedJson.offering.eyebrow);
    compareField(ssLabel, "offeringTitle", ss.offeringTitle, sharedJson.offering.title);
    compareField(ssLabel, "offeringIntro", ss.offeringIntro, sharedJson.offering.intro);

    // offeringOptions[]
    const expectedOptions = sharedJson.offering.options.map((o) => ({
      id: o.id,
      label: o.label,
      title: o.title,
      body: o.body,
      bullets: o.bullets,
      cta: o.cta,
    }));
    compareArrayField(ssLabel, "offeringOptions", ss.offeringOptions, expectedOptions, [
      "id",
      "label",
      "title",
      "body",
      "bullets",
      "cta",
    ]);

    compareField(
      ssLabel,
      "howItWorksSectionTitle",
      ss.howItWorksSectionTitle,
      sharedJson.howItWorks.sectionTitle,
    );

    // Security
    compareField(ssLabel, "securityPill", ss.securityPill, sharedJson.security.pill);
    compareField(ssLabel, "securityTitle", ss.securityTitle, sharedJson.security.title);
    compareField(ssLabel, "securityIntro", ss.securityIntro, sharedJson.security.intro);
    compareArrayField(
      ssLabel,
      "securityCards",
      ss.securityCards,
      sharedJson.security.cards.map((c) => ({ title: c.title, body: c.body })),
      ["title", "body"],
    );

    // Footer
    compareField(ssLabel, "footerIntro", ss.footerIntro, sharedJson.footer.intro);
    compareField(ssLabel, "footerCareersCta", ss.footerCareersCta, sharedJson.footer.careersCta);
    compareField(ssLabel, "footerEmail", ss.footerEmail, sharedJson.footer.email);
    compareField(ssLabel, "footerOffice1", ss.footerOffice1, sharedJson.footer.office1);
    compareField(ssLabel, "footerOffice2", ss.footerOffice2, sharedJson.footer.office2);
    compareField(ssLabel, "footerCopyright", ss.footerCopyright, sharedJson.footer.copyright);

    // Showcase shared
    compareField(
      ssLabel,
      "showcaseShared.introLines",
      ss.showcaseShared?.introLines,
      sharedJson.offering.showcase.introLines,
    );
    compareField(
      ssLabel,
      "showcaseShared.previewLabel",
      ss.showcaseShared?.previewLabel,
      sharedJson.offering.showcase.previewLabel,
    );

    // Showcase platform
    compareField(
      ssLabel,
      "showcasePlatform.signal",
      ss.showcasePlatform?.signal,
      sharedJson.offering.showcase.platform.signal,
    );
    compareField(
      ssLabel,
      "showcasePlatform.chartLabel",
      ss.showcasePlatform?.chartLabel,
      sharedJson.offering.showcase.platform.chartLabel,
    );
    compareArrayField(
      ssLabel,
      "showcasePlatform.stats",
      ss.showcasePlatform?.stats,
      sharedJson.offering.showcase.platform.stats.map((s) => ({ label: s.label, value: s.value })),
      ["label", "value"],
    );

    // Showcase full-service
    const fsVisual = sharedJson.offering.showcase["full-service"].serviceVisual;
    compareField(
      ssLabel,
      "showcaseFullService.chipOwnership",
      ss.showcaseFullService?.chipOwnership,
      fsVisual.chipOwnership,
    );
    compareField(
      ssLabel,
      "showcaseFullService.chipDelivery",
      ss.showcaseFullService?.chipDelivery,
      fsVisual.chipDelivery,
    );
    compareField(
      ssLabel,
      "showcaseFullService.chipLeadership",
      ss.showcaseFullService?.chipLeadership,
      fsVisual.chipLeadership,
    );
    compareField(
      ssLabel,
      "showcaseFullService.eyebrow",
      ss.showcaseFullService?.eyebrow,
      fsVisual.eyebrow,
    );
    compareField(
      ssLabel,
      "showcaseFullService.title",
      ss.showcaseFullService?.title,
      fsVisual.title,
    );
    compareField(
      ssLabel,
      "showcaseFullService.badge",
      ss.showcaseFullService?.badge,
      fsVisual.badge,
    );
    compareField(
      ssLabel,
      "showcaseFullService.steps",
      ss.showcaseFullService?.steps,
      fsVisual.steps,
    );
    compareField(
      ssLabel,
      "showcaseFullService.summaryReportLabel",
      ss.showcaseFullService?.summaryReportLabel,
      fsVisual.summaryReportLabel,
    );
    compareField(
      ssLabel,
      "showcaseFullService.summaryReportValue",
      ss.showcaseFullService?.summaryReportValue,
      fsVisual.summaryReportValue,
    );
    compareField(
      ssLabel,
      "showcaseFullService.summaryAlertsLabel",
      ss.showcaseFullService?.summaryAlertsLabel,
      fsVisual.summaryAlertsLabel,
    );
    compareField(
      ssLabel,
      "showcaseFullService.summaryAlertsValue",
      ss.showcaseFullService?.summaryAlertsValue,
      fsVisual.summaryAlertsValue,
    );

    // HIW Account
    const acct = sharedJson.howItWorks.ui.account;
    compareField(ssLabel, "hiwAccount.secureLabel", ss.hiwAccount?.secureLabel, acct.secureLabel);
    compareField(ssLabel, "hiwAccount.tabCreate", ss.hiwAccount?.tabCreate, acct.tabCreate);
    compareField(ssLabel, "hiwAccount.tabLogin", ss.hiwAccount?.tabLogin, acct.tabLogin);
    compareField(ssLabel, "hiwAccount.emailLabel", ss.hiwAccount?.emailLabel, acct.emailLabel);
    compareField(
      ssLabel,
      "hiwAccount.passwordLabel",
      ss.hiwAccount?.passwordLabel,
      acct.passwordLabel,
    );
    compareField(ssLabel, "hiwAccount.termsLabel", ss.hiwAccount?.termsLabel, acct.termsLabel);
    compareField(ssLabel, "hiwAccount.buttonLabel", ss.hiwAccount?.buttonLabel, acct.buttonLabel);
    compareField(
      ssLabel,
      "hiwAccount.existingAccountLabel",
      ss.hiwAccount?.existingAccountLabel,
      acct.existingAccountLabel,
    );
    compareField(
      ssLabel,
      "hiwAccount.loginLinkLabel",
      ss.hiwAccount?.loginLinkLabel,
      acct.loginLinkLabel,
    );
    compareField(
      ssLabel,
      "hiwAccount.welcomeTitle",
      ss.hiwAccount?.welcomeTitle,
      acct.welcomeTitle,
    );
    compareField(
      ssLabel,
      "hiwAccount.welcomeSubtitle",
      ss.hiwAccount?.welcomeSubtitle,
      acct.welcomeSubtitle,
    );
    compareField(
      ssLabel,
      "hiwAccount.continueWithGoogle",
      ss.hiwAccount?.continueWithGoogle,
      acct.continueWithGoogle,
    );
    compareField(
      ssLabel,
      "hiwAccount.continueWithMicrosoft",
      ss.hiwAccount?.continueWithMicrosoft,
      acct.continueWithMicrosoft,
    );
    compareField(
      ssLabel,
      "hiwAccount.dividerLabel",
      ss.hiwAccount?.dividerLabel,
      acct.dividerLabel,
    );
    compareField(
      ssLabel,
      "hiwAccount.emailInputPlaceholder",
      ss.hiwAccount?.emailInputPlaceholder,
      acct.emailInputPlaceholder,
    );
    compareField(
      ssLabel,
      "hiwAccount.continueLabel",
      ss.hiwAccount?.continueLabel,
      acct.continueLabel,
    );

    // HIW Connect
    const conn = sharedJson.howItWorks.ui.connect;
    compareField(ssLabel, "hiwConnect.fortnoxWord", ss.hiwConnect?.fortnoxWord, conn.fortnoxWord);
    compareField(
      ssLabel,
      "hiwConnect.accountConnected",
      ss.hiwConnect?.accountConnected,
      conn.accountConnected,
    );
    compareField(ssLabel, "hiwConnect.mincfoWord", ss.hiwConnect?.mincfoWord, conn.mincfoWord);
    compareField(
      ssLabel,
      "hiwConnect.receivingData",
      ss.hiwConnect?.receivingData,
      conn.receivingData,
    );
    compareField(
      ssLabel,
      "hiwConnect.integrationActive",
      ss.hiwConnect?.integrationActive,
      conn.integrationActive,
    );
    compareField(
      ssLabel,
      "hiwConnect.lastSyncLabel",
      ss.hiwConnect?.lastSyncLabel,
      conn.lastSyncLabel,
    );

    // HIW Insights
    const ins = sharedJson.howItWorks.ui.insights;
    compareField(ssLabel, "hiwInsights.title", ss.hiwInsights?.title, ins.title);
    compareField(ssLabel, "hiwInsights.question", ss.hiwInsights?.question, ins.question);
    compareField(
      ssLabel,
      "hiwInsights.thinkingLabel",
      ss.hiwInsights?.thinkingLabel,
      ins.thinkingLabel,
    );
    compareField(
      ssLabel,
      "hiwInsights.generatedForecastLabel",
      ss.hiwInsights?.generatedForecastLabel,
      ins.generatedForecastLabel,
    );
    compareField(
      ssLabel,
      "hiwInsights.runwayMonthsLabel",
      ss.hiwInsights?.runwayMonthsLabel,
      ins.runwayMonthsLabel,
    );
    compareField(ssLabel, "hiwInsights.barCurrent", ss.hiwInsights?.barCurrent, ins.barCurrent);
    compareField(ssLabel, "hiwInsights.barPlan", ss.hiwInsights?.barPlan, ins.barPlan);
    compareField(ssLabel, "hiwInsights.barScenario", ss.hiwInsights?.barScenario, ins.barScenario);
    compareField(ssLabel, "hiwInsights.summary", ss.hiwInsights?.summary, ins.summary);
    compareField(ssLabel, "hiwInsights.inputHint", ss.hiwInsights?.inputHint, ins.inputHint);
    compareField(ssLabel, "hiwInsights.inputTyped", ss.hiwInsights?.inputTyped, ins.inputTyped);

    // HIW FaaS Realtime
    const frt = sharedJson.howItWorks.ui.faasRealtime;
    compareField(
      ssLabel,
      "hiwFaasRealtime.statusUpdated",
      ss.hiwFaasRealtime?.statusUpdated,
      frt.statusUpdated,
    );
    compareField(
      ssLabel,
      "hiwFaasRealtime.cashflowLabel",
      ss.hiwFaasRealtime?.cashflowLabel,
      frt.cashflowLabel,
    );
    compareField(
      ssLabel,
      "hiwFaasRealtime.runwayLabel",
      ss.hiwFaasRealtime?.runwayLabel,
      frt.runwayLabel,
    );
    compareField(
      ssLabel,
      "hiwFaasRealtime.monthSuffix",
      ss.hiwFaasRealtime?.monthSuffix,
      frt.monthSuffix,
    );
    compareField(
      ssLabel,
      "hiwFaasRealtime.deviationLabel",
      ss.hiwFaasRealtime?.deviationLabel,
      frt.deviationLabel,
    );
    compareField(ssLabel, "hiwFaasRealtime.months", ss.hiwFaasRealtime?.months, frt.months);
    compareField(
      ssLabel,
      "hiwFaasRealtime.personnelAlertTemplate",
      ss.hiwFaasRealtime?.personnelAlertTemplate,
      frt.personnelAlertTemplate,
    );
    compareField(
      ssLabel,
      "hiwFaasRealtime.latePaymentsAlert",
      ss.hiwFaasRealtime?.latePaymentsAlert,
      frt.latePaymentsAlert,
    );

    // HIW FaaS Onboarding Badge
    compareField(
      ssLabel,
      "hiwFaasOnboardingBadge",
      ss.hiwFaasOnboardingBadge,
      sharedJson.howItWorks.ui.faasOnboarding.badgeLabel,
    );

    // HIW Systems
    const sys = sharedJson.howItWorks.ui.faasSystems;
    compareField(ssLabel, "hiwSystems.hubLabel", ss.hiwSystems?.hubLabel, sys.hubLabel);
    compareField(ssLabel, "hiwSystems.bankLabel", ss.hiwSystems?.bankLabel, sys.bankLabel);
    compareField(
      ssLabel,
      "hiwSystems.skatteverketLabel",
      ss.hiwSystems?.skatteverketLabel,
      sys.skatteverketLabel,
    );
    compareField(
      ssLabel,
      "hiwSystems.fortnoxLabel",
      ss.hiwSystems?.fortnoxLabel,
      sys.fortnoxLabel,
    );
    compareField(
      ssLabel,
      "hiwSystems.payrollLabel",
      ss.hiwSystems?.payrollLabel,
      sys.payrollLabel,
    );
    compareField(
      ssLabel,
      "hiwSystems.paymentsLabel",
      ss.hiwSystems?.paymentsLabel,
      sys.paymentsLabel,
    );
    compareField(
      ssLabel,
      "hiwSystems.customerTeamLabel",
      ss.hiwSystems?.customerTeamLabel,
      sys.customerTeamLabel,
    );
    compareField(
      ssLabel,
      "hiwSystems.partnerTopLeft",
      ss.hiwSystems?.partnerTopLeft,
      sys.partnerLabels.topLeft,
    );
    compareField(
      ssLabel,
      "hiwSystems.partnerTopCenter",
      ss.hiwSystems?.partnerTopCenter,
      sys.partnerLabels.topCenter,
    );
    compareField(
      ssLabel,
      "hiwSystems.partnerTopRight",
      ss.hiwSystems?.partnerTopRight,
      sys.partnerLabels.topRight,
    );
    compareField(
      ssLabel,
      "hiwSystems.partnerMidLeft",
      ss.hiwSystems?.partnerMidLeft,
      sys.partnerLabels.midLeft,
    );
    compareField(
      ssLabel,
      "hiwSystems.partnerMidRight",
      ss.hiwSystems?.partnerMidRight,
      sys.partnerLabels.midRight,
    );
    compareField(
      ssLabel,
      "hiwSystems.partnerBottomCenter",
      ss.hiwSystems?.partnerBottomCenter,
      sys.partnerLabels.bottomCenter,
    );

    // HIW Partner Workspace
    const pw = sharedJson.howItWorks.ui.partnerWorkspace;
    compareField(ssLabel, "hiwPartnerWorkspace.navHome", ss.hiwPartnerWorkspace?.navHome, pw.nav.home);
    compareField(ssLabel, "hiwPartnerWorkspace.navUsers", ss.hiwPartnerWorkspace?.navUsers, pw.nav.users);
    compareField(ssLabel, "hiwPartnerWorkspace.navSettings", ss.hiwPartnerWorkspace?.navSettings, pw.nav.settings);
    compareField(ssLabel, "hiwPartnerWorkspace.homeTitle", ss.hiwPartnerWorkspace?.homeTitle, pw.home.title);
    compareField(ssLabel, "hiwPartnerWorkspace.homeSubtitle", ss.hiwPartnerWorkspace?.homeSubtitle, pw.home.subtitle);
    compareField(ssLabel, "hiwPartnerWorkspace.homeColumns", ss.hiwPartnerWorkspace?.homeColumns, pw.home.columns);
    compareField(ssLabel, "hiwPartnerWorkspace.homeActionLabel", ss.hiwPartnerWorkspace?.homeActionLabel, pw.home.actionLabel);
    compareArrayField(
      ssLabel,
      "hiwPartnerWorkspace.homeRows",
      ss.hiwPartnerWorkspace?.homeRows,
      pw.home.rows.map((r) => ({ label: r.label, detail: r.detail, tag: r.tag, status: r.status })),
      ["label", "detail", "tag", "status"],
    );
    compareField(ssLabel, "hiwPartnerWorkspace.usersTitle", ss.hiwPartnerWorkspace?.usersTitle, pw.users.title);
    compareField(ssLabel, "hiwPartnerWorkspace.usersSubtitle", ss.hiwPartnerWorkspace?.usersSubtitle, pw.users.subtitle);
    compareField(ssLabel, "hiwPartnerWorkspace.usersColumns", ss.hiwPartnerWorkspace?.usersColumns, pw.users.columns);
    compareField(ssLabel, "hiwPartnerWorkspace.usersActionLabel", ss.hiwPartnerWorkspace?.usersActionLabel, pw.users.actionLabel);
    compareArrayField(
      ssLabel,
      "hiwPartnerWorkspace.usersRows",
      ss.hiwPartnerWorkspace?.usersRows,
      pw.users.rows.map((r) => ({ label: r.label, detail: r.detail, tag: r.tag, status: r.status })),
      ["label", "detail", "tag", "status"],
    );
    compareField(ssLabel, "hiwPartnerWorkspace.usersSearchPlaceholder", ss.hiwPartnerWorkspace?.usersSearchPlaceholder, pw.users.searchPlaceholder);
    compareField(ssLabel, "hiwPartnerWorkspace.usersInviteLabel", ss.hiwPartnerWorkspace?.usersInviteLabel, pw.users.inviteLabel);
    compareField(ssLabel, "hiwPartnerWorkspace.settingsTitle", ss.hiwPartnerWorkspace?.settingsTitle, pw.settings.title);
    compareField(ssLabel, "hiwPartnerWorkspace.settingsSubtitle", ss.hiwPartnerWorkspace?.settingsSubtitle, pw.settings.subtitle);
    compareField(ssLabel, "hiwPartnerWorkspace.settingsColumns", ss.hiwPartnerWorkspace?.settingsColumns, pw.settings.columns);
    compareField(ssLabel, "hiwPartnerWorkspace.settingsActionLabel", ss.hiwPartnerWorkspace?.settingsActionLabel, pw.settings.actionLabel);
    compareArrayField(
      ssLabel,
      "hiwPartnerWorkspace.settingsRows",
      ss.hiwPartnerWorkspace?.settingsRows,
      pw.settings.rows.map((r) => ({ label: r.label, detail: r.detail, tag: r.tag, status: r.status })),
      ["label", "detail", "tag", "status"],
    );
    compareField(ssLabel, "hiwPartnerWorkspace.settingsAppearanceTitle", ss.hiwPartnerWorkspace?.settingsAppearanceTitle, pw.settings.appearanceTitle);
    compareField(ssLabel, "hiwPartnerWorkspace.settingsAppearanceBody", ss.hiwPartnerWorkspace?.settingsAppearanceBody, pw.settings.appearanceBody);
    compareField(ssLabel, "hiwPartnerWorkspace.settingsModeLight", ss.hiwPartnerWorkspace?.settingsModeLight, pw.settings.modes.light);
    compareField(ssLabel, "hiwPartnerWorkspace.settingsModeDark", ss.hiwPartnerWorkspace?.settingsModeDark, pw.settings.modes.dark);
    compareField(ssLabel, "hiwPartnerWorkspace.settingsLanguageTitle", ss.hiwPartnerWorkspace?.settingsLanguageTitle, pw.settings.languageTitle);
    compareField(ssLabel, "hiwPartnerWorkspace.settingsLanguageBody", ss.hiwPartnerWorkspace?.settingsLanguageBody, pw.settings.languageBody);
    compareField(ssLabel, "hiwPartnerWorkspace.settingsLanguageValue", ss.hiwPartnerWorkspace?.settingsLanguageValue, pw.settings.languageValue);
    compareField(ssLabel, "hiwPartnerWorkspace.paginationPrevious", ss.hiwPartnerWorkspace?.paginationPrevious, pw.pagination.previous);
    compareField(ssLabel, "hiwPartnerWorkspace.paginationNext", ss.hiwPartnerWorkspace?.paginationNext, pw.pagination.next);
    compareField(ssLabel, "hiwPartnerWorkspace.summaryLabel", ss.hiwPartnerWorkspace?.summaryLabel, pw.summary.label);
    compareField(ssLabel, "hiwPartnerWorkspace.summaryTitle", ss.hiwPartnerWorkspace?.summaryTitle, pw.summary.title);
    compareField(ssLabel, "hiwPartnerWorkspace.summaryStatPrimary", ss.hiwPartnerWorkspace?.summaryStatPrimary, pw.summary.statPrimary);
    compareField(ssLabel, "hiwPartnerWorkspace.summaryStatSecondary", ss.hiwPartnerWorkspace?.summaryStatSecondary, pw.summary.statSecondary);

    // Scenario UI
    const sui = solutionPagesJson.shared.scenarioUi;
    compareField(ssLabel, "scenarioUi.typingStatus", ss.scenarioUi?.typingStatus, sui.typingStatus);
    compareField(ssLabel, "scenarioUi.analyzingStatus", ss.scenarioUi?.analyzingStatus, sui.analyzingStatus);
    compareField(ssLabel, "scenarioUi.readyStatus", ss.scenarioUi?.readyStatus, sui.readyStatus);
    compareField(ssLabel, "scenarioUi.copilotLabel", ss.scenarioUi?.copilotLabel, sui.copilotLabel);
    compareField(ssLabel, "scenarioUi.copilotResponseLabel", ss.scenarioUi?.copilotResponseLabel, sui.copilotResponseLabel);
    compareField(ssLabel, "scenarioUi.metaLoadingLabel", ss.scenarioUi?.metaLoadingLabel, sui.metaLoadingLabel);
    compareField(ssLabel, "scenarioUi.metaReadyLabel", ss.scenarioUi?.metaReadyLabel, sui.metaReadyLabel);
    compareField(ssLabel, "scenarioUi.boardTitle", ss.scenarioUi?.boardTitle, sui.boardTitle);
    compareField(ssLabel, "scenarioUi.boardBadge", ss.scenarioUi?.boardBadge, sui.boardBadge);
    compareField(ssLabel, "scenarioUi.chartComparisonLabel", ss.scenarioUi?.chartComparisonLabel, sui.chartComparisonLabel);
    compareField(ssLabel, "scenarioUi.legendBase", ss.scenarioUi?.legendBase, sui.legendBase);
    compareField(ssLabel, "scenarioUi.legendScenario", ss.scenarioUi?.legendScenario, sui.legendScenario);
    compareField(ssLabel, "scenarioUi.startLabel", ss.scenarioUi?.startLabel, sui.startLabel);
    compareField(ssLabel, "scenarioUi.waitingLabel", ss.scenarioUi?.waitingLabel, sui.waitingLabel);
    compareField(ssLabel, "scenarioUi.disclaimer", ss.scenarioUi?.disclaimer, sui.disclaimer);

    // Solution shared CTAs
    const sp = solutionPagesJson.shared;
    compareField(ssLabel, "solutionSharedCtas.heroPrimaryCta", ss.solutionSharedCtas?.heroPrimaryCta, sp.heroPrimaryCta);
    compareField(ssLabel, "solutionSharedCtas.heroSecondaryCta", ss.solutionSharedCtas?.heroSecondaryCta, sp.heroSecondaryCta);
    compareField(ssLabel, "solutionSharedCtas.helpsOverline", ss.solutionSharedCtas?.helpsOverline, sp.helpsOverline);
    compareField(ssLabel, "solutionSharedCtas.impactTag", ss.solutionSharedCtas?.impactTag, sp.impactTag);
    compareField(ssLabel, "solutionSharedCtas.closingOverline", ss.solutionSharedCtas?.closingOverline, sp.closingOverline);
    compareField(ssLabel, "solutionSharedCtas.closingAccent", ss.solutionSharedCtas?.closingAccent, sp.closingAccent);
    compareField(ssLabel, "solutionSharedCtas.closingCta", ss.solutionSharedCtas?.closingCta, sp.closingCta);
    compareField(ssLabel, "solutionSharedCtas.indexTitle", ss.solutionSharedCtas?.indexTitle, sp.indexPage.title);
    compareField(ssLabel, "solutionSharedCtas.indexDescription", ss.solutionSharedCtas?.indexDescription, sp.indexPage.description);

    console.log("");
  }

  // ════════════════════════════════════════════
  // homeVariant documents
  // ════════════════════════════════════════════
  const modeToOfferKey = {
    platform: "platform",
    "full-service": "faas",
    partner: "partner",
  };

  const variants = [
    { mode: "platform", json: platformJson },
    { mode: "full-service", json: fullServiceJson },
    { mode: "partner", json: partnerJson },
  ];

  for (const { mode, json } of variants) {
    const docId = `homeVariant-${mode}`;
    const doc = docs[docId];
    const label = docId;

    if (!doc) {
      console.log(`SKIPPING ${docId} — document not found.\n`);
      continue;
    }

    console.log(`── ${docId} ──`);

    const offerKey = modeToOfferKey[mode];
    const howItWorksOffer = sharedJson.howItWorks.offers[offerKey];
    const showcaseData = sharedJson.offering.showcase[mode];

    // Hero
    compareField(label, "heroTagline", doc.heroTagline, json.hero.tagline);
    compareField(label, "heroTitleLine1", doc.heroTitleLine1, json.hero.titleLine1);
    compareField(label, "heroTitleLine2", doc.heroTitleLine2, json.hero.titleLine2);
    compareField(label, "heroBody", doc.heroBody, json.hero.body);
    compareField(label, "heroPrimaryCta", doc.heroPrimaryCta, json.hero.primaryCta);
    compareField(label, "heroSecondaryCta", doc.heroSecondaryCta, json.hero.secondaryCta);

    // AI Copilot
    compareField(label, "aicopilotPill", doc.aicopilotPill, json.aicopilot.leftPill);
    compareField(label, "aicopilotTitle", doc.aicopilotTitle, json.aicopilot.leftTitle);
    compareField(label, "aicopilotIntro", doc.aicopilotIntro, json.aicopilot.leftIntro);
    compareField(label, "aicopilotBullets", doc.aicopilotBullets, json.aicopilot.leftBullets);

    // Dashboard
    compareField(label, "dashboardPill", doc.dashboardPill, json.aicopilot.dashboard.pill);
    compareField(label, "dashboardTitle", doc.dashboardTitle, json.aicopilot.dashboard.title);
    compareField(label, "dashboardIntro", doc.dashboardIntro, json.aicopilot.dashboard.intro);
    compareField(label, "dashboardBullets", doc.dashboardBullets, json.aicopilot.dashboard.kpiBullets);

    // Planning
    compareField(label, "planningPill", doc.planningPill, json.aicopilot.planning.pill);
    compareField(label, "planningTitle", doc.planningTitle, json.aicopilot.planning.title);
    compareField(label, "planningIntro", doc.planningIntro, json.aicopilot.planning.intro);
    compareField(label, "planningBullets", doc.planningBullets, json.aicopilot.planning.bullets);

    // Solutions
    compareField(label, "solutionsPill", doc.solutionsPill, json.solutions.pill);
    compareField(label, "solutionsTitle", doc.solutionsTitle, json.solutions.title);
    compareField(label, "solutionsIntro", doc.solutionsIntro, json.solutions.intro);
    compareField(label, "solutionsCardCta", doc.solutionsCardCta, json.solutions.cardCta);
    compareArrayField(
      label,
      "solutionsCards",
      doc.solutionsCards,
      json.solutions.cards.map((c) => ({ title: c.title, text: c.text })),
      ["title", "text"],
    );

    // Customers
    compareField(label, "customersPill", doc.customersPill, json.customers.pill);
    compareField(label, "customersTitle", doc.customersTitle, json.customers.title);
    compareField(label, "customersIntro", doc.customersIntro, json.customers.intro);
    compareField(label, "customersTickerLabel", doc.customersTickerLabel, json.customers.tickerLabel);
    compareArrayField(
      label,
      "customersTestimonials",
      doc.customersTestimonials,
      json.customers.testimonials.map((t) => ({
        company: t.company,
        person: t.person,
        role: t.role,
        quote: t.quote,
      })),
      ["company", "person", "role", "quote"],
    );

    // How It Works
    const expectedHiwIntro =
      sharedJson.howItWorks.sectionIntroByOffer?.[offerKey] ??
      sharedJson.howItWorks.sectionIntro;
    compareField(label, "howItWorksIntro", doc.howItWorksIntro, expectedHiwIntro);
    compareField(label, "howItWorksTabLabel", doc.howItWorksTabLabel, howItWorksOffer?.tabLabel);

    if (howItWorksOffer?.steps) {
      const expectedSteps = howItWorksOffer.steps.map((s) => ({
        title: s.title,
        body: s.body,
        highlights: s.highlights ?? [],
      }));
      compareArrayField(label, "howItWorksSteps", doc.howItWorksSteps, expectedSteps, [
        "title",
        "body",
        "highlights",
      ]);
    }

    // Showcase
    compareField(label, "showcaseEyebrow", doc.showcaseEyebrow, showcaseData?.eyebrow);
    compareField(label, "showcaseTitle", doc.showcaseTitle, showcaseData?.title);
    compareField(label, "showcaseBody", doc.showcaseBody, showcaseData?.body);
    compareField(label, "showcaseCtaLabel", doc.showcaseCtaLabel, showcaseData?.ctaLabel);

    // Ending
    compareField(label, "endingTitle", doc.endingTitle, json.ending.title);
    compareField(label, "endingBody", doc.endingBody, json.ending.body);
    compareField(label, "endingPrimaryCta", doc.endingPrimaryCta, json.ending.primaryCta);

    // ── Visual content fields ──

    // Copilot examples
    const expectedExamples = json.aicopilot.examples.map((ex) => ({
      question: ex.question,
      answer: ex.answer,
      chartTitle: ex.chartTitle,
      chartUnit: ex.chartUnit,
      yTicks: ex.yTicks,
      bars: ex.bars.map((b) => ({
        label: b.label,
        value: b.value,
        height: b.height,
      })),
    }));

    if (isNullish(doc.copilotExamples)) {
      totalCount++;
      missingCount++;
      console.log(`\u2717 MISSING  ${label} > copilotExamples`);
    } else if (!Array.isArray(doc.copilotExamples)) {
      totalCount++;
      mismatchCount++;
      console.log(`\u2717 MISMATCH ${label} > copilotExamples (not an array)`);
    } else {
      for (let i = 0; i < expectedExamples.length; i++) {
        const ex = expectedExamples[i];
        const se = doc.copilotExamples[i];
        compareField(label, `copilotExamples[${i}].question`, se?.question, ex.question);
        compareField(label, `copilotExamples[${i}].answer`, se?.answer, ex.answer);
        compareField(label, `copilotExamples[${i}].chartTitle`, se?.chartTitle, ex.chartTitle);
        compareField(label, `copilotExamples[${i}].chartUnit`, se?.chartUnit, ex.chartUnit);
        compareField(label, `copilotExamples[${i}].yTicks`, se?.yTicks, ex.yTicks);
        compareArrayField(
          label,
          `copilotExamples[${i}].bars`,
          se?.bars,
          ex.bars,
          ["label", "value", "height"],
        );
      }
    }

    // Dashboard visual
    compareField(label, "dashboardVisual.resultTitle", doc.dashboardVisual?.resultTitle, json.aicopilot.dashboard.resultTitle);
    compareField(label, "dashboardVisual.currentLabel", doc.dashboardVisual?.currentLabel, json.aicopilot.dashboard.currentLabel);
    compareField(label, "dashboardVisual.previousLabel", doc.dashboardVisual?.previousLabel, json.aicopilot.dashboard.previousLabel);
    compareField(label, "dashboardVisual.currencyLabel", doc.dashboardVisual?.currencyLabel, json.aicopilot.dashboard.currencyLabel);
    compareField(label, "dashboardVisual.metricOptions", doc.dashboardVisual?.metricOptions, json.aicopilot.dashboard.metricOptions);
    compareField(label, "dashboardVisual.compareLabel", doc.dashboardVisual?.compareLabel, json.aicopilot.dashboard.compareLabel);
    compareField(label, "dashboardVisual.trendAxisTicks", doc.dashboardVisual?.trendAxisTicks, json.aicopilot.dashboard.trendAxisTicks);
    compareField(label, "dashboardVisual.monthLabels", doc.dashboardVisual?.monthLabels, json.aicopilot.dashboard.monthLabelsSv);

    // Planning visual
    compareField(label, "planningVisual.forecastTitle", doc.planningVisual?.forecastTitle, json.aicopilot.planning.forecastTitle);
    compareField(label, "planningVisual.liveLabel", doc.planningVisual?.liveLabel, json.aicopilot.planning.liveLabel);
    compareField(label, "planningVisual.actualPrefix", doc.planningVisual?.actualPrefix, json.aicopilot.planning.actualPrefix);
    compareField(label, "planningVisual.forecastPrefix", doc.planningVisual?.forecastPrefix, json.aicopilot.planning.forecastPrefix);
    compareField(label, "planningVisual.vsPrevious", doc.planningVisual?.vsPrevious, json.aicopilot.planning.vsPrevious);
    compareField(label, "planningVisual.annualVariance", doc.planningVisual?.annualVariance, json.aicopilot.planning.annualVariance);
    compareField(label, "planningVisual.monthLabels", doc.planningVisual?.monthLabels, json.aicopilot.planning.monthLabelsEn);

    console.log("");
  }

  // ════════════════════════════════════════════
  // Solution page documents
  // ════════════════════════════════════════════
  const solutionIdMap = {
    "CEO & Founders": "solution-ceo-founders",
    "CFO & Finance Team": "solution-cfo-finance",
    "SaaS / Tech": "solution-saas-tech",
    "Konsult & Tjänster": "solution-konsult-tjanster",
    "E-handel": "solution-ehandel",
  };

  for (const page of solutionPagesJson.pages) {
    const docId = solutionIdMap[page.key];
    if (!docId) continue;

    const doc = docs[docId];
    const label = docId;

    if (!doc) {
      console.log(`SKIPPING ${docId} — document not found.\n`);
      continue;
    }

    console.log(`── ${docId} ──`);

    compareField(label, "key", doc.key, page.key);
    compareField(label, "eyebrow", doc.eyebrow, page.eyebrow);
    compareField(label, "heroHeadlineFirst", doc.heroHeadlineFirst, page.heroHeadline.first);
    compareField(label, "heroHeadlineSecond", doc.heroHeadlineSecond, page.heroHeadline.second ?? undefined);
    compareField(label, "heroIntro", doc.heroIntro, page.heroIntro);
    compareField(label, "logoStripText", doc.logoStripText, page.logoStripText);

    // Dilemma
    compareField(label, "dilemmaTitle", doc.dilemmaTitle, page.dilemmaTitle);
    compareField(label, "dilemmaIntro", doc.dilemmaIntro, page.dilemmaIntro);
    compareArrayField(
      label,
      "dilemmaCards",
      doc.dilemmaCards,
      page.dilemmaCards.map((c) => ({ title: c.title, body: c.body })),
      ["title", "body"],
    );

    // Helps
    compareField(label, "helpsTitle", doc.helpsTitle, page.helpsTitle);
    compareField(label, "helpsIntro", doc.helpsIntro, page.helpsIntro);
    compareArrayField(
      label,
      "helpsCards",
      doc.helpsCards,
      page.helpsCards.map((c) => ({ title: c.title, body: c.body })),
      ["title", "body"],
    );

    // Scenario
    compareField(label, "scenarioHeading", doc.scenarioHeading, page.scenario.heading);
    compareField(label, "scenarioDescription", doc.scenarioDescription, page.scenario.description ?? undefined);
    compareField(label, "scenarioQuestion", doc.scenarioQuestion, page.scenario.question);
    compareField(label, "scenarioAnswer1", doc.scenarioAnswer1, page.scenario.answer1);
    compareField(label, "scenarioAnswer2", doc.scenarioAnswer2, page.scenario.answer2);
    compareField(label, "scenarioMetricLabels", doc.scenarioMetricLabels, page.scenario.metricLabels);
    compareField(label, "scenarioMetricValues", doc.scenarioMetricValues, page.scenario.metricValues);
    compareField(label, "scenarioMetricHints", doc.scenarioMetricHints, page.scenario.metricHints);

    // Impact
    compareField(label, "impactHeadlineFirst", doc.impactHeadlineFirst, page.impactHeadline.first);
    compareField(label, "impactHeadlineSecond", doc.impactHeadlineSecond, page.impactHeadline.second ?? undefined);
    compareField(label, "impactIntro", doc.impactIntro, page.impactIntro);
    compareArrayField(
      label,
      "impactCards",
      doc.impactCards,
      page.impactCards.map((c) => ({ value: c.value, title: c.title, description: c.description })),
      ["value", "title", "description"],
    );

    // Testimonials
    const testimonials = page.testimonials ?? (page.testimonial ? [page.testimonial] : []);
    compareArrayField(
      label,
      "testimonials",
      doc.testimonials,
      testimonials.map((t) => ({ name: t.name, role: t.role, quote: t.quote })),
      ["name", "role", "quote"],
    );

    // Closing
    compareField(label, "closingHeadline", doc.closingHeadline, page.closingHeadline);
    compareField(label, "closingText", doc.closingText, page.closingText);

    console.log("");
  }

  // ════════════════════════════════════════════
  // Summary
  // ════════════════════════════════════════════
  console.log("════════════════════════════════════════════");
  console.log("SUMMARY");
  console.log("════════════════════════════════════════════");
  console.log(`Total fields checked: ${totalCount}`);
  console.log(`\u2713 Match:    ${matchCount}/${totalCount}`);
  console.log(`\u2717 Missing:  ${missingCount}`);
  console.log(`\u2717 Mismatch: ${mismatchCount}`);
  console.log("");

  if (missingCount === 0 && mismatchCount === 0) {
    console.log("All fields match! Sanity data is in sync with JSON source files.");
  } else {
    console.log("Some fields are out of sync. Review the details above.");
    process.exit(1);
  }
}

validate().catch((err) => {
  console.error("Validation failed:", err);
  process.exit(1);
});
