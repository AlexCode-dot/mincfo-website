/**
 * Pull content from Sanity → local JSON files.
 * Run after someone edits content in Sanity Studio to keep JSON fallbacks in sync.
 *
 * Usage: npm run content:pull:sanity
 */

import { createClient } from "@sanity/client";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env.local ──
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
  // .env.local not found
}

if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_WRITE_TOKEN) {
  console.error("Missing env vars. Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN.");
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// ── Helpers ──

function stripKeys(val) {
  if (Array.isArray(val)) return val.map(stripKeys);
  if (val !== null && typeof val === "object") {
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      if (k === "_key" || k === "_type") continue;
      out[k] = stripKeys(v);
    }
    return out;
  }
  return val;
}

function set(obj, path, value) {
  if (value === undefined || value === null) return;
  const keys = path.split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

function writeJson(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

// ── Main ──

async function pull() {
  console.log("Fetching from Sanity...\n");

  const [settings, ...variants] = await Promise.all([
    client.fetch(`*[_type == "siteSettings" && _id == "siteSettings"][0]`),
    client.fetch(`*[_type == "homeVariantContent" && mode == "platform"][0]`),
    client.fetch(`*[_type == "homeVariantContent" && mode == "full-service"][0]`),
    client.fetch(`*[_type == "homeVariantContent" && mode == "partner"][0]`),
  ]);

  const [sanityPlatform, sanityFullService, sanityPartner] = variants;

  if (!settings) {
    console.error("No siteSettings document found in Sanity.");
    process.exit(1);
  }

  // ── Load current JSON files ──
  const sharedPath = resolve(__dirname, "../src/content/home/shared.json");
  const platformPath = resolve(__dirname, "../src/content/home/platform.json");
  const fullServicePath = resolve(__dirname, "../src/content/home/full-service.json");
  const partnerPath = resolve(__dirname, "../src/content/home/partner.json");

  const shared = JSON.parse(readFileSync(sharedPath, "utf-8"));
  const platform = JSON.parse(readFileSync(platformPath, "utf-8"));
  const fullService = JSON.parse(readFileSync(fullServicePath, "utf-8"));
  const partner = JSON.parse(readFileSync(partnerPath, "utf-8"));

  let changes = 0;
  function apply(obj, path, value) {
    if (value === undefined || value === null) return;
    const cleaned = stripKeys(value);
    set(obj, path, cleaned);
    changes++;
  }

  // ═══════════════════════════════════════
  // siteSettings → shared.json
  // ═══════════════════════════════════════

  // Site meta
  apply(shared, "siteMeta.title", settings.siteTitle);
  apply(shared, "siteMeta.description", settings.siteDescription);

  // Navigation
  apply(shared, "navigation.produkt", settings.navProdukt);
  apply(shared, "navigation.losningar", settings.navLosningar);
  apply(shared, "navigation.kundcase", settings.navKundcase);
  apply(shared, "navigation.sakerhet", settings.navSakerhet);
  apply(shared, "navigation.hurDetFunkar", settings.navHurDetFunkar);
  apply(shared, "navigation.blogg", settings.navBlogg);
  apply(shared, "navigation.demoCta", settings.navDemoCta);
  apply(shared, "navigation.loginSignupLabel", settings.navLoginLabel);
  apply(shared, "navigation.signupCta", settings.signupNavCta);
  apply(shared, "navigation.openSolutionsAria", settings.navOpenSolutionsAria);
  apply(shared, "navigation.openMenuAria", settings.navOpenMenuAria);
  apply(shared, "navigation.loginChooser.title", settings.loginChooserTitle);
  apply(shared, "navigation.loginChooser.subtitle", settings.loginChooserSubtitle);
  apply(shared, "navigation.loginChooser.loginLabel", settings.loginChooserLoginLabel);
  apply(shared, "navigation.loginChooser.loginSublabel", settings.loginChooserLoginSublabel);
  apply(shared, "navigation.loginChooser.signupLabel", settings.loginChooserSignupLabel);
  apply(shared, "navigation.loginChooser.signupSublabel", settings.loginChooserSignupSublabel);
  apply(shared, "navigation.loginChooser.closeAria", settings.loginChooserCloseAria);

  // Offering options
  if (Array.isArray(settings.offeringOptions)) {
    for (let i = 0; i < settings.offeringOptions.length && i < shared.offering.options.length; i++) {
      const s = settings.offeringOptions[i];
      const target = shared.offering.options[i];
      if (s.label) target.label = s.label;
      if (s.title) target.title = s.title;
      if (s.body) target.body = s.body;
      if (s.bullets) target.bullets = stripKeys(s.bullets);
      if (s.cta) target.cta = s.cta;
    }
  }

  // How It Works
  apply(shared, "howItWorks.sectionTitle", settings.howItWorksSectionTitle);

  // Security
  apply(shared, "security.pill", settings.securityPill);
  apply(shared, "security.title", settings.securityTitle);
  apply(shared, "security.intro", settings.securityIntro);
  if (Array.isArray(settings.securityCards)) {
    shared.security.cards = stripKeys(settings.securityCards);
  }

  // Signup
  apply(shared, "signup.title", settings.signupTitle);
  apply(shared, "signup.subtitle", settings.signupSubtitle);
  apply(shared, "signup.companyLabel", settings.signupCompanyLabel);
  apply(shared, "signup.orgNrLabel", settings.signupOrgNrLabel);
  apply(shared, "signup.nameLabel", settings.signupNameLabel);
  apply(shared, "signup.emailLabel", settings.signupEmailLabel);
  apply(shared, "signup.phoneLabel", settings.signupPhoneLabel);
  apply(shared, "signup.consent", settings.signupConsent);
  apply(shared, "signup.consentLinkText", settings.signupConsentLinkText);
  apply(shared, "signup.submitLabel", settings.signupSubmitLabel);
  apply(shared, "signup.successTitle", settings.signupSuccessTitle);
  apply(shared, "signup.successText", settings.signupSuccessText);

  // Blog page text
  apply(shared, "blog.title", settings.blogTitle);
  apply(shared, "blog.subtitle", settings.blogSubtitle);
  apply(shared, "blog.sidebarHeading", settings.blogSidebarHeading);
  apply(shared, "blog.gridHeading", settings.blogGridHeading);
  apply(shared, "blog.emptyTitle", settings.blogEmptyTitle);
  apply(shared, "blog.emptyBody", settings.blogEmptyBody);
  apply(shared, "blog.backToListLabel", settings.blogBackToListLabel);

  // Footer
  apply(shared, "footer.intro", settings.footerIntro);
  apply(shared, "footer.careersCta", settings.footerCareersCta);
  apply(shared, "footer.email", settings.footerEmail);
  apply(shared, "footer.office1", settings.footerOffice1);
  apply(shared, "footer.office2", settings.footerOffice2);
  apply(shared, "footer.copyright", settings.footerCopyright);

  // Visual: Showcase shared
  if (settings.showcaseShared) {
    apply(shared, "offering.showcase.introLines", settings.showcaseShared.introLines);
    apply(shared, "offering.showcase.previewLabel", settings.showcaseShared.previewLabel);
  }

  // Visual: Showcase platform
  if (settings.showcasePlatform?.stats) {
    shared.offering.showcase.platform.stats = stripKeys(settings.showcasePlatform.stats);
  }

  // Visual: Showcase full-service
  if (settings.showcaseFullService) {
    const fs = settings.showcaseFullService;
    const sv = shared.offering.showcase["full-service"].serviceVisual;
    if (fs.eyebrow) sv.eyebrow = fs.eyebrow;
    if (fs.title) sv.title = fs.title;
    if (fs.badge) sv.badge = fs.badge;
    if (fs.steps) sv.steps = stripKeys(fs.steps);
    if (fs.summaryReportLabel) sv.summaryReportLabel = fs.summaryReportLabel;
    if (fs.summaryReportValue) sv.summaryReportValue = fs.summaryReportValue;
    if (fs.summaryAlertsLabel) sv.summaryAlertsLabel = fs.summaryAlertsLabel;
    if (fs.summaryAlertsValue) sv.summaryAlertsValue = fs.summaryAlertsValue;
  }

  // Visual: HIW Account
  if (settings.hiwAccount) {
    const a = settings.hiwAccount;
    const t = shared.howItWorks.ui.account;
    for (const key of Object.keys(t)) {
      if (a[key] !== undefined && a[key] !== null) t[key] = a[key];
    }
  }

  // Visual: HIW Connect
  if (settings.hiwConnect) {
    const s = settings.hiwConnect;
    const t = shared.howItWorks.ui.connect;
    for (const key of Object.keys(t)) {
      if (s[key] !== undefined && s[key] !== null) t[key] = s[key];
    }
  }

  // Visual: HIW Insights
  if (settings.hiwInsights) {
    const s = settings.hiwInsights;
    const t = shared.howItWorks.ui.insights;
    for (const key of Object.keys(t)) {
      if (s[key] !== undefined && s[key] !== null) t[key] = s[key];
    }
  }

  // Visual: HIW FaaS Realtime
  if (settings.hiwFaasRealtime) {
    const s = settings.hiwFaasRealtime;
    const t = shared.howItWorks.ui.faasRealtime;
    for (const key of Object.keys(t)) {
      if (s[key] !== undefined && s[key] !== null) t[key] = stripKeys(s[key]);
    }
  }

  // Visual: HIW FaaS Onboarding Badge
  if (settings.hiwFaasOnboardingBadge) {
    shared.howItWorks.ui.faasOnboarding.badgeLabel = settings.hiwFaasOnboardingBadge;
  }

  // Visual: HIW Systems
  if (settings.hiwSystems) {
    const s = settings.hiwSystems;
    const t = shared.howItWorks.ui.faasSystems;
    if (s.hubLabel) t.hubLabel = s.hubLabel;
    if (s.bankLabel) t.bankLabel = s.bankLabel;
    if (s.skatteverketLabel) t.skatteverketLabel = s.skatteverketLabel;
    if (s.fortnoxLabel) t.fortnoxLabel = s.fortnoxLabel;
    if (s.payrollLabel) t.payrollLabel = s.payrollLabel;
    if (s.paymentsLabel) t.paymentsLabel = s.paymentsLabel;
    if (s.customerTeamLabel) t.customerTeamLabel = s.customerTeamLabel;
    if (s.partnerTopLeft) t.partnerLabels.topLeft = s.partnerTopLeft;
    if (s.partnerTopCenter) t.partnerLabels.topCenter = s.partnerTopCenter;
    if (s.partnerTopRight) t.partnerLabels.topRight = s.partnerTopRight;
    if (s.partnerMidLeft) t.partnerLabels.midLeft = s.partnerMidLeft;
    if (s.partnerMidRight) t.partnerLabels.midRight = s.partnerMidRight;
    if (s.partnerBottomCenter) t.partnerLabels.bottomCenter = s.partnerBottomCenter;
  }

  // Visual: HIW Partner Workspace
  if (settings.hiwPartnerWorkspace) {
    const s = settings.hiwPartnerWorkspace;
    const pw = shared.howItWorks.ui.partnerWorkspace;
    if (s.navHome) pw.nav.home = s.navHome;
    if (s.navUsers) pw.nav.users = s.navUsers;
    if (s.navSettings) pw.nav.settings = s.navSettings;
    if (s.homeTitle) pw.home.title = s.homeTitle;
    if (s.homeSubtitle) pw.home.subtitle = s.homeSubtitle;
    if (s.homeColumns) pw.home.columns = stripKeys(s.homeColumns);
    if (s.homeActionLabel) pw.home.actionLabel = s.homeActionLabel;
    if (s.homeRows) pw.home.rows = stripKeys(s.homeRows);
    if (s.usersTitle) pw.users.title = s.usersTitle;
    if (s.usersSubtitle) pw.users.subtitle = s.usersSubtitle;
    if (s.usersColumns) pw.users.columns = stripKeys(s.usersColumns);
    if (s.usersActionLabel) pw.users.actionLabel = s.usersActionLabel;
    if (s.usersRows) pw.users.rows = stripKeys(s.usersRows);
    if (s.usersSearchPlaceholder) pw.users.searchPlaceholder = s.usersSearchPlaceholder;
    if (s.usersInviteLabel) pw.users.inviteLabel = s.usersInviteLabel;
    if (s.settingsTitle) pw.settings.title = s.settingsTitle;
    if (s.settingsSubtitle) pw.settings.subtitle = s.settingsSubtitle;
    if (s.settingsColumns) pw.settings.columns = stripKeys(s.settingsColumns);
    if (s.settingsActionLabel) pw.settings.actionLabel = s.settingsActionLabel;
    if (s.settingsRows) pw.settings.rows = stripKeys(s.settingsRows);
    if (s.settingsAppearanceTitle) pw.settings.appearanceTitle = s.settingsAppearanceTitle;
    if (s.settingsAppearanceBody) pw.settings.appearanceBody = s.settingsAppearanceBody;
    if (s.settingsModeLight) pw.settings.modes.light = s.settingsModeLight;
    if (s.settingsModeDark) pw.settings.modes.dark = s.settingsModeDark;
    if (s.settingsLanguageTitle) pw.settings.languageTitle = s.settingsLanguageTitle;
    if (s.settingsLanguageBody) pw.settings.languageBody = s.settingsLanguageBody;
    if (s.settingsLanguageValue) pw.settings.languageValue = s.settingsLanguageValue;
    if (s.paginationPrevious) pw.pagination.previous = s.paginationPrevious;
    if (s.paginationNext) pw.pagination.next = s.paginationNext;
    if (s.summaryLabel) pw.summary.label = s.summaryLabel;
    if (s.summaryTitle) pw.summary.title = s.summaryTitle;
    if (s.summaryStatPrimary) pw.summary.statPrimary = s.summaryStatPrimary;
    if (s.summaryStatSecondary) pw.summary.statSecondary = s.summaryStatSecondary;
  }

  // ═══════════════════════════════════════
  // homeVariant docs → variant JSON files
  // ═══════════════════════════════════════

  const variantPairs = [
    { sanity: sanityPlatform, json: platform, path: platformPath, label: "platform" },
    { sanity: sanityFullService, json: fullService, path: fullServicePath, label: "full-service" },
    { sanity: sanityPartner, json: partner, path: partnerPath, label: "partner" },
  ];

  for (const { sanity: s, json, label } of variantPairs) {
    if (!s) {
      console.log(`  ⚠ No Sanity doc for ${label}, skipping.`);
      continue;
    }

    // Hero
    apply(json, "hero.tagline", s.heroTagline);
    apply(json, "hero.titleLine1", s.heroTitleLine1);
    apply(json, "hero.titleLine2", s.heroTitleLine2);
    apply(json, "hero.body", s.heroBody);
    apply(json, "hero.primaryCta", s.heroPrimaryCta);
    apply(json, "hero.secondaryCta", s.heroSecondaryCta);

    // AI Copilot
    apply(json, "aicopilot.leftPill", s.aicopilotPill);
    apply(json, "aicopilot.leftTitle", s.aicopilotTitle);
    apply(json, "aicopilot.leftIntro", s.aicopilotIntro);
    if (s.aicopilotBullets) json.aicopilot.leftBullets = stripKeys(s.aicopilotBullets);

    // Dashboard
    apply(json, "aicopilot.dashboard.pill", s.dashboardPill);
    apply(json, "aicopilot.dashboard.title", s.dashboardTitle);
    apply(json, "aicopilot.dashboard.intro", s.dashboardIntro);
    if (s.dashboardBullets) json.aicopilot.dashboard.kpiBullets = stripKeys(s.dashboardBullets);

    // Planning
    apply(json, "aicopilot.planning.pill", s.planningPill);
    apply(json, "aicopilot.planning.title", s.planningTitle);
    apply(json, "aicopilot.planning.intro", s.planningIntro);
    if (s.planningBullets) json.aicopilot.planning.bullets = stripKeys(s.planningBullets);

    // Solutions
    apply(json, "solutions.pill", s.solutionsPill);
    apply(json, "solutions.title", s.solutionsTitle);
    apply(json, "solutions.intro", s.solutionsIntro);
    apply(json, "solutions.cardCta", s.solutionsCardCta);
    if (Array.isArray(s.solutionsCards)) {
      for (let i = 0; i < s.solutionsCards.length && i < json.solutions.cards.length; i++) {
        const sc = s.solutionsCards[i];
        if (sc.title) json.solutions.cards[i].title = sc.title;
        if (sc.text) json.solutions.cards[i].text = sc.text;
      }
    }

    // Customers
    apply(json, "customers.pill", s.customersPill);
    apply(json, "customers.title", s.customersTitle);
    apply(json, "customers.intro", s.customersIntro);
    apply(json, "customers.tickerLabel", s.customersTickerLabel);
    if (Array.isArray(s.customersTestimonials)) {
      for (let i = 0; i < s.customersTestimonials.length && i < json.customers.testimonials.length; i++) {
        const st = s.customersTestimonials[i];
        const jt = json.customers.testimonials[i];
        if (st.company) jt.company = st.company;
        if (st.person) jt.person = st.person;
        if (st.role) jt.role = st.role;
        if (st.quote) jt.quote = st.quote;
      }
    }

    // Ending
    apply(json, "ending.title", s.endingTitle);
    apply(json, "ending.body", s.endingBody);
    apply(json, "ending.primaryCta", s.endingPrimaryCta);

    // Visual: Copilot examples
    if (Array.isArray(s.copilotExamples)) {
      for (let i = 0; i < s.copilotExamples.length && i < json.aicopilot.examples.length; i++) {
        const se = s.copilotExamples[i];
        const je = json.aicopilot.examples[i];
        if (se.question) je.question = se.question;
        if (se.answer) je.answer = se.answer;
        if (se.chartTitle) je.chartTitle = se.chartTitle;
        if (se.chartUnit) je.chartUnit = se.chartUnit;
        if (se.yTicks) je.yTicks = stripKeys(se.yTicks);
        if (se.bars) je.bars = stripKeys(se.bars);
      }
    }

    // Visual: Dashboard
    if (s.dashboardVisual) {
      const dv = s.dashboardVisual;
      if (dv.resultTitle) json.aicopilot.dashboard.resultTitle = dv.resultTitle;
      if (dv.currentLabel) json.aicopilot.dashboard.currentLabel = dv.currentLabel;
      if (dv.previousLabel) json.aicopilot.dashboard.previousLabel = dv.previousLabel;
      if (dv.currencyLabel) json.aicopilot.dashboard.currencyLabel = dv.currencyLabel;
      if (dv.metricOptions) json.aicopilot.dashboard.metricOptions = stripKeys(dv.metricOptions);
      if (dv.compareLabel) json.aicopilot.dashboard.compareLabel = dv.compareLabel;
      if (dv.trendAxisTicks) json.aicopilot.dashboard.trendAxisTicks = stripKeys(dv.trendAxisTicks);
      if (dv.monthLabels) json.aicopilot.dashboard.monthLabelsSv = stripKeys(dv.monthLabels);
    }

    // Visual: Planning
    if (s.planningVisual) {
      const pv = s.planningVisual;
      if (pv.forecastTitle) json.aicopilot.planning.forecastTitle = pv.forecastTitle;
      if (pv.liveLabel) json.aicopilot.planning.liveLabel = pv.liveLabel;
      if (pv.actualPrefix) json.aicopilot.planning.actualPrefix = pv.actualPrefix;
      if (pv.forecastPrefix) json.aicopilot.planning.forecastPrefix = pv.forecastPrefix;
      if (pv.vsPrevious) json.aicopilot.planning.vsPrevious = pv.vsPrevious;
      if (pv.annualVariance) json.aicopilot.planning.annualVariance = pv.annualVariance;
      if (pv.monthLabels) json.aicopilot.planning.monthLabelsEn = stripKeys(pv.monthLabels);
    }
  }

  // ═══════════════════════════════════════
  // Write files
  // ═══════════════════════════════════════

  writeJson(sharedPath, shared);
  console.log("  ✓ shared.json updated");

  for (const { json, path, label } of variantPairs) {
    writeJson(path, json);
    console.log(`  ✓ ${label}.json updated`);
  }

  console.log(`\nPulled ${changes} fields from Sanity → JSON.`);
}

pull().catch((err) => {
  console.error("Pull failed:", err);
  process.exit(1);
});
