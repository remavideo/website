import { createFileRoute } from "@tanstack/react-router";
import { BottomCta } from "../components/landing/BottomCta";
import { Features } from "../components/landing/Features";
import { Hero } from "../components/landing/Hero";
import { Pricing } from "../components/landing/Pricing";
import { Problem } from "../components/landing/Problem";
import { Solution } from "../components/landing/Solution";
import { UseCases } from "../components/landing/UseCases";
import { Footer } from "../components/layout/Footer";
import { MarketingNav } from "../components/layout/MarketingNav";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MarketingNav />
      <main className="flex-1">
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <UseCases />
        <Pricing />
        <BottomCta />
      </main>
      <Footer />
    </div>
  );
}
