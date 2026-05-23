import type { Metadata } from "next";
import CareersListPage from "@/components/v2/careers/CareersListPage";

export const metadata: Metadata = {
  title: "Karriär — MinCFO",
  description:
    "Lediga roller på MinCFO. Vi bygger framtidens ekonomifunktion för tillväxtbolag — bli en del av ett entreprenörsdrivet team i centrala Göteborg.",
};

export default function Page() {
  return <CareersListPage />;
}
