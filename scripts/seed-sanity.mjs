import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local (Next.js doesn't do this for plain Node scripts)
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
const sharedJsonEn = JSON.parse(
  readFileSync(resolve(__dirname, "../src/content/home/shared.en.json"), "utf-8"),
);
const platformJsonEn = JSON.parse(
  readFileSync(resolve(__dirname, "../src/content/home/platform.en.json"), "utf-8"),
);
const fullServiceJsonEn = JSON.parse(
  readFileSync(resolve(__dirname, "../src/content/home/full-service.en.json"), "utf-8"),
);
const partnerJsonEn = JSON.parse(
  readFileSync(resolve(__dirname, "../src/content/home/partner.en.json"), "utf-8"),
);

// Each locale seeds its own siteSettings + homeVariant docs.
// Swedish keeps the legacy ids; other locales get a suffix + a `locale` field.
const LOCALE_SEEDS = [
  {
    locale: "sv",
    settingsId: "siteSettings",
    variantSuffix: "",
    shared: sharedJson,
    variantJson: {
      platform: platformJson,
      "full-service": fullServiceJson,
      partner: partnerJson,
    },
  },
  {
    locale: "en",
    settingsId: "siteSettings.en",
    variantSuffix: "-en",
    shared: sharedJsonEn,
    variantJson: {
      platform: platformJsonEn,
      "full-service": fullServiceJsonEn,
      partner: partnerJsonEn,
    },
  },
];

const solutionPagesJson = JSON.parse(
  readFileSync(resolve(__dirname, "../src/content/solutionPagesText.json"), "utf-8"),
);
const solutionPagesJsonEn = JSON.parse(
  readFileSync(resolve(__dirname, "../src/content/solutionPagesText.en.json"), "utf-8"),
);
const SOLUTION_LOCALE_SEEDS = [
  { locale: "sv", suffix: "", src: solutionPagesJson },
  { locale: "en", suffix: "-en", src: solutionPagesJsonEn },
];
const jobPostsJson = JSON.parse(
  readFileSync(resolve(__dirname, "../src/content/jobPosts.json"), "utf-8"),
);
const jobPostsJsonEn = JSON.parse(
  readFileSync(resolve(__dirname, "../src/content/jobPosts.en.json"), "utf-8"),
);
const JOB_LOCALE_SEEDS = [
  { locale: "sv", suffix: "", src: jobPostsJson },
  { locale: "en", suffix: "-en", src: jobPostsJsonEn },
];

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_WRITE_TOKEN) {
  console.error(
    "Missing env vars. Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN.",
  );
  process.exit(1);
}

