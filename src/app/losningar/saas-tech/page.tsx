import type { Metadata } from "next";
import SolutionPageTemplate from "../_shared/SolutionPageTemplate";
import { fetchSolutionContent } from "../_shared/solutionPageContent";
import { getSolutionMetadata, SAAS_TECH_META } from "../_shared/solutionMetadata";
import { getLocale } from "@/i18n/server";

export const metadata: Metadata = getSolutionMetadata(SAAS_TECH_META);

export default async function SaasTechPage() {
  const locale = await getLocale();
  const content = await fetchSolutionContent("SaaS / Tech", locale);
  return <SolutionPageTemplate content={content} locale={locale} />;
}
