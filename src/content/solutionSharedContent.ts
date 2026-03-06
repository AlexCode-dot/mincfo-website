import solutionPagesText from "./solutionPagesText.json";

export type SolutionSharedContent = {
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  scrollLabel: string;
  helpsOverline: string;
  impactTag: string;
  closingOverline: string;
  closingAccent: string;
  closingCta: string;
};

type RawShared = {
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  scrollLabel: string;
  helpsOverline: string;
  impactTag: string;
  closingOverline: string;
  closingAccent: string;
  closingCta: string;
};

type RawSolutionPagesText = {
  shared: RawShared;
};

const raw = solutionPagesText as RawSolutionPagesText;

export const SOLUTION_SHARED_CONTENT: SolutionSharedContent = {
  heroPrimaryCta: raw.shared.heroPrimaryCta,
  heroSecondaryCta: raw.shared.heroSecondaryCta,
  scrollLabel: raw.shared.scrollLabel,
  helpsOverline: raw.shared.helpsOverline,
  impactTag: raw.shared.impactTag,
  closingOverline: raw.shared.closingOverline,
  closingAccent: raw.shared.closingAccent,
  closingCta: raw.shared.closingCta,
};
