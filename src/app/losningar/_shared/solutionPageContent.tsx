import solutionsSvContent from "@/content/locales/sv/solutions.json";
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
  answer: string[];
  metrics: string[];
  metricValues: string[];
  metricHints: string[];
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
  heroHeadline: string;
  heroTitleWide?: boolean;
  heroSubheadline: string;
  logoStripMicrocopy: string;
  dilemmaTitle: string;
  dilemmaSubtitle: string;
  dilemmaCards: SolutionTextCard[];
  helpsTitle: string;
  helpsSubtitle: string;
  helpsCards: SolutionTextCard[];
  scenario: SolutionScenario;
  impactTitle: string;
  impactSubtitle: string;
  impactCards: SolutionImpactCard[];
  impactVisuals?: ImpactVisualType[];
  testimonial?: TestimonialItem;
  testimonials?: TestimonialItem[];
  trustHeadline: string;
  trustSub: string;
};

export type SolutionTemplateContent = typeof solutionsSvContent.template;
export type SolutionsIndexContent = typeof solutionsSvContent.indexPage;

const pages = solutionsSvContent.pages as Record<string, SolutionPageContent>;

export const solutionsTemplateContent = solutionsSvContent.template;
export const solutionsIndexContent = solutionsSvContent.indexPage;

export const CEO_FOUNDERS_CONTENT: SolutionPageContent = pages.ceoFounders;
export const CFO_FINANCE_CONTENT: SolutionPageContent = pages.cfoFinance;
export const SAAS_TECH_CONTENT: SolutionPageContent = pages.saasTech;
export const FRACTIONAL_CFO_CONTENT: SolutionPageContent = pages.fractionalCfo;
export const KONSULT_TJANSTER_CONTENT: SolutionPageContent = pages.konsultTjanster;
export const EHANDEL_CONTENT: SolutionPageContent = pages.ehandel;
