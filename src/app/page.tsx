import FloatingNav from "@/components/layout/FloatingNav/FloatingNav";
import Logo from "@/components/layout/Logo/Logo";
import AICopilot from "@/components/sections/AICopilot/AICopilot";
import Hero from "@/components/sections/Hero/Hero";

export default function Home() {
  return (
    <>
      <Logo />
      <FloatingNav />
      <Hero />
      <AICopilot />
    </>
  );
}
