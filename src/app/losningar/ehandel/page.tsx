import type { Metadata } from "next";
import SolutionPage from "@/components/v2/SolutionPage";
import { EHANDEL_META, getSolutionMetadata } from "../_shared/solutionMetadata";

export const metadata: Metadata = getSolutionMetadata(EHANDEL_META);

export default function Page() {
  return <SolutionPage solutionKey="E-handel" />;
}
