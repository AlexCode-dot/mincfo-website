import type { Metadata } from "next";
import SolutionPageTemplate from "../_shared/SolutionPageTemplate";
import { fetchSolutionContent } from "../_shared/solutionPageContent";
import { EHANDEL_META, getSolutionMetadata } from "../_shared/solutionMetadata";

export const metadata: Metadata = getSolutionMetadata(EHANDEL_META);

export default async function EhandelPage() {
  const content = await fetchSolutionContent("E-handel");
  return <SolutionPageTemplate content={content} />;
}
