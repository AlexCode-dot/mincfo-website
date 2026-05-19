import type { Metadata } from "next";
import SolutionPageTemplate from "../_shared/SolutionPageTemplate";
import { fetchSolutionContent } from "../_shared/solutionPageContent";
import { getSolutionMetadata, KONSULT_TJANSTER_META } from "../_shared/solutionMetadata";
import { getLocale } from "@/i18n/server";

export const metadata: Metadata = getSolutionMetadata(KONSULT_TJANSTER_META);

export default async function KonsultTjansterPage() {
  const locale = await getLocale();
  const content = await fetchSolutionContent("Konsult & Tjänster", locale);
  return <SolutionPageTemplate content={content} locale={locale} />;
}
