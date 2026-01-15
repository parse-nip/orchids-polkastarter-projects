"use client";

import AnnouncementHeader from "@/components/sections/announcement-header";
import Navigation from "@/components/sections/navigation";
import HeroSection from "@/components/sections/coinlist-hero";
import TokenSales from "@/components/sections/coinlist-token-sales";
import ProductShowcase from "@/components/sections/coinlist-product-showcase";
import Footer from "@/components/sections/coinlist-footer";
import { Aurora } from "@/components/ui/aurora";

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-white dark:bg-black transition-colors duration-300">
      {/* Aurora Background - Absolute at top */}
      <div className="absolute top-0 left-0 right-0 h-[700px] z-0 pointer-events-none opacity-90 dark:opacity-40">
        <Aurora
          colorStops={["#4c1fe0", "#6229ff", "#3b82f6"]}
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <AnnouncementHeader />
        <Navigation />
        
        <div className="flex-1">
          <HeroSection />
          <TokenSales />
          <ProductShowcase />
        </div>

        <Footer />
      </div>
    </main>
  );
}
