import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PricingCards } from "@/components/landing/pricing-cards";
import { FAQ } from "@/components/landing/faq";
import { CTA } from "@/components/landing/cta";
import {
  OrganizationJsonLd,
  ProductJsonLd,
  FAQJsonLd,
} from "@/components/shared/json-ld";

export default function Home() {
  return (
    <>
      <OrganizationJsonLd />
      <ProductJsonLd />
      <FAQJsonLd />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <PricingCards />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
