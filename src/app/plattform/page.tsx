import HomePage from "@/app/_components/HomePage";

export const revalidate = 3600;

export default function PlattformPage() {
  return <HomePage initialOffering="platform" />;
}
