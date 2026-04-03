import { defineType, defineField } from "sanity";

const textCard = {
  type: "object" as const,
  fields: [
    { name: "title", title: "Rubrik", type: "string" as const },
    { name: "body", title: "Brödtext", type: "text" as const, rows: 2 },
  ],
  preview: { select: { title: "title" } },
};

const impactCard = {
  type: "object" as const,
  fields: [
    { name: "value", title: "Värde (t.ex. 30-50%)", type: "string" as const },
    { name: "title", title: "Rubrik", type: "string" as const },
    { name: "description", title: "Beskrivning", type: "text" as const, rows: 2 },
  ],
  preview: { select: { title: "title", subtitle: "value" } },
};

const testimonial = {
  type: "object" as const,
  fields: [
    { name: "name", title: "Namn", type: "string" as const },
    { name: "role", title: "Roll", type: "string" as const },
    { name: "quote", title: "Citat", type: "text" as const, rows: 3 },
  ],
  preview: { select: { title: "name", subtitle: "role" } },
};

export default defineType({
  name: "solutionPage",
  title: "Lösningssida",
  type: "document",
  fieldsets: [
    { name: "hero", title: "Hero", options: { collapsible: true } },
    { name: "dilemma", title: "Problem-sektion", options: { collapsible: true } },
    { name: "helps", title: "Lösning-sektion", options: { collapsible: true } },
    { name: "scenario", title: "Scenario", options: { collapsible: true } },
    { name: "impact", title: "Affärsvärde", options: { collapsible: true } },
    { name: "testimonials", title: "Kundomdömen", options: { collapsible: true } },
    { name: "closing", title: "Avslutande CTA", options: { collapsible: true } },
  ],
  fields: [
    defineField({
      name: "key",
      title: "Sidnyckel",
      type: "string",
      description: "Matchar sidan (ändra ej)",
      readOnly: true,
    }),

    // ── Hero ──
    defineField({
      name: "eyebrow",
      title: "Ögonbryn",
      type: "string",
      fieldset: "hero",
    }),
    defineField({
      name: "heroHeadlineFirst",
      title: "Rubrik rad 1",
      type: "string",
      fieldset: "hero",
    }),
    defineField({
      name: "heroHeadlineSecond",
      title: "Rubrik rad 2 (valfri)",
      type: "string",
      fieldset: "hero",
    }),
    defineField({
      name: "heroIntro",
      title: "Intro",
      type: "text",
      rows: 3,
      fieldset: "hero",
    }),
    defineField({
      name: "logoStripText",
      title: "Text ovanför logotyper",
      type: "string",
      fieldset: "hero",
    }),

    // ── Dilemma ──
    defineField({
      name: "dilemmaTitle",
      title: "Rubrik",
      type: "string",
      fieldset: "dilemma",
    }),
    defineField({
      name: "dilemmaIntro",
      title: "Intro",
      type: "text",
      rows: 2,
      fieldset: "dilemma",
    }),
    defineField({
      name: "dilemmaCards",
      title: "Problemkort (4 st)",
      type: "array",
      of: [textCard],
      validation: (r) => r.length(4),
      fieldset: "dilemma",
    }),

    // ── Helps ──
    defineField({
      name: "helpsTitle",
      title: "Rubrik",
      type: "string",
      fieldset: "helps",
    }),
    defineField({
      name: "helpsIntro",
      title: "Intro",
      type: "text",
      rows: 2,
      fieldset: "helps",
    }),
    defineField({
      name: "helpsCards",
      title: "Lösningskort (4 st)",
      type: "array",
      of: [textCard],
      validation: (r) => r.length(4),
      fieldset: "helps",
    }),

    // ── Scenario ──
    defineField({
      name: "scenarioHeading",
      title: "Rubrik",
      type: "string",
      fieldset: "scenario",
    }),
    defineField({
      name: "scenarioDescription",
      title: "Beskrivning (valfri)",
      type: "text",
      rows: 2,
      fieldset: "scenario",
    }),
    defineField({
      name: "scenarioQuestion",
      title: "Fråga",
      type: "string",
      fieldset: "scenario",
    }),
    defineField({
      name: "scenarioAnswer1",
      title: "Svar del 1",
      type: "text",
      rows: 2,
      fieldset: "scenario",
    }),
    defineField({
      name: "scenarioAnswer2",
      title: "Svar del 2",
      type: "text",
      rows: 2,
      fieldset: "scenario",
    }),
    defineField({
      name: "scenarioMetricLabels",
      title: "Metrisk-etiketter (3 st)",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.length(3),
      fieldset: "scenario",
    }),
    defineField({
      name: "scenarioMetricValues",
      title: "Metrisk-värden (2 st)",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.length(2),
      fieldset: "scenario",
    }),
    defineField({
      name: "scenarioMetricHints",
      title: "Metrisk-ledtrådar (2 st)",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.length(2),
      fieldset: "scenario",
    }),

    // ── Impact ──
    defineField({
      name: "impactHeadlineFirst",
      title: "Rubrik rad 1",
      type: "string",
      fieldset: "impact",
    }),
    defineField({
      name: "impactHeadlineSecond",
      title: "Rubrik rad 2 (valfri)",
      type: "string",
      fieldset: "impact",
    }),
    defineField({
      name: "impactIntro",
      title: "Intro",
      type: "text",
      rows: 2,
      fieldset: "impact",
    }),
    defineField({
      name: "impactCards",
      title: "Effektkort (4 st)",
      type: "array",
      of: [impactCard],
      validation: (r) => r.length(4),
      fieldset: "impact",
    }),

    // ── Testimonials ──
    defineField({
      name: "testimonials",
      title: "Kundomdömen",
      type: "array",
      of: [testimonial],
      fieldset: "testimonials",
    }),

    // ── Closing ──
    defineField({
      name: "closingHeadline",
      title: "Rubrik",
      type: "string",
      fieldset: "closing",
    }),
    defineField({
      name: "closingText",
      title: "Brödtext",
      type: "text",
      rows: 2,
      fieldset: "closing",
    }),
  ],

  preview: {
    select: { title: "key" },
  },
});
