import type { Metadata } from "next";
import PlatformPage from "@/components/v2/products/PlatformPage";

export const metadata: Metadata = {
  title: "Plattform — MinCFO",
  description:
    "MinCFO-plattformen ger din finansiella data en röst: AI-driven analys, modulära realtidsdashboards och smarta kassaflödesprognoser — kopplat till era befintliga flöden och system.",
};

export default function Page() {
  return <PlatformPage />;
}
