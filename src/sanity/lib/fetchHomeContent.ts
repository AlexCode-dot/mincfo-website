import { client } from "@/sanity/client";
import { sanityFetch } from "@/sanity/lib/live";
import { SITE_SETTINGS_QUERY, VARIANT_QUERY } from "./queries";
import sharedJson from "@/content/home/shared.json";
import platformJson from "@/content/home/platform.json";
import fullServiceJson from "@/content/home/full-service.json";
import partnerJson from "@/content/home/partner.json";
import type { HomeOfferingMode } from "@/content/homePageText";

const VARIANT_JSON: Record<HomeOfferingMode, typeof platformJson> = {
  platform: platformJson,
  "full-service": fullServiceJson,
  partner: partnerJson,
};

// Maps from the mode key used in the code to the key used in shared.json howItWorks.offers
const MODE_TO_OFFER_KEY: Record<HomeOfferingMode, string> = {
  platform: "platform",
  "full-service": "faas",
  partner: "partner",
};

// ── Deep merge utility ──

type AnyObject = Record<string, unknown>;

function deepMerge<T extends AnyObject>(base: T, override: AnyObject | null | undefined): T {
  if (!override) return base;
  const result = { ...base };
  for (const key of Object.keys(base)) {
    const overrideVal = override[key];
    if (overrideVal === undefined || overrideVal === null) continue;

    const baseVal = base[key];
    if (
      typeof baseVal === "object" &&
      baseVal !== null &&
      !Array.isArray(baseVal) &&
      typeof overrideVal === "object" &&
      !Array.isArray(overrideVal)
    ) {
      (result as AnyObject)[key] = deepMerge(
        baseVal as AnyObject,
        overrideVal as AnyObject,
      );
    } else {
      (result as AnyObject)[key] = overrideVal;
    }
  }
  return result;
}

// ── Map Sanity variant doc → code-expected variant shape ──

