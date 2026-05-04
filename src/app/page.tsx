import HomePage from "@/app/_components/HomePage";
import { DEFAULT_HOME_OFFERING_MODE } from "@/content/homePageText";

export default function Home() {
  return <HomePage initialOffering={DEFAULT_HOME_OFFERING_MODE} />;
}
