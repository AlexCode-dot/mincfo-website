import {
  createSolutionOgImage,
  KONSULT_TJANSTER_META,
} from "../_shared/solutionMetadata";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return createSolutionOgImage(KONSULT_TJANSTER_META);
}
