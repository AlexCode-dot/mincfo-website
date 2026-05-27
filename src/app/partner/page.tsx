import type { Metadata } from "next";
import PartnerPage from "@/components/v2/solutions/PartnerPage";

export const metadata: Metadata = {
  title: "För byråer — MinCFO",
  description:
    "MinCFO Byråportal: standardisera uppföljning, leverera bättre beslutsunderlag och skala rådgivningen över hela klientportföljen — utan att varje klientupplägg blir ett specialprojekt.",
};

export default function Page() {
  return <PartnerPage />;
}
