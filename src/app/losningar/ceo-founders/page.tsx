import type { Metadata } from "next";
import CeoFoundersPage from "@/components/v2/CeoFoundersPage";

export const metadata: Metadata = {
  title: "CEO & Founders — MinCFO",
  description:
    "MinCFO sköter ekonomin i bakgrunden och ger ledningsteamet en plattform där runway, burn, ARR och avvikelser ligger i realtid.",
};

export default function Page() {
  return <CeoFoundersPage />;
}
