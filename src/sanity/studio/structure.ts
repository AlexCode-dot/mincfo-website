import type { StructureBuilder } from "sanity/structure";

const SOLUTION_PAGES = [
  { id: "solution-ceo-founders", title: "CEO & Founders" },
  { id: "solution-cfo-finance", title: "CFO & Finance Team" },
  { id: "solution-saas-tech", title: "SaaS / Tech" },
  { id: "solution-konsult-tjanster", title: "Konsult & Tjänster" },
  { id: "solution-ehandel", title: "E-handel" },
];

export const structure = (S: StructureBuilder) =>
  S.list()
    .title("Innehåll")
    .items([
      // ── Startsida ──
      S.listItem()
        .title("Plattform")
        .child(
          S.document().schemaType("homeVariantContent").documentId("homeVariant-platform"),
        ),
      S.listItem()
        .title("Helhetslösning")
        .child(
          S.document()
            .schemaType("homeVariantContent")
            .documentId("homeVariant-full-service"),
        ),
      S.listItem()
        .title("Byråer")
        .child(
          S.document().schemaType("homeVariantContent").documentId("homeVariant-partner"),
        ),
      S.divider(),

      // ── Lösningssidor ──
      S.listItem()
        .title("Lösningssidor")
        .child(
          S.list()
            .title("Lösningssidor")
            .items(
              SOLUTION_PAGES.map((page) =>
                S.listItem()
                  .title(page.title)
                  .child(
                    S.document().schemaType("solutionPage").documentId(page.id),
                  ),
              ),
            ),
        ),
      S.divider(),

      // ── Gemensamt ──
      S.listItem()
        .title("Gemensamt (nav, footer, säkerhet)")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
    ]);
