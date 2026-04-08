import HomePage from "@/app/_components/HomePage";

// Enable ISR so revalidateTag can refresh the page on Sanity publish
export const revalidate = 3600;

export default function Home() {
  return <HomePage initialOffering="platform" />;
}
