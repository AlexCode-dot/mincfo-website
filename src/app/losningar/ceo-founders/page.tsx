import type { Metadata } from "next";
import SolutionPageTemplate from "../_shared/SolutionPageTemplate";
import { fetchSolutionContent } from "../_shared/solutionPageContent";
import { CEO_FOUNDERS_META, getSolutionMetadata } from "../_shared/solutionMetadata";

export const revalidate = 3600;
export const metadata: Metadata = getSolutionMetadata(CEO_FOUNDERS_META);

export default async function CeoFoundersPage() {
  const content = await fetchSolutionContent("CEO & Founders");
  return <SolutionPageTemplate content={content} />;
}
