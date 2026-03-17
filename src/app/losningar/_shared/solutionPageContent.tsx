import type { ReactNode } from "react";
import solutionPagesText from "@/content/solutionPagesText.json";
import type { TestimonialItem } from "../ceo-founders/TestimonialSpotlight";

export type SolutionTextCard = {
  title: string;
  body: string;
};

export type SolutionImpactCard = {
  value: string;
  title: string;
  description: string;
};

export type SolutionScenario = {
  heading: string;
  description?: string;
  question: string;
  answer: [string, string];
  metrics: [string, string, string];
  metricValues: [string, string];
  metricHints: [string, string];
  activeMonth: string;
};

export type ImpactVisualType =
  | "realtime"
  | "time"
  | "flow"
  | "cash"
  | "accuracy"
  | "analysis"
  | "scale"
  | "radar"
  | "proactive"
  | "report"
  | "governance";

export type SolutionPageContent = {
  eyebrow: string;
  heroHeadline: ReactNode;
  heroTitleWide?: boolean;
  heroSubheadline: string;
  logoStripMicrocopy: string;
  dilemmaTitle: string;
  dilemmaSubtitle: string;
  dilemmaCards: [SolutionTextCard, SolutionTextCard, SolutionTextCard, SolutionTextCard];
  helpsTitle: string;
  helpsSubtitle: string;
  helpsCards: [SolutionTextCard, SolutionTextCard, SolutionTextCard, SolutionTextCard];
  scenario: SolutionScenario;
  impactTitle: ReactNode;
  impactSubtitle: string;
  impactCards: [SolutionImpactCard, SolutionImpactCard, SolutionImpactCard, SolutionImpactCard];
  impactVisuals?: [ImpactVisualType, ImpactVisualType, ImpactVisualType, ImpactVisualType];
  testimonial?: TestimonialItem;
  testimonials?: TestimonialItem[];
  trustHeadline: string;
  trustSub: string;
};

type RawCard = {
  title: string;
  body: string;
};

type RawImpactCard = {
  value: string;
  title: string;
  description: string;
};

type RawScenario = {
  heading: string;
  description?: string;
  question: string;
  answer1: string;
  answer2: string;
  metricLabels: string[];
  metricValues: string[];
  metricHints: string[];
  activeMonth: string;
};

type RawHeadline = {
  first: string;
  second: string | null;
};

type RawTestimonial = {
  image: string;
  name: string;
  role: string;
  quote: string;
};

type RawPage = {
  key: string;
  eyebrow: string;
  heroHeadline: RawHeadline;
  heroIntro: string;
  logoStripText: string;
  dilemmaTitle: string;
  dilemmaIntro: string;
  dilemmaCards: RawCard[];
  helpsTitle: string;
  helpsIntro: string;
  helpsCards: RawCard[];
  scenario: RawScenario;
  impactHeadline: RawHeadline;
  impactIntro: string;
  impactCards: RawImpactCard[];
  testimonial?: RawTestimonial;
  testimonials?: RawTestimonial[];
  closingHeadline: string;
  closingText: string;
};

type RawSolutionPagesText = {
  pages: RawPage[];
};

const rawSolutions = solutionPagesText as RawSolutionPagesText;

const IMPACT_VISUALS_BY_KEY: Record<
  string,
  [ImpactVisualType, ImpactVisualType, ImpactVisualType, ImpactVisualType]
> = {
  "CEO & Founders": ["realtime", "flow", "proactive", "governance"],
  "CFO & Finance Team": ["realtime", "flow", "accuracy", "analysis"],
  "SaaS / Tech": ["realtime", "flow", "radar", "report"],
  "Konsult & Tjänster": ["analysis", "flow", "cash", "scale"],
  "E-handel": ["cash", "flow", "radar", "analysis"],
};

