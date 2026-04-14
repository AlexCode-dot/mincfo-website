import { defineType, defineField } from "sanity";

const section = {
  type: "object" as const,
  name: "jobSection",
  title: "Sektion",
  fields: [
    {
      name: "heading",
      title: "Rubrik",
      type: "string" as const,
    },
    {
      name: "body",
      title: "Brödtext (valfri)",
      type: "text" as const,
      rows: 4,
    },
    {
      name: "bullets",
      title: "Punktlista (valfri)",
      type: "array" as const,
      of: [{ type: "string" as const }],
    },
  ],
  preview: {
    select: { title: "heading" },
  },
};

export default defineType({
  name: "jobPost",
  title: "Jobbannons",
  type: "document",
  fieldsets: [
    { name: "meta", title: "Grunddata", options: { collapsible: true } },
    { name: "intro", title: "Intro / hero", options: { collapsible: true } },
    { name: "details", title: "Roll & innehåll", options: { collapsible: true } },
    { name: "closing", title: "Avslutning", options: { collapsible: true } },
  ],
  fields: [
    // ── Meta ──
    defineField({
      name: "title",
      title: "Titel",
      type: "string",
      validation: (r) => r.required(),
      fieldset: "meta",
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
      fieldset: "meta",
    }),
    defineField({
      name: "openForApplications",
      title: "Öppen för ansökningar",
      type: "boolean",
      description: "Avmarkera för att dölja annonsen från /karriar utan att radera den.",
      initialValue: true,
      fieldset: "meta",
    }),
    defineField({
      name: "order",
      title: "Sorteringsordning",
      type: "number",
      description: "Lägre värde visas först i listan.",
      initialValue: 100,
      fieldset: "meta",
    }),
    defineField({
      name: "location",
      title: "Plats",
      type: "string",
      description: 'T.ex. "Göteborg / Hybrid"',
      fieldset: "meta",
    }),
    defineField({
      name: "employmentType",
      title: "Omfattning",
      type: "string",
      description: 'T.ex. "Praktik/LIA", "Heltid", "Deltid"',
      fieldset: "meta",
    }),
    defineField({
      name: "start",
      title: "Startdatum",
      type: "string",
      description: 'T.ex. "Enligt överenskommelse"',
      fieldset: "meta",
    }),
    defineField({
      name: "compensation",
      title: "Ersättning",
      type: "string",
      fieldset: "meta",
    }),

    // ── Intro ──
    defineField({
      name: "eyebrow",
      title: "Ögonbryn (kategori)",
      type: "string",
      description: 'T.ex. "Utveckling", "Ekonomi", "Sälj"',
      fieldset: "intro",
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "text",
      rows: 2,
      description: "Kort hook högst upp i annonsen.",
      fieldset: "intro",
    }),
    defineField({
      name: "shortDescription",
      title: "Kort beskrivning (för listan)",
      type: "text",
      rows: 2,
      description: "Visas på /karriar-listan. Håll den kort.",
      fieldset: "intro",
    }),
    defineField({
      name: "intro",
      title: "Intro / Om rollen",
      type: "text",
      rows: 6,
      fieldset: "intro",
    }),

    // ── Sections ──
    defineField({
      name: "sections",
      title: "Sektioner",
      description:
        "Fritt antal sektioner. Varje sektion har en rubrik + valfri brödtext + valfri punktlista.",
      type: "array",
      of: [section],
      fieldset: "details",
    }),

    // ── Closing ──
    defineField({
      name: "closingHeading",
      title: "Avslutningsrubrik",
      type: "string",
      fieldset: "closing",
    }),
    defineField({
      name: "closingBody",
      title: "Avslutningstext",
      type: "text",
      rows: 4,
      fieldset: "closing",
    }),
  ],

  orderings: [
    {
      name: "orderAsc",
      title: "Sortering",
      by: [
        { field: "order", direction: "asc" },
        { field: "title", direction: "asc" },
      ],
    },
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "employmentType",
      open: "openForApplications",
    },
    prepare({ title, subtitle, open }) {
      return {
        title,
        subtitle: `${subtitle ?? ""}${open ? "" : " · (dold)"}`,
      };
    },
  },
});
