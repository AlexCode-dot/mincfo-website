import FloatingNav from "@/components/layout/FloatingNav/FloatingNav";
import Logo from "@/components/layout/Logo/Logo";
import SiteFooter from "@/components/layout/SiteFooter/SiteFooter";
import AICopilot from "@/components/sections/AICopilot/AICopilot";
import Customers from "@/components/sections/Customers/Customers";
import Ending from "@/components/sections/Ending/Ending";
import Hero from "@/components/sections/Hero/Hero";
import HowItWorks from "@/components/sections/HowItWorks/HowItWorks";
import Security from "@/components/sections/Security/Security";
import Solutions from "@/components/sections/Solutions/Solutions";

export default function Home() {
  return (
    <>
      <Logo />
      <FloatingNav />
      <Hero />
      <AICopilot />
      <Solutions />
      <Customers />
      <Security />
      <HowItWorks />
      <Ending />
      <SiteFooter />
    </>
  );
}
