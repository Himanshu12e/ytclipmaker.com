import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import TrustBadges from "@/components/landing/trust-badges";
import Features from "@/components/landing/features";
import HowItWorks from "@/components/landing/how-it-works";
import DemoSection from "@/components/landing/demo-section";
import Testimonials from "@/components/landing/testimonials";
import Pricing from "@/components/landing/pricing";
import FAQ from "@/components/landing/faq";
import CTA from "@/components/landing/cta";
import Footer from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <TrustBadges />
        <Features />
        <HowItWorks />
        <DemoSection />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
