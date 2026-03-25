import { createOgImage } from "@/app/og/shared";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return createOgImage({
    title: "Realtidsdashboards, prognoser och AI för moderna ekonomiteam",
    description:
      "MinCFO kombinerar automation, dashboards i realtid och en AI-copilot i en modern ekonomiplattform.",
    eyebrow: "MinCFO",
    theme: "home",
  });
}
