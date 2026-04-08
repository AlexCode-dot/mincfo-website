import HomePage from "@/app/_components/HomePage";

export const revalidate = 3600;

export default function FullServicePage() {
  return <HomePage initialOffering="full-service" />;
}
