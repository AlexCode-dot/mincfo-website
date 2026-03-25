import type { Metadata } from "next";
import SolutionPageTemplate from "../_shared/SolutionPageTemplate";
import { CEO_FOUNDERS_CONTENT } from "../_shared/solutionPageContent";
import { CEO_FOUNDERS_META, getSolutionMetadata } from "../_shared/solutionMetadata";

export const metadata: Metadata = getSolutionMetadata(CEO_FOUNDERS_META);

export default function CeoFoundersPage() {
  return <SolutionPageTemplate content={CEO_FOUNDERS_CONTENT} />;
}