function mapVariantFromSanity(
  sanity: AnyObject | null,
  jsonFallback: typeof platformJson,
): typeof platformJson {
  if (!sanity) return jsonFallback;

  const overlay: AnyObject = {};

  // Hero
  if (sanity.heroTagline || sanity.heroTitleLine1) {
    overlay.hero = {
      tagline: sanity.heroTagline,
      titleLine1: sanity.heroTitleLine1,
      titleLine2: sanity.heroTitleLine2,
      body: sanity.heroBody,
      primaryCta: sanity.heroPrimaryCta,
      secondaryCta: sanity.heroSecondaryCta,
    };
  }

  // AI Copilot
  if (sanity.aicopilotPill || sanity.aicopilotTitle) {
    overlay.aicopilot = {
      leftPill: sanity.aicopilotPill,
      leftTitle: sanity.aicopilotTitle,
      leftIntro: sanity.aicopilotIntro,
      leftBullets: sanity.aicopilotBullets,
      dashboard: {
        pill: sanity.dashboardPill,
        title: sanity.dashboardTitle,
        intro: sanity.dashboardIntro,
        kpiBullets: sanity.dashboardBullets,
      },
      planning: {
        pill: sanity.planningPill,
        title: sanity.planningTitle,
        intro: sanity.planningIntro,
        bullets: sanity.planningBullets,
      },
    };
  }

  // Solutions
  if (sanity.solutionsPill || sanity.solutionsTitle) {
    const solutionsOverlay: AnyObject = {
      pill: sanity.solutionsPill,
      title: sanity.solutionsTitle,
      intro: sanity.solutionsIntro,
      cardCta: sanity.solutionsCardCta,
    };

    // Merge solution cards: Sanity provides title+text, JSON has href+icon
    if (Array.isArray(sanity.solutionsCards)) {
      const jsonCards = jsonFallback.solutions.cards;
      solutionsOverlay.cards = jsonCards.map(
        (jsonCard: (typeof jsonCards)[number], i: number) => {
          const sanityCard = (sanity.solutionsCards as AnyObject[])?.[i];
          if (!sanityCard) return jsonCard;
          return {
            ...jsonCard,
            title: (sanityCard.title as string) ?? jsonCard.title,
            text: (sanityCard.text as string) ?? jsonCard.text,
          };
        },
      );
    }

    overlay.solutions = solutionsOverlay;
  }

  // Customers
  if (sanity.customersPill || sanity.customersTitle) {
    const customersOverlay: AnyObject = {
      pill: sanity.customersPill,
      title: sanity.customersTitle,
      intro: sanity.customersIntro,
      tickerLabel: sanity.customersTickerLabel,
    };

    // Merge testimonials: Sanity provides text fields, JSON has avatarFile+accent
    if (Array.isArray(sanity.customersTestimonials)) {
      const jsonTestimonials = jsonFallback.customers.testimonials;
      customersOverlay.testimonials = jsonTestimonials.map(
        (jsonT: (typeof jsonTestimonials)[number], i: number) => {
          const sanityT = (sanity.customersTestimonials as AnyObject[])?.[i];
          if (!sanityT) return jsonT;
          return {
            ...jsonT,
            company: (sanityT.company as string) ?? jsonT.company,
            person: (sanityT.person as string) ?? jsonT.person,
            role: (sanityT.role as string) ?? jsonT.role,
            quote: (sanityT.quote as string) ?? jsonT.quote,
          };
        },
      );
    }

    overlay.customers = customersOverlay;
  }

  // Ending
  if (sanity.endingTitle || sanity.endingBody) {
    overlay.ending = {
      title: sanity.endingTitle,
      body: sanity.endingBody,
      primaryCta: sanity.endingPrimaryCta,
    };
  }

  // ── Visual fields ──

  // Copilot examples
  if (Array.isArray(sanity.copilotExamples) && sanity.copilotExamples.length > 0) {
    if (!overlay.aicopilot) overlay.aicopilot = {};
    (overlay.aicopilot as AnyObject).examples = (sanity.copilotExamples as AnyObject[]).map(
      (ex) => ({
        question: ex.question,
        answer: ex.answer,
        chartTitle: ex.chartTitle,
        chartUnit: ex.chartUnit,
        yTicks: ex.yTicks,
        bars: ex.bars,
      }),
    );
  }

  // Dashboard visual labels
  const dv = sanity.dashboardVisual as AnyObject | undefined;
  if (dv) {
    if (!overlay.aicopilot) overlay.aicopilot = {};
    const db = ((overlay.aicopilot as AnyObject).dashboard as AnyObject) ?? {};
    if (dv.resultTitle) db.resultTitle = dv.resultTitle;
    if (dv.currentLabel) db.currentLabel = dv.currentLabel;
    if (dv.previousLabel) db.previousLabel = dv.previousLabel;
    if (dv.currencyLabel) db.currencyLabel = dv.currencyLabel;
    if (dv.metricOptions) db.metricOptions = dv.metricOptions;
    if (dv.compareLabel) db.compareLabel = dv.compareLabel;
    if (dv.trendAxisTicks) db.trendAxisTicks = dv.trendAxisTicks;
    if (dv.monthLabels) db.monthLabelsSv = dv.monthLabels;
    (overlay.aicopilot as AnyObject).dashboard = db;
  }

  // Planning visual labels
  const pv = sanity.planningVisual as AnyObject | undefined;
  if (pv) {
    if (!overlay.aicopilot) overlay.aicopilot = {};
    const pl = ((overlay.aicopilot as AnyObject).planning as AnyObject) ?? {};
    if (pv.forecastTitle) pl.forecastTitle = pv.forecastTitle;
    if (pv.liveLabel) pl.liveLabel = pv.liveLabel;
    if (pv.actualPrefix) pl.actualPrefix = pv.actualPrefix;
    if (pv.forecastPrefix) pl.forecastPrefix = pv.forecastPrefix;
    if (pv.vsPrevious) pl.vsPrevious = pv.vsPrevious;
    if (pv.annualVariance) pl.annualVariance = pv.annualVariance;
    if (pv.monthLabels) pl.monthLabelsEn = pv.monthLabels;
    (overlay.aicopilot as AnyObject).planning = pl;
  }

  return deepMerge(jsonFallback, overlay);
}

// ── Map Sanity siteSettings → shared.json overlay ──

