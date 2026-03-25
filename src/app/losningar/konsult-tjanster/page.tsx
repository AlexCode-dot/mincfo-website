import type { Metadata } from "next";
import SolutionPageTemplate from "../_shared/SolutionPageTemplate";
import { KONSULT_TJANSTER_CONTENT } from "../_shared/solutionPageContent";
import { getSolutionMetadata, KONSULT_TJANSTER_META } from "../_shared/solutionMetadata";

export const metadata: Metadata = getSolutionMetadata(KONSULT_TJANSTER_META);

export default function KonsultTjansterPage() {
  return <SolutionPageTemplate content={KONSULT_TJANSTER_CONTENT} />;
}
