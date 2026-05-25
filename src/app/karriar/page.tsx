import type { Metadata } from "next";
import CareersListPage from "@/components/v2/careers/CareersListPage";

export const metadata: Metadata = {
  title: "Karriär | MinCFO",
  description:
    "Bli en del av MinCFO. Se våra lediga tjänster och praktikplatser och skicka in din ansökan direkt på sajten.",
};

export default function Page() {
  return <CareersListPage />;
}
