import type { Metadata } from "next";
import {
  buildPageMetadata,
  createOgImage,
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_RUNTIME,
  OG_IMAGE_SIZE,
  type OgTheme,
} from "@/app/og/shared";

type SolutionMeta = {
  title: string;
  description: string;
  eyebrow: string;
  path: string;
  theme: OgTheme;
};

export const CEO_FOUNDERS_META: SolutionMeta = {
  title: "Finansiell klarhet för VD:ar och grundare",
  description:
    "MinCFO samlar AI Copilot, dashboards i realtid, forecasting och strategisk rådgivning i en beslutsyta för snabbare och säkrare tillväxtbeslut.",
  eyebrow: "Lösning för VD:ar och grundare",
  path: "/losningar/ceo-founders",
  theme: "ceo",
};

export const CFO_FINANCE_META: SolutionMeta = {
  title: "Styr finansfunktionen proaktivt med MinCFO",
  description:
    "MinCFO kopplar ihop datakällor, automatiserar finansflöden och ger teamet en plattform för analys, planering och strategisk uppföljning.",
  eyebrow: "Lösning för CFO och ekonomifunktion",
  path: "/losningar/cfo-finance",
  theme: "finance",
};

export const SAAS_TECH_META: SolutionMeta = {
  title: "Finansiell kontroll för SaaS- och techbolag",
  description:
    "Få bättre kontroll över burn, runway, forecasting och tillväxtdrivare med realtidsdata, AI-stöd och tydligare finansiell uppföljning.",
  eyebrow: "Lösning för SaaS / Tech",
  path: "/losningar/saas-tech",
  theme: "saas",
};

export const KONSULT_TJANSTER_META: SolutionMeta = {
  title: "Bättre styrning för konsult- och tjänsteföretag",
  description:
    "MinCFO hjälper konsult- och tjänsteföretag att följa beläggning, marginal, kassaflöde och scenarier i en samlad ekonomiplattform.",
  eyebrow: "Lösning för konsult och tjänster",
  path: "/losningar/konsult-tjanster",
  theme: "consulting",
};

export const EHANDEL_META: SolutionMeta = {
  title: "Datadriven styrning för e-handel",
  description:
    "Följ kassaflöde, lager, marginal och tillväxt i realtid med MinCFOs dashboards, prognoser och AI-drivna beslutsstöd.",
  eyebrow: "Lösning för e-handel",
  path: "/losningar/ehandel",
  theme: "retail",
};

export function getSolutionMetadata(meta: SolutionMeta): Metadata {
  return buildPageMetadata(meta);
}

export function createSolutionOgImage(meta: SolutionMeta) {
  return createOgImage(meta);
}

export const solutionOgRuntime = OG_IMAGE_RUNTIME;
export const solutionOgSize = OG_IMAGE_SIZE;
export const solutionOgContentType = OG_IMAGE_CONTENT_TYPE;
