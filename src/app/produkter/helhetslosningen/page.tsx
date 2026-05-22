import type { Metadata } from "next";
import HelhetslosningenPage from "@/components/v2/HelhetslosningenPage";

export const metadata: Metadata = {
  title: "Helhetslösningen — MinCFO",
  description:
    "MinCFO blir er ekonomifunktion: redovisning, rapportering, lön och CFO-stöd levererat av ett team som äger leveransen och en plattform som visar läget i realtid.",
};

export default function Page() {
  return <HelhetslosningenPage />;
}