function mapSettingsFromSanity(
  sanity: AnyObject | null,
): AnyObject {
  if (!sanity) return {};

  const overlay: AnyObject = {};

  // Site meta
  if (sanity.siteTitle || sanity.siteDescription) {
    overlay.siteMeta = {
      title: sanity.siteTitle,
      description: sanity.siteDescription,
    };
  }

  // Navigation
  if (sanity.navDemoCta || sanity.navLoginLabel || sanity.signupNavCta || sanity.navProdukt) {
    overlay.navigation = {
      produkt: sanity.navProdukt,
      losningar: sanity.navLosningar,
      kundcase: sanity.navKundcase,
      sakerhet: sanity.navSakerhet,
      hurDetFunkar: sanity.navHurDetFunkar,
      demoCta: sanity.navDemoCta,
      loginSignupLabel: sanity.navLoginLabel,
      signupCta: sanity.signupNavCta,
      openSolutionsAria: sanity.navOpenSolutionsAria,
      openMenuAria: sanity.navOpenMenuAria,
      loginChooser: {
        title: sanity.loginChooserTitle,
        subtitle: sanity.loginChooserSubtitle,
        loginLabel: sanity.loginChooserLoginLabel,
        loginSublabel: sanity.loginChooserLoginSublabel,
        signupLabel: sanity.loginChooserSignupLabel,
        signupSublabel: sanity.loginChooserSignupSublabel,
        closeAria: sanity.loginChooserCloseAria,
      },
    };
  }

  // Signup form
  if (sanity.signupTitle || sanity.signupSubtitle) {
    overlay.signup = {
      title: sanity.signupTitle,
      subtitle: sanity.signupSubtitle,
      companyLabel: sanity.signupCompanyLabel,
      orgNrLabel: sanity.signupOrgNrLabel,
      nameLabel: sanity.signupNameLabel,
      emailLabel: sanity.signupEmailLabel,
      phoneLabel: sanity.signupPhoneLabel,
      consent: sanity.signupConsent,
      consentLinkText: sanity.signupConsentLinkText,
      submitLabel: sanity.signupSubmitLabel,
      successTitle: sanity.signupSuccessTitle,
      successText: sanity.signupSuccessText,
    };
  }

  // Offering
  if (Array.isArray(sanity.offeringOptions)) {
    const offeringOverlay: AnyObject = {};

    if (Array.isArray(sanity.offeringOptions)) {
      const jsonOptions = sharedJson.offering.options;
      offeringOverlay.options = jsonOptions.map(
        (jsonOpt: (typeof jsonOptions)[number], i: number) => {
          const sanityOpt = (sanity.offeringOptions as AnyObject[])?.[i];
          if (!sanityOpt) return jsonOpt;
          return {
            ...jsonOpt,
            label: (sanityOpt.label as string) ?? jsonOpt.label,
            title: (sanityOpt.title as string) ?? jsonOpt.title,
            body: (sanityOpt.body as string) ?? jsonOpt.body,
            bullets: (sanityOpt.bullets as string[]) ?? jsonOpt.bullets,
            cta: (sanityOpt.cta as string) ?? jsonOpt.cta,
          };
        },
      );
    }

    overlay.offering = offeringOverlay;
  }

  // How It Works section title
  if (sanity.howItWorksSectionTitle) {
    overlay.howItWorks = {
      sectionTitle: sanity.howItWorksSectionTitle,
    };
  }

  // Security
  if (sanity.securityPill || sanity.securityTitle) {
    const securityOverlay: AnyObject = {
      pill: sanity.securityPill,
      title: sanity.securityTitle,
      intro: sanity.securityIntro,
    };

    if (Array.isArray(sanity.securityCards)) {
      securityOverlay.cards = (sanity.securityCards as AnyObject[]).map(
        (card: AnyObject) => ({
          title: card.title,
          body: card.body,
        }),
      );
    }

    overlay.security = securityOverlay;
  }

  // Footer
  if (sanity.footerIntro || sanity.footerEmail) {
    overlay.footer = {
      intro: sanity.footerIntro,
      careersCta: sanity.footerCareersCta,
      email: sanity.footerEmail,
      office1: sanity.footerOffice1,
      office2: sanity.footerOffice2,
      copyright: sanity.footerCopyright,
    };
  }

  // ── Visual fields ──

  // Showcase shared labels
  if (sanity.showcaseShared) {
    const ss = sanity.showcaseShared as AnyObject;
    if (!overlay.offering) overlay.offering = {};
    const offeringObj = overlay.offering as AnyObject;
    if (!offeringObj.showcase) offeringObj.showcase = {};
    const showcase = offeringObj.showcase as AnyObject;
    if (ss.introLines) showcase.introLines = ss.introLines;
    if (ss.previewLabel) showcase.previewLabel = ss.previewLabel;
  }

  // HowItWorks UI sections
  const uiOverlay: AnyObject = {};

  if (sanity.hiwAccount) uiOverlay.account = sanity.hiwAccount;
  if (sanity.hiwConnect) uiOverlay.connect = sanity.hiwConnect;
  if (sanity.hiwInsights) uiOverlay.insights = sanity.hiwInsights;
  if (sanity.hiwFaasRealtime) uiOverlay.faasRealtime = sanity.hiwFaasRealtime;
  if (sanity.hiwFaasOnboardingBadge) {
    uiOverlay.faasOnboarding = { badgeLabel: sanity.hiwFaasOnboardingBadge };
  }

  if (sanity.hiwSystems) {
    const sys = sanity.hiwSystems as AnyObject;
    uiOverlay.faasSystems = {
      hubLabel: sys.hubLabel,
      bankLabel: sys.bankLabel,
      skatteverketLabel: sys.skatteverketLabel,
      fortnoxLabel: sys.fortnoxLabel,
      payrollLabel: sys.payrollLabel,
      paymentsLabel: sys.paymentsLabel,
      customerTeamLabel: sys.customerTeamLabel,
      skatteverketAlt: sys.skatteverketLabel,
      fortnoxAlt: sys.fortnoxLabel,
      partnerLabels: {
        topLeft: sys.partnerTopLeft,
        topCenter: sys.partnerTopCenter,
        topRight: sys.partnerTopRight,
        midLeft: sys.partnerMidLeft,
        midRight: sys.partnerMidRight,
        bottomCenter: sys.partnerBottomCenter,
      },
    };
  }

  if (sanity.hiwPartnerWorkspace) {
    const pw = sanity.hiwPartnerWorkspace as AnyObject;
    uiOverlay.partnerWorkspace = {
      nav: { home: pw.navHome, users: pw.navUsers, settings: pw.navSettings },
      home: {
        title: pw.homeTitle,
        subtitle: pw.homeSubtitle,
        columns: pw.homeColumns,
        actionLabel: pw.homeActionLabel,
        rows: pw.homeRows,
      },
      users: {
        title: pw.usersTitle,
        subtitle: pw.usersSubtitle,
        columns: pw.usersColumns,
        actionLabel: pw.usersActionLabel,
        rows: pw.usersRows,
        searchPlaceholder: pw.usersSearchPlaceholder,
        inviteLabel: pw.usersInviteLabel,
      },
      settings: {
        title: pw.settingsTitle,
        subtitle: pw.settingsSubtitle,
        columns: pw.settingsColumns,
        actionLabel: pw.settingsActionLabel,
        rows: pw.settingsRows,
        appearanceTitle: pw.settingsAppearanceTitle,
        appearanceBody: pw.settingsAppearanceBody,
        modes: { light: pw.settingsModeLight, dark: pw.settingsModeDark },
        languageTitle: pw.settingsLanguageTitle,
        languageBody: pw.settingsLanguageBody,
        languageValue: pw.settingsLanguageValue,
      },
      pagination: { previous: pw.paginationPrevious, next: pw.paginationNext },
      summary: {
        label: pw.summaryLabel,
        title: pw.summaryTitle,
        statPrimary: pw.summaryStatPrimary,
        statSecondary: pw.summaryStatSecondary,
      },
    };
  }

  if (Object.keys(uiOverlay).length > 0) {
    if (!overlay.howItWorks) overlay.howItWorks = {};
    (overlay.howItWorks as AnyObject).ui = uiOverlay;
  }

  return overlay;
}