function buildSiteSettings(sharedJson) {
  return {
    siteTitle: sharedJson.siteMeta.title,
    siteDescription: sharedJson.siteMeta.description,
    navProdukt: sharedJson.navigation.produkt,
    navLosningar: sharedJson.navigation.losningar,
    navKundcase: sharedJson.navigation.kundcase,
    navSakerhet: sharedJson.navigation.sakerhet,
    navHurDetFunkar: sharedJson.navigation.hurDetFunkar,
    navBlogg: sharedJson.navigation.blogg,
    navDemoCta: sharedJson.navigation.demoCta,
    navLoginLabel: sharedJson.navigation.loginSignupLabel,
    navOpenSolutionsAria: sharedJson.navigation.openSolutionsAria,
    navOpenMenuAria: sharedJson.navigation.openMenuAria,
    loginChooserTitle: sharedJson.navigation.loginChooser.title,
    loginChooserSubtitle: sharedJson.navigation.loginChooser.subtitle,
    loginChooserLoginLabel: sharedJson.navigation.loginChooser.loginLabel,
    loginChooserLoginSublabel: sharedJson.navigation.loginChooser.loginSublabel,
    loginChooserSignupLabel: sharedJson.navigation.loginChooser.signupLabel,
    loginChooserSignupSublabel: sharedJson.navigation.loginChooser.signupSublabel,
    loginChooserCloseAria: sharedJson.navigation.loginChooser.closeAria,
    offeringOptions: sharedJson.offering.options.map((o, i) => ({
      _key: `option-${i}`,
      id: o.id,
      label: o.label,
      title: o.title,
      body: o.body,
      bullets: o.bullets,
      cta: o.cta,
    })),
    howItWorksSectionTitle: sharedJson.howItWorks.sectionTitle,
    securityPill: sharedJson.security.pill,
    securityTitle: sharedJson.security.title,
    securityIntro: sharedJson.security.intro,
    securityCards: sharedJson.security.cards.map((c, i) => ({
      _key: `card-${i}`,
      title: c.title,
      body: c.body,
    })),
    // Signup form
    signupNavCta: sharedJson.navigation.signupCta,
    signupTitle: sharedJson.signup.title,
    signupSubtitle: sharedJson.signup.subtitle,
    signupCompanyLabel: sharedJson.signup.companyLabel,
    signupOrgNrLabel: sharedJson.signup.orgNrLabel,
    signupNameLabel: sharedJson.signup.nameLabel,
    signupEmailLabel: sharedJson.signup.emailLabel,
    signupPhoneLabel: sharedJson.signup.phoneLabel,
    signupConsent: sharedJson.signup.consent,
    signupConsentLinkText: sharedJson.signup.consentLinkText,
    signupSubmitLabel: sharedJson.signup.submitLabel,
    signupSuccessTitle: sharedJson.signup.successTitle,
    signupSuccessText: sharedJson.signup.successText,

    footerIntro: sharedJson.footer.intro,
    footerCareersCta: sharedJson.footer.careersCta,
    footerEmail: sharedJson.footer.email,
    footerOffice1: sharedJson.footer.office1,
    footerOffice2: sharedJson.footer.office2,
    footerCopyright: sharedJson.footer.copyright,

    // ── Visual content fields ──

    // Showcase shared
    showcaseShared: {
      introLines: sharedJson.offering.showcase.introLines,
      previewLabel: sharedJson.offering.showcase.previewLabel,
    },

    // Showcase: Platform
    showcasePlatform: {
      stats: sharedJson.offering.showcase.platform.stats.map((s, i) => ({
        _key: `stat-${i}`,
        label: s.label,
        value: s.value,
      })),
    },

    // Showcase: Full-service
    showcaseFullService: {
      eyebrow: sharedJson.offering.showcase["full-service"].serviceVisual.eyebrow,
      title: sharedJson.offering.showcase["full-service"].serviceVisual.title,
      badge: sharedJson.offering.showcase["full-service"].serviceVisual.badge,
      steps: sharedJson.offering.showcase["full-service"].serviceVisual.steps,
      summaryReportLabel: sharedJson.offering.showcase["full-service"].serviceVisual.summaryReportLabel,
      summaryReportValue: sharedJson.offering.showcase["full-service"].serviceVisual.summaryReportValue,
      summaryAlertsLabel: sharedJson.offering.showcase["full-service"].serviceVisual.summaryAlertsLabel,
      summaryAlertsValue: sharedJson.offering.showcase["full-service"].serviceVisual.summaryAlertsValue,
    },

    // Partner showcase visual is covered by partnerWorkspace fields above

    // How It Works – Account UI
    hiwAccount: {
      secureLabel: sharedJson.howItWorks.ui.account.secureLabel,
      tabCreate: sharedJson.howItWorks.ui.account.tabCreate,
      tabLogin: sharedJson.howItWorks.ui.account.tabLogin,
      emailLabel: sharedJson.howItWorks.ui.account.emailLabel,
      passwordLabel: sharedJson.howItWorks.ui.account.passwordLabel,
      termsLabel: sharedJson.howItWorks.ui.account.termsLabel,
      buttonLabel: sharedJson.howItWorks.ui.account.buttonLabel,
      existingAccountLabel: sharedJson.howItWorks.ui.account.existingAccountLabel,
      loginLinkLabel: sharedJson.howItWorks.ui.account.loginLinkLabel,
      welcomeTitle: sharedJson.howItWorks.ui.account.welcomeTitle,
      welcomeSubtitle: sharedJson.howItWorks.ui.account.welcomeSubtitle,
      continueWithGoogle: sharedJson.howItWorks.ui.account.continueWithGoogle,
      continueWithMicrosoft: sharedJson.howItWorks.ui.account.continueWithMicrosoft,
      dividerLabel: sharedJson.howItWorks.ui.account.dividerLabel,
      emailInputPlaceholder: sharedJson.howItWorks.ui.account.emailInputPlaceholder,
      continueLabel: sharedJson.howItWorks.ui.account.continueLabel,
    },

    // How It Works – Connect UI
    hiwConnect: {
      fortnoxWord: sharedJson.howItWorks.ui.connect.fortnoxWord,
      accountConnected: sharedJson.howItWorks.ui.connect.accountConnected,
      mincfoWord: sharedJson.howItWorks.ui.connect.mincfoWord,
      receivingData: sharedJson.howItWorks.ui.connect.receivingData,
      integrationActive: sharedJson.howItWorks.ui.connect.integrationActive,
      lastSyncLabel: sharedJson.howItWorks.ui.connect.lastSyncLabel,
    },

    // How It Works – Insights UI
    hiwInsights: {
      title: sharedJson.howItWorks.ui.insights.title,
      question: sharedJson.howItWorks.ui.insights.question,
      thinkingLabel: sharedJson.howItWorks.ui.insights.thinkingLabel,
      generatedForecastLabel: sharedJson.howItWorks.ui.insights.generatedForecastLabel,
      runwayMonthsLabel: sharedJson.howItWorks.ui.insights.runwayMonthsLabel,
      barCurrent: sharedJson.howItWorks.ui.insights.barCurrent,
      barPlan: sharedJson.howItWorks.ui.insights.barPlan,
      barScenario: sharedJson.howItWorks.ui.insights.barScenario,
      summary: sharedJson.howItWorks.ui.insights.summary,
      inputHint: sharedJson.howItWorks.ui.insights.inputHint,
      inputTyped: sharedJson.howItWorks.ui.insights.inputTyped,
    },

    // How It Works – FaaS Realtime UI
    hiwFaasRealtime: {
      statusUpdated: sharedJson.howItWorks.ui.faasRealtime.statusUpdated,
      cashflowLabel: sharedJson.howItWorks.ui.faasRealtime.cashflowLabel,
      runwayLabel: sharedJson.howItWorks.ui.faasRealtime.runwayLabel,
      monthSuffix: sharedJson.howItWorks.ui.faasRealtime.monthSuffix,
      deviationLabel: sharedJson.howItWorks.ui.faasRealtime.deviationLabel,
      months: sharedJson.howItWorks.ui.faasRealtime.months,
      personnelAlertTemplate: sharedJson.howItWorks.ui.faasRealtime.personnelAlertTemplate,
      latePaymentsAlert: sharedJson.howItWorks.ui.faasRealtime.latePaymentsAlert,
    },

    // How It Works – FaaS Onboarding Badge
    hiwFaasOnboardingBadge: sharedJson.howItWorks.ui.faasOnboarding.badgeLabel,

    // How It Works – Systems UI
    hiwSystems: {
      hubLabel: sharedJson.howItWorks.ui.faasSystems.hubLabel,
      bankLabel: sharedJson.howItWorks.ui.faasSystems.bankLabel,
      skatteverketLabel: sharedJson.howItWorks.ui.faasSystems.skatteverketLabel,
      fortnoxLabel: sharedJson.howItWorks.ui.faasSystems.fortnoxLabel,
      payrollLabel: sharedJson.howItWorks.ui.faasSystems.payrollLabel,
      paymentsLabel: sharedJson.howItWorks.ui.faasSystems.paymentsLabel,
      customerTeamLabel: sharedJson.howItWorks.ui.faasSystems.customerTeamLabel,
      partnerTopLeft: sharedJson.howItWorks.ui.faasSystems.partnerLabels.topLeft,
      partnerTopCenter: sharedJson.howItWorks.ui.faasSystems.partnerLabels.topCenter,
      partnerTopRight: sharedJson.howItWorks.ui.faasSystems.partnerLabels.topRight,
      partnerMidLeft: sharedJson.howItWorks.ui.faasSystems.partnerLabels.midLeft,
      partnerMidRight: sharedJson.howItWorks.ui.faasSystems.partnerLabels.midRight,
      partnerBottomCenter: sharedJson.howItWorks.ui.faasSystems.partnerLabels.bottomCenter,
    },

    // How It Works – Partner Workspace UI
    hiwPartnerWorkspace: {
      navHome: sharedJson.howItWorks.ui.partnerWorkspace.nav.home,
      navUsers: sharedJson.howItWorks.ui.partnerWorkspace.nav.users,
      navSettings: sharedJson.howItWorks.ui.partnerWorkspace.nav.settings,
      homeTitle: sharedJson.howItWorks.ui.partnerWorkspace.home.title,
      homeSubtitle: sharedJson.howItWorks.ui.partnerWorkspace.home.subtitle,
      homeColumns: sharedJson.howItWorks.ui.partnerWorkspace.home.columns,
      homeActionLabel: sharedJson.howItWorks.ui.partnerWorkspace.home.actionLabel,
      homeRows: sharedJson.howItWorks.ui.partnerWorkspace.home.rows.map((r, i) => ({
        _key: `home-row-${i}`,
        label: r.label,
        detail: r.detail,
        tag: r.tag,
        status: r.status,
      })),
      usersTitle: sharedJson.howItWorks.ui.partnerWorkspace.users.title,
      usersSubtitle: sharedJson.howItWorks.ui.partnerWorkspace.users.subtitle,
      usersColumns: sharedJson.howItWorks.ui.partnerWorkspace.users.columns,
      usersActionLabel: sharedJson.howItWorks.ui.partnerWorkspace.users.actionLabel,
      usersRows: sharedJson.howItWorks.ui.partnerWorkspace.users.rows.map((r, i) => ({
        _key: `users-row-${i}`,
        label: r.label,
        detail: r.detail,
        tag: r.tag,
        status: r.status,
      })),
      usersSearchPlaceholder: sharedJson.howItWorks.ui.partnerWorkspace.users.searchPlaceholder,
      usersInviteLabel: sharedJson.howItWorks.ui.partnerWorkspace.users.inviteLabel,
      settingsTitle: sharedJson.howItWorks.ui.partnerWorkspace.settings.title,
      settingsSubtitle: sharedJson.howItWorks.ui.partnerWorkspace.settings.subtitle,
      settingsColumns: sharedJson.howItWorks.ui.partnerWorkspace.settings.columns,
      settingsActionLabel: sharedJson.howItWorks.ui.partnerWorkspace.settings.actionLabel,
      settingsRows: sharedJson.howItWorks.ui.partnerWorkspace.settings.rows.map((r, i) => ({
        _key: `settings-row-${i}`,
        label: r.label,
        detail: r.detail,
        tag: r.tag,
        status: r.status,
      })),
      settingsAppearanceTitle: sharedJson.howItWorks.ui.partnerWorkspace.settings.appearanceTitle,
      settingsAppearanceBody: sharedJson.howItWorks.ui.partnerWorkspace.settings.appearanceBody,
      settingsModeLight: sharedJson.howItWorks.ui.partnerWorkspace.settings.modes.light,
      settingsModeDark: sharedJson.howItWorks.ui.partnerWorkspace.settings.modes.dark,
      settingsLanguageTitle: sharedJson.howItWorks.ui.partnerWorkspace.settings.languageTitle,
      settingsLanguageBody: sharedJson.howItWorks.ui.partnerWorkspace.settings.languageBody,
      settingsLanguageValue: sharedJson.howItWorks.ui.partnerWorkspace.settings.languageValue,
      paginationPrevious: sharedJson.howItWorks.ui.partnerWorkspace.pagination.previous,
      paginationNext: sharedJson.howItWorks.ui.partnerWorkspace.pagination.next,
      summaryLabel: sharedJson.howItWorks.ui.partnerWorkspace.summary.label,
      summaryTitle: sharedJson.howItWorks.ui.partnerWorkspace.summary.title,
      summaryStatPrimary: sharedJson.howItWorks.ui.partnerWorkspace.summary.statPrimary,
      summaryStatSecondary: sharedJson.howItWorks.ui.partnerWorkspace.summary.statSecondary,
    },

  };
}

