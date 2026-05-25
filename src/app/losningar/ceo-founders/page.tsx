import type { Metadata } from "next";
import SolutionPage from "@/components/v2/solutions/SolutionPage";

export const metadata: Metadata = {
  title: "CEO & Founders — MinCFO",
  description:
    "MinCFO sköter ekonomin i bakgrunden och ger ledningsteamet en plattform där runway, burn, ARR och avvikelser ligger i realtid.",
};

export default function Page() {
  return <SolutionPage solutionKey="CEO & Founders" />;
}