// ── Map howItWorks and showcase from variant docs → shared overlay ──

function mapHowItWorksFromVariants(
  variants: Record<HomeOfferingMode, AnyObject | null>,
): AnyObject {
  const offers: AnyObject = {};
  const sectionIntroByOffer: AnyObject = {};

  for (const mode of ["platform", "full-service", "partner"] as HomeOfferingMode[]) {
    const sanity = variants[mode];
    const offerKey = MODE_TO_OFFER_KEY[mode];

    if (sanity?.howItWorksIntro) {
      sectionIntroByOffer[offerKey] = sanity.howItWorksIntro;
    }

    if (sanity?.howItWorksTabLabel || sanity?.howItWorksSteps) {
      offers[offerKey] = {
        tabLabel: sanity.howItWorksTabLabel,
        steps: Array.isArray(sanity.howItWorksSteps)
          ? (sanity.howItWorksSteps as AnyObject[]).map((step) => ({
              title: step.title,
              body: step.body,
              highlights: step.highlights,
            }))
          : undefined,
      };
    }
  }

  return { howItWorks: { sectionIntroByOffer, offers } };
}

function mapShowcaseFromVariants(
  variants: Record<HomeOfferingMode, AnyObject | null>,
): AnyObject {
  const showcase: AnyObject = {};

  for (const mode of ["platform", "full-service", "partner"] as HomeOfferingMode[]) {
    const sanity = variants[mode];
    if (sanity?.showcaseEyebrow || sanity?.showcaseTitle || sanity?.showcaseVisual) {
      const entry: AnyObject = {
        eyebrow: sanity.showcaseEyebrow,
        title: sanity.showcaseTitle,
        body: sanity.showcaseBody,
        ctaLabel: sanity.showcaseCtaLabel,
      };

      // Visual showcase fields
      const sv = sanity.showcaseVisual as AnyObject | undefined;
      if (sv) {
        if (sv.signal) entry.signal = sv.signal;
        if (sv.chartLabel) entry.chartLabel = sv.chartLabel;
        if (sv.stats) entry.stats = sv.stats;
        // Service visual (full-service mode)
        if (sv.serviceVisualTitle) {
          entry.serviceVisual = {
            chipOwnership: sv.serviceVisualChipOwnership,
            chipDelivery: sv.serviceVisualChipDelivery,
            chipLeadership: sv.serviceVisualChipLeadership,
            eyebrow: sv.serviceVisualEyebrow,
            title: sv.serviceVisualTitle,
            badge: sv.serviceVisualBadge,
            steps: sv.serviceVisualSteps,
            summaryReportLabel: sv.serviceVisualSummaryReportLabel,
            summaryReportValue: sv.serviceVisualSummaryReportValue,
            summaryAlertsLabel: sv.serviceVisualSummaryAlertsLabel,
            summaryAlertsValue: sv.serviceVisualSummaryAlertsValue,
          };
        }
      }

      showcase[mode] = entry;
    }
  }

  if (Object.keys(showcase).length > 0) {
    return { offering: { showcase } };
  }
  return {};
}

