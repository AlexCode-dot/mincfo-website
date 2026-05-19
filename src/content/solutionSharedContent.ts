import { DEFAULT_LOCALE, type Locale } from "@/i18n/locale";
import solutionPagesText from "./solutionPagesText.json";
import solutionPagesTextEn from "./solutionPagesText.en.json";

export type SolutionSharedContent = {
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  scrollLabel: string;
  scrollCueAriaLabel: string;
  logoTickerAriaLabel: string;
  helpsOverline: string;
  impactTag: string;
  closingOverline: string;
  closingAccent: string;
  closingCta: string;
  scenarioPromptPrefix: string;
  scenarioUi: {
    typingStatus: string;
    analyzingStatus: string;
    readyStatus: string;
    copilotLabel: string;
    copilotResponseLabel: string;
    metaLoadingLabel: string;
    metaReadyLabel: string;
    boardAriaLabel: string;
    boardTitle: string;
    boardBadge: string;
    chartComparisonLabel: string;
    legendBase: string;
    legendScenario: string;
    startLabel: string;
    waitingLabel: string;
    rerunAriaLabel: string;
    disclaimer: string;
  };
  indexPage: {
    backLabel: string;
    title: string;
    description: string;
  };
};

type RawShared = {
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  scrollLabel: string;
  scrollCueAriaLabel: string;
  logoTickerAriaLabel: string;
  helpsOverline: string;
  impactTag: string;
  closingOverline: string;
  closingAccent: string;
  closingCta: string;
  scenarioPromptPrefix: string;
  scenarioUi: SolutionSharedContent["scenarioUi"];
  indexPage: {
    backLabel: string;
    title: string;
    description: string;
  };
};

type RawSolutionPagesText = {
  shared: RawShared;
};

const buildShared = (raw: RawSolutionPagesText): SolutionSharedContent => ({
  heroPrimaryCta: raw.shared.heroPrimaryCta,
  heroSecondaryCta: raw.shared.heroSecondaryCta,
  scrollLabel: raw.shared.scrollLabel,
  scrollCueAriaLabel: raw.shared.scrollCueAriaLabel,
  logoTickerAriaLabel: raw.shared.logoTickerAriaLabel,
  helpsOverline: raw.shared.helpsOverline,
  impactTag: raw.shared.impactTag,
  closingOverline: raw.shared.closingOverline,
  closingAccent: raw.shared.closingAccent,
  closingCta: raw.shared.closingCta,
  scenarioPromptPrefix: raw.shared.scenarioPromptPrefix,
  scenarioUi: raw.shared.scenarioUi,
  indexPage: raw.shared.indexPage,
});

const SHARED_BY_LOCALE: Record<Locale, SolutionSharedContent> = {
  sv: buildShared(solutionPagesText as RawSolutionPagesText),
  en: buildShared(solutionPagesTextEn as RawSolutionPagesText),
};

export const getSolutionSharedContent = (
  locale: Locale = DEFAULT_LOCALE,
): SolutionSharedContent => SHARED_BY_LOCALE[locale] ?? SHARED_BY_LOCALE[DEFAULT_LOCALE];

export const SOLUTION_SHARED_CONTENT: SolutionSharedContent = SHARED_BY_LOCALE[DEFAULT_LOCALE];
