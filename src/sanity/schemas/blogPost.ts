import { defineType, defineField } from "sanity";
import { AutoSlugInput, HiddenSlugField } from "../components/AutoSlugInput";

export default defineType({
  name: "blogPost",
  title: "Blogginlägg",
  type: "document",

  fieldsets: [
    { name: "meta", title: "Grunddata", options: { collapsible: true } },
    { name: "intro", title: "Intro", options: { collapsible: true } },
    { name: "content", title: "Innehåll", options: { collapsible: true } },
    { name: "seo", title: "SEO", options: { collapsible: true, collapsed: true } },
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
      title: "URL",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
      fieldset: "meta",
      components: { input: AutoSlugInput, field: HiddenSlugField },
    }),
    defineField({
      name: "publishedAt",
      title: "Publiceringsdatum",
      type: "datetime",
      description: "Inlägget visas på sajten från och med detta datum.",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
      fieldset: "meta",
    }),
    defineField({
      name: "published",
      title: "Publicerad",
      type: "boolean",
      description: "Avmarkera för att hålla inlägget som utkast utan att radera det.",
      initialValue: true,
      fieldset: "meta",
    }),
    defineField({
      name: "featured",
      title: "Featured (visa stort på blogg-sidan)",
      type: "boolean",
      description:
        "Markera för att lyfta fram inlägget i den stora hero-platsen på /blogg. Om flera är markerade visas det senast publicerade. Lämna avmarkerat så visas det senaste inlägget automatiskt.",
      initialValue: false,
      fieldset: "meta",
    }),
    defineField({
      name: "author",
      title: "Författare",
      type: "string",
      fieldset: "meta",
    }),
    defineField({
      name: "authorRole",
      title: "Författarens roll",
      type: "string",
      description: 'Valfritt. T.ex. "Founder, MinCFO" eller "Head of Finance".',
      fieldset: "meta",
    }),
    defineField({
      name: "authorImage",
      title: "Författarens bild",
      type: "image",
      options: { hotspot: true },
      fieldset: "meta",
    }),
    defineField({
      name: "readingTime",
      title: "Lästid (min)",
      type: "number",
      description: "Valfritt. Visas i inlägget.",
      fieldset: "meta",
    }),

    // ── Intro ──
    defineField({
      name: "eyebrow",
      title: "Ögonbryn (kategori)",
      type: "string",
      description: 'Valfritt. T.ex. "Insikter", "Guide", "Nyhet".',
      fieldset: "intro",
    }),
    defineField({
      name: "excerpt",
      title: "Utdrag",
      type: "text",
      rows: 3,
      description: "Kort sammanfattning som visas på listsidan och i delningar.",
      validation: (r) => r.max(280),
      fieldset: "intro",
    }),
    defineField({
      name: "coverImage",
      title: "Omslagsbild",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt-text",
          type: "string",
          description: "Beskrivning av bilden för skärmläsare och SEO.",
        }),
      ],
      fieldset: "intro",
    }),

    // ── Content ──
    defineField({
      name: "body",
      title: "Brödtext",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Brödtext", value: "normal" },
            { title: "Rubrik 2", value: "h2" },
            { title: "Rubrik 3", value: "h3" },
            { title: "Citat", value: "blockquote" },
          ],
          lists: [
            { title: "Punktlista", value: "bullet" },
            { title: "Numrerad", value: "number" },
          ],
          marks: {
            decorators: [
              { title: "Fet", value: "strong" },
              { title: "Kursiv", value: "em" },
              { title: "Kod", value: "code" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Länk",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                    validation: (r) =>
                      r.uri({ allowRelative: true, scheme: ["http", "https", "mailto", "tel"] }),
                  },
                ],
              },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "alt", title: "Alt-text", type: "string" },
            { name: "caption", title: "Bildtext", type: "string" },
          ],
        },
      ],
      fieldset: "content",
    }),

    // ── SEO ──
    defineField({
      name: "seoTitle",
      title: "SEO-titel",
      type: "string",
      description: "Valfritt. Faller tillbaka till titeln om tom.",
      fieldset: "seo",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO-beskrivning",
      type: "text",
      rows: 2,
      description: "Valfritt. Faller tillbaka till utdraget om tom.",
      validation: (r) => r.max(180),
      fieldset: "seo",
    }),
  ],

  orderings: [
    {
      name: "publishedAtDesc",
      title: "Senast publicerade först",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "publishedAt",
      media: "coverImage",
      published: "published",
    },
    prepare({ title, subtitle, media, published }) {
      const date = subtitle
        ? new Date(subtitle).toLocaleDateString("sv-SE", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "Inget datum";
      return {
        title,
        subtitle: `${date}${published ? "" : " · (utkast)"}`,
        media,
      };
    },
  },
});
