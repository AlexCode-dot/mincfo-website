import type { StructureBuilder } from "sanity/structure";

const SOLUTION_PAGES = [
  { id: "solution-ceo-founders", title: "CEO & Founders" },
  { id: "solution-cfo-finance", title: "CFO & Finance Team" },
  { id: "solution-saas-tech", title: "SaaS / Tech" },
  { id: "solution-konsult-tjanster", title: "Konsult & Tjänster" },
  { id: "solution-ehandel", title: "E-handel" },
];

type Locale = "sv" | "en";

// Swedish keeps the legacy ids; English uses the suffixed ids the seed creates.
const variantId = (base: string, locale: Locale) =>
  locale === "sv" ? base : `${base}-en`;
const solutionId = (base: string, locale: Locale) =>
  locale === "sv" ? base : `${base}-en`;
const settingsId = (locale: Locale) =>
  locale === "sv" ? "siteSettings" : "siteSettings.en";

// Build the full content tree for one language.
const localeBranch = (S: StructureBuilder, locale: Locale) =>
  S.list()
    .title(locale === "sv" ? "Svenska" : "English")
    .items([
      // ── Startsida ──
      S.listItem()
        .id(`${locale}-variant-platform`)
        .title("Plattform")
        .child(
          S.document()
            .schemaType("homeVariantContent")
            .documentId(variantId("homeVariant-platform", locale)),
        ),
      S.listItem()
        .id(`${locale}-variant-full-service`)
        .title("Helhetslösning")
        .child(
          S.document()
            .schemaType("homeVariantContent")
            .documentId(variantId("homeVariant-full-service", locale)),
        ),
      S.listItem()
        .id(`${locale}-variant-partner`)
        .title("Byråer")
        .child(
          S.document()
            .schemaType("homeVariantContent")
            .documentId(variantId("homeVariant-partner", locale)),
        ),
      S.divider(),

      // ── Lösningssidor ──
      S.listItem()
        .id(`${locale}-solutions`)
        .title("Lösningssidor")
        .child(
          S.list()
            .id(`${locale}-solutions-list`)
            .title("Lösningssidor")
            .items(
              SOLUTION_PAGES.map((page) =>
                S.listItem()
                  .id(`${locale}-${page.id}`)
                  .title(page.title)
                  .child(
                    S.document()
                      .schemaType("solutionPage")
                      .documentId(solutionId(page.id, locale)),
                  ),
              ),
            ),
        ),
      S.divider(),

      // ── Jobbannonser ──
      S.listItem()
        .id(`${locale}-jobs`)
        .title("Jobbannonser")
        .child(
          S.documentTypeList("jobPost")
            .id(`${locale}-jobs-list`)
            .title("Jobbannonser")
            .filter(
              '_type == "jobPost" && (locale == $loc || (!defined(locale) && $loc == "sv"))',
            )
            .params({ loc: locale })
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),

      // ── Blogg ──
      S.listItem()
        .id(`${locale}-blog`)
        .title("Blogg")
        .child(
          S.documentTypeList("blogPost")
            .id(`${locale}-blog-list`)
            .title("Blogginlägg")
            .filter(
              '_type == "blogPost" && (locale == $loc || (!defined(locale) && $loc == "sv"))',
            )
            .params({ loc: locale })
            .defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
        ),
      S.divider(),

      // ── Gemensamt ──
      S.listItem()
        .id(`${locale}-settings`)
        .title("Gemensamt (nav, footer, säkerhet)")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId(settingsId(locale)),
        ),
    ]);

export const structure = (S: StructureBuilder) =>
  S.list()
    .title("Innehåll")
    .items([
      S.listItem()
        .id("locale-sv")
        .title("🇸🇪 Svenska")
        .child(localeBranch(S, "sv")),
      S.listItem()
        .id("locale-en")
        .title("🇬🇧 English")
        .child(localeBranch(S, "en")),
    ]);
