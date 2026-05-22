import type { Metadata } from "next";
import SolutionPage from "@/components/v2/SolutionPage";
import { CFO_FINANCE_META, getSolutionMetadata } from "../_shared/solutionMetadata";

export const metadata: Metadata = getSolutionMetadata(CFO_FINANCE_META);

export default function Page() {
  return <SolutionPage solutionKey="CFO & Finance Team" />;
}
