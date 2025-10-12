// Update this page (the content is just a fallback if you fail to update the page)

import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import UnitTypesSection from "@/components/UnitTypesSection";
import PrimeLocationsSection from "@/components/PrimeLocationsSection";
import Contact from "@/components/Contact";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <UnitTypesSection />
      <PrimeLocationsSection />
      <Contact />
    </div>
  );
};

export default Index;
