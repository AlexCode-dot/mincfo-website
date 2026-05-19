import type { Metadata } from "next";
import SolutionPageTemplate from "../_shared/SolutionPageTemplate";
import { fetchSolutionContent } from "../_shared/solutionPageContent";
import { CFO_FINANCE_META, getSolutionMetadata } from "../_shared/solutionMetadata";
import { getLocale } from "@/i18n/server";

export const metadata: Metadata = getSolutionMetadata(CFO_FINANCE_META);

export default async function CfoFinancePage() {
  const locale = await getLocale();
  const content = await fetchSolutionContent("CFO & Finance Team", locale);
  return <SolutionPageTemplate content={content} locale={locale} />;
}
