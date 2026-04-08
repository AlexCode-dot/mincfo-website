import HomePage from "@/app/_components/HomePage";

export const revalidate = 3600;

export default function PartnerPage() {
  return <HomePage initialOffering="partner" />;
}