const MODE_TO_OFFER_KEY = {
  platform: "platform",
  "full-service": "faas",
  partner: "partner",
};

function buildVariant(mode, json, sharedJson) {
  const offerKey = MODE_TO_OFFER_KEY[mode];
  const howItWorksOffer = sharedJson.howItWorks.offers[offerKey];
  const showcaseData = sharedJson.offering.showcase[mode];

  return {
      _type: "homeVariantContent",
      mode,

      // Hero
      heroTagline: json.hero.tagline,
      heroTitleLine1: json.hero.titleLine1,
      heroTitleLine2: json.hero.titleLine2,
      heroBody: json.hero.body,
      heroPrimaryCta: json.hero.primaryCta,
      heroSecondaryCta: json.hero.secondaryCta,

      // AI Copilot
      aicopilotPill: json.aicopilot.leftPill,
      aicopilotTitle: json.aicopilot.leftTitle,
      aicopilotIntro: json.aicopilot.leftIntro,
      aicopilotBullets: json.aicopilot.leftBullets,

      // Dashboard
      dashboardPill: json.aicopilot.dashboard.pill,
      dashboardTitle: json.aicopilot.dashboard.title,
      dashboardIntro: json.aicopilot.dashboard.intro,
      dashboardBullets: json.aicopilot.dashboard.kpiBullets,

      // Planning
      planningPill: json.aicopilot.planning.pill,
      planningTitle: json.aicopilot.planning.title,
      planningIntro: json.aicopilot.planning.intro,
      planningBullets: json.aicopilot.planning.bullets,

      // Solutions
      solutionsPill: json.solutions.pill,
      solutionsTitle: json.solutions.title,
      solutionsIntro: json.solutions.intro,
      solutionsCardCta: json.solutions.cardCta,
      solutionsCards: json.solutions.cards.map((c, i) => ({
        _key: `card-${i}`,
        title: c.title,
        text: c.text,
      })),

      // Customers
      customersPill: json.customers.pill,
      customersTitle: json.customers.title,
      customersIntro: json.customers.intro,
      customersTickerLabel: json.customers.tickerLabel,
      customersTestimonials: json.customers.testimonials.map((t, i) => ({
        _key: `testimonial-${i}`,
        company: t.company,
        person: t.person,
        role: t.role,
        quote: t.quote,
      })),

      // How It Works (from shared.json for this mode)
      howItWorksIntro:
        sharedJson.howItWorks.sectionIntroByOffer?.[offerKey] ??
        sharedJson.howItWorks.sectionIntro,
      howItWorksTabLabel: howItWorksOffer?.tabLabel,
      howItWorksSteps: howItWorksOffer?.steps?.map((s, i) => ({
        _key: `step-${i}`,
        title: s.title,
        body: s.body,
        highlights: s.highlights ?? [],
      })),

      // Showcase (from shared.json for this mode)
      showcaseEyebrow: showcaseData?.eyebrow,
      showcaseTitle: showcaseData?.title,
      showcaseBody: showcaseData?.body,
      showcaseCtaLabel: showcaseData?.ctaLabel,

      // Ending
      endingTitle: json.ending.title,
      endingBody: json.ending.body,
      endingPrimaryCta: json.ending.primaryCta,

      // ── Visual content fields ──

      // Copilot examples
      copilotExamples: json.aicopilot.examples.map((ex, i) => ({
        _key: `example-${i}`,
        question: ex.question,
        answer: ex.answer,
        chartTitle: ex.chartTitle,
        chartUnit: ex.chartUnit,
        yTicks: ex.yTicks,
        bars: ex.bars.map((b, j) => ({
          _key: `bar-${i}-${j}`,
          label: b.label,
          value: b.value,
          height: b.height,
        })),
      })),

      // Dashboard visual
      dashboardVisual: {
        resultTitle: json.aicopilot.dashboard.resultTitle,
        currentLabel: json.aicopilot.dashboard.currentLabel,
        previousLabel: json.aicopilot.dashboard.previousLabel,
        currencyLabel: json.aicopilot.dashboard.currencyLabel,
        metricOptions: json.aicopilot.dashboard.metricOptions,
        compareLabel: json.aicopilot.dashboard.compareLabel,
        trendAxisTicks: json.aicopilot.dashboard.trendAxisTicks,
        monthLabels: json.aicopilot.dashboard.monthLabelsSv,
      },

      // Planning visual
      planningVisual: {
        forecastTitle: json.aicopilot.planning.forecastTitle,
        liveLabel: json.aicopilot.planning.liveLabel,
        actualPrefix: json.aicopilot.planning.actualPrefix,
        forecastPrefix: json.aicopilot.planning.forecastPrefix,
        vsPrevious: json.aicopilot.planning.vsPrevious,
        annualVariance: json.aicopilot.planning.annualVariance,
        monthLabels: json.aicopilot.planning.monthLabelsEn,
      },

      // Showcase visual (mode-specific)
      // Showcase visuals are in siteSettings, not per-variant
  };
}

