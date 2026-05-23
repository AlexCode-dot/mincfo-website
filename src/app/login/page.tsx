import type { Metadata } from "next";
import LoginPage from "@/components/v2/auth/LoginPage";

export const metadata: Metadata = {
  title: "Logga in — MinCFO",
  description:
    "Logga in på MinCFO för att följa ekonomin i realtid — resultat, likviditet och nyckeltal samlat på ett ställe.",
};

export default function Page() {
  return <LoginPage />;
}
