import type { Metadata } from "next";
import SolutionPageTemplate from "../_shared/SolutionPageTemplate";
import { SAAS_TECH_CONTENT } from "../_shared/solutionPageContent";
import { getSolutionMetadata, SAAS_TECH_META } from "../_shared/solutionMetadata";

export const metadata: Metadata = getSolutionMetadata(SAAS_TECH_META);

export default function SaasTechPage() {
  return <SolutionPageTemplate content={SAAS_TECH_CONTENT} />;
}