// ── Static JSON fallback ──

function staticFallback() {
  return {
    shared: sharedJson,
    byMode: {
      platform: { ...sharedJson, ...platformJson },
      "full-service": { ...sharedJson, ...fullServiceJson },
      partner: { ...sharedJson, ...partnerJson },
    },
  };
}

// ── Main fetch function ──

export async function fetchAllHomeContent() {
  if (!client) {
    return staticFallback();
  }

  try {
    const [
      { data: sanitySettings },
      { data: sanityPlatform },
      { data: sanityFullService },
      { data: sanityPartner },
    ] = await Promise.all([
      sanityFetch({ query: SITE_SETTINGS_QUERY }),
      sanityFetch({ query: VARIANT_QUERY, params: { mode: "platform" } }),
      sanityFetch({ query: VARIANT_QUERY, params: { mode: "full-service" } }),
      sanityFetch({ query: VARIANT_QUERY, params: { mode: "partner" } }),
    ]);

    const sanityVariants: Record<HomeOfferingMode, AnyObject | null> = {
      platform: sanityPlatform,
      "full-service": sanityFullService,
      partner: sanityPartner,
    };

    // Build shared overlay from siteSettings + cross-variant howItWorks/showcase
    const settingsOverlay = mapSettingsFromSanity(sanitySettings);
    const howItWorksOverlay = mapHowItWorksFromVariants(sanityVariants);
    const showcaseOverlay = mapShowcaseFromVariants(sanityVariants);

    const shared = deepMerge(
      sharedJson,
      deepMerge(settingsOverlay, deepMerge(howItWorksOverlay, showcaseOverlay)),
    );

    // Build per-variant content
    const platform = mapVariantFromSanity(sanityPlatform, platformJson);
    const fullService = mapVariantFromSanity(sanityFullService, fullServiceJson);
    const partner = mapVariantFromSanity(sanityPartner, partnerJson);

    return {
      shared,
      byMode: {
        platform: { ...shared, ...platform },
        "full-service": { ...shared, ...fullService },
        partner: { ...shared, ...partner },
      },
    };
  } catch (error) {
    console.error("Failed to fetch from Sanity, using JSON fallback:", error);
    return staticFallback();
  }
}