const HERO_TITLE_WIDE_BY_KEY: Record<string, boolean> = {
  "CEO & Founders": false,
  "CFO & Finance Team": true,
  "SaaS / Tech": true,
  "Konsult & Tjänster": true,
  "E-handel": true,
};

function asTuple2(values: string[], label: string): [string, string] {
  if (values.length !== 2) {
    throw new Error(`${label} must contain exactly 2 items`);
  }
  return [values[0], values[1]];
}

function asTuple3(values: string[], label: string): [string, string, string] {
  if (values.length !== 3) {
    throw new Error(`${label} must contain exactly 3 items`);
  }
  return [values[0], values[1], values[2]];
}

function asTuple4<T>(values: T[], label: string): [T, T, T, T] {
  if (values.length !== 4) {
    throw new Error(`${label} must contain exactly 4 items`);
  }
  return [values[0], values[1], values[2], values[3]];
}

function buildHeadline(headline: RawHeadline): ReactNode {
  const second = headline.second ?? "";
  if (!second.trim()) return headline.first;

  return (
    <>
      {headline.first}
      <br />
      {second}
    </>
  );
}

function mapScenario(page: RawPage): SolutionScenario {
  return {
    heading: page.scenario.heading,
    description: page.scenario.description,
    question: page.scenario.question,
    answer: [page.scenario.answer1, page.scenario.answer2],
    metrics: asTuple3(page.scenario.metricLabels, `${page.key} scenario.metricLabels`),
    metricValues: asTuple2(page.scenario.metricValues, `${page.key} scenario.metricValues`),
    metricHints: asTuple2(page.scenario.metricHints, `${page.key} scenario.metricHints`),
    activeMonth: page.scenario.activeMonth,
  };
}

function mapPage(page: RawPage): SolutionPageContent {
  const dilemmaCards = asTuple4(
    page.dilemmaCards.map((item) => ({ title: item.title, body: item.body })),
    `${page.key} dilemmaCards`,
  );

  const helpsCards = asTuple4(
    page.helpsCards.map((item) => ({ title: item.title, body: item.body })),
    `${page.key} helpsCards`,
  );

  const impactCards = asTuple4(
    page.impactCards.map((item) => ({
      value: item.value,
      title: item.title,
      description: item.description,
    })),
    `${page.key} impactCards`,
  );

  return {
    eyebrow: page.eyebrow,
    heroHeadline: buildHeadline(page.heroHeadline),
    heroTitleWide: HERO_TITLE_WIDE_BY_KEY[page.key] ?? true,
    heroSubheadline: page.heroIntro,
    logoStripMicrocopy: page.logoStripText,
    dilemmaTitle: page.dilemmaTitle,
    dilemmaSubtitle: page.dilemmaIntro,
    dilemmaCards,
    helpsTitle: page.helpsTitle,
    helpsSubtitle: page.helpsIntro,
    helpsCards,
    scenario: mapScenario(page),
    impactTitle: buildHeadline(page.impactHeadline),
    impactSubtitle: page.impactIntro,
    impactCards,
    impactVisuals: IMPACT_VISUALS_BY_KEY[page.key],
    testimonial: page.testimonial,
    testimonials: page.testimonials,
    trustHeadline: page.closingHeadline,
    trustSub: page.closingText,
  };
}

const pageByKey = new Map(rawSolutions.pages.map((page) => [page.key, mapPage(page)]));

function getPageContent(key: string): SolutionPageContent {
  const page = pageByKey.get(key);
  if (!page) {
    throw new Error(`Missing solution page content for key: ${key}`);
  }
  return page;
}

export const CEO_FOUNDERS_CONTENT = getPageContent("CEO & Founders");
export const CFO_FINANCE_CONTENT = getPageContent("CFO & Finance Team");
export const SAAS_TECH_CONTENT = getPageContent("SaaS / Tech");
export const KONSULT_TJANSTER_CONTENT = getPageContent("Konsult & Tjänster");
export const EHANDEL_CONTENT = getPageContent("E-handel");
