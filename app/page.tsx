"use client";

import TopBar from "@/app/components/homepage/TopBar";
import Navbar from "@/app/components/homepage/Navbar";
import HeroSection from "@/app/components/homepage/HeroSection";
import DealsSection from "@/app/components/homepage/DealsSection";
import DestinationsSection from "@/app/components/homepage/DestinationsSection";
import WhyChooseUs from "@/app/components/homepage/WhyChooseUs";
import Testimonials from "@/app/components/homepage/Testimonials";
import FaqSection from "@/app/components/homepage/FaqSection";
import Footer from "@/app/components/homepage/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <Navbar />
      <DealsSection />
      <HeroSection />
      <DestinationsSection />
      <WhyChooseUs />
      <Testimonials />
      <FaqSection />
      <Footer />
    </div>
  );
}