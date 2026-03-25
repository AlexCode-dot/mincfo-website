import type { Metadata } from "next";
import SolutionPageTemplate from "../_shared/SolutionPageTemplate";
import { EHANDEL_CONTENT } from "../_shared/solutionPageContent";
import { EHANDEL_META, getSolutionMetadata } from "../_shared/solutionMetadata";

export const metadata: Metadata = getSolutionMetadata(EHANDEL_META);

export default function EhandelPage() {
  return <SolutionPageTemplate content={EHANDEL_CONTENT} />;
}
