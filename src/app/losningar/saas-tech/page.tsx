import type { Metadata } from "next";
import SolutionPageTemplate from "../_shared/SolutionPageTemplate";
import { fetchSolutionContent } from "../_shared/solutionPageContent";
import { getSolutionMetadata, SAAS_TECH_META } from "../_shared/solutionMetadata";

export const metadata: Metadata = getSolutionMetadata(SAAS_TECH_META);

export default async function SaasTechPage() {
  const content = await fetchSolutionContent("SaaS / Tech");
  return <SolutionPageTemplate content={content} />;
}
