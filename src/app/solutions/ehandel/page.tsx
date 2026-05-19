import SolutionPageTemplate from "../../losningar/_shared/SolutionPageTemplate";
import { fetchSolutionContent } from "../../losningar/_shared/solutionPageContent";
import { getLocale } from "@/i18n/server";

export default async function EhandelSolutionPage() {
  const locale = await getLocale();
  const content = await fetchSolutionContent("E-handel", locale);
  return <SolutionPageTemplate content={content} locale={locale} />;
}
