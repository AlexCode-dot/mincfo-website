import type { Metadata } from "next";
import SolutionPageTemplate from "../_shared/SolutionPageTemplate";
import { fetchSolutionContent } from "../_shared/solutionPageContent";
import { getSolutionMetadata, KONSULT_TJANSTER_META } from "../_shared/solutionMetadata";

export const revalidate = 3600;
export const metadata: Metadata = getSolutionMetadata(KONSULT_TJANSTER_META);

export default async function KonsultTjansterPage() {
  const content = await fetchSolutionContent("Konsult & Tjänster");
  return <SolutionPageTemplate content={content} />;
}
