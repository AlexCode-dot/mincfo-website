import type { Metadata } from "next";
import SolutionPage from "@/components/v2/SolutionPage";
import { getSolutionMetadata, KONSULT_TJANSTER_META } from "../_shared/solutionMetadata";

export const metadata: Metadata = getSolutionMetadata(KONSULT_TJANSTER_META);

export default function Page() {
  return <SolutionPage solutionKey="Konsult & Tjänster" />;
}
