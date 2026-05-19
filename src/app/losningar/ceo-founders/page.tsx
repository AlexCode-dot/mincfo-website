import type { Metadata } from "next";
import SolutionPageTemplate from "../_shared/SolutionPageTemplate";
import { fetchSolutionContent } from "../_shared/solutionPageContent";
import { CEO_FOUNDERS_META, getSolutionMetadata } from "../_shared/solutionMetadata";
import { getLocale } from "@/i18n/server";

export const metadata: Metadata = getSolutionMetadata(CEO_FOUNDERS_META);

export default async function CeoFoundersPage() {
  const locale = await getLocale();
  const content = await fetchSolutionContent("CEO & Founders", locale);
  return <SolutionPageTemplate content={content} locale={locale} />;
}
