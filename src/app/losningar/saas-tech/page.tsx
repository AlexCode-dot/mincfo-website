import type { Metadata } from "next";
import SolutionPage from "@/components/v2/SolutionPage";
import { getSolutionMetadata, SAAS_TECH_META } from "../_shared/solutionMetadata";

export const metadata: Metadata = getSolutionMetadata(SAAS_TECH_META);

export default function Page() {
  return <SolutionPage solutionKey="SaaS / Tech" />;
}
