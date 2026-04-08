import type { Metadata } from "next";
import SolutionPageTemplate from "../_shared/SolutionPageTemplate";
import { fetchSolutionContent } from "../_shared/solutionPageContent";
import { CFO_FINANCE_META, getSolutionMetadata } from "../_shared/solutionMetadata";

export const revalidate = 3600;
export const metadata: Metadata = getSolutionMetadata(CFO_FINANCE_META);

export default async function CfoFinancePage() {
  const content = await fetchSolutionContent("CFO & Finance Team");
  return <SolutionPageTemplate content={content} />;
}
