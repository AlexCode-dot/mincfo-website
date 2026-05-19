import type { Metadata } from "next";
import SolutionPageTemplate from "../_shared/SolutionPageTemplate";
import { fetchSolutionContent } from "../_shared/solutionPageContent";
import { EHANDEL_META, getSolutionMetadata } from "../_shared/solutionMetadata";
import { getLocale } from "@/i18n/server";

export const metadata: Metadata = getSolutionMetadata(EHANDEL_META);

export default async function EhandelPage() {
  const locale = await getLocale();
  const content = await fetchSolutionContent("E-handel", locale);
  return <SolutionPageTemplate content={content} locale={locale} />;
}
