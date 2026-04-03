import { sanityClient } from "@/sanity/client";
import solutionPagesText from "@/content/solutionPagesText.json";

type AnyObject = Record<string, unknown>;

const SOLUTION_IDS: Record<string, string> = {
  "CEO & Founders": "solution-ceo-founders",
  "CFO & Finance Team": "solution-cfo-finance",
  "SaaS / Tech": "solution-saas-tech",
  "Konsult & Tjänster": "solution-konsult-tjanster",
  "E-handel": "solution-ehandel",
};

const SOLUTION_PAGE_QUERY = `*[_type == "solutionPage" && _id == $id][0]`;

function mapSanityToRawPage(
  sanity: AnyObject | null,
  jsonPage: AnyObject,
): AnyObject {
  if (!sanity) return jsonPage;

  const result = { ...jsonPage };

  // Hero
  if (sanity.eyebrow) result.eyebrow = sanity.eyebrow;
  if (sanity.heroHeadlineFirst) {
    result.heroHeadline = {
      first: sanity.heroHeadlineFirst,
      second: sanity.heroHeadlineSecond ?? null,
    };
  }
  if (sanity.heroIntro) result.heroIntro = sanity.heroIntro;
  if (sanity.logoStripText) result.logoStripText = sanity.logoStripText;

  // Dilemma
  if (sanity.dilemmaTitle) result.dilemmaTitle = sanity.dilemmaTitle;
  if (sanity.dilemmaIntro) result.dilemmaIntro = sanity.dilemmaIntro;
  if (Array.isArray(sanity.dilemmaCards) && sanity.dilemmaCards.length === 4) {
    result.dilemmaCards = (sanity.dilemmaCards as AnyObject[]).map((c) => ({
      title: c.title,
      body: c.body,
    }));
  }

  // Helps
  if (sanity.helpsTitle) result.helpsTitle = sanity.helpsTitle;
  if (sanity.helpsIntro) result.helpsIntro = sanity.helpsIntro;
  if (Array.isArray(sanity.helpsCards) && sanity.helpsCards.length === 4) {
    result.helpsCards = (sanity.helpsCards as AnyObject[]).map((c) => ({
      title: c.title,
      body: c.body,
    }));
  }

  // Scenario
  if (sanity.scenarioHeading || sanity.scenarioQuestion) {
    const jsonScenario = jsonPage.scenario as AnyObject;
    result.scenario = {
      ...jsonScenario,
      heading: sanity.scenarioHeading ?? jsonScenario.heading,
      description: sanity.scenarioDescription ?? jsonScenario.description,
      question: sanity.scenarioQuestion ?? jsonScenario.question,
      answer1: sanity.scenarioAnswer1 ?? jsonScenario.answer1,
      answer2: sanity.scenarioAnswer2 ?? jsonScenario.answer2,
      metricLabels:
        Array.isArray(sanity.scenarioMetricLabels) && sanity.scenarioMetricLabels.length === 3
          ? sanity.scenarioMetricLabels
          : jsonScenario.metricLabels,
      metricValues:
        Array.isArray(sanity.scenarioMetricValues) && sanity.scenarioMetricValues.length === 2
          ? sanity.scenarioMetricValues
          : jsonScenario.metricValues,
      metricHints:
        Array.isArray(sanity.scenarioMetricHints) && sanity.scenarioMetricHints.length === 2
          ? sanity.scenarioMetricHints
          : jsonScenario.metricHints,
    };
  }

  // Impact
  if (sanity.impactHeadlineFirst) {
    result.impactHeadline = {
      first: sanity.impactHeadlineFirst,
      second: sanity.impactHeadlineSecond ?? null,
    };
  }
  if (sanity.impactIntro) result.impactIntro = sanity.impactIntro;
  if (Array.isArray(sanity.impactCards) && sanity.impactCards.length === 4) {
    result.impactCards = (sanity.impactCards as AnyObject[]).map((c) => ({
      value: c.value,
      title: c.title,
      description: c.description,
    }));
  }

  // Testimonials — Sanity merges into both `testimonial` and `testimonials`
  if (Array.isArray(sanity.testimonials) && sanity.testimonials.length > 0) {
    const mapped = (sanity.testimonials as AnyObject[]).map((t) => ({
      image: (jsonPage.testimonial as AnyObject)?.image ?? (jsonPage.testimonials as AnyObject[])?.[0]?.image ?? "",
      name: t.name,
      role: t.role,
      quote: t.quote,
    }));
    if (mapped.length === 1) {
      result.testimonial = mapped[0];
    } else {
      result.testimonials = mapped;
    }
  }

  // Closing
  if (sanity.closingHeadline) result.closingHeadline = sanity.closingHeadline;
  if (sanity.closingText) result.closingText = sanity.closingText;

  return result;
}

export async function fetchSolutionPagesText() {
  if (!sanityClient) {
    return solutionPagesText;
  }

  try {
    const raw = solutionPagesText as { shared: AnyObject; pages: AnyObject[] };

    const sanityDocs = await Promise.all(
      raw.pages.map((page) => {
        const id = SOLUTION_IDS[page.key as string];
        return id
          ? sanityClient!.fetch(SOLUTION_PAGE_QUERY, { id })
          : Promise.resolve(null);
      }),
    );

    const mergedPages = raw.pages.map((page, i) =>
      mapSanityToRawPage(sanityDocs[i], page),
    );

    return { shared: raw.shared, pages: mergedPages };
  } catch (error) {
    console.error("Failed to fetch solution pages from Sanity:", error);
    return solutionPagesText;
  }
}
