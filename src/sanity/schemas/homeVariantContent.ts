import { defineType, defineField } from "sanity";

export default defineType({
  name: "homeVariantContent",
  title: "Startsida - variant",
  type: "document",
  groups: [
    { name: "content", title: "Innehåll", default: true },
    { name: "visual", title: "Visuella element" },
  ],
  fieldsets: [
    // ── Content fieldsets ──
    { name: "hero", title: "Hero", options: { collapsible: true } },
    { name: "aicopilot", title: "AI Copilot", options: { collapsible: true } },
    { name: "dashboard", title: "Dashboard", options: { collapsible: true } },
    { name: "planning", title: "Planering", options: { collapsible: true } },
    { name: "solutions", title: "Lösningar", options: { collapsible: true } },
    { name: "customers", title: "Kundcase", options: { collapsible: true } },
    {
      name: "howItWorks",
      title: "Hur det funkar",
      options: { collapsible: true },
    },
    {
      name: "showcase",
      title: "Erbjudande-presentation",
      options: { collapsible: true },
    },
    {
      name: "ending",
      title: "Avslutande CTA",
      options: { collapsible: true },
    },
    // Visual fields are object types — they collapse on their own
  ],
  fields: [
    // ────────────────────────────────────────────────
    // Mode (no group, no fieldset)
    // ────────────────────────────────────────────────
    defineField({
      name: "mode",
      title: "Variant",
      type: "string",
      options: { list: ["full-service", "platform", "partner"] },
      validation: (r) => r.required(),
      readOnly: true,
    }),

    // ════════════════════════════════════════════════
    // GROUP: content
    // ════════════════════════════════════════════════

    // ── Hero ──
    defineField({
      name: "heroTagline",
      title: "Tagline",
      type: "string",
      fieldset: "hero",
      group: "content",
    }),
    defineField({
      name: "heroTitleLine1",
      title: "Rubrikrad 1",
      type: "string",
      fieldset: "hero",
      group: "content",
    }),
    defineField({
      name: "heroTitleLine2",
      title: "Rubrikrad 2",
      type: "string",
      fieldset: "hero",
      group: "content",
    }),
    defineField({
      name: "heroBody",
      title: "Brödtext",
      type: "text",
      rows: 3,
      fieldset: "hero",
      group: "content",
    }),
    defineField({
      name: "heroPrimaryCta",
      title: "Primär knapp",
      type: "string",
      fieldset: "hero",
      group: "content",
    }),
    defineField({
      name: "heroSecondaryCta",
      title: "Sekundär knapp",
      type: "string",
      fieldset: "hero",
      group: "content",
    }),

    // ── AI Copilot ──
    defineField({
      name: "aicopilotPill",
      title: "Etikett",
      type: "string",
      fieldset: "aicopilot",
      group: "content",
    }),
    defineField({
      name: "aicopilotTitle",
      title: "Rubrik",
      type: "string",
      fieldset: "aicopilot",
      group: "content",
    }),
    defineField({
      name: "aicopilotIntro",
      title: "Intro",
      type: "text",
      rows: 3,
      fieldset: "aicopilot",
      group: "content",
    }),
    defineField({
      name: "aicopilotBullets",
      title: "Punktlista",
      type: "array",
      of: [{ type: "string" }],
      fieldset: "aicopilot",
      group: "content",
    }),

    // ── Dashboard ──
    defineField({
      name: "dashboardPill",
      title: "Etikett",
      type: "string",
      fieldset: "dashboard",
      group: "content",
    }),
    defineField({
      name: "dashboardTitle",
      title: "Rubrik",
      type: "string",
      fieldset: "dashboard",
      group: "content",
    }),
    defineField({
      name: "dashboardIntro",
      title: "Intro",
      type: "text",
      rows: 3,
      fieldset: "dashboard",
      group: "content",
    }),
    defineField({
      name: "dashboardBullets",
      title: "Punktlista",
      type: "array",
      of: [{ type: "string" }],
      fieldset: "dashboard",
      group: "content",
    }),

    // ── Planning ──
    defineField({
      name: "planningPill",
      title: "Etikett",
      type: "string",
      fieldset: "planning",
      group: "content",
    }),
    defineField({
      name: "planningTitle",
      title: "Rubrik",
      type: "string",
      fieldset: "planning",
      group: "content",
    }),
    defineField({
      name: "planningIntro",
      title: "Intro",
      type: "text",
      rows: 3,
      fieldset: "planning",
      group: "content",
    }),
    defineField({
      name: "planningBullets",
      title: "Punktlista",
      type: "array",
      of: [{ type: "string" }],
      fieldset: "planning",
      group: "content",
    }),

    // ── Solutions ──
    defineField({
      name: "solutionsPill",
      title: "Etikett",
      type: "string",
      fieldset: "solutions",
      group: "content",
    }),
    defineField({
      name: "solutionsTitle",
      title: "Rubrik",
      type: "string",
      fieldset: "solutions",
      group: "content",
    }),
    defineField({
      name: "solutionsIntro",
      title: "Intro",
      type: "text",
      rows: 3,
      fieldset: "solutions",
      group: "content",
    }),
    defineField({
      name: "solutionsCardCta",
      title: "Kortknapp-text",
      type: "string",
      fieldset: "solutions",
      group: "content",
    }),
    defineField({
      name: "solutionsCards",
      title: "Lösningskort",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", title: "Rubrik", type: "string" },
            { name: "text", title: "Beskrivning", type: "text", rows: 2 },
          ],
          preview: {
            select: { title: "title" },
          },
        },
      ],
      fieldset: "solutions",
      group: "content",
    }),

    // ── Customers ──
    defineField({
      name: "customersPill",
      title: "Etikett",
      type: "string",
      fieldset: "customers",
      group: "content",
    }),
    defineField({
      name: "customersTitle",
      title: "Rubrik",
      type: "string",
      fieldset: "customers",
      group: "content",
    }),
    defineField({
      name: "customersIntro",
      title: "Intro",
      type: "text",
      rows: 3,
      fieldset: "customers",
      group: "content",
    }),
    defineField({
      name: "customersTickerLabel",
      title: "Ticker-text",
      type: "string",
      fieldset: "customers",
      group: "content",
    }),
    defineField({
      name: "customersTestimonials",
      title: "Kundomdömen",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "company", title: "Företag", type: "string" },
            { name: "person", title: "Person", type: "string" },
            { name: "role", title: "Roll", type: "string" },
            { name: "quote", title: "Citat", type: "text", rows: 3 },
          ],
          preview: {
            select: { title: "person", subtitle: "company" },
          },
        },
      ],
      fieldset: "customers",
      group: "content",
    }),

    // ── How It Works ──
    defineField({
      name: "howItWorksIntro",
      title: "Intro-text",
      type: "string",
      fieldset: "howItWorks",
      group: "content",
    }),
    defineField({
      name: "howItWorksTabLabel",
      title: "Fliktext",
      type: "string",
      fieldset: "howItWorks",
      group: "content",
    }),
    defineField({
      name: "howItWorksSteps",
      title: "Steg",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", title: "Rubrik", type: "string" },
            { name: "body", title: "Brödtext", type: "text", rows: 2 },
            {
              name: "highlights",
              title: "Höjdpunkter",
              type: "array",
              of: [{ type: "string" }],
            },
          ],
          preview: {
            select: { title: "title" },
          },
        },
      ],
      fieldset: "howItWorks",
      group: "content",
    }),

    // ── Showcase ──
    defineField({
      name: "showcaseEyebrow",
      title: "Ögonbryn",
      type: "string",
      fieldset: "showcase",
      group: "content",
    }),
    defineField({
      name: "showcaseTitle",
      title: "Rubrik",
      type: "string",
      fieldset: "showcase",
      group: "content",
    }),
    defineField({
      name: "showcaseBody",
      title: "Brödtext",
      type: "text",
      rows: 2,
      fieldset: "showcase",
      group: "content",
    }),
    defineField({
      name: "showcaseCtaLabel",
      title: "Knapptext",
      type: "string",
      fieldset: "showcase",
      group: "content",
    }),

    // ── Ending ──
    defineField({
      name: "endingTitle",
      title: "Rubrik",
      type: "string",
      fieldset: "ending",
      group: "content",
    }),
    defineField({
      name: "endingBody",
      title: "Brödtext",
      type: "text",
      rows: 2,
      fieldset: "ending",
      group: "content",
    }),
    defineField({
      name: "endingPrimaryCta",
      title: "Knapptext",
      type: "string",
      fieldset: "ending",
      group: "content",
    }),

    // ════════════════════════════════════════════════
    // GROUP: visual
    // ════════════════════════════════════════════════

    // ── Copilot Demo ──
    defineField({
      name: "copilotExamples",
      title: "Copilot-exempel",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "question", title: "Fråga", type: "string" },
            { name: "answer", title: "Svar", type: "text", rows: 3 },
            { name: "chartTitle", title: "Diagramrubrik", type: "string" },
            { name: "chartUnit", title: "Diagramenhet", type: "string" },
            {
              name: "yTicks",
              title: "Y-axel värden",
              type: "array",
              of: [{ type: "string" }],
            },
            {
              name: "bars",
              title: "Staplar",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    { name: "label", title: "Etikett", type: "string" },
                    { name: "value", title: "Värde", type: "string" },
                    { name: "height", title: "Höjd", type: "string" },
                  ],
                  preview: {
                    select: { title: "label", subtitle: "value" },
                  },
                },
              ],
            },
          ],
          preview: {
            select: { title: "question" },
          },
        },
      ],
      group: "visual",
    }),

    // ── Dashboard Visual ──
    defineField({
      name: "dashboardVisual",
      title: "Dashboard-etiketter",
      type: "object",
      fields: [
        { name: "resultTitle", title: "Rapporttitel", type: "string" },
        { name: "currentLabel", title: "Senaste-etikett", type: "string" },
        {
          name: "previousLabel",
          title: "Föregående-etikett",
          type: "string",
        },
        { name: "currencyLabel", title: "Valuta", type: "string" },
        {
          name: "metricOptions",
          title: "Metrik-alternativ",
          type: "array",
          of: [{ type: "string" }],
        },
        { name: "compareLabel", title: "Jämförelseetikett", type: "string" },
        {
          name: "trendAxisTicks",
          title: "Y-axel skalsteg",
          type: "array",
          of: [{ type: "string" }],
        },
        {
          name: "monthLabels",
          title: "Månadsnamn",
          type: "array",
          of: [{ type: "string" }],
        },
      ],
      group: "visual",
    }),

    // ── Planning Visual ──
    defineField({
      name: "planningVisual",
      title: "Planering-etiketter",
      type: "object",
      fields: [
        { name: "forecastTitle", title: "Prognosrubrik", type: "string" },
        { name: "liveLabel", title: "Live-etikett", type: "string" },
        { name: "actualPrefix", title: "Aktuell-prefix", type: "string" },
        { name: "forecastPrefix", title: "Prognos-prefix", type: "string" },
        {
          name: "vsPrevious",
          title: "Jämfört med föregående",
          type: "string",
        },
        { name: "annualVariance", title: "Årsavvikelse", type: "string" },
        {
          name: "monthLabels",
          title: "Månadsnamn (eng)",
          type: "array",
          of: [{ type: "string" }],
        },
      ],
      group: "visual",
    }),

    // All showcase visuals are managed in Gemensamt (siteSettings)
  ],

  preview: {
    select: { mode: "mode" },
    prepare: ({ mode }) => ({
      title:
        mode === "platform"
          ? "Plattform"
          : mode === "full-service"
            ? "Helhetslösning"
            : "Byråer",
      subtitle: `Variant: ${mode}`,
    }),
  },
});
