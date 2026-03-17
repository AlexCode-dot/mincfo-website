import { HomeOfferingProvider } from "@/components/home/HomeOfferingProvider";
import FloatingNav from "@/components/layout/FloatingNav/FloatingNav";
import Logo from "@/components/layout/Logo/Logo";
import SiteFooter from "@/components/layout/SiteFooter/SiteFooter";
import AICopilot from "@/components/sections/Products/ProductsSection";
import Customers from "@/components/sections/Customers/Customers";
import Ending from "@/components/sections/Ending/Ending";
import Hero from "@/components/sections/Hero/Hero";
import HowItWorks from "@/components/sections/HowItWorks/HowItWorks";
import Security from "@/components/sections/Security/Security";
import Solutions from "@/components/sections/Solutions/Solutions";
import {
  isHomeOfferingMode,
  type HomeOfferingMode,
} from "@/content/homePageText";

type PageSearchParams = Promise<{
  offering?: string;
}>;

type HomePageProps = {
  searchParams?: PageSearchParams;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const offeringParam = params?.offering ?? null;
  const initialOffering: HomeOfferingMode | undefined = isHomeOfferingMode(offeringParam)
    ? offeringParam
    : undefined;

  return (
    <HomeOfferingProvider initialOffering={initialOffering}>
      <Logo showOfferingSwitch />
      <FloatingNav />
      <Hero />
      <AICopilot />
      <Solutions />
      <Customers />
      <HowItWorks />
      <Ending />
      <Security />
      <SiteFooter />
    </HomeOfferingProvider>
  );
}
