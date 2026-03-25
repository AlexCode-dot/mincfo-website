import type { Metadata } from "next";
import SolutionPageTemplate from "../_shared/SolutionPageTemplate";
import { CFO_FINANCE_CONTENT } from "../_shared/solutionPageContent";
import { CFO_FINANCE_META, getSolutionMetadata } from "../_shared/solutionMetadata";

export const metadata: Metadata = getSolutionMetadata(CFO_FINANCE_META);

export default function CfoFinancePage() {
  return <SolutionPageTemplate content={CFO_FINANCE_CONTENT} />;
}
