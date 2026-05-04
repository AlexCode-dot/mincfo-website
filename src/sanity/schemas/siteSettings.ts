import { defineType, defineField } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Gemensamt",
  type: "document",

  groups: [
    { name: "content", title: "Innehåll", default: true },
    { name: "visual", title: "Visuella element" },
  ],

  fieldsets: [
    // ── Content group fieldsets ──
    { name: "siteMeta", title: "Sidtitel & beskrivning", options: { collapsible: true } },
    { name: "navigation", title: "Navigation", options: { collapsible: true } },
    { name: "offering", title: "Erbjudandeväljare", options: { collapsible: true } },
    { name: "howItWorks", title: "Hur det funkar", options: { collapsible: true } },
    { name: "security", title: "Säkerhet", options: { collapsible: true } },
    { name: "signup", title: "Registreringsformulär", options: { collapsible: true } },
    { name: "blog", title: "Blogg-sida (text)", options: { collapsible: true } },
    { name: "footer", title: "Sidfot", options: { collapsible: true } },

    // Visual group fields are object types — they collapse on their own, no fieldsets needed
  ],

  fields: [
    // ═══════════════════════════════════════════════
    // GROUP: content
    // ═══════════════════════════════════════════════

    // ── Site Meta ──
    defineField({
      name: "siteTitle",
      title: "Titel",
      type: "string",
      fieldset: "siteMeta",
      group: "content",
    }),
    defineField({
      name: "siteDescription",
      title: "Beskrivning",
      type: "text",
      rows: 2,
      fieldset: "siteMeta",
      group: "content",
    }),

    // ── Navigation ──
    defineField({
      name: "navProdukt",
      title: "Produkt-länktext",
      type: "string",
      fieldset: "navigation",
      group: "content",
    }),
    defineField({
      name: "navLosningar",
      title: "Lösningar-länktext",
      type: "string",
      fieldset: "navigation",
      group: "content",
    }),
    defineField({
      name: "navKundcase",
      title: "Kundcase-länktext",
      type: "string",
      fieldset: "navigation",
      group: "content",
    }),
    defineField({
      name: "navSakerhet",
      title: "Säkerhet-länktext",
      type: "string",
      fieldset: "navigation",
      group: "content",
    }),
    defineField({
      name: "navHurDetFunkar",
      title: "Hur det funkar-länktext",
      type: "string",
      fieldset: "navigation",
      group: "content",
    }),
    defineField({
      name: "navBlogg",
      title: "Blogg-länktext",
      type: "string",
      fieldset: "navigation",
      group: "content",
    }),
    defineField({
      name: "navDemoCta",
      title: "Demo-knapptext",
      type: "string",
      fieldset: "navigation",
      group: "content",
    }),
    defineField({
      name: "navLoginLabel",
      title: "Logga in-text",
      type: "string",
      fieldset: "navigation",
      group: "content",
    }),
    defineField({
      name: "navOpenSolutionsAria",
      title: "Öppna lösningsmeny (aria)",
      type: "string",
      fieldset: "navigation",
      group: "content",
    }),
    defineField({
      name: "navOpenMenuAria",
      title: "Öppna meny (aria)",
      type: "string",
      fieldset: "navigation",
      group: "content",
    }),
    defineField({
      name: "loginChooserTitle",
      title: "Logga in-val: rubrik",
      type: "string",
      fieldset: "navigation",
      group: "content",
    }),
    defineField({
      name: "loginChooserSubtitle",
      title: "Logga in-val: underrubrik",
      type: "string",
      fieldset: "navigation",
      group: "content",
    }),
    defineField({
      name: "loginChooserLoginLabel",
      title: "Logga in-val: Logga in-knapp",
      type: "string",
      fieldset: "navigation",
      group: "content",
    }),
    defineField({
      name: "loginChooserLoginSublabel",
      title: "Logga in-val: Logga in-beskrivning",
      type: "string",
      fieldset: "navigation",
      group: "content",
    }),
    defineField({
      name: "loginChooserSignupLabel",
      title: "Logga in-val: Skapa konto-knapp",
      type: "string",
      fieldset: "navigation",
      group: "content",
    }),
    defineField({
      name: "loginChooserSignupSublabel",
      title: "Logga in-val: Skapa konto-beskrivning",
      type: "string",
      fieldset: "navigation",
      group: "content",
    }),
    defineField({
      name: "loginChooserCloseAria",
      title: "Logga in-val: Stäng (aria)",
      type: "string",
      fieldset: "navigation",
      group: "content",
    }),

    // ── Offering switcher ──
    defineField({
      name: "offeringOptions",
      title: "Alternativ",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "id",
              title: "ID",
              type: "string",
              options: { list: ["full-service", "platform", "partner"] },
              readOnly: true,
            },
            { name: "label", title: "Etikett", type: "string" },
            { name: "title", title: "Rubrik", type: "string" },
            { name: "body", title: "Beskrivning", type: "text", rows: 2 },
            { name: "bullets", title: "Punktlista", type: "array", of: [{ type: "string" }] },
            { name: "cta", title: "Knapptext", type: "string" },
          ],
          preview: {
            select: { title: "label" },
          },
        },
      ],
      fieldset: "offering",
      group: "content",
    }),

    // ── How It Works ──
    defineField({
      name: "howItWorksSectionTitle",
      title: "Sektionsrubrik",
      type: "string",
      fieldset: "howItWorks",
      group: "content",
    }),

    // ── Security ──
    defineField({
      name: "securityPill",
      title: "Etikett",
      type: "string",
      fieldset: "security",
      group: "content",
    }),
    defineField({
      name: "securityTitle",
      title: "Rubrik",
      type: "string",
      fieldset: "security",
      group: "content",
    }),
    defineField({
      name: "securityIntro",
      title: "Intro",
      type: "text",
      rows: 2,
      fieldset: "security",
      group: "content",
    }),
    defineField({
      name: "securityCards",
      title: "Kort",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", title: "Rubrik", type: "string" },
            { name: "body", title: "Brödtext", type: "text", rows: 3 },
          ],
          preview: {
            select: { title: "title" },
          },
        },
      ],
      fieldset: "security",
      group: "content",
    }),

    // ── Signup form ──
    defineField({
      name: "signupNavCta",
      title: "Knapptext i nav",
      type: "string",
      fieldset: "signup",
      group: "content",
    }),
    defineField({
      name: "signupTitle",
      title: "Rubrik",
      type: "string",
      fieldset: "signup",
      group: "content",
    }),
    defineField({
      name: "signupSubtitle",
      title: "Beskrivning",
      type: "text",
      rows: 3,
      fieldset: "signup",
      group: "content",
    }),
    defineField({
      name: "signupCompanyLabel",
      title: "Företagsnamn – label",
      type: "string",
      fieldset: "signup",
      group: "content",
    }),
    defineField({
      name: "signupOrgNrLabel",
      title: "Org.nummer – label",
      type: "string",
      fieldset: "signup",
      group: "content",
    }),
    defineField({
      name: "signupNameLabel",
      title: "Kontaktperson – label",
      type: "string",
      fieldset: "signup",
      group: "content",
    }),
    defineField({
      name: "signupEmailLabel",
      title: "E-post – label",
      type: "string",
      fieldset: "signup",
      group: "content",
    }),
    defineField({
      name: "signupPhoneLabel",
      title: "Telefon – label",
      type: "string",
      fieldset: "signup",
      group: "content",
    }),
    defineField({
      name: "signupConsent",
      title: "Samtycke-text (använd {villkoren} som platshållare för länken)",
      type: "text",
      rows: 2,
      fieldset: "signup",
      group: "content",
    }),
    defineField({
      name: "signupConsentLinkText",
      title: "Samtycke – länktext",
      type: "string",
      fieldset: "signup",
      group: "content",
    }),
    defineField({
      name: "signupSubmitLabel",
      title: "Skicka-knapptext",
      type: "string",
      fieldset: "signup",
      group: "content",
    }),
    defineField({
      name: "signupSuccessTitle",
      title: "Bekräftelse – rubrik",
      type: "string",
      fieldset: "signup",
      group: "content",
    }),
    defineField({
      name: "signupSuccessText",
      title: "Bekräftelse – text",
      type: "text",
      rows: 2,
      fieldset: "signup",
      group: "content",
    }),

    // ── Blog page text ──
    defineField({
      name: "blogTitle",
      title: "Rubrik",
      type: "string",
      description: 'Stora rubriken högst upp på /blogg. T.ex. "Insikter från MinCFO".',
      fieldset: "blog",
      group: "content",
    }),
    defineField({
      name: "blogSubtitle",
      title: "Underrubrik",
      type: "text",
      rows: 2,
      description: "Visas under rubriken och används även som SEO-beskrivning för bloggen.",
      fieldset: "blog",
      group: "content",
    }),
    defineField({
      name: "blogSidebarHeading",
      title: "Sidebar-rubrik",
      type: "string",
      description: 'Rubrik över listan med senaste inläggen. T.ex. "Senaste inläggen".',
      fieldset: "blog",
      group: "content",
    }),
    defineField({
      name: "blogGridHeading",
      title: "Grid-rubrik",
      type: "string",
      description: 'Rubrik över de mindre korten under hero. T.ex. "Mer från oss".',
      fieldset: "blog",
      group: "content",
    }),
    defineField({
      name: "blogEmptyTitle",
      title: "Tomt-läge: rubrik",
      type: "string",
      description: "Visas när inga blogginlägg är publicerade ännu.",
      fieldset: "blog",
      group: "content",
    }),
    defineField({
      name: "blogEmptyBody",
      title: "Tomt-läge: text",
      type: "text",
      rows: 2,
      fieldset: "blog",
      group: "content",
    }),
    defineField({
      name: "blogBackToListLabel",
      title: 'Länktext "tillbaka till alla inlägg"',
      type: "string",
      description: "Visas längst ned på varje enskilt blogginlägg.",
      fieldset: "blog",
      group: "content",
    }),

    // ── Footer ──
    defineField({
      name: "footerIntro",
      title: "Intro",
      type: "text",
      rows: 2,
      fieldset: "footer",
      group: "content",
    }),
    defineField({
      name: "footerCareersCta",
      title: "Karriärlänk-text",
      type: "string",
      fieldset: "footer",
      group: "content",
    }),
    defineField({
      name: "footerEmail",
      title: "E-post",
      type: "string",
      fieldset: "footer",
      group: "content",
    }),
    defineField({
      name: "footerOffice1",
      title: "Kontor 1",
      type: "string",
      fieldset: "footer",
      group: "content",
    }),
    defineField({
      name: "footerOffice2",
      title: "Kontor 2",
      type: "string",
      fieldset: "footer",
      group: "content",
    }),
    defineField({
      name: "footerCopyright",
      title: "Copyright",
      type: "string",
      fieldset: "footer",
      group: "content",
    }),

    // ═══════════════════════════════════════════════
    // GROUP: visual
    // ═══════════════════════════════════════════════

    // ── Showcase Shared ──
    defineField({
      name: "showcaseShared",
      title: "Erbjudande-presentation (gemensamt)",
      type: "object",
      group: "visual",
      fields: [
        defineField({
          name: "introLines",
          title: "Introrader",
          type: "array",
          of: [{ type: "string" }],
        }),
        defineField({
          name: "previewLabel",
          title: "Förhandsgranskning-text",
          type: "string",
        }),
      ],
    }),

    // ── Showcase: Platform ──
    defineField({
      name: "showcasePlatform",
      title: "Showcase - Plattform",
      type: "object",
      group: "visual",
      fields: [
        {
          name: "stats",
          title: "Statistik",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                { name: "label", title: "Etikett", type: "string" },
                { name: "value", title: "Värde", type: "string" },
              ],
              preview: { select: { title: "label", subtitle: "value" } },
            },
          ],
        },
      ],
    }),

    // ── Showcase: Full-service ──
    defineField({
      name: "showcaseFullService",
      title: "Showcase - Helhetslösning",
      type: "object",
      group: "visual",
      fields: [
        { name: "eyebrow", title: "Ögonbryn", type: "string" },
        { name: "title", title: "Rubrik", type: "string" },
        { name: "badge", title: "Badge", type: "string" },
        {
          name: "steps",
          title: "Steg",
          type: "array",
          of: [{ type: "string" }],
        },
        { name: "summaryReportLabel", title: "Rapport-etikett", type: "string" },
        { name: "summaryReportValue", title: "Rapport-värde", type: "string" },
        { name: "summaryAlertsLabel", title: "Prognostisering-etikett", type: "string" },
        { name: "summaryAlertsValue", title: "Prognostisering-värde", type: "string" },
      ],
    }),

    // Partner showcase visual is covered by the Byråportal fields above

    // ── HIW Account ──
    defineField({
      name: "hiwAccount",
      title: "Hur det funkar - Kontoformulär",
      type: "object",
      group: "visual",
      fields: [
        defineField({ name: "secureLabel", title: "Säkerhetsetikett", type: "string" }),
        defineField({ name: "tabCreate", title: "Skapa-flik", type: "string" }),
        defineField({ name: "tabLogin", title: "Logga in-flik", type: "string" }),
        defineField({ name: "emailLabel", title: "E-postetikett", type: "string" }),
        defineField({ name: "passwordLabel", title: "Lösenord", type: "string" }),
        defineField({ name: "termsLabel", title: "Villkorstext", type: "string" }),
        defineField({ name: "buttonLabel", title: "Knapptext", type: "string" }),
        defineField({ name: "existingAccountLabel", title: "Redan konto?", type: "string" }),
        defineField({ name: "loginLinkLabel", title: "Inloggningslänk", type: "string" }),
        defineField({ name: "welcomeTitle", title: "Välkomstrubrik", type: "string" }),
        defineField({ name: "welcomeSubtitle", title: "Välkomstunderrubrik", type: "string" }),
        defineField({ name: "continueWithGoogle", title: "Fortsätt med Google", type: "string" }),
        defineField({ name: "continueWithMicrosoft", title: "Fortsätt med Microsoft", type: "string" }),
        defineField({ name: "dividerLabel", title: "Delaretikett", type: "string" }),
        defineField({ name: "emailInputPlaceholder", title: "E-post platshållare", type: "string" }),
        defineField({ name: "continueLabel", title: "Fortsätt-etikett", type: "string" }),
      ],
    }),

    // ── HIW Connect ──
    defineField({
      name: "hiwConnect",
      title: "Hur det funkar - Systemkoppling",
      type: "object",
      group: "visual",
      fields: [
        defineField({ name: "fortnoxWord", title: "Fortnox", type: "string" }),
        defineField({ name: "accountConnected", title: "Konto kopplat", type: "string" }),
        defineField({ name: "mincfoWord", title: "minCFO", type: "string" }),
        defineField({ name: "receivingData", title: "Tar emot data", type: "string" }),
        defineField({ name: "integrationActive", title: "Integration aktiv", type: "string" }),
        defineField({ name: "lastSyncLabel", title: "Senast synk", type: "string" }),
      ],
    }),

    // ── HIW Insights ──
    defineField({
      name: "hiwInsights",
      title: "Hur det funkar - AI Insights",
      type: "object",
      group: "visual",
      fields: [
        defineField({ name: "title", title: "Rubrik", type: "string" }),
        defineField({ name: "question", title: "Fråga", type: "string" }),
        defineField({ name: "thinkingLabel", title: "Tänker-etikett", type: "string" }),
        defineField({ name: "generatedForecastLabel", title: "Prognosetikett", type: "string" }),
        defineField({ name: "runwayMonthsLabel", title: "Runway-etikett", type: "string" }),
        defineField({ name: "barCurrent", title: "Stapel: Nu", type: "string" }),
        defineField({ name: "barPlan", title: "Stapel: Plan", type: "string" }),
        defineField({ name: "barScenario", title: "Stapel: Scenario", type: "string" }),
        defineField({ name: "summary", title: "Sammanfattning", type: "string" }),
        defineField({ name: "inputHint", title: "Inmatningsledtråd", type: "string" }),
        defineField({ name: "inputTyped", title: "Förskriven fråga", type: "string" }),
      ],
    }),

    // ── HIW FaaS Dashboard ──
    defineField({
      name: "hiwFaasRealtime",
      title: "Hur det funkar - FaaS Realtid",
      type: "object",
      group: "visual",
      fields: [
        defineField({ name: "statusUpdated", title: "Statusuppdaterad", type: "string" }),
        defineField({ name: "cashflowLabel", title: "Kassaflöde", type: "string" }),
        defineField({ name: "runwayLabel", title: "Runway", type: "string" }),
        defineField({ name: "monthSuffix", title: "Månadssuffix", type: "string" }),
        defineField({ name: "deviationLabel", title: "Avvikelse", type: "string" }),
        defineField({
          name: "months",
          title: "Månader",
          type: "array",
          of: [{ type: "string" }],
        }),
        defineField({ name: "personnelAlertTemplate", title: "Personalvarning (mall)", type: "string" }),
        defineField({ name: "latePaymentsAlert", title: "Sena betalningar", type: "string" }),
      ],
    }),
    defineField({
      name: "hiwFaasOnboardingBadge",
      title: "FaaS Onboarding badge",
      type: "string",
      group: "visual",
    }),

    // ── HIW Systems ──
    defineField({
      name: "hiwSystems",
      title: "Hur det funkar - Systemintegration",
      type: "object",
      group: "visual",
      fields: [
        defineField({ name: "hubLabel", title: "Hubb", type: "string" }),
        defineField({ name: "bankLabel", title: "Bank", type: "string" }),
        defineField({ name: "skatteverketLabel", title: "Skatteverket", type: "string" }),
        defineField({ name: "fortnoxLabel", title: "Fortnox", type: "string" }),
        defineField({ name: "payrollLabel", title: "Lönesystem", type: "string" }),
        defineField({ name: "paymentsLabel", title: "Betalningar", type: "string" }),
        defineField({ name: "customerTeamLabel", title: "Kundteam", type: "string" }),
        defineField({ name: "partnerTopLeft", title: "Partner: Överst vänster", type: "string" }),
        defineField({ name: "partnerTopCenter", title: "Partner: Överst mitt", type: "string" }),
        defineField({ name: "partnerTopRight", title: "Partner: Överst höger", type: "string" }),
        defineField({ name: "partnerMidLeft", title: "Partner: Mitt vänster", type: "string" }),
        defineField({ name: "partnerMidRight", title: "Partner: Mitt höger", type: "string" }),
        defineField({ name: "partnerBottomCenter", title: "Partner: Nederst mitt", type: "string" }),
      ],
    }),

    // ── HIW Partner Workspace ──
    defineField({
      name: "hiwPartnerWorkspace",
      title: "Hur det funkar - Byråportal",
      type: "object",
      group: "visual",
      fields: [
        defineField({ name: "navHome", title: "Nav: Hem", type: "string" }),
        defineField({ name: "navUsers", title: "Nav: Användare", type: "string" }),
        defineField({ name: "navSettings", title: "Nav: Inställningar", type: "string" }),
        defineField({ name: "homeTitle", title: "Hem - Rubrik", type: "string" }),
        defineField({ name: "homeSubtitle", title: "Hem - Underrubrik", type: "string" }),
        defineField({
          name: "homeColumns",
          title: "Hem - Kolumner",
          type: "array",
          of: [{ type: "string" }],
        }),
        defineField({ name: "homeActionLabel", title: "Hem - Åtgärdsknapp", type: "string" }),
        defineField({
          name: "homeRows",
          title: "Hem - Rader",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                { name: "label", title: "Etikett", type: "string" },
                { name: "detail", title: "Detalj", type: "string" },
                { name: "tag", title: "Tagg", type: "string" },
                { name: "status", title: "Status", type: "string" },
              ],
              preview: {
                select: { title: "label" },
              },
            },
          ],
        }),
        defineField({ name: "usersTitle", title: "Användare - Rubrik", type: "string" }),
        defineField({ name: "usersSubtitle", title: "Användare - Underrubrik", type: "string" }),
        defineField({
          name: "usersColumns",
          title: "Användare - Kolumner",
          type: "array",
          of: [{ type: "string" }],
        }),
        defineField({ name: "usersActionLabel", title: "Användare - Åtgärdsknapp", type: "string" }),
        defineField({
          name: "usersRows",
          title: "Användare - Rader",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                { name: "label", title: "Etikett", type: "string" },
                { name: "detail", title: "Detalj", type: "string" },
                { name: "tag", title: "Tagg", type: "string" },
                { name: "status", title: "Status", type: "string" },
              ],
              preview: {
                select: { title: "label" },
              },
            },
          ],
        }),
        defineField({ name: "usersSearchPlaceholder", title: "Sökfält", type: "string" }),
        defineField({ name: "usersInviteLabel", title: "Bjud in-knapp", type: "string" }),
        defineField({ name: "settingsTitle", title: "Inställningar - Rubrik", type: "string" }),
        defineField({ name: "settingsSubtitle", title: "Inställningar - Underrubrik", type: "string" }),
        defineField({
          name: "settingsColumns",
          title: "Inställningar - Kolumner",
          type: "array",
          of: [{ type: "string" }],
        }),
        defineField({ name: "settingsActionLabel", title: "Inställningar - Åtgärdsknapp", type: "string" }),
        defineField({
          name: "settingsRows",
          title: "Inställningar - Rader",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                { name: "label", title: "Etikett", type: "string" },
                { name: "detail", title: "Detalj", type: "string" },
                { name: "tag", title: "Tagg", type: "string" },
                { name: "status", title: "Status", type: "string" },
              ],
              preview: {
                select: { title: "label" },
              },
            },
          ],
        }),
        defineField({ name: "settingsAppearanceTitle", title: "Utseende-rubrik", type: "string" }),
        defineField({ name: "settingsAppearanceBody", title: "Utseende-beskrivning", type: "string" }),
        defineField({ name: "settingsModeLight", title: "Ljust läge", type: "string" }),
        defineField({ name: "settingsModeDark", title: "Mörkt läge", type: "string" }),
        defineField({ name: "settingsLanguageTitle", title: "Språk-rubrik", type: "string" }),
        defineField({ name: "settingsLanguageBody", title: "Språk-beskrivning", type: "string" }),
        defineField({ name: "settingsLanguageValue", title: "Språk-värde", type: "string" }),
        defineField({ name: "paginationPrevious", title: "Föregående", type: "string" }),
        defineField({ name: "paginationNext", title: "Nästa", type: "string" }),
        defineField({ name: "summaryLabel", title: "Sammanfattning - Etikett", type: "string" }),
        defineField({ name: "summaryTitle", title: "Sammanfattning - Rubrik", type: "string" }),
        defineField({ name: "summaryStatPrimary", title: "Primär stat", type: "string" }),
        defineField({ name: "summaryStatSecondary", title: "Sekundär stat", type: "string" }),
      ],
    }),

  ],

  preview: {
    prepare: () => ({
      title: "Gemensamt",
      subtitle: "Navigation, säkerhet, sidfot",
    }),
  },
});