async function seed() {
  for (const { locale, settingsId, variantSuffix, shared, variantJson } of LOCALE_SEEDS) {
    console.log(`Seeding siteSettings (${locale})...`);
    await client.createOrReplace({
      _id: settingsId,
      _type: "siteSettings",
      locale,
      ...buildSiteSettings(shared),
    });
    console.log(`  siteSettings (${locale}) done.`);

    for (const mode of ["platform", "full-service", "partner"]) {
      const docId = `homeVariant-${mode}${variantSuffix}`;
      console.log(`Seeding ${docId}...`);
      await client.createOrReplace({
        _id: docId,
        locale,
        ...buildVariant(mode, variantJson[mode], shared),
      });
      console.log(`  ${docId} done.`);
    }
  }

  // ── Seed solution pages ──
  const solutionIdMap = {
    "CEO & Founders": "solution-ceo-founders",
    "CFO & Finance Team": "solution-cfo-finance",
    "SaaS / Tech": "solution-saas-tech",
    "Konsult & Tjänster": "solution-konsult-tjanster",
    "E-handel": "solution-ehandel",
  };

  for (const { locale, suffix, src } of SOLUTION_LOCALE_SEEDS) {
  for (const page of src.pages) {
    const baseId = solutionIdMap[page.key];
    if (!baseId) continue;
    const docId = `${baseId}${suffix}`;

    console.log(`Seeding ${docId}...`);

    const testimonials = page.testimonials ?? (page.testimonial ? [page.testimonial] : []);

    await client.createOrReplace({
      _id: docId,
      _type: "solutionPage",
      locale,
      key: page.key,
      eyebrow: page.eyebrow,
      heroHeadlineFirst: page.heroHeadline.first,
      heroHeadlineSecond: page.heroHeadline.second ?? undefined,
      heroIntro: page.heroIntro,
      logoStripText: page.logoStripText,
      dilemmaTitle: page.dilemmaTitle,
      dilemmaIntro: page.dilemmaIntro,
      dilemmaCards: page.dilemmaCards.map((c, i) => ({
        _key: `card-${i}`,
        title: c.title,
        body: c.body,
      })),
      helpsTitle: page.helpsTitle,
      helpsIntro: page.helpsIntro,
      helpsCards: page.helpsCards.map((c, i) => ({
        _key: `card-${i}`,
        title: c.title,
        body: c.body,
      })),
      scenarioHeading: page.scenario.heading,
      scenarioDescription: page.scenario.description ?? undefined,
      scenarioQuestion: page.scenario.question,
      scenarioAnswer1: page.scenario.answer1,
      scenarioAnswer2: page.scenario.answer2,
      scenarioMetricLabels: page.scenario.metricLabels,
      scenarioMetricValues: page.scenario.metricValues,
      scenarioMetricHints: page.scenario.metricHints,
      impactHeadlineFirst: page.impactHeadline.first,
      impactHeadlineSecond: page.impactHeadline.second ?? undefined,
      impactIntro: page.impactIntro,
      impactCards: page.impactCards.map((c, i) => ({
        _key: `card-${i}`,
        value: c.value,
        title: c.title,
        description: c.description,
      })),
      testimonials: testimonials.map((t, i) => ({
        _key: `testimonial-${i}`,
        name: t.name,
        role: t.role,
        quote: t.quote,
      })),
      closingHeadline: page.closingHeadline,
      closingText: page.closingText,
    });

    console.log(`  ${docId} done.`);
  }
  }

  // ── Seed job posts ──
  for (const { locale, suffix, src } of JOB_LOCALE_SEEDS) {
  for (const post of src.posts ?? []) {
    const docId = `jobPost-${post.slug}${suffix}`;
    console.log(`Seeding ${docId}...`);

    await client.createOrReplace({
      _id: docId,
      _type: "jobPost",
      locale,
      title: post.title,
      slug: { _type: "slug", current: post.slug },
      openForApplications: post.openForApplications !== false,
      order: typeof post.order === "number" ? post.order : 100,
      location: post.location,
      employmentType: post.employmentType,
      start: post.start,
      compensation: post.compensation,
      eyebrow: post.eyebrow,
      tagline: post.tagline,
      shortDescription: post.shortDescription,
      intro: post.intro,
      sections: (post.sections ?? []).map((s, i) => ({
        _key: `section-${i}`,
        _type: "jobSection",
        heading: s.heading,
        body: s.body || undefined,
        bullets: Array.isArray(s.bullets) && s.bullets.length > 0 ? s.bullets : undefined,
      })),
      closingHeading: post.closingHeading,
      closingBody: post.closingBody,
    });

    console.log(`  ${docId} done.`);
  }
  }

  console.log("\nSanity seeded successfully!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
