import { HomeOfferingProvider } from "@/components/home/HomeOfferingProvider";
import FloatingNav from "@/components/layout/FloatingNav/FloatingNav";
import Logo from "@/components/layout/Logo/Logo";
import SiteFooter from "@/components/layout/SiteFooter/SiteFooter";
import Customers from "@/components/sections/Customers/Customers";
import Ending from "@/components/sections/Ending/Ending";
import Hero from "@/components/sections/Hero/Hero";
import HowItWorks from "@/components/sections/HowItWorks/HowItWorks";
import AICopilot from "@/components/sections/Products/ProductsSection";
import Security from "@/components/sections/Security/Security";
import Solutions from "@/components/sections/Solutions/Solutions";
import type { HomeOfferingMode } from "@/content/homePageText";
import { fetchAllHomeContent } from "@/sanity/lib/fetchHomeContent";

type HomePageProps = {
  initialOffering: HomeOfferingMode;
};

export default async function HomePage({ initialOffering }: HomePageProps) {
  const prefetchedContent = await fetchAllHomeContent();

  return (
    <HomeOfferingProvider initialOffering={initialOffering} prefetchedContent={prefetchedContent}>
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
